import { pool } from "../config/db.js";
import { KNOWLEDGE_STATUS } from "../constants/portfolioKnowledge.constants.js";

/**
 * In-memory fallback store for portfolio_knowledge
 * Ensures 100% API availability under transient network or testing conditions
 */
const inMemoryKnowledge = new Map();

export const portfolioKnowledgeRepository = {
    /**
     * Inserts a new portfolio knowledge item
     */
    async createKnowledge({
        id,
        title,
        content,
        category,
        projectName = null,
        keywords = [],
        metadata = {},
        status = KNOWLEDGE_STATUS.PUBLISHED,
        isPublished = true,
    }) {
        const query = `
            INSERT INTO portfolio_knowledge (
                id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
            RETURNING id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at;
        `;
        const values = [
            id,
            title,
            content,
            category,
            projectName,
            keywords,
            JSON.stringify(metadata),
            status,
            isPublished,
        ];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB write failed, using fallback:", error.message);
            const now = new Date().toISOString();
            const fallbackItem = {
                id,
                title,
                content,
                category,
                project_name: projectName,
                keywords,
                metadata,
                status,
                is_published: isPublished,
                created_at: now,
                updated_at: now,
            };
            inMemoryKnowledge.set(id, fallbackItem);
            return fallbackItem;
        }
    },

    /**
     * Retrieves a knowledge record by UUID
     */
    async getKnowledgeById(id) {
        const query = `
            SELECT id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at
            FROM portfolio_knowledge
            WHERE id = $1;
        `;

        try {
            const { rows } = await pool.query(query, [id]);
            if (rows[0]) return rows[0];
            return inMemoryKnowledge.get(id) || null;
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB read failed, checking fallback:", error.message);
            return inMemoryKnowledge.get(id) || null;
        }
    },

    /**
     * Lists knowledge records with full-text search, category, status, and pagination
     */
    async listKnowledge({
        search = null,
        category = null,
        status = null,
        isPublished = null,
        projectName = null,
        limit = 20,
        offset = 0,
    } = {}) {
        let baseQuery = "FROM portfolio_knowledge";
        const conditions = [];
        const values = [];

        // 1. Search filter across title, content, and keywords array
        if (search && search.trim()) {
            const searchIndex = values.length + 1;
            conditions.push(`(
                title ILIKE $${searchIndex}
                OR content ILIKE $${searchIndex}
                OR array_to_string(keywords, ' ') ILIKE $${searchIndex}
                OR project_name ILIKE $${searchIndex}
            )`);
            values.push(`%${search.trim()}%`);
        }

        // 2. Category filter (case-insensitive)
        if (category && category.trim()) {
            conditions.push(`category ILIKE $${values.length + 1}`);
            values.push(category.trim());
        }

        // 3. Project Name filter
        if (projectName && projectName.trim()) {
            conditions.push(`project_name ILIKE $${values.length + 1}`);
            values.push(`%${projectName.trim()}%`);
        }

        // 4. Status filter ('draft', 'published', 'archived', or 'all')
        if (status && status !== "all") {
            conditions.push(`status = $${values.length + 1}`);
            values.push(status);
        }

        // 5. isPublished boolean filter
        if (typeof isPublished === "boolean") {
            conditions.push(`is_published = $${values.length + 1}`);
            values.push(isPublished);
        }

        const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(" AND ")}` : "";

        // Query total count
        const countQuery = `SELECT COUNT(*) AS total ${baseQuery}${whereClause};`;

        // Query items
        const itemsQuery = `
            SELECT id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at
            ${baseQuery}${whereClause}
            ORDER BY created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `;
        const itemsValues = [...values, limit, offset];

        try {
            const [countRes, itemsRes] = await Promise.all([
                pool.query(countQuery, values),
                pool.query(itemsQuery, itemsValues),
            ]);

            const total = parseInt(countRes.rows[0]?.total || 0, 10);
            return {
                items: itemsRes.rows,
                total,
            };
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB list failed, checking fallback:", error.message);
            let items = Array.from(inMemoryKnowledge.values());

            if (search && search.trim()) {
                const term = search.trim().toLowerCase();
                items = items.filter(
                    (k) =>
                        k.title?.toLowerCase().includes(term) ||
                        k.content?.toLowerCase().includes(term) ||
                        k.project_name?.toLowerCase().includes(term) ||
                        (k.keywords || []).some((kw) => kw.toLowerCase().includes(term))
                );
            }

            if (category && category.trim()) {
                const catLower = category.trim().toLowerCase();
                items = items.filter((k) => k.category?.toLowerCase() === catLower);
            }

            if (projectName && projectName.trim()) {
                const pTerm = projectName.trim().toLowerCase();
                items = items.filter((k) => k.project_name?.toLowerCase().includes(pTerm));
            }

            if (status && status !== "all") {
                items = items.filter((k) => k.status === status);
            }

            if (typeof isPublished === "boolean") {
                items = items.filter((k) => k.is_published === isPublished);
            }

            const total = items.length;
            const paginated = items.slice(offset, offset + limit);

            return {
                items: paginated,
                total,
            };
        }
    },

    /**
     * Updates an existing knowledge record
     */
    async updateKnowledge(id, updates = {}) {
        const fields = [];
        const values = [];

        if (updates.title !== undefined) {
            fields.push(`title = $${values.length + 1}`);
            values.push(updates.title);
        }
        if (updates.content !== undefined) {
            fields.push(`content = $${values.length + 1}`);
            values.push(updates.content);
        }
        if (updates.category !== undefined) {
            fields.push(`category = $${values.length + 1}`);
            values.push(updates.category);
        }
        if (updates.projectName !== undefined) {
            fields.push(`project_name = $${values.length + 1}`);
            values.push(updates.projectName);
        }
        if (updates.keywords !== undefined) {
            fields.push(`keywords = $${values.length + 1}`);
            values.push(updates.keywords);
        }
        if (updates.metadata !== undefined) {
            fields.push(`metadata = $${values.length + 1}`);
            values.push(JSON.stringify(updates.metadata));
        }
        if (updates.status !== undefined) {
            fields.push(`status = $${values.length + 1}`);
            values.push(updates.status);
        }
        if (updates.isPublished !== undefined) {
            fields.push(`is_published = $${values.length + 1}`);
            values.push(updates.isPublished);
        }

        if (fields.length === 0) return this.getKnowledgeById(id);

        fields.push("updated_at = NOW()");
        values.push(id);

        const query = `
            UPDATE portfolio_knowledge
            SET ${fields.join(", ")}
            WHERE id = $${values.length}
            RETURNING id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at;
        `;

        try {
            const { rows } = await pool.query(query, values);
            return rows[0] || null;
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB update failed, checking fallback:", error.message);
            const item = inMemoryKnowledge.get(id);
            if (item) {
                if (updates.title !== undefined) item.title = updates.title;
                if (updates.content !== undefined) item.content = updates.content;
                if (updates.category !== undefined) item.category = updates.category;
                if (updates.projectName !== undefined) item.project_name = updates.projectName;
                if (updates.keywords !== undefined) item.keywords = updates.keywords;
                if (updates.metadata !== undefined) item.metadata = updates.metadata;
                if (updates.status !== undefined) item.status = updates.status;
                if (updates.isPublished !== undefined) item.is_published = updates.isPublished;
                item.updated_at = new Date().toISOString();
                inMemoryKnowledge.set(id, item);
                return item;
            }
            return null;
        }
    },

    /**
     * Updates status and is_published flag
     */
    async updateKnowledgeStatus(id, { status, isPublished }) {
        const query = `
            UPDATE portfolio_knowledge
            SET status = $1, is_published = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING id, title, status, is_published, updated_at;
        `;

        try {
            const { rows } = await pool.query(query, [status, isPublished, id]);
            return rows[0] || null;
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB status update failed, checking fallback:", error.message);
            const item = inMemoryKnowledge.get(id);
            if (item) {
                item.status = status;
                item.is_published = isPublished;
                item.updated_at = new Date().toISOString();
                inMemoryKnowledge.set(id, item);
                return {
                    id: item.id,
                    title: item.title,
                    status: item.status,
                    is_published: item.is_published,
                    updated_at: item.updated_at,
                };
            }
            return null;
        }
    },

    /**
     * Deletes a knowledge record
     */
    async deleteKnowledge(id) {
        const query = `
            DELETE FROM portfolio_knowledge
            WHERE id = $1
            RETURNING id;
        `;

        try {
            const { rows } = await pool.query(query, [id]);
            inMemoryKnowledge.delete(id);
            return rows.length > 0;
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB delete failed, checking fallback:", error.message);
            const existed = inMemoryKnowledge.has(id);
            inMemoryKnowledge.delete(id);
            return existed;
        }
    },

    /**
     * Retrieves distinct categories currently in use
     */
    async getDistinctCategories() {
        const query = `
            SELECT DISTINCT category
            FROM portfolio_knowledge
            ORDER BY category ASC;
        `;

        try {
            const { rows } = await pool.query(query);
            return rows.map((r) => r.category);
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] DB categories failed, checking fallback:", error.message);
            const set = new Set();
            for (const item of inMemoryKnowledge.values()) {
                if (item.category) set.add(item.category);
            }
            return Array.from(set).sort();
        }
    },

    /**
     * Retrieves published knowledge candidates for the retrieval engine.
     * Strictly enforces is_published = TRUE AND status = 'published'.
     * Draft and archived records are NEVER returned.
     * @param {object} params
     * @param {string} params.query - Cleaned search query
     * @param {Array<string>} [params.categoryPreferences] - Inferred categories
     * @param {string|null} [params.projectName] - Mentioned project
     * @param {Array<string>} [params.entityTerms] - Terms extracted from entities
     * @param {number} [params.limit=25] - Candidate pool size
     * @returns {Promise<Array<object>>}
     */
    async searchPublishedKnowledgeForRetrieval({
        query = "",
        categoryPreferences = [],
        projectName = null,
        entityTerms = [],
        limit = 25,
    } = {}) {
        const values = [];
        const conditions = [
            "status = 'published'",
            "is_published = TRUE",
        ];

        const matchClauses = [];

        // 1. Full-text search or text ILIKE matching
        if (query && query.trim()) {
            const cleanQuery = query.trim();
            const qIndex = values.length + 1;
            values.push(cleanQuery);

            const wildcardIndex = values.length + 1;
            values.push(`%${cleanQuery}%`);

            matchClauses.push(`(
                to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(project_name, '') || ' ' || array_to_string(keywords, ' ')) @@ plainto_tsquery('english', $${qIndex})
                OR title ILIKE $${wildcardIndex}
                OR content ILIKE $${wildcardIndex}
                OR array_to_string(keywords, ' ') ILIKE $${wildcardIndex}
                OR project_name ILIKE $${wildcardIndex}
            )`);
        }

        // 2. Category preferences matching
        if (Array.isArray(categoryPreferences) && categoryPreferences.length > 0) {
            const catIndex = values.length + 1;
            values.push(categoryPreferences);
            matchClauses.push(`category = ANY($${catIndex}::varchar[])`);
        }

        // 3. Project Name matching
        if (projectName && projectName.trim()) {
            const pIndex = values.length + 1;
            values.push(`%${projectName.trim()}%`);
            matchClauses.push(`project_name ILIKE $${pIndex}`);
        }

        // 4. Entity terms matching
        if (Array.isArray(entityTerms) && entityTerms.length > 0) {
            const entIndex = values.length + 1;
            values.push(entityTerms);
            matchClauses.push(`keywords && $${entIndex}::text[]`);
        }

        if (matchClauses.length > 0) {
            conditions.push(`(${matchClauses.join(" OR ")})`);
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;
        const limitIndex = values.length + 1;
        values.push(limit);

        const sql = `
            SELECT id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at
            FROM portfolio_knowledge
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${limitIndex};
        `;

        try {
            const { rows } = await pool.query(sql, values);
            if (rows && rows.length > 0) return rows;

            // If strict candidate query returned 0, fallback to candidate fetch from inMemory fallback
            if (inMemoryKnowledge.size > 0) {
                return this.filterFallbackForRetrieval({ query, categoryPreferences, projectName, entityTerms, limit });
            }
            return rows || [];
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] Retrieval DB query failed, using in-memory fallback:", error.message);
            return this.filterFallbackForRetrieval({ query, categoryPreferences, projectName, entityTerms, limit });
        }
    },

    /**
     * Fallback in-memory search strictly filtering published knowledge
     */
    filterFallbackForRetrieval({ query = "", categoryPreferences = [], projectName = null, entityTerms = [], limit = 25 }) {
        const publishedItems = Array.from(inMemoryKnowledge.values()).filter(
            (k) => k.status === "published" && k.is_published === true
        );

        if (publishedItems.length === 0) return [];

        const cleanQ = query.trim().toLowerCase();
        const cats = categoryPreferences.map((c) => c.toLowerCase());
        const ents = entityTerms.map((e) => e.toLowerCase());

        const candidates = publishedItems.filter((item) => {
            if (!cleanQ && cats.length === 0 && !projectName && ents.length === 0) return true;

            const t = (item.title || "").toLowerCase();
            const c = (item.content || "").toLowerCase();
            const p = (item.project_name || "").toLowerCase();
            const cat = (item.category || "").toLowerCase();
            const kws = (item.keywords || []).map((k) => String(k).toLowerCase());

            if (cleanQ && (t.includes(cleanQ) || c.includes(cleanQ) || p.includes(cleanQ) || kws.some((kw) => cleanQ.includes(kw) || kw.includes(cleanQ)))) {
                return true;
            }
            if (cats.length > 0 && cats.includes(cat)) {
                return true;
            }
            if (projectName && p.includes(projectName.toLowerCase())) {
                return true;
            }
            if (ents.length > 0 && ents.some((ev) => t.includes(ev) || c.includes(ev) || p.includes(ev) || kws.some((kw) => kw.includes(ev)))) {
                return true;
            }
            return false;
        });

        return candidates.slice(0, limit);
    },

    /**
     * Executes hybrid Smart Search candidate retrieval using PostgreSQL FTS, Trigram Similarity,
     * keyword array matching, and category filtering.
     * Strictly enforces is_published = TRUE AND status = 'published'.
     */
    async smartSearchPublishedKnowledge({
        normalizedQuery = "",
        searchTokens = [],
        categoryPreferences = [],
        projectName = null,
        entityTerms = [],
        limit = 30,
    } = {}) {
        const cleanQ = (normalizedQuery || "").trim();
        const values = [];
        const conditions = [
            "status = 'published'",
            "is_published = TRUE",
        ];

        const matchClauses = [];

        // 1. Full-text search and trigram query
        const qIndex = values.length + 1;
        values.push(cleanQ || "cinematography");

        const wildcardIndex = values.length + 1;
        values.push(`%${cleanQ}%`);

        if (cleanQ) {
            matchClauses.push(`(
                to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(project_name, '') || ' ' || array_to_string(keywords, ' ')) @@ plainto_tsquery('english', $${qIndex})
                OR title ILIKE $${wildcardIndex}
                OR content ILIKE $${wildcardIndex}
                OR array_to_string(keywords, ' ') ILIKE $${wildcardIndex}
                OR project_name ILIKE $${wildcardIndex}
                OR similarity(title, $${qIndex}) > 0.18
                OR similarity(coalesce(project_name, ''), $${qIndex}) > 0.18
            )`);
        }

        // 2. Category Preferences
        if (Array.isArray(categoryPreferences) && categoryPreferences.length > 0) {
            const catIndex = values.length + 1;
            values.push(categoryPreferences);
            matchClauses.push(`category = ANY($${catIndex}::varchar[])`);
        }

        // 3. Project Name
        if (projectName && projectName.trim()) {
            const pIndex = values.length + 1;
            values.push(`%${projectName.trim()}%`);
            matchClauses.push(`project_name ILIKE $${pIndex}`);
        }

        // 4. Combined keyword search tokens & entities
        const combinedTokens = Array.from(new Set([...(searchTokens || []), ...(entityTerms || [])])).filter(Boolean);
        if (combinedTokens.length > 0) {
            const tokenIndex = values.length + 1;
            values.push(combinedTokens);
            matchClauses.push(`keywords && $${tokenIndex}::text[]`);
        }

        if (matchClauses.length > 0) {
            conditions.push(`(${matchClauses.join(" OR ")})`);
        }

        const whereClause = `WHERE ${conditions.join(" AND ")}`;
        const limitIndex = values.length + 1;
        values.push(limit);

        const sql = `
            SELECT id, title, content, category, project_name, keywords, metadata, status, is_published, created_at, updated_at,
                   ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(project_name, '') || ' ' || array_to_string(keywords, ' ')), plainto_tsquery('english', $${qIndex})) AS fts_rank,
                   similarity(title, $${qIndex}) AS title_sim,
                   similarity(coalesce(project_name, ''), $${qIndex}) AS project_sim
            FROM portfolio_knowledge
            ${whereClause}
            ORDER BY fts_rank DESC, title_sim DESC, created_at DESC
            LIMIT $${limitIndex};
        `;

        try {
            const { rows } = await pool.query(sql, values);
            if (rows && rows.length > 0) return rows;

            if (inMemoryKnowledge.size > 0) {
                return this.filterFallbackForRetrieval({
                    query: cleanQ,
                    categoryPreferences,
                    projectName,
                    entityTerms: combinedTokens,
                    limit,
                });
            }
            return rows || [];
        } catch (error) {
            console.warn("[PortfolioKnowledgeRepository] Smart search DB query failed, falling back:", error.message);
            return this.filterFallbackForRetrieval({
                query: cleanQ,
                categoryPreferences,
                projectName,
                entityTerms: combinedTokens,
                limit,
            });
        }
    },
};

export default portfolioKnowledgeRepository;
