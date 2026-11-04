import { pool } from "../config/db.js";

export const createEnquiry = async ({
    name,
    phone,
    message = "",
    email = null,
    project_type = null,
    source = "Portfolio Contact Form",
}) => {
    const query = `
        INSERT INTO enquiries (name, phone, message, email, project_type, source, status)
        VALUES ($1, $2, $3, $4, $5, $6, 'New')
        RETURNING id, name, phone, message, email, project_type, source, status, created_at, updated_at;
    `;
    const values = [
        name,
        phone,
        message || "",
        email || null,
        project_type || null,
        source || "Portfolio Contact Form",
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const getEnquiries = async ({ limit = 100, offset = 0, status, search } = {}) => {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (status && status !== "All") {
        conditions.push(`status = $${paramIndex++}`);
        values.push(status);
    }

    if (search && search.trim()) {
        conditions.push(`(name ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR message ILIKE $${paramIndex} OR source ILIKE $${paramIndex})`);
        values.push(`%${search.trim()}%`);
        paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
        SELECT id, name, phone, message, email, project_type, source, status, created_at, updated_at
        FROM enquiries
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++};
    `;
    values.push(limit, offset);

    const { rows } = await pool.query(query, values);
    return rows;
};

export const updateEnquiryStatus = async (id, status) => {
    const query = `
        UPDATE enquiries
        SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, phone, message, email, project_type, source, status, created_at, updated_at;
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0] || null;
};

export const deleteEnquiry = async (id) => {
    const query = `
        DELETE FROM enquiries
        WHERE id = $1
        RETURNING id;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};
