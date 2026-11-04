/**
 * Portfolio Knowledge Retrieval Service
 * Step 5: Portfolio Knowledge Retrieval Engine
 * 
 * Retrieves relevant published knowledge from Neon PostgreSQL database based on
 * visitor questions, detected intents, extracted entities, and weighted relevance scoring.
 */

import { smartSearchService } from "./smartSearch.service.js";
import {
    INTENT_TO_CATEGORY_PREFERENCES,
    RELEVANCE_THRESHOLDS,
    DEFAULT_RETRIEVAL_LIMIT,
} from "../constants/knowledgeRetrieval.constants.js";

/**
 * Sanitizes input query string
 */
const sanitizeQuery = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
        .replace(/<[^>]*>?/gm, "")
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "")
        .trim();
};

export const knowledgeRetrievalService = {
    /**
     * Resolves preferred knowledge categories based on intent and entities
     */
    resolvePreferredCategories(intent, intentCategory, entities = {}) {
        return smartSearchService.resolveCategories(intent, intentCategory, entities);
    },

    /**
     * Core retrieval pipeline powered by Smart Search Engine (Step 6)
     * Handles multilingual queries, synonyms, pg_trgm fuzzy matching, FTS, and context resolution
     * @param {object} params
     * @param {string} params.query - Visitor question
     * @param {string|null} [params.intent] - Detected intent name (from Step 3)
     * @param {string|null} [params.category] - Intent category
     * @param {object} [params.entities] - Extracted entities (from Step 3)
     * @param {Array<object>} [params.recentMessages] - Previous conversation messages
     * @param {number} [params.limit] - Max items to return
     * @param {number} [params.minThreshold] - Minimum score threshold
     * @returns {Promise<object>}
     */
    async retrieveKnowledge({
        query,
        intent = null,
        category = null,
        entities = {},
        recentMessages = [],
        conversationState = null,
        limit = DEFAULT_RETRIEVAL_LIMIT,
        minThreshold = RELEVANCE_THRESHOLDS.MINIMUM,
    } = {}) {
        const cleanQuery = sanitizeQuery(query);
        return await smartSearchService.search({
            query: cleanQuery,
            intent,
            category,
            entities,
            recentMessages,
            conversationState,
            limit,
            minThreshold,
        });
    },
};

export default knowledgeRetrievalService;
