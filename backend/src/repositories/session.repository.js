import { pool } from "../config/db.js";

export const sessionRepository = {
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
};
