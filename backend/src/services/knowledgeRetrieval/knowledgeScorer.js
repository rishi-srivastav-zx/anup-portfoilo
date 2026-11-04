/**
 * Knowledge Scorer & Relevance Ranking Engine
 * Step 5: Portfolio Knowledge Retrieval Engine
 */

import { SCORING_WEIGHTS, RELEVANCE_THRESHOLDS } from "../../constants/knowledgeRetrieval.constants.js";

/**
 * Standard English Stopwords & conversational query filler words
 * Proper nouns (Anup, Rawat) and domain terms (commercial, film, transit, camera, lens) are NEVER stopwords.
 */
const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with",
    "by", "from", "is", "are", "was", "were", "be", "been", "have", "has", "had",
    "do", "does", "did", "can", "could", "will", "would", "should", "tell", "me",
    "about", "show", "what", "which", "who", "whom", "where", "when", "how", "you",
    "your", "yours", "i", "he", "she", "it", "they", "we", "my", "our", "please",
    "give", "get", "like", "use", "using", "want"
]);

/**
 * Simple English stemmer for plural and common suffix normalization
 */
export const stemWord = (word) => {
    if (!word || word.length <= 3) return word;
    const lower = word.toLowerCase();
    if (lower.endsWith("ies") && lower.length > 4) return lower.slice(0, -3) + "y";
    if (lower.endsWith("es") && !lower.endsWith("ses") && !lower.endsWith("zes") && lower.length > 4) return lower.slice(0, -2);
    if (lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
    if (lower.endsWith("ing") && lower.length > 5) return lower.slice(0, -3);
    if (lower.endsWith("ed") && lower.length > 4) return lower.slice(0, -2);
    return lower;
};

/**
 * Tokenizes text into lowercase alphanumeric words, filtering out short stopwords
 */
export const tokenizeText = (text) => {
    if (!text || typeof text !== "string") return [];
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
};

export const knowledgeScorer = {
    /**
     * Calculates the relevance score of a knowledge record against a query, intent, and entities
     * @param {object} params
     * @param {object} params.record - Database or fallback knowledge record
     * @param {string} params.query - Cleaned visitor question
     * @param {string|null} [params.intent] - Detected intent name
     * @param {Array<string>} [params.categoryPreferences] - Inferred relevant categories
     * @param {object} [params.entities] - Extracted entities dictionary
     * @returns {number} Score between 0.00 and 1.00
     */
    scoreRecord({ record, query, intent = null, categoryPreferences = [], entities = {} }) {
        if (!record || !query) return 0;

        const cleanQuery = query.trim().toLowerCase();
        const queryTokens = tokenizeText(cleanQuery);
        const queryStems = queryTokens.map(stemWord);

        const entityValues = Object.values(entities || {})
            .filter((v) => typeof v === "string" && v.trim().length > 0)
            .map((v) => v.toLowerCase().trim());

        // Extract and normalize record fields
        const title = (record.title || "").toLowerCase();
        const content = (record.content || "").toLowerCase();
        const projectName = (record.project_name || "").toLowerCase();
        const category = (record.category || "").toLowerCase();
        const keywords = (record.keywords || []).map((k) => String(k).toLowerCase());

        let totalScore = 0;

        // 1. Exact Title & Title Token Match (Weight: 0.25)
        let titleComponent = 0;
        if (cleanQuery.length > 2 && (title.includes(cleanQuery) || cleanQuery.includes(title))) {
            titleComponent = 1.0;
        } else if (queryTokens.length > 0) {
            const titleTokens = tokenizeText(title);
            const titleStems = titleTokens.map(stemWord);
            const matchedCount = queryTokens.filter((qt, idx) => {
                const qStem = queryStems[idx];
                return (
                    titleTokens.some((tt) => tt === qt || tt.includes(qt) || qt.includes(tt)) ||
                    titleStems.some((ts) => ts === qStem || ts.includes(qStem) || qStem.includes(ts))
                );
            }).length;
            titleComponent = matchedCount / queryTokens.length;
        }
        totalScore += titleComponent * SCORING_WEIGHTS.EXACT_TITLE_MATCH;

        // 2. Project Name Match (Weight: 0.15)
        let projectComponent = 0;
        if (projectName) {
            if (cleanQuery.includes(projectName) || projectName.includes(cleanQuery)) {
                projectComponent = 1.0;
            } else {
                const projectTokens = tokenizeText(projectName);
                const projectStems = projectTokens.map(stemWord);
                const matchedProjectTokens = queryTokens.filter((qt, idx) => {
                    const qStem = queryStems[idx];
                    return (
                        projectTokens.some((pt) => pt === qt || pt.includes(qt) || qt.includes(pt)) ||
                        projectStems.some((ps) => ps === qStem || ps.includes(qStem) || qStem.includes(ps))
                    );
                }).length;

                // Also check if any entity matched project name
                const entityMatched = entityValues.some(
                    (ev) => projectName.includes(ev) || ev.includes(projectName)
                );

                if (entityMatched) {
                    projectComponent = Math.max(projectComponent, 0.85);
                }
                if (queryTokens.length > 0) {
                    projectComponent = Math.max(projectComponent, matchedProjectTokens / queryTokens.length);
                }
            }
        }
        totalScore += projectComponent * SCORING_WEIGHTS.PROJECT_NAME_MATCH;

        // 3. Keywords Match (Weight: 0.20)
        let keywordsComponent = 0;
        if (keywords.length > 0 && queryTokens.length > 0) {
            const keywordTokens = keywords.flatMap((kw) => tokenizeText(kw));
            const keywordStems = keywordTokens.map(stemWord);

            const matchedKeywords = queryTokens.filter((qt, idx) => {
                const qStem = queryStems[idx];
                return (
                    keywords.some((kw) => kw.includes(qt) || qt.includes(kw)) ||
                    keywordTokens.some((kt) => kt === qt) ||
                    keywordStems.some((ks) => ks === qStem)
                );
            }).length;

            const entityKeywordMatches = entityValues.filter((ev) =>
                keywords.some((kw) => kw === ev || kw.includes(ev) || ev.includes(kw))
            ).length;

            const kwRatio = matchedKeywords / queryTokens.length;
            const entRatio = entityValues.length > 0 ? entityKeywordMatches / entityValues.length : 0;
            keywordsComponent = Math.min(1.0, kwRatio + entRatio * 0.5);
        }
        totalScore += keywordsComponent * SCORING_WEIGHTS.KEYWORD_MATCH;

        // 4. Content Match (Weight: 0.10)
        let contentComponent = 0;
        if (cleanQuery.length > 4 && content.includes(cleanQuery)) {
            contentComponent = 1.0;
        } else if (queryTokens.length > 0) {
            const contentTokens = tokenizeText(content);
            const contentStems = contentTokens.map(stemWord);

            const matchedInContent = queryTokens.filter((qt, idx) => {
                const qStem = queryStems[idx];
                return content.includes(qt) || contentStems.some((cs) => cs === qStem);
            }).length;
            contentComponent = matchedInContent / queryTokens.length;
        }
        totalScore += contentComponent * SCORING_WEIGHTS.CONTENT_MATCH;

        // 5. Category Compatibility Match (Weight: 0.15)
        let categoryComponent = 0;
        const normalizedPreferences = categoryPreferences.map((c) => c.toLowerCase());
        const categoryTokens = tokenizeText(category);
        const queryMatchesCategory = queryTokens.some((qt) => categoryTokens.includes(qt));

        if (normalizedPreferences.includes(category)) {
            const isTopPref = normalizedPreferences[0] === category;
            categoryComponent = isTopPref ? 1.0 : 0.8;
        } else if (queryMatchesCategory) {
            categoryComponent = 0.85;
        } else if (normalizedPreferences.some((p) => p.includes(category) || category.includes(p))) {
            categoryComponent = 0.6;
        }
        totalScore += categoryComponent * SCORING_WEIGHTS.CATEGORY_MATCH;

        // 6. Intent Compatibility (Weight: 0.15)
        let intentComponent = 0;
        if (intent && normalizedPreferences.length > 0) {
            if (normalizedPreferences[0] === category) {
                intentComponent = 1.0;
            } else if (normalizedPreferences.includes(category)) {
                intentComponent = 0.75;
            }
        }
        totalScore += intentComponent * SCORING_WEIGHTS.INTENT_COMPATIBILITY;

        // 7. Entity Match Boost (Up to +0.15)
        let entityBoost = 0;
        if (entityValues.length > 0) {
            for (const ev of entityValues) {
                if (
                    title.includes(ev) ||
                    projectName.includes(ev) ||
                    keywords.some((kw) => kw.includes(ev)) ||
                    content.includes(ev)
                ) {
                    entityBoost = SCORING_WEIGHTS.ENTITY_MATCH_BOOST;
                    break;
                }
            }
        }
        totalScore += entityBoost;

        // 8. Exact Phrase Boost (+0.10)
        if (
            cleanQuery.split(/\s+/).length >= 2 &&
            (title.includes(cleanQuery) || content.includes(cleanQuery))
        ) {
            totalScore += SCORING_WEIGHTS.PHRASE_MATCH_BOOST;
        }

        // Clamp to [0.00, 1.00] and round to 2 decimals
        const finalScore = Math.min(1.0, Math.max(0.0, totalScore));
        return Math.round(finalScore * 100) / 100;
    },

    /**
     * Ranks and prunes knowledge candidates based on minimum threshold
     * @param {Array<object>} records
     * @param {object} context
     * @param {number} [threshold]
     * @param {number} [limit]
     * @returns {Array<object>}
     */
    rankAndFilter(records, context, threshold = RELEVANCE_THRESHOLDS.MINIMUM, limit = 5) {
        if (!Array.isArray(records) || records.length === 0) return [];

        const scored = records.map((record) => {
            const score = this.scoreRecord({
                record,
                query: context.query,
                intent: context.intent,
                categoryPreferences: context.categoryPreferences || [],
                entities: context.entities || {},
            });
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

        // Filter out below minimum threshold
        const relevant = scored.filter((item) => item.relevanceScore >= threshold);

        // Sort descending by relevance score
        relevant.sort((a, b) => b.relevanceScore - a.relevanceScore);

        return relevant.slice(0, limit);
    },
};

export default knowledgeScorer;
