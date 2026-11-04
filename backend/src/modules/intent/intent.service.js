/**
 * Intent Service for Cinematographer Portfolio AI Assistant
 * Step 3: Modular Intent Detection Engine Orchestrator
 */

import {
    INTENTS,
    INTENT_CATEGORIES,
    INTENT_TO_CATEGORY_MAP,
    CONFIDENCE_THRESHOLDS,
} from "./intent.constants.js";
import { intentNormalizer } from "./intent.normalizer.js";
import { intentEntityExtractor } from "./intent.entity-extractor.js";
import { intentScorer } from "./intent.scorer.js";

export const intentService = {
    /**
     * Primary entry point for detecting user intent from raw text input
     * @param {object} params
     * @param {string} params.message - Raw user input text
     * @param {string} [params.previousIntent] - Previous turn intent for context awareness
     * @param {object} [params.context] - Additional conversational context (e.g., active page)
     * @returns {Promise<object>} Standardized intent detection result
     */
    async detectIntent({ message, previousIntent = null, context = {} } = {}) {
        // 1. Guard against empty, null, or malformed inputs
        if (!message || typeof message !== "string" || !message.trim()) {
            return {
                intent: INTENTS.UNCLEAR_INTENT,
                category: INTENT_CATEGORIES.GENERAL,
                confidence: CONFIDENCE_THRESHOLDS.UNCLEAR_FALLBACK,
                entities: {},
                requiresClarification: true,
                candidates: [],
            };
        }

        // 2. Normalize input text (strips unwanted characters, handles Hinglish, slang & accents)
        const normalizationResult = intentNormalizer.normalize(message);

        // 3. Extract entities explicitly mentioned in message (evaluating raw + normalized representations)
        const entities = intentEntityExtractor.extract(message, normalizationResult.normalized);

        // 4. Score intent patterns across all categories
        const scoringResult = intentScorer.scoreIntents({
            normalizationResult,
            previousIntent,
        });

        // 5. Context-aware intent resolution
        let finalIntent = scoringResult.topIntent;
        let finalCategory = scoringResult.category;
        let finalConfidence = scoringResult.confidence;
        let requiresClarification = scoringResult.requiresClarification;

        // Follow-up resolution: if user says "what about weddings?" or mentions a specific projectType,
        // and intent was previously services_inquiry or hire_inquiry, align intent appropriately
        if (
            (finalIntent === INTENTS.UNCLEAR_INTENT || finalIntent === INTENTS.GENERAL_QUESTION) &&
            entities.projectType &&
            previousIntent
        ) {
            if (previousIntent === INTENTS.SERVICES_INQUIRY || previousIntent === INTENTS.HIRE_INQUIRY) {
                if (entities.projectType === "wedding") {
                    finalIntent = INTENTS.WEDDING_INQUIRY;
                    finalCategory = INTENT_CATEGORIES.SERVICES;
                    finalConfidence = 0.88;
                    requiresClarification = false;
                } else if (entities.projectType === "commercial") {
                    finalIntent = INTENTS.COMMERCIAL_INQUIRY;
                    finalCategory = INTENT_CATEGORIES.SERVICES;
                    finalConfidence = 0.88;
                    requiresClarification = false;
                } else if (entities.projectType === "documentary") {
                    finalIntent = INTENTS.DOCUMENTARY_INQUIRY;
                    finalCategory = INTENT_CATEGORIES.SERVICES;
                    finalConfidence = 0.88;
                    requiresClarification = false;
                }
            }
        }

        // 6. Return standardized result contract
        return {
            intent: finalIntent,
            category: finalCategory,
            confidence: finalConfidence,
            entities,
            requiresClarification,
            candidates: (scoringResult.candidates || []).slice(0, 3),
        };
    },

    /**
     * Helper to check if an intent is directly related to hiring Anup
     * @param {string} intentName
     * @returns {boolean}
     */
    isHiringIntent(intentName) {
        return [
            INTENTS.HIRE_INQUIRY,
            INTENTS.BOOKING_INQUIRY,
            INTENTS.AVAILABILITY_INQUIRY,
            INTENTS.PRICING_INQUIRY,
            INTENTS.COLLABORATION_INQUIRY,
        ].includes(intentName);
    },

    /**
     * Helper to check if an intent requests client-side UI navigation
     * @param {string} intentName
     * @returns {boolean}
     */
    isNavigationIntent(intentName) {
        return [
            INTENTS.NAVIGATE_HOME,
            INTENTS.NAVIGATE_ABOUT,
            INTENTS.NAVIGATE_WORK,
            INTENTS.NAVIGATE_SERVICES,
            INTENTS.NAVIGATE_CONTACT,
            INTENTS.NAVIGATE_BLOG,
        ].includes(intentName);
    },

    /**
     * Helper to retrieve all defined categories
     * @returns {string[]}
     */
    getAllCategories() {
        return Object.values(INTENT_CATEGORIES);
    },

    /**
     * Helper to retrieve all defined intents
     * @returns {string[]}
     */
    getAllIntents() {
        return Object.values(INTENTS);
    },
};

export default intentService;
