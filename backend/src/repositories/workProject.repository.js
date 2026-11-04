import { pool } from "../config/db.js";

export const getWorkProjects = async () => {
    const query = `
        SELECT 
            id,
            title,
            station_name,
            floating_tag,
            client,
            summary,
            seo_title,
            seo_description,
            video_url,
            video_mov_url,
            thumbnail_url,
            file_id,
            keyword,
            camera,
            lens,
            format_ratio,
            sort_order,
            is_featured,
            created_at,
            updated_at
        FROM work_projects
        ORDER BY sort_order ASC, created_at ASC;
    `;
    const { rows } = await pool.query(query);
    return rows;
};

export const getWorkProjectById = async (id) => {
    const query = `SELECT * FROM work_projects WHERE id = $1;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

export const createWorkProject = async ({
    title,
    station_name = "",
    floating_tag = "FEATURED",
    client = "",
    summary = "",
    seo_title = "",
    seo_description = "",
    video_url,
    video_mov_url = "",
    thumbnail_url = "",
    file_id = null,
    keyword = "Cinematography",
    camera = "ARRI LF",
    lens = "ANAMORPHIC",
    format_ratio = "2.39:1",
    sort_order = 0,
    is_featured = false,
}) => {
    const query = `
        INSERT INTO work_projects (
            title, station_name, floating_tag, client, summary,
            seo_title, seo_description, video_url, video_mov_url,
            thumbnail_url, file_id, keyword, camera, lens,
            format_ratio, sort_order, is_featured
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *;
    `;
    const values = [
        title,
        station_name || "",
        floating_tag || "FEATURED",
        client || "",
        summary || "",
        seo_title || title || "",
        seo_description || summary || "",
        video_url,
        video_mov_url || "",
        thumbnail_url || "",
        file_id || null,
        keyword || "Cinematography",
        camera || "ARRI LF",
        lens || "ANAMORPHIC",
        format_ratio || "2.39:1",
        sort_order,
        Boolean(is_featured),
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
};

export const updateWorkProject = async (id, data) => {
    const fields = [];
    const values = [];
    let idx = 1;

    const allowed = [
        "title",
        "station_name",
        "floating_tag",
        "client",
        "summary",
        "seo_title",
        "seo_description",
        "video_url",
        "video_mov_url",
        "thumbnail_url",
        "file_id",
        "keyword",
        "camera",
        "lens",
        "format_ratio",
        "sort_order",
        "is_featured",
    ];

    for (const key of allowed) {
        if (data[key] !== undefined) {
            fields.push(`${key} = $${idx++}`);
            values.push(data[key]);
        }
    }

    if (fields.length === 0) {
        return getWorkProjectById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
        UPDATE work_projects
        SET ${fields.join(", ")}
        WHERE id = $${idx}
        RETURNING *;
    `;

    const { rows } = await pool.query(query, values);
    return rows[0] || null;
};

export const deleteWorkProject = async (id) => {
    const query = `DELETE FROM work_projects WHERE id = $1 RETURNING id, file_id;`;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
};

export const reorderWorkProjects = async (orderedIds = []) => {
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) return [];

    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        for (let i = 0; i < orderedIds.length; i++) {
            await client.query(
                `UPDATE work_projects SET sort_order = $1, updated_at = NOW() WHERE id = $2;`,
                [i, orderedIds[i]]
            );
        }
        await client.query("COMMIT");
        return await getWorkProjects();
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
};

