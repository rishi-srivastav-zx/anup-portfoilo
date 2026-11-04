import { pool } from "../config/db.js";

export const getImages = async () => {
    const query = `
        SELECT id, title, place, description, image_url, thumbnail_url, file_id, sort_order, created_at, updated_at
        FROM sketchbook_images
        ORDER BY sort_order ASC, created_at ASC
        LIMIT 10;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

export const countImages = async () => {
    const query = `SELECT COUNT(*)::int AS total FROM sketchbook_images;`;
    const { rows } = await pool.query(query);
    return rows[0]?.total || 0;
};

export const getImageById = async (id) => {
    const query = `SELECT * FROM sketchbook_images WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

export const createImage = async ({
    title = "Untitled Plate",
    place = "",
    description = "",
    image_url,
    thumbnail_url = null,
    file_id = null,
    sort_order = 0,
}) => {
    const query = `
        INSERT INTO sketchbook_images (title, place, description, image_url, thumbnail_url, file_id, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, title, place, description, image_url, thumbnail_url, file_id, sort_order, created_at, updated_at;
    `;
    const values = [
        title || "Untitled Plate",
        place || "",
        description || "",
        image_url,
        thumbnail_url || image_url,
        file_id || null,
        sort_order,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const updateImage = async (id, { title, place, description, sort_order }) => {
    const query = `
        UPDATE sketchbook_images
        SET 
            title = COALESCE($1, title),
            place = COALESCE($2, place),
            description = COALESCE($3, description),
            sort_order = COALESCE($4, sort_order),
            updated_at = NOW()
        WHERE id = $5
        RETURNING *;
    `;
    const values = [title, place, description, sort_order, id];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
};

export const deleteImage = async (id) => {
    const query = `DELETE FROM sketchbook_images WHERE id = $1 RETURNING id, file_id;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

export const reorderImages = async (orderedIds) => {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) return [];

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query(
                "UPDATE sketchbook_images SET sort_order = $1, updated_at = NOW() WHERE id = $2",
                [i, orderedIds[i]]
            );
        }
        await client.query("COMMIT");
        return await getImages();
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

