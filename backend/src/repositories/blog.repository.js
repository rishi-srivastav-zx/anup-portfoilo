import { pool } from "../config/db.js";

// ---------- shared SQL ----------
const BASE_COLUMNS = `
    b.id,
    b.user_id AS "userId",
    b.title,
    b.slug,
    b.excerpt,
    b.category,
    b.tags,
    b.author,
    b.featured_image AS "featuredImage",
    b.featured_image_alt AS "featuredImageAlt",
    b.featured_image_file_id AS "featuredImageFileId",
    b.gallery_images AS "galleryImages",
    b.reading_time AS "readingTime",
    b.status,
    b.is_featured AS "isFeatured",
    b.layout_variant AS "layoutVariant",
    b.technical_note AS "technicalNote",
    b.introduction,
    b.content,
    b.sections,
    b.seo_title AS "seoTitle",
    b.seo_description AS "seoDescription",
    b.seo_keywords AS "seoKeywords",
    b.canonical_url AS "canonicalUrl",
    b.published_at AS "publishedAt",
    b.created_at AS "createdAt",
    b.updated_at AS "updatedAt"`;

// RETURNING ke liye alias-free columns (ek baar compute, har call pe nahi)
const RETURNING_COLUMNS = BASE_COLUMNS.replaceAll("b.", "");

// list/cards ke liye heavy content (introduction, sections, content, gallery_images) nahi
const LIST_COLUMNS = `
    b.id,
    b.title,
    b.slug,
    b.excerpt,
    b.category,
    b.tags,
    b.author,
    b.featured_image AS "featuredImage",
    b.featured_image_alt AS "featuredImageAlt",
    b.reading_time AS "readingTime",
    b.status,
    b.is_featured AS "isFeatured",
    b.layout_variant AS "layoutVariant",
    b.published_at AS "publishedAt",
    b.created_at AS "createdAt",
    b.updated_at AS "updatedAt"`;

const CARD_COLUMNS = `
    b.id,
    b.title,
    b.slug,
    b.excerpt,
    b.category,
    b.featured_image AS "featuredImage",
    b.featured_image_alt AS "featuredImageAlt",
    b.reading_time AS "readingTime",
    b.published_at AS "publishedAt"`;

// admin (findById) columns
const ADMIN_COLUMNS = BASE_COLUMNS;

const FIELD_MAPPING = {
    title: "title",
    slug: "slug",
    excerpt: "excerpt",
    category: "category",
    tags: "tags",
    author: "author",
    featuredImage: "featured_image",
    featuredImageAlt: "featured_image_alt",
    featuredImageFileId: "featured_image_file_id",
    galleryImages: "gallery_images",
    readingTime: "reading_time",
    status: "status",
    isFeatured: "is_featured",
    layoutVariant: "layout_variant",
    technicalNote: "technical_note",
    introduction: "introduction",
    content: "content",
    sections: "sections",
    seoTitle: "seo_title",
    seoDescription: "seo_description",
    seoKeywords: "seo_keywords",
    canonicalUrl: "canonical_url",
    publishedAt: "published_at",
};

const JSON_FIELDS = new Set([
    "author",
    "introduction",
    "sections",
    "galleryImages",
]);

const SORT_COLUMNS = {
    publishedAt: "COALESCE(b.published_at, b.created_at)",
    createdAt: "b.created_at",
    updatedAt: "b.updated_at",
    title: "b.title",
};

const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

const ADJ_COLS = `b.title, b.slug, b.featured_image AS "featuredImage"`;
const ADJACENT_SQL = `
    (
        SELECT 'prev' AS direction, ${ADJ_COLS}
        FROM blogs b
        WHERE b.status = 'published' AND b.published_at < $1
        ORDER BY b.published_at DESC
        LIMIT 1
    )
    UNION ALL
    (
        SELECT 'next' AS direction, ${ADJ_COLS}
        FROM blogs b
        WHERE b.status = 'published' AND b.published_at > $1
        ORDER BY b.published_at ASC
        LIMIT 1
    )`;

export const blogRepository = {
    /**
     * List blogs with filters + total count -> { items, total }
     */
    async findAll(
        {
            status,
            category,
            tag,
            search,
            isFeatured,
            sortBy,
            order,
            limit = 50,
            offset = 0,
        } = {},
        client = pool,
    ) {
        const conditions = [];
        const params = [];
        const add = (sql, value) => {
            params.push(value);
            conditions.push(sql.replace("?", `$${params.length}`));
        };

        if (status && status !== "all") add("b.status = ?", status);
        if (category) add("b.category = ?", category);
        if (tag) add("? = ANY(b.tags)", tag);
        if (isFeatured !== undefined) add("b.is_featured = ?", isFeatured);
        if (search) {
            const like = `%${escapeLike(search)}%`;
            params.push(like);
            conditions.push(
                `(b.title ILIKE $${params.length} OR b.excerpt ILIKE $${params.length})`,
            );
        }

        const whereClause = conditions.length
            ? `WHERE ${conditions.join(" AND ")}`
            : "";
        const sortCol = SORT_COLUMNS[sortBy] || SORT_COLUMNS.publishedAt;
        const dir = String(order).toLowerCase() === "asc" ? "ASC" : "DESC";

        const [list, count] = await Promise.all([
            client.query(
                `SELECT ${LIST_COLUMNS}
                 FROM blogs b
                 ${whereClause}
                 ORDER BY ${sortCol} ${dir}, b.created_at DESC
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
                [...params, limit, offset],
            ),
            client.query(
                `SELECT COUNT(*)::int AS total FROM blogs b ${whereClause}`,
                params,
            ),
        ]);

        return { items: list.rows, total: count.rows[0].total };
    },

    async findBySlug(slug, client = pool) {
        const res = await client.query(
            `SELECT ${BASE_COLUMNS} FROM blogs b WHERE b.slug = $1`,
            [slug],
        );
        return res.rows[0] || null;
    },

    async findById(id, client = pool) {
        const res = await client.query(
            `SELECT ${ADMIN_COLUMNS} FROM blogs b WHERE b.id = $1`,
            [id],
        );
        return res.rows[0] || null;
    },

    /**
     * Bulk delete se pehle ImageKit fileIds nikalne ke liye
     */
    async findByIds(ids, client = pool) {
        const res = await client.query(
            `SELECT id, featured_image_file_id AS "featuredImageFileId"
             FROM blogs WHERE id = ANY($1::uuid[])`,
            [ids],
        );
        return res.rows;
    },

    async slugExists(slug, excludeId = null, client = pool) {
        const res = await client.query(
            `SELECT 1 FROM blogs
             WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2::uuid)
             LIMIT 1`,
            [slug, excludeId],
        );
        return res.rowCount > 0;
    },

    /**
     * Same category ya shared tags; zyada shared tags pehle
     */
    async findRelated(blog, limit = 3, client = pool) {
        const res = await client.query(
            `SELECT ${CARD_COLUMNS}
             FROM blogs b
             WHERE b.status = 'published'
               AND b.id <> $1
               AND (b.category = $2 OR b.tags && $3::text[])
             ORDER BY
                (SELECT COUNT(*) FROM unnest(b.tags) t WHERE t = ANY($3::text[])) DESC,
                b.published_at DESC NULLS LAST
             LIMIT $4`,
            [blog.id, blog.category, blog.tags || [], limit],
        );
        return res.rows;
    },

    /**
     * prev = purana article, next = naya article
     * Combined UNION ALL query retrieves both adjacent articles in a single database round-trip
     */
    async getAdjacent(publishedAt, client = pool) {
        if (!publishedAt) return { prev: null, next: null };

        const res = await client.query(ADJACENT_SQL, [publishedAt]);
        let prev = null;
        let next = null;

        for (const row of res.rows) {
            const item = {
                title: row.title,
                slug: row.slug,
                featuredImage: row.featuredImage,
            };
            if (row.direction === "prev") prev = item;
            else if (row.direction === "next") next = item;
        }

        return { prev, next };
    },

    async getCategories(scope = "published", client = pool) {
        const res = await client.query(
            `SELECT category, COUNT(*)::int AS count
             FROM blogs
             WHERE ($1 = 'all' OR status = 'published')
             GROUP BY category
             ORDER BY category`,
            [scope],
        );
        return res.rows;
    },

    async getTags(scope = "published", client = pool) {
        const res = await client.query(
            `SELECT tag, COUNT(*)::int AS count
             FROM blogs, unnest(tags) AS tag
             WHERE ($1 = 'all' OR status = 'published')
             GROUP BY tag
             ORDER BY count DESC, tag`,
            [scope],
        );
        return res.rows;
    },

    async getStats(client = pool) {
        const res = await client.query(
            `SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status = 'published')::int AS published,
                COUNT(*) FILTER (WHERE status = 'draft')::int AS draft,
                COUNT(*) FILTER (WHERE is_featured)::int AS featured
             FROM blogs`,
        );
        return res.rows[0];
    },

    /**
     * Create a new blog
     */
    async create(data, client = pool) {
        const status = data.status || "draft";
        const publishedAt =
            data.publishedAt ||
            (status === "published" ? new Date().toISOString() : null);

        // Ensure only one blog can be featured at a time
        // (sirf wahi rows touch hoti hain jo featured hain -> poori table rewrite nahi)
        if (data.isFeatured) {
            await client.query(
                "UPDATE blogs SET is_featured = false WHERE is_featured = true",
            );
        }

        const query = `
            INSERT INTO blogs (
                user_id, title, slug, excerpt, category, tags, author,
                featured_image, featured_image_alt, featured_image_file_id,
                gallery_images, reading_time, status, is_featured, layout_variant,
                technical_note, introduction, content, sections,
                seo_title, seo_description, seo_keywords, canonical_url, published_at
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
                $24::timestamptz
            )
            RETURNING ${RETURNING_COLUMNS};
        `;

        const values = [
            data.userId || null,
            data.title,
            data.slug,
            data.excerpt,
            data.category,
            data.tags || [],
            JSON.stringify(data.author || {}),
            data.featuredImage || "",
            data.featuredImageAlt || "",
            data.featuredImageFileId || null,
            JSON.stringify(data.galleryImages || []),
            data.readingTime || "1 min read",
            status,
            data.isFeatured || false,
            data.layoutVariant || "wide",
            data.technicalNote || null,
            JSON.stringify(data.introduction || []),
            data.content || "",
            JSON.stringify(data.sections || []),
            data.seoTitle || null,
            data.seoDescription || null,
            data.seoKeywords || null,
            data.canonicalUrl || null,
            publishedAt,
        ];

        const res = await client.query(query, values);
        return res.rows[0];
    },

    /**
     * Update an existing blog (sirf bheje gaye fields)
     */
    async update(id, data, client = pool) {
        // Ensure only one blog can be featured at a time
        if (data.isFeatured) {
            await client.query(
                "UPDATE blogs SET is_featured = false WHERE id != $1 AND is_featured = true",
                [id],
            );
        }

        const updates = [];
        const values = [];

        for (const [key, col] of Object.entries(FIELD_MAPPING)) {
            if (data[key] === undefined) continue;
            values.push(
                JSON_FIELDS.has(key) ? JSON.stringify(data[key]) : data[key],
            );
            updates.push(`${col} = $${values.length}`);
        }

        if (updates.length === 0) return this.findById(id, client);

        values.push(id);
        const res = await client.query(
            `UPDATE blogs
             SET ${updates.join(", ")}, updated_at = NOW()
             WHERE id = $${values.length}
             RETURNING ${RETURNING_COLUMNS}`,
            values,
        );
        return res.rows[0] || null;
    },

    /**
     * Atomically set featured state ensuring ONLY ONE blog can be featured
     * (ek hi statement -> ek round-trip, aur atomic)
     */
    async setFeatured(id, isFeatured, client = pool) {
        const on = Boolean(isFeatured);
        const res = await client.query(
            on
                ? `WITH unfeature AS (
                       UPDATE blogs SET is_featured = false
                       WHERE id <> $1 AND is_featured = true
                   )
                   UPDATE blogs
                   SET is_featured = $2, updated_at = NOW()
                   WHERE id = $1
                   RETURNING ${RETURNING_COLUMNS}`
                : `UPDATE blogs
                   SET is_featured = $2, updated_at = NOW()
                   WHERE id = $1
                   RETURNING ${RETURNING_COLUMNS}`,
            [id, on],
        );
        return res.rows[0] || null;
    },

    /**
     * Retrieve the single featured published blog
     */
    async getFeatured(client = pool) {
        const res = await client.query(
            `SELECT ${BASE_COLUMNS}
             FROM blogs b
             WHERE b.is_featured = true AND b.status = 'published'
             ORDER BY b.published_at DESC NULLS LAST, b.created_at DESC
             LIMIT 1`,
        );
        return res.rows[0] || null;
    },

    async bulkUpdateStatus(ids, status, client = pool) {
        const res = await client.query(
            `UPDATE blogs
             SET status = $2,
                 published_at = CASE WHEN $2::text = 'published'
                                THEN COALESCE(published_at, NOW())
                                ELSE published_at END,
                 updated_at = NOW()
             WHERE id = ANY($1::uuid[])`,
            [ids, status],
        );
        return res.rowCount;
    },

    async bulkDelete(ids, client = pool) {
        const res = await client.query(
            "DELETE FROM blogs WHERE id = ANY($1::uuid[])",
            [ids],
        );
        return res.rowCount;
    },

    async delete(id, client = pool) {
        const res = await client.query(
            "DELETE FROM blogs WHERE id = $1 RETURNING id",
            [id],
        );
        return res.rowCount > 0;
    },
};
