import crypto from "crypto";
import { portfolioKnowledgeRepository } from "../repositories/portfolioKnowledge.repository.js";
import {
    KNOWLEDGE_STATUS,
    SUGGESTED_KNOWLEDGE_CATEGORIES,
} from "../constants/portfolioKnowledge.constants.js";

/**
 * Custom Error Class for Knowledge Management
 */
export class KnowledgeError extends Error {
    constructor(message, statusCode = 400, code = "KNOWLEDGE_ERROR") {
        super(message);
        this.name = "KnowledgeError";
        this.statusCode = statusCode;
        this.code = code;
    }
}

/**
 * Strips dangerous HTML tags and control characters to sanitize content
 */
const sanitizeText = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
        .replace(/<[^>]*>?/gm, "")
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "")
        .trim();
};

export const portfolioKnowledgeService = {
    /**
     * Creates a new dynamic knowledge record
     */
    async createKnowledge({
        title,
        content,
        category,
        projectName = null,
        keywords = [],
        metadata = {},
        status = null,
        isPublished = undefined,
    }) {
        const id = crypto.randomUUID();

        // Determine publishing status: sync status and isPublished
        let finalStatus = KNOWLEDGE_STATUS.PUBLISHED;
        let finalIsPublished = true;

        if (status) {
            finalStatus = status;
            finalIsPublished = status === KNOWLEDGE_STATUS.PUBLISHED;
        } else if (typeof isPublished === "boolean") {
            finalIsPublished = isPublished;
            finalStatus = isPublished ? KNOWLEDGE_STATUS.PUBLISHED : KNOWLEDGE_STATUS.DRAFT;
        }

        // Clean & sanitize keywords array
        const cleanedKeywords = Array.isArray(keywords)
            ? Array.from(new Set(keywords.map((k) => String(k).trim()).filter(Boolean)))
            : [];

        const record = await portfolioKnowledgeRepository.createKnowledge({
            id,
            title: sanitizeText(title),
            content: content.trim(),
            category: category.trim(),
            projectName: projectName ? projectName.trim() : null,
            keywords: cleanedKeywords,
            metadata: typeof metadata === "object" && metadata !== null ? metadata : {},
            status: finalStatus,
            isPublished: finalIsPublished,
        });

        return record;
    },

    /**
     * Lists knowledge records with search, category filtering, and pagination
     */
    async listKnowledge({
        page = 1,
        limit = 20,
        search = null,
        category = null,
        status = null,
        isPublished = null,
        projectName = null,
    } = {}) {
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
        const offset = (pageNum - 1) * limitNum;

        const { items, total } = await portfolioKnowledgeRepository.listKnowledge({
            search,
            category,
            status,
            isPublished,
            projectName,
            limit: limitNum,
            offset,
        });

        const totalPages = Math.ceil(total / limitNum) || 1;

        return {
            items,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        };
    },

    /**
     * Retrieves a single knowledge record by UUID
     */
    async getKnowledgeById(id) {
        const item = await portfolioKnowledgeRepository.getKnowledgeById(id);
        if (!item) {
            throw new KnowledgeError(
                `Knowledge record not found with ID '${id}'.`,
                404,
                "KNOWLEDGE_NOT_FOUND"
            );
        }
        return item;
    },

    /**
     * Updates an existing knowledge record
     */
    async updateKnowledge(id, updates = {}) {
        // Verify existence first
        await this.getKnowledgeById(id);

        const sanitizedUpdates = {};

        if (updates.title !== undefined) {
            sanitizedUpdates.title = sanitizeText(updates.title);
        }
        if (updates.content !== undefined) {
            sanitizedUpdates.content = updates.content.trim();
        }
        if (updates.category !== undefined) {
            sanitizedUpdates.category = updates.category.trim();
        }
        if (updates.projectName !== undefined) {
            sanitizedUpdates.projectName = updates.projectName ? updates.projectName.trim() : null;
        }
        if (updates.keywords !== undefined) {
            sanitizedUpdates.keywords = Array.isArray(updates.keywords)
                ? Array.from(new Set(updates.keywords.map((k) => String(k).trim()).filter(Boolean)))
                : [];
        }
        if (updates.metadata !== undefined) {
            sanitizedUpdates.metadata =
                typeof updates.metadata === "object" && updates.metadata !== null
                    ? updates.metadata
                    : {};
        }

        // Status & isPublished sync
        if (updates.status !== undefined) {
            sanitizedUpdates.status = updates.status;
            sanitizedUpdates.isPublished = updates.status === KNOWLEDGE_STATUS.PUBLISHED;
        } else if (typeof updates.isPublished === "boolean") {
            sanitizedUpdates.isPublished = updates.isPublished;
            sanitizedUpdates.status = updates.isPublished
                ? KNOWLEDGE_STATUS.PUBLISHED
                : KNOWLEDGE_STATUS.DRAFT;
        }

        const updated = await portfolioKnowledgeRepository.updateKnowledge(id, sanitizedUpdates);
        return updated;
    },

    /**
     * Updates publication status ('draft', 'published', 'archived')
     */
    async updateKnowledgeStatus(id, { status = null, isPublished = null, is_published = null }) {
        await this.getKnowledgeById(id);

        let finalStatus;
        let finalIsPublished;

        if (status) {
            finalStatus = status;
            finalIsPublished = status === KNOWLEDGE_STATUS.PUBLISHED;
        } else {
            const pub = typeof isPublished === "boolean" ? isPublished : Boolean(is_published);
            finalIsPublished = pub;
            finalStatus = pub ? KNOWLEDGE_STATUS.PUBLISHED : KNOWLEDGE_STATUS.DRAFT;
        }

        const result = await portfolioKnowledgeRepository.updateKnowledgeStatus(id, {
            status: finalStatus,
            isPublished: finalIsPublished,
        });

        return result;
    },

    /**
     * Deletes a knowledge record
     */
    async deleteKnowledge(id) {
        await this.getKnowledgeById(id);
        const deleted = await portfolioKnowledgeRepository.deleteKnowledge(id);
        return deleted;
    },

    /**
     * Returns suggested default categories and active categories currently in the database
     */
    async getCategories() {
        const activeCategories = await portfolioKnowledgeRepository.getDistinctCategories();
        return {
            suggestedCategories: SUGGESTED_KNOWLEDGE_CATEGORIES,
            activeCategories,
        };
    },

    /**
     * Public knowledge retrieval interface for Step 5 & AI Assistant Chatbot
     * Strictly filters for published knowledge. Draft and archived records are never returned.
     */
    async getPublishedKnowledge({ search = null, category = null, limit = 10, offset = 0 } = {}) {
        return await portfolioKnowledgeRepository.listKnowledge({
            search,
            category,
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
            limit,
            offset,
        });
    },
};

export default portfolioKnowledgeService;

