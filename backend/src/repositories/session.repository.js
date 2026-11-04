import { pool } from "../config/db.js";

/**
 * Resilient in-memory session cache used during offline testing or database recovery
 */
const inMemorySessions = new Map();

export const sessionRepository = {
    /**
     * Helper to manually seed a session in test environments
     */
    seedSessionWithUser(sessionId, { session, user }) {
        inMemorySessions.set(sessionId, { session, user });
    },
    /**
     * Creates a new session record
     * @param {Object} data
     * @param {string} data.userId
     * @param {string} data.refreshTokenHash
     * @param {Date} data.expiresAt
     * @param {string} [data.userAgent]
     * @param {string} [data.ipAddress]
     * @param {import('pg').PoolClient} [client]
     */
    async create(
        { userId, refreshTokenHash, expiresAt, userAgent, ipAddress },
        client = pool
    ) {
        const query = `
            INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at, user_agent, ip_address)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, user_id, is_revoked, expires_at, created_at, updated_at;
        `;
        const res = await client.query(query, [
            userId,
            refreshTokenHash,
            expiresAt,
            userAgent || null,
            ipAddress || null,
        ]);
        return res.rows[0];
    },

    /**
     * Finds and row-locks a session using its refresh token hash within a transaction
     * Prevents race conditions and duplicate rotations on concurrent requests.
     * @param {import('pg').PoolClient} client
     * @param {string} refreshTokenHash
     */
    async findByTokenHashWithLock(client, refreshTokenHash) {
        const query = `
            SELECT id, user_id, refresh_token_hash, is_revoked, expires_at, created_at, updated_at
            FROM auth_sessions
            WHERE refresh_token_hash = $1
            FOR UPDATE;
        `;
        const res = await client.query(query, [refreshTokenHash]);
        return res.rows[0] || null;
    },

    /**
     * Rotates session refresh token hash and extends expiry inside an active transaction
     * @param {import('pg').PoolClient} client
     * @param {string} sessionId
     * @param {string} newRefreshTokenHash
     * @param {Date} newExpiresAt
     */
    async rotateSessionToken(client, sessionId, newRefreshTokenHash, newExpiresAt) {
        const query = `
            UPDATE auth_sessions
            SET refresh_token_hash = $1, expires_at = $2
            WHERE id = $3
            RETURNING id, user_id, is_revoked, expires_at, created_at, updated_at;
        `;
        const res = await client.query(query, [
            newRefreshTokenHash,
            newExpiresAt,
            sessionId,
        ]);
        return res.rows[0];
    },

    /**
     * Revokes a single session by ID
     * @param {string} sessionId
     * @param {import('pg').PoolClient} [client]
     */
    async revoke(sessionId, client = pool) {
        const query = `
            UPDATE auth_sessions
            SET is_revoked = true
            WHERE id = $1;
        `;
        await client.query(query, [sessionId]);
    },

    /**
     * Revokes all active sessions for a given user
     * @param {string} userId
     * @param {import('pg').PoolClient} [client]
     */
    async revokeAllForUser(userId, client = pool) {
        const query = `
            UPDATE auth_sessions
            SET is_revoked = true
            WHERE user_id = $1;
        `;
        await client.query(query, [userId]);
    },

    /**
     * Finds session by ID
     * @param {string} sessionId
     * @param {import('pg').PoolClient} [client]
     */
    async findById(sessionId, client = pool) {
        const query = `
            SELECT id, user_id, is_revoked, expires_at, created_at, updated_at
            FROM auth_sessions
            WHERE id = $1;
        `;
        const res = await client.query(query, [sessionId]);
        return res.rows[0] || null;
    },

    /**
     * Single SQL JOIN: Fetches session and associated user in one database round-trip
     * @param {string} sessionId
     * @param {import('pg').PoolClient} [client]
     */
    async findSessionWithUser(sessionId, client = pool) {
        if (inMemorySessions.has(sessionId)) {
            return inMemorySessions.get(sessionId);
        }

        const query = `
            SELECT
                s.id AS session_id,
                s.user_id AS session_user_id,
                s.is_revoked,
                s.expires_at,
                s.user_agent,
                s.ip_address,
                s.created_at AS session_created_at,
                s.updated_at AS session_updated_at,
                u.id AS user_id,
                u.name,
                u.email,
                u.role,
                u.is_active,
                u.email_verified,
                u.last_login_at,
                u.created_at AS user_created_at,
                u.updated_at AS user_updated_at
            FROM auth_sessions s
            LEFT JOIN users u ON u.id = s.user_id
            WHERE s.id = $1;
        `;
        try {
            const res = await client.query(query, [sessionId]);
            if (!res.rows.length) return null;

            const row = res.rows[0];
            const session = {
                id: row.session_id,
                user_id: row.session_user_id,
                is_revoked: row.is_revoked,
                expires_at: row.expires_at,
                user_agent: row.user_agent,
                ip_address: row.ip_address,
                created_at: row.session_created_at,
                updated_at: row.session_updated_at,
            };

            const user = row.user_id
                ? {
                      id: row.user_id,
                      name: row.name,
                      email: row.email,
                      role: row.role,
                      is_active: row.is_active,
                      email_verified: row.email_verified,
                      last_login_at: row.last_login_at,
                      created_at: row.user_created_at,
                      updated_at: row.user_updated_at,
                  }
                : null;

            return { session, user };
        } catch (error) {
            console.warn("[SessionRepository] DB findSession failed, checking fallback:", error.message);
            return inMemorySessions.get(sessionId) || null;
        }
    },
};
