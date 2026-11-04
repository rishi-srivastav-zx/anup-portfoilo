/**
 * Smart Search Relevance Scorer
 * Step 6: Smart Search Engine for Cinematographer Portfolio AI Assistant
 */

import {
    SMART_SEARCH_WEIGHTS,
    SMART_SEARCH_THRESHOLDS,
} from "../../constants/smartSearch.constants.js";
import { stemWord, tokenizeText } from "../knowledgeRetrieval/knowledgeScorer.js";

/**
 * Trigram-like Jaccard character similarity for in-memory fallback
 */
function computeCharTrigrams(str) {
    const s = `  ${str.toLowerCase()} `;
    const trigrams = new Set();
    for (let i = 0; i < s.length - 2; i++) {
        trigrams.add(s.substring(i, i + 3));
    }
    return trigrams;
}

function calculateFuzzySimilarity(strA, strB) {
    if (!strA || !strB) return 0;
    const setA = computeCharTrigrams(strA);
    const setB = computeCharTrigrams(strB);
    let intersection = 0;
    for (const t of setA) {
        if (setB.has(t)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    return union === 0 ? 0 : intersection / union;
}

export const smartSearchScorer = {
    /**
     * Scores a knowledge candidate against smart search multi-factor signals
     * @param {object} params
     * @param {object} params.record - Knowledge item
     * @param {object} params.queryContext - Normalized query, tokens, intent, categories, entities
     * @returns {number} Score from 0.00 to 1.00
     */
    score({ record, queryContext }) {
        if (!record || !queryContext) return 0;

        const {
            normalizedQuery = "",
            searchTokens = [],
            intent = null,
            categoryPreferences = [],
            entities = {},
            injectedContextTerms = [],
        } = queryContext;

        const cleanQ = normalizedQuery.toLowerCase().trim();
        const title = (record.title || "").toLowerCase();
        const content = (record.content || "").toLowerCase();
        const projectName = (record.project_name || "").toLowerCase();
        const category = (record.category || "").toLowerCase();
        const keywords = (record.keywords || []).map((k) => String(k).toLowerCase());

        let totalScore = 0;

        // 1. Exact Phrase Match (Weight: 0.20)
        let exactPhraseScore = 0;
        if (cleanQ.length > 2 && (title.includes(cleanQ) || cleanQ.includes(title))) {
            exactPhraseScore = 1.0;
        } else if (cleanQ.length > 4 && content.includes(cleanQ)) {
            exactPhraseScore = 0.8;
        }
        totalScore += exactPhraseScore * SMART_SEARCH_WEIGHTS.EXACT_PHRASE;

        // 2. Full-Text Search Rank (Weight: 0.15)
        let ftsScore = 0;
        const numFts = typeof record.fts_rank === "number" ? record.fts_rank : parseFloat(record.fts_rank || 0);
        if (numFts > 0) {
            ftsScore = Math.min(1.0, numFts * 3.0);
        }
        if (ftsScore < 0.4 && searchTokens.length > 0) {
            const tokenStems = searchTokens.map(stemWord);
            const matchedTokens = searchTokens.filter((token, idx) => {
                const stem = tokenStems[idx];
                return (
                    title.includes(token) ||
                    content.includes(token) ||
                    keywords.some((kw) => kw.includes(token) || kw.includes(stem))
                );
            }).length;
            ftsScore = Math.max(ftsScore, Math.min(1.0, matchedTokens / searchTokens.length));
        }
        totalScore += ftsScore * SMART_SEARCH_WEIGHTS.FTS_RANK;

        // 3. Fuzzy Similarity (Trigram) (Weight: 0.15)
        let fuzzyScore = 0;
        const titleSim = typeof record.title_sim === "number" ? record.title_sim : parseFloat(record.title_sim || 0);
        const projSim = typeof record.project_sim === "number" ? record.project_sim : parseFloat(record.project_sim || 0);
        fuzzyScore = Math.max(titleSim, projSim);

        if (fuzzyScore < 0.25) {
            const fallbackTitleSim = calculateFuzzySimilarity(cleanQ, title);
            const fallbackProjSim = projectName ? calculateFuzzySimilarity(cleanQ, projectName) : 0;
            fuzzyScore = Math.max(fuzzyScore, fallbackTitleSim, fallbackProjSim);
        }
        totalScore += Math.min(1.0, fuzzyScore) * SMART_SEARCH_WEIGHTS.FUZZY_SIMILARITY;

        // 4. Keyword Overlap (Weight: 0.15)
        let keywordScore = 0;
        if (keywords.length > 0 && searchTokens.length > 0) {
            const tokenStems = searchTokens.map(stemWord);
            const matchedKeywords = searchTokens.filter((st, idx) => {
                const stem = tokenStems[idx];
                return keywords.some((kw) =>
                    kw.includes(st) || st.includes(kw) || kw.includes(stem)
                );
            }).length;
            keywordScore = Math.min(1.0, matchedKeywords / Math.min(searchTokens.length, 5));
        }
        totalScore += keywordScore * SMART_SEARCH_WEIGHTS.KEYWORD_OVERLAP;

        // 5. Intent Compatibility (Weight: 0.15)
        let intentScore = 0;
        const normalizedCats = categoryPreferences.map((c) => c.toLowerCase());
        if (normalizedCats.length > 0) {
            if (normalizedCats[0] === category) {
                intentScore = 1.0;
            } else if (normalizedCats.includes(category)) {
                intentScore = 0.75;
            }
        }
        totalScore += intentScore * SMART_SEARCH_WEIGHTS.INTENT_COMPATIBILITY;

        // 6. Entity & Context Matches (Weight: 0.10)
        let entityScore = 0;
        const allEntityTerms = [
            ...Object.values(entities || {}).filter((v) => typeof v === "string" && v.length > 0),
            ...injectedContextTerms,
        ].map((t) => t.toLowerCase());

        if (allEntityTerms.length > 0) {
            const matchedEntityCount = allEntityTerms.filter((term) =>
                title.includes(term) ||
                content.includes(term) ||
                projectName.includes(term) ||
                keywords.some((kw) => kw.includes(term) || term.includes(kw))
            ).length;
            entityScore = Math.min(1.0, matchedEntityCount / allEntityTerms.length);
        }
        totalScore += entityScore * SMART_SEARCH_WEIGHTS.ENTITY_MATCH;

        // 7. Category Relevance (Weight: 0.10)
        let categoryScore = 0;
        if (normalizedCats.includes(category)) {
            categoryScore = 1.0;
        } else if (searchTokens.some((t) => category.includes(t))) {
            categoryScore = 0.8;
        }
        totalScore += categoryScore * SMART_SEARCH_WEIGHTS.CATEGORY_RELEVANCE;

        // Normalize between 0.00 and 1.00
        const finalScore = Math.min(1.0, Math.max(0.0, totalScore));
        return Math.round(finalScore * 100) / 100;
    },

    /**
     * Scores, prunes below minimum threshold, and sorts records in descending order
     */
    rankAndFilter(records, queryContext, threshold = SMART_SEARCH_THRESHOLDS.MIN_RELEVANCE_SCORE, limit = 5) {
        if (!Array.isArray(records) || records.length === 0) return [];

        const scored = records.map((record) => {
            const score = this.score({ record, queryContext });
            return {
                id: record.id,
                title: record.title,
                category: record.category,
                projectName: record.project_name || null,
                content: record.content,
                keywords: record.keywords || [],
                metadata: typeof record.metadata === "string" ? JSON.parse(record.metadata) : (record.metadata || {}),
                relevanceScore: score,
            };
        });

        // Exclude records strictly below minimum threshold
        const filtered = scored.filter((item) => item.relevanceScore >= threshold);

        // Sort descending by relevance score
        filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return filtered.slice(0, limit);
    },
};

export default smartSearchScorer;
