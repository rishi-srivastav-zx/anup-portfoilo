import crypto from "crypto";
import { pool } from "../config/db.js";

/**
 * In-memory fallback store for chat_leads
 */
const inMemoryLeads = new Map();

export const chatLeadRepository = {
    /**
     * Creates a new chat lead generated from a visitor conversation
     */
    async createLead({
        id,
        conversationId = null,
        visitorName = null,
        email = null,
        phone = null,
        projectType = null,
        projectDescription = null,
        budget = null,
        preferredDate = null,
        location = null,
        leadStatus = "new",
        source = "AI Chat Assistant",
    }) {
        const query = `
            INSERT INTO chat_leads (
                id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
            RETURNING id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at;
        `;
        const values = [
            id,
            conversationId,
            visitorName,
            email,
            phone,
            projectType,
            projectDescription,
            budget,
            preferredDate,
            location,
            leadStatus,
            source,
        ];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.warn("[ChatLeadRepository] DB write failed, using resilient fallback:", error.message);
            const fallbackLead = {
                id,
                conversation_id: conversationId,
                visitor_name: visitorName,
                email,
                phone,
                project_type: projectType,
                project_description: projectDescription,
                budget,
                preferred_date: preferredDate,
                location,
                lead_status: leadStatus,
                source,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            inMemoryLeads.set(id, fallbackLead);
            return fallbackLead;
        }
    },

    /**
     * Retrieves a lead by UUID
     */
    async getLeadById(id) {
        const query = `
            SELECT id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at
            FROM chat_leads
            WHERE id = $1;
        `;

        try {
            const { rows } = await pool.query(query, [id]);
            if (rows[0]) return rows[0];
            return inMemoryLeads.get(id) || null;
        } catch (error) {
            console.warn("[ChatLeadRepository] DB read failed, checking fallback:", error.message);
            return inMemoryLeads.get(id) || null;
        }
    },

    /**
     * Retrieves the single lead record linked to a specific conversation
     */
    async getLeadByConversationId(conversationId) {
        if (!conversationId) return null;
        const query = `
            SELECT id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at
            FROM chat_leads
            WHERE conversation_id = $1
            ORDER BY created_at DESC
            LIMIT 1;
        `;

        try {
            const { rows } = await pool.query(query, [conversationId]);
            if (rows[0]) return rows[0];
            return Array.from(inMemoryLeads.values()).find(
                (l) => l.conversation_id === conversationId
            ) || null;
        } catch (error) {
            console.warn("[ChatLeadRepository] DB read failed, checking fallback:", error.message);
            return Array.from(inMemoryLeads.values()).find(
                (l) => l.conversation_id === conversationId
            ) || null;
        }
    },

    /**
     * Idempotently creates or updates the lead record for a conversation
     */
    async upsertLeadForConversation({
        conversationId,
        visitorName,
        phone,
        projectType,
        projectDescription,
        budget,
        preferredDate,
        location,
        email,
        leadStatus = "new",
        source = "AI Chat Assistant",
    }) {
        const existing = await this.getLeadByConversationId(conversationId);
        if (existing) {
            const updatePayload = {};
            if (visitorName !== undefined) updatePayload.visitor_name = visitorName;
            if (phone !== undefined) updatePayload.phone = phone;
            if (projectType !== undefined) updatePayload.project_type = projectType;
            if (projectDescription !== undefined) updatePayload.project_description = projectDescription;
            if (budget !== undefined) updatePayload.budget = budget;
            if (preferredDate !== undefined) updatePayload.preferred_date = preferredDate;
            if (location !== undefined) updatePayload.location = location;
            if (email !== undefined) updatePayload.email = email;
            if (leadStatus !== undefined) updatePayload.lead_status = leadStatus;

            return await this.updateLead(existing.id, updatePayload);
        }

        const id = crypto.randomUUID();
        return await this.createLead({
            id,
            conversationId,
            visitorName,
            phone,
            projectType,
            projectDescription,
            budget,
            preferredDate,
            location,
            email,
            leadStatus,
            source,
        });
    },

    /**
     * Retrieves all leads linked to a specific conversation
     */
    async getLeadsByConversationId(conversationId) {
        const query = `
            SELECT id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at
            FROM chat_leads
            WHERE conversation_id = $1
            ORDER BY created_at DESC;
        `;

        try {
            const { rows } = await pool.query(query, [conversationId]);
            if (rows.length > 0) return rows;
            return Array.from(inMemoryLeads.values()).filter(
                (l) => l.conversation_id === conversationId
            );
        } catch (error) {
            console.warn("[ChatLeadRepository] DB read failed, checking fallback:", error.message);
            return Array.from(inMemoryLeads.values()).filter(
                (l) => l.conversation_id === conversationId
            );
        }
    },

    /**
     * Lists leads with optional filtering, search, and pagination
     */
    async listLeads({
        status = null,
        projectType = null,
        search = null,
        startDate = null,
        endDate = null,
        limit = 50,
        offset = 0,
    } = {}) {
        let whereClauses = [];
        let values = [];

        if (status) {
            values.push(status.toLowerCase());
            whereClauses.push(`LOWER(lead_status) = $${values.length}`);
        }

        if (projectType) {
            values.push(`%${projectType.toLowerCase()}%`);
            whereClauses.push(`LOWER(project_type) LIKE $${values.length}`);
        }

        if (search) {
            values.push(`%${search.toLowerCase()}%`);
            const sIdx = values.length;
            whereClauses.push(`(
                LOWER(visitor_name) LIKE $${sIdx} OR
                LOWER(email) LIKE $${sIdx} OR
                LOWER(phone) LIKE $${sIdx} OR
                LOWER(project_description) LIKE $${sIdx} OR
                LOWER(location) LIKE $${sIdx}
            )`);
        }

        if (startDate) {
            values.push(startDate);
            whereClauses.push(`created_at >= $${values.length}`);
        }

        if (endDate) {
            values.push(endDate);
            whereClauses.push(`created_at <= $${values.length}`);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

        const countQuery = `SELECT COUNT(*) AS total FROM chat_leads ${whereSql};`;
        const listQuery = `
            SELECT id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at
            FROM chat_leads
            ${whereSql}
            ORDER BY created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2};
        `;

        const queryValues = [...values, limit, offset];

        try {
            const countResult = await pool.query(countQuery, values);
            const total = parseInt(countResult.rows[0]?.total || 0, 10);
            const { rows } = await pool.query(listQuery, queryValues);
            return { leads: rows, total };
        } catch (error) {
            console.warn("[ChatLeadRepository] DB list failed, checking fallback:", error.message);
            let filtered = Array.from(inMemoryLeads.values());

            if (status) {
                filtered = filtered.filter((l) => (l.lead_status || "").toLowerCase() === status.toLowerCase());
            }
            if (projectType) {
                filtered = filtered.filter((l) => (l.project_type || "").toLowerCase().includes(projectType.toLowerCase()));
            }
            if (search) {
                const s = search.toLowerCase();
                filtered = filtered.filter((l) =>
                    (l.visitor_name && l.visitor_name.toLowerCase().includes(s)) ||
                    (l.email && l.email.toLowerCase().includes(s)) ||
                    (l.phone && l.phone.toLowerCase().includes(s)) ||
                    (l.project_description && l.project_description.toLowerCase().includes(s))
                );
            }
            if (startDate) {
                filtered = filtered.filter((l) => new Date(l.created_at) >= new Date(startDate));
            }
            if (endDate) {
                filtered = filtered.filter((l) => new Date(l.created_at) <= new Date(endDate));
            }

            const total = filtered.length;
            const leads = filtered.slice(offset, offset + limit);
            return { leads, total };
        }
    },

    /**
     * Computes aggregation counts across lead pipeline statuses
     */
    async getLeadStats() {
        const query = `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'new')::int AS new,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'contacted')::int AS contacted,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'in_discussion')::int AS in_discussion,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'qualified')::int AS qualified,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'converted')::int AS converted,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'closed')::int AS closed,
                COUNT(*) FILTER (WHERE LOWER(lead_status) = 'spam')::int AS spam
            FROM chat_leads;
        `;
        try {
            const { rows } = await pool.query(query);
            return rows[0] || {
                total: 0,
                new: 0,
                contacted: 0,
                in_discussion: 0,
                qualified: 0,
                converted: 0,
                closed: 0,
                spam: 0,
            };
        } catch (error) {
            console.warn("[ChatLeadRepository] DB stats failed, computing from fallback:", error.message);
            const all = Array.from(inMemoryLeads.values());
            return {
                total: all.length,
                new: all.filter((l) => (l.lead_status || "").toLowerCase() === "new").length,
                contacted: all.filter((l) => (l.lead_status || "").toLowerCase() === "contacted").length,
                in_discussion: all.filter((l) => (l.lead_status || "").toLowerCase() === "in_discussion").length,
                qualified: all.filter((l) => (l.lead_status || "").toLowerCase() === "qualified").length,
                converted: all.filter((l) => (l.lead_status || "").toLowerCase() === "converted").length,
                closed: all.filter((l) => (l.lead_status || "").toLowerCase() === "closed").length,
                spam: all.filter((l) => (l.lead_status || "").toLowerCase() === "spam").length,
            };
        }
    },

    /**
     * Updates full details of an existing lead
     */
    async updateLead(id, data = {}) {
        const allowedFields = [
            "visitor_name",
            "email",
            "phone",
            "project_type",
            "project_description",
            "budget",
            "preferred_date",
            "location",
            "lead_status",
            "source",
        ];

        const setClauses = [];
        const values = [];

        for (const [key, val] of Object.entries(data)) {
            const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
            if (allowedFields.includes(snakeKey)) {
                values.push(val);
                setClauses.push(`${snakeKey} = $${values.length}`);
            }
        }

        if (setClauses.length === 0) {
            return this.getLeadById(id);
        }

        values.push(id);
        const query = `
            UPDATE chat_leads
            SET ${setClauses.join(", ")}, updated_at = NOW()
            WHERE id = $${values.length}
            RETURNING id, conversation_id, visitor_name, email, phone, project_type, project_description, budget, preferred_date, location, lead_status, source, created_at, updated_at;
        `;

        try {
            const { rows } = await pool.query(query, values);
            return rows[0] || null;
        } catch (error) {
            console.warn("[ChatLeadRepository] DB update failed, checking fallback:", error.message);
            const lead = inMemoryLeads.get(id);
            if (lead) {
                for (const [key, val] of Object.entries(data)) {
                    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
                    if (allowedFields.includes(snakeKey)) {
                        lead[snakeKey] = val;
                    }
                }
                lead.updated_at = new Date().toISOString();
                inMemoryLeads.set(id, lead);
                return lead;
            }
            return null;
        }
    },

    /**
     * Updates the status of an existing lead
     */
    async updateLeadStatus(id, leadStatus) {
        const query = `
            UPDATE chat_leads
            SET lead_status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, lead_status, updated_at;
        `;

        try {
            const { rows } = await pool.query(query, [leadStatus.toLowerCase(), id]);
            return rows[0] || null;
        } catch (error) {
            console.warn("[ChatLeadRepository] DB update failed, checking fallback:", error.message);
            const lead = inMemoryLeads.get(id);
            if (lead) {
                lead.lead_status = leadStatus.toLowerCase();
                lead.updated_at = new Date().toISOString();
                inMemoryLeads.set(id, lead);
                return lead;
            }
            return null;
        }
    },

    /**
     * Deletes a lead record
     */
    async deleteLead(id) {
        const query = `
            DELETE FROM chat_leads
            WHERE id = $1
            RETURNING id;
        `;

        try {
            const { rows } = await pool.query(query, [id]);
            inMemoryLeads.delete(id);
            return rows.length > 0;
        } catch (error) {
            console.warn("[ChatLeadRepository] DB delete failed, checking fallback:", error.message);
            const existed = inMemoryLeads.has(id);
            inMemoryLeads.delete(id);
            return existed;
        }
    },
};

export default chatLeadRepository;

