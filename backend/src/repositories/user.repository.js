import { pool } from "../config/db.js";

export const userRepository = {
    /**
     * Creates a new user record
     * @param {Object} data
     * @param {string} data.name
     * @param {string} data.email
     * @param {string} data.passwordHash
     * @param {string} [data.role='user']
     * @param {import('pg').PoolClient} [client]
     */
    async create({ name, email, passwordHash, role = "user" }, client = pool) {
        const query = `
            INSERT INTO users (name, email, password_hash, role)
            VALUES ($1, LOWER($2), $3, $4)
            RETURNING id, name, email, role, is_active, email_verified, created_at, updated_at;
        `;
        const res = await client.query(query, [name, email, passwordHash, role]);
        return res.rows[0];
    },

    /**
     * Finds a user by email (case-insensitive)
     * Note: returns password_hash for internal password verification
     * @param {string} email
     * @param {import('pg').PoolClient} [client]
     */
    async findByEmail(email, client = pool) {
        const query = `
            SELECT id, name, email, password_hash, role, is_active, email_verified, last_login_at, created_at, updated_at
            FROM users
            WHERE LOWER(email) = LOWER($1);
        `;
        const res = await client.query(query, [email]);
        return res.rows[0] || null;
    },

    /**
     * Finds a user by ID excluding sensitive password hash
     * @param {string} id
     * @param {import('pg').PoolClient} [client]
     */
    async findById(id, client = pool) {
        const query = `
            SELECT id, name, email, role, is_active, email_verified, last_login_at, created_at, updated_at
            FROM users
            WHERE id = $1;
        `;
        const res = await client.query(query, [id]);
        return res.rows[0] || null;
    },

    /**
     * Updates user's last_login_at timestamp
     * @param {string} id
     * @param {import('pg').PoolClient} [client]
     */
    async updateLastLogin(id, client = pool) {
        const query = `
            UPDATE users
            SET last_login_at = NOW()
            WHERE id = $1;
        `;
        await client.query(query, [id]);
    },

    /**
     * Lists users for admin dashboard
     * @param {Object} options
     * @param {number} [options.limit=50]
     * @param {number} [options.offset=0]
     * @param {boolean} [options.includeCount=true]
     */
    async listUsers({ limit = 50, offset = 0, includeCount = true } = {}, client = pool) {
        const query = `
            SELECT id, name, email, role, is_active, email_verified, last_login_at, created_at, updated_at
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2;
        `;

        if (!includeCount) {
            const listRes = await client.query(query, [limit, offset]);
            return {
                users: listRes.rows,
                total: null,
            };
        }

        const countQuery = `SELECT COUNT(*) AS total FROM users;`;

        const [listRes, countRes] = await Promise.all([
            client.query(query, [limit, offset]),
            client.query(countQuery),
        ]);

        return {
            users: listRes.rows,
            total: parseInt(countRes.rows[0].total, 10),
        };
    },
};
