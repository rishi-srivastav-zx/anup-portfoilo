/**
 * Smart Search Engine Service
 * Step 6: Smart Search Engine for Cinematographer Portfolio AI Assistant
 * 
 * Implements a hybrid search pipeline combining:
 * - Multilingual query normalization (English, Hindi, Hinglish) & domain synonym expansion
 * - PostgreSQL Full-Text Search (tsvector / plainto_tsquery / ts_rank)
 * - PostgreSQL Trigram fuzzy similarity (pg_trgm) for typo tolerance
 * - Step 3 Intent & Entity alignment
 * - Context-aware anaphora and pronoun resolution
 * - Multi-factor relevance scoring and threshold filtering
 */

import { portfolioKnowledgeRepository } from "../repositories/portfolioKnowledge.repository.js";
import { searchQueryExpander } from "./smartSearch/searchQueryExpander.js";
import { conversationContextResolver } from "./smartSearch/conversationContextResolver.js";
import { smartSearchScorer } from "./smartSearch/smartSearch.scorer.js";
import {
    SMART_SEARCH_LIMITS,
    SMART_SEARCH_THRESHOLDS,
} from "../constants/smartSearch.constants.js";
import { INTENT_TO_CATEGORY_PREFERENCES } from "../constants/knowledgeRetrieval.constants.js";

export const smartSearchService = {
    /**
     * Resolves preferred knowledge categories from intent and extracted entities
     * @param {string|null} intent
     * @param {string|null} category
     * @param {object} entities
     * @returns {Array<string>}
     */
    resolveCategories(intent, category, entities = {}) {
        const preferred = new Set();

        if (intent && INTENT_TO_CATEGORY_PREFERENCES[intent]) {
            for (const cat of INTENT_TO_CATEGORY_PREFERENCES[intent]) {
                preferred.add(cat);
            }
        }

        if (entities?.equipmentType) {
            preferred.add("Camera Equipment");
            preferred.add("Lenses and Gear");
        }
        if (entities?.projectType) {
            preferred.add("Portfolio Projects");
            preferred.add("Services");
        }
        if (entities?.serviceType) {
            preferred.add("Services");
            preferred.add("Working Process");
        }
        if (entities?.location) {
            preferred.add("Location");
            preferred.add("Portfolio Projects");
        }

        return Array.from(preferred);
    },

    /**
     * Executes the end-to-end Smart Search pipeline
     * @param {object} params
     * @param {string} params.query - Raw visitor question (English / Hindi / Hinglish)
     * @param {string|null} [params.intent] - Detected intent from Step 3
     * @param {string|null} [params.category] - Overarching intent category
     * @param {object} [params.entities] - Extracted entities dictionary
     * @param {Array<object>} [params.recentMessages] - Previous messages in conversation for context
     * @param {number} [params.limit] - Max results to return
     * @param {number} [params.minThreshold] - Minimum score threshold
     * @returns {Promise<object>}
     */
    async search({
        query,
        intent = null,
        category = null,
        entities = {},
        recentMessages = [],
        conversationState = null,
        limit = SMART_SEARCH_LIMITS.DEFAULT,
        minThreshold = SMART_SEARCH_THRESHOLDS.MIN_RELEVANCE_SCORE,
    } = {}) {
        const rawQ = (query || "").trim();
        const resolvedLimit = Math.max(1, Math.min(SMART_SEARCH_LIMITS.MAX, parseInt(limit, 10) || SMART_SEARCH_LIMITS.DEFAULT));

        // 1. Multilingual query normalization & domain synonym expansion
        const expanded = searchQueryExpander.expand(rawQ);

        // 2. Context resolution for pronouns and short follow-up questions
        const contextRes = conversationContextResolver.resolve({
            query: expanded.normalizedQuery,
            recentMessages,
            currentEntities: entities,
            conversationState,
        });

        const mergedEntities = contextRes.mergedEntities;
        const injectedContextTerms = contextRes.injectedContextTerms;

        // If normalized query is empty and no intent is present
        if (!expanded.normalizedQuery && !intent) {
            return {
                query: rawQ,
                normalizedQuery: "",
                intent: null,
                entities: mergedEntities,
                contextUsed: false,
                results: [],
                totalResults: 0,
                hasRelevantKnowledge: false,
                relevanceLevel: "none",
                fallbackStatus: "NO_RELEVANT_KNOWLEDGE",
            };
        }

        // 3. Map preferred categories
        const categoryPreferences = this.resolveCategories(intent, category, mergedEntities);

        // 4. Gather search tokens and entity terms
        const projectName = mergedEntities?.projectName || null;
        const entityTerms = [
            ...Object.values(mergedEntities).filter((v) => typeof v === "string" && v.length > 0),
            ...injectedContextTerms,
        ];

        // 5. Query candidate records via PostgreSQL FTS + Trigram Similarity + Keyword matching
        // Strictly filters status = 'published' AND is_published = TRUE
        const candidateRecords = await portfolioKnowledgeRepository.smartSearchPublishedKnowledge({
            normalizedQuery: expanded.normalizedQuery,
            searchTokens: expanded.searchTokens,
            categoryPreferences,
            projectName,
            entityTerms,
            limit: SMART_SEARCH_LIMITS.CANDIDATE_POOL,
        });

        // 6. Multi-factor scoring and ranking
        const queryContext = {
            query: rawQ,
            normalizedQuery: expanded.normalizedQuery,
            searchTokens: expanded.searchTokens,
            intent,
            categoryPreferences,
            entities: mergedEntities,
            injectedContextTerms,
        };

        const rankedResults = smartSearchScorer.rankAndFilter(
            candidateRecords,
            queryContext,
            minThreshold,
            resolvedLimit
        );

        // 7. Relevance evaluation & fallback determination
        const hasRelevantKnowledge = rankedResults.length > 0;
        let relevanceLevel = "none";

        if (hasRelevantKnowledge) {
            const topScore = rankedResults[0].relevanceScore;
            if (topScore >= SMART_SEARCH_THRESHOLDS.HIGH_RELEVANCE) {
                relevanceLevel = "high";
            } else if (topScore >= SMART_SEARCH_THRESHOLDS.MODERATE_RELEVANCE) {
                relevanceLevel = "moderate";
            } else {
                relevanceLevel = "weak";
            }
        }

        const searchTechniques = [
            "pg_full_text_search",
            "pg_trgm_fuzzy_matching",
            "multilingual_normalization",
            "domain_synonym_expansion",
            "intent_compatibility",
        ];
        if (contextRes.contextUsed) {
            searchTechniques.push("context_anaphora_resolution");
        }

        return {
            query: rawQ,
            normalizedQuery: expanded.normalizedQuery,
            intent: intent || null,
            entities: mergedEntities,
            contextUsed: contextRes.contextUsed,
            results: rankedResults,
            totalResults: rankedResults.length,
            hasRelevantKnowledge,
            relevanceLevel,
            searchTechniques,
            fallbackStatus: hasRelevantKnowledge ? null : "NO_RELEVANT_KNOWLEDGE",
        };
    },
};

export default smartSearchService;

