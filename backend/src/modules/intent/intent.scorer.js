/**
 * Scorer for Intent Detection Engine
 * Step 3: Confidence Scoring, Ambiguity Detection, and Context Boost
 */

import {
    INTENTS,
    INTENT_CATEGORIES,
    CONFIDENCE_THRESHOLDS,
    INTENT_TO_CATEGORY_MAP,
} from "./intent.constants.js";
import { INTENT_PATTERNS } from "./intent.patterns.js";

// Follow-up context boost transitions
const CONTEXT_FOLLOW_UP_MAP = {
    // If user previously asked about general services, asking about a specific niche boosts that niche intent
    [INTENTS.SERVICES_INQUIRY]: {
        wedding: INTENTS.WEDDING_INQUIRY,
        weddings: INTENTS.WEDDING_INQUIRY,
        commercial: INTENTS.COMMERCIAL_INQUIRY,
        commercials: INTENTS.COMMERCIAL_INQUIRY,
        documentary: INTENTS.DOCUMENTARY_INQUIRY,
        documentaries: INTENTS.DOCUMENTARY_INQUIRY,
        music: INTENTS.MUSIC_VIDEO_INQUIRY,
        brand: INTENTS.BRAND_FILM_INQUIRY,
        rates: INTENTS.PRICING_INQUIRY,
        cost: INTENTS.PRICING_INQUIRY,
        charge: INTENTS.PRICING_INQUIRY,
    },
    // If user previously asked about a project or service, inquiring about pricing or booking is a follow-up
    [INTENTS.WEDDING_INQUIRY]: {
        "how much": INTENTS.PRICING_INQUIRY,
        rates: INTENTS.PRICING_INQUIRY,
        cost: INTENTS.PRICING_INQUIRY,
        charge: INTENTS.PRICING_INQUIRY,
        price: INTENTS.PRICING_INQUIRY,
        book: INTENTS.BOOKING_INQUIRY,
        hire: INTENTS.HIRE_INQUIRY,
        available: INTENTS.AVAILABILITY_INQUIRY,
    },
    [INTENTS.COMMERCIAL_INQUIRY]: {
        "how much": INTENTS.PRICING_INQUIRY,
        rates: INTENTS.PRICING_INQUIRY,
        cost: INTENTS.PRICING_INQUIRY,
        charge: INTENTS.PRICING_INQUIRY,
        price: INTENTS.PRICING_INQUIRY,
        book: INTENTS.BOOKING_INQUIRY,
        hire: INTENTS.HIRE_INQUIRY,
        available: INTENTS.AVAILABILITY_INQUIRY,
    },
    [INTENTS.VIEW_PORTFOLIO]: {
        best: INTENTS.FEATURED_WORK,
        bts: INTENTS.BEHIND_THE_SCENES,
        more: INTENTS.PROJECT_DETAILS,
        details: INTENTS.PROJECT_DETAILS,
    },
};

export const intentScorer = {
    /**
     * Evaluates all intent patterns against normalized text and scores candidates
     * @param {object} params
     * @param {object} params.normalizationResult - Result from intentNormalizer.normalize
     * @param {string} [params.previousIntent] - Previous conversation intent for context boost
     * @returns {object} Ranked evaluation containing top candidates and scoring breakdown
     */
    scoreIntents({ normalizationResult, previousIntent = null }) {
        const { normalized, cleaned, tokens, tokenSet } = normalizationResult;

        // Handle empty or whitespace input immediately
        if (!tokens || tokens.length === 0) {
            return {
                topIntent: INTENTS.UNCLEAR_INTENT,
                category: INTENT_CATEGORIES.GENERAL,
                confidence: CONFIDENCE_THRESHOLDS.UNCLEAR_FALLBACK,
                requiresClarification: true,
                candidates: [],
            };
        }

        const candidates = [];

        for (const [intentKey, pattern] of Object.entries(INTENT_PATTERNS)) {
            if (intentKey === INTENTS.UNCLEAR_INTENT) continue;

            let score = 0;
            let matchType = "none";
            const matchedFeatures = [];

            // 1. Exact Phrase Matching (Check normalized and cleaned against list)
            const exactMatch = pattern.exactPhrases.some(
                (p) => normalized === p || cleaned === p
            );
            if (exactMatch) {
                score = CONFIDENCE_THRESHOLDS.EXACT_PHRASE_HIGH;
                matchType = "exact_phrase";
                matchedFeatures.push("exact_phrase");
            }

            // 2. Regex Pattern Matching
            if (score < CONFIDENCE_THRESHOLDS.EXACT_PHRASE_HIGH && pattern.regexPatterns?.length > 0) {
                for (const regex of pattern.regexPatterns) {
                    if (regex.test(normalized) || regex.test(cleaned)) {
                        score = Math.max(score, CONFIDENCE_THRESHOLDS.STRONG_MATCH);
                        matchType = "regex";
                        matchedFeatures.push(`regex:${regex.source}`);
                        break;
                    }
                }
            }

            // 3. Keyword / Token Analysis
            let primaryMatchCount = 0;
            let secondaryMatchCount = 0;

            for (const kw of pattern.primaryKeywords || []) {
                if (tokenSet.has(kw) || normalized.includes(kw)) {
                    primaryMatchCount++;
                }
            }

            for (const kw of pattern.secondaryKeywords || []) {
                if (tokenSet.has(kw) || normalized.includes(kw)) {
                    secondaryMatchCount++;
                }
            }

            // Keyword weighted score calculation
            if (primaryMatchCount > 0 || secondaryMatchCount > 0) {
                const weightedSum = primaryMatchCount * 3.0 + secondaryMatchCount * 1.0;
                const coverage = Math.min(1.0, (primaryMatchCount + secondaryMatchCount) / tokens.length);
                const keywordScore = Math.min(0.92, (weightedSum / 4.0) * 0.65 + coverage * 0.35);

                if (keywordScore > score) {
                    score = keywordScore;
                    matchType = "keywords";
                    matchedFeatures.push(`keywords:p=${primaryMatchCount},s=${secondaryMatchCount}`);
                }
            }

            // 4. Negative Keyword Penalty
            if (score > 0 && pattern.negativeKeywords?.length > 0) {
                for (const negKw of pattern.negativeKeywords) {
                    if (tokenSet.has(negKw) || normalized.includes(negKw)) {
                        score = Math.max(0.1, score - 0.40);
                        matchedFeatures.push(`penalty:${negKw}`);
                    }
                }
            }

            // 5. Contextual Follow-Up Boost
            if (previousIntent && CONTEXT_FOLLOW_UP_MAP[previousIntent]) {
                const subMap = CONTEXT_FOLLOW_UP_MAP[previousIntent];
                for (const [cueWord, targetIntent] of Object.entries(subMap)) {
                    if (targetIntent === intentKey && (normalized.includes(cueWord) || tokenSet.has(cueWord))) {
                        score = Math.min(0.95, score + 0.25);
                        matchedFeatures.push(`context_boost:${previousIntent}->${cueWord}`);
                        break;
                    }
                }
            }

            if (score > 0.15) {
                candidates.push({
                    intent: intentKey,
                    category: pattern.category || INTENT_TO_CATEGORY_MAP[intentKey] || INTENT_CATEGORIES.GENERAL,
                    confidence: Number(score.toFixed(2)),
                    matchType,
                    matchedFeatures,
                });
            }
        }

        // Sort candidates descending by confidence
        candidates.sort((a, b) => b.confidence - a.confidence);

        // Ambiguity & Low-Confidence Checks
        if (candidates.length === 0 || candidates[0].confidence < CONFIDENCE_THRESHOLDS.MIN_ACCEPTABLE) {
            const fallbackConfidence = candidates.length > 0
                ? candidates[0].confidence
                : CONFIDENCE_THRESHOLDS.UNCLEAR_FALLBACK;

            return {
                topIntent: INTENTS.UNCLEAR_INTENT,
                category: INTENT_CATEGORIES.GENERAL,
                confidence: Number(fallbackConfidence.toFixed(2)),
                requiresClarification: true,
                candidates,
            };
        }

        const top = candidates[0];
        const runnerUp = candidates[1] || null;

        let requiresClarification = false;
        // If top 2 intents are close in score and both are moderately high confidence, flag ambiguity
        if (
            runnerUp &&
            top.confidence >= 0.50 &&
            runnerUp.confidence >= 0.50 &&
            Math.abs(top.confidence - runnerUp.confidence) <= CONFIDENCE_THRESHOLDS.AMBIGUITY_DELTA
        ) {
            requiresClarification = true;
        }

        return {
            topIntent: top.intent,
            category: top.category,
            confidence: top.confidence,
            requiresClarification,
            candidates,
        };
    },
};

export default intentScorer;
