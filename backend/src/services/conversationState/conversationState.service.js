/**
 * Conversation State Management Engine Service
 * Step 9: Conversation State Management Engine for Cinematographer Portfolio AI Assistant
 * 
 * Maintains structured, persistent, and bounded conversation context across multiple turns.
 * Handles context-aware follow-up resolution, anaphoric references, project & equipment
 * tracking, topic switching, and clarification option resolution.
 */

import { INTENTS, INTENT_CATEGORIES } from "../../modules/intent/intent.constants.js";
import { chatRepository } from "../../repositories/chat.repository.js";

/**
 * Default empty state template
 */
export const createInitialState = () => ({
    currentTopic: null,
    currentIntent: null,
    entities: {},
    mentionedProjects: [],
    mentionedEquipment: [],
    visitorInterests: [],
    pendingQuestion: null,
    lastRelevantKnowledgeIds: [],
    lastUpdatedAt: new Date().toISOString(),
    leadState: {
        isLeadFlowActive: false,
        currentLeadField: null,
        collectedLeadData: {},
        missingRequiredFields: [],
        leadSubmissionStatus: "idle",
        lastSubmittedLeadId: null,
        pendingConfirmation: false,
    },
});

// Category to Topic mapping
const CATEGORY_TOPIC_MAP = {
    [INTENT_CATEGORIES.TECHNICAL]: "technical",
    [INTENT_CATEGORIES.PORTFOLIO]: "portfolio",
    [INTENT_CATEGORIES.SERVICES]: "services",
    [INTENT_CATEGORIES.BUSINESS]: "business",
    [INTENT_CATEGORIES.PERSONAL]: "personal",
    [INTENT_CATEGORIES.CONTACT]: "contact",
};

// Common anaphoric and follow-up markers
const ANAPHORIC_PATTERNS = [
    /\b(with it|for it|with that|for that|about it|in it|on it)\b/i,
    /\b(it|its|that|this|them|these|those)\b/i,
    /\b(uske|iska|iske|uski|usme|isme|unka)\b/i,
    /^(which|what|who|how|where|konsa|kaunsa|kitna|kaisa)\s+(about|lens|lenses|gear|camera|client|cost|rates?|pricing|charges?|date)\b/i,
    /^(who was the client|what was the client|client kaun tha|client kaun hai)\b/i,
    /^(what about for a|what about a|and for|how about)\b/i,
];

// Clarification choice resolution patterns
const ORDINAL_CHOICE_PATTERNS = [
    { pattern: /\b(first( one)?|pehla|1st|number 1|option 1)\b/i, index: 0 },
    { pattern: /\b(second( one)?|doosra|2nd|number 2|option 2)\b/i, index: 1 },
    { pattern: /\b(third( one)?|teesra|3rd|number 3|option 3)\b/i, index: 2 },
    { pattern: /\b(this one|that one|previous one|yeh wala|woh wala)\b/i, index: 0 },
];

export const conversationStateService = {
    /**
     * Resolves and enriches state for an incoming message before intent/retrieval processing.
     * Evaluates follow-ups, pending clarifications, and topic switches.
     * @param {object} params
     * @param {object} params.currentState - Existing persisted conversation state
     * @param {string} params.message - Raw incoming user message
     * @param {Array<object>} [params.recentMessages] - Bounded recent message window
     * @returns {object} { resolvedMessage, resolvedEntities, state, clarificationResolved }
     */
    resolveTurnContext({ currentState = null, message = "", recentMessages = [] } = {}) {
        const state = currentState
            ? { ...createInitialState(), ...currentState }
            : createInitialState();

        const rawMsg = message.trim();
        const lowMsg = rawMsg.toLowerCase();
        let resolvedMessage = rawMsg;
        let resolvedEntities = { ...(state.entities || {}) };
        let clarificationResolved = false;

        // -------------------------------------------------------------
        // 1. Resolve Pending Clarification (e.g. "the first one", "second one")
        // -------------------------------------------------------------
        if (state.pendingQuestion && Array.isArray(state.pendingQuestion.options) && state.pendingQuestion.options.length > 0) {
            const options = state.pendingQuestion.options;

            for (const { pattern, index } of ORDINAL_CHOICE_PATTERNS) {
                if (pattern.test(lowMsg)) {
                    const chosenOption = options[index] || options[0];
                    if (chosenOption) {
                        resolvedEntities.projectName = chosenOption;
                        if (!state.mentionedProjects.includes(chosenOption)) {
                            state.mentionedProjects.unshift(chosenOption);
                        }
                        resolvedMessage = `Tell me about ${chosenOption}`;
                        clarificationResolved = true;
                        state.pendingQuestion = null; // Cleared once resolved
                        break;
                    }
                }
            }

            // Also check if user typed an exact or partial match of one of the options
            if (!clarificationResolved) {
                for (const opt of options) {
                    if (lowMsg.includes(opt.toLowerCase())) {
                        resolvedEntities.projectName = opt;
                        if (!state.mentionedProjects.includes(opt)) {
                            state.mentionedProjects.unshift(opt);
                        }
                        clarificationResolved = true;
                        state.pendingQuestion = null;
                        break;
                    }
                }
            }
        }

        // -------------------------------------------------------------
        // 2. Resolve Anaphoric References & Follow-Up Questions
        // -------------------------------------------------------------
        const isAnaphoric = ANAPHORIC_PATTERNS.some((p) => p.test(lowMsg));
        const isShortFollowUp = lowMsg.split(/\s+/).length <= 5;

        if (isAnaphoric || isShortFollowUp) {
            // A. Equipment Follow-up (e.g. "Which lens does he use with it?")
            const isLensQuery = /\b(lens|lenses|glass|optics)\b/i.test(lowMsg);
            const isWithIt = /\b(with it|for it|with that|iska|uske)\b/i.test(lowMsg);

            if ((isLensQuery || isWithIt) && state.mentionedEquipment.length > 0) {
                const primaryCamera = state.mentionedEquipment[0];
                resolvedEntities.parentEquipment = primaryCamera;
                resolvedEntities.equipmentType = "lens";
                if (!resolvedMessage.toLowerCase().includes(primaryCamera.toLowerCase())) {
                    resolvedMessage = `${resolvedMessage} (for ${primaryCamera})`;
                }
            }

            // B. Project Follow-up (e.g. "Who was the client?", "Tell me more about it")
            const isClientQuery = /\b(client|director|producer|brand)\b/i.test(lowMsg);
            if ((isClientQuery || isWithIt) && state.mentionedProjects.length > 0) {
                const primaryProject = state.mentionedProjects[0];
                resolvedEntities.projectName = primaryProject;
                if (!resolvedMessage.toLowerCase().includes(primaryProject.toLowerCase())) {
                    resolvedMessage = `${resolvedMessage} for ${primaryProject}`;
                }
            }

            // C. Pricing Follow-up (e.g. "What about for a two-day shoot?")
            const isDayRateQuery = /\b(two-day|2-day|half-day|multi-day|shoot|days?|commercial)\b/i.test(lowMsg);
            if (isDayRateQuery && (state.currentTopic === "business" || state.currentIntent?.includes("pricing"))) {
                resolvedEntities.pricingTopic = "commercial_day_rate";
            }
        }

        return {
            resolvedMessage,
            resolvedEntities,
            state,
            clarificationResolved,
        };
    },

    /**
     * Updates and commits conversation state after intent detection, retrieval, and response generation.
     * Performs topic switching, entity consolidation, and PostgreSQL state persistence.
     * @param {object} params
     * @param {string} params.conversationId
     * @param {object} params.previousState - State before the current turn
     * @param {object} params.intentResult - Step 3 Intent detection output
     * @param {object} params.retrievalResult - Step 5/6 Knowledge retrieval output
     * @param {object} params.generationResult - Step 7/8 Response generation output
     * @returns {Promise<object>} The committed state
     */
    async commitTurnState({
        conversationId,
        previousState = null,
        intentResult = {},
        retrievalResult = {},
        generationResult = {},
    } = {}) {
        const state = previousState
            ? { ...createInitialState(), ...previousState }
            : createInitialState();

        const intentName = intentResult?.intent || null;
        const intentCategory = intentResult?.category || null;
        const turnEntities = intentResult?.entities || {};
        const newTopic = CATEGORY_TOPIC_MAP[intentCategory] || state.currentTopic;

        // -------------------------------------------------------------
        // 3. Topic Switching & Stale Entity Invalidation
        // -------------------------------------------------------------
        const isTopicSwitch =
            newTopic &&
            state.currentTopic &&
            newTopic !== state.currentTopic &&
            intentCategory !== INTENT_CATEGORIES.GENERAL;

        if (isTopicSwitch) {
            // When switching topic, clear stale specific entities belonging to the previous topic
            // but preserve long-term knowledge lists (mentionedProjects, mentionedEquipment)
            state.entities = {};
            state.currentTopic = newTopic;
        } else if (newTopic) {
            state.currentTopic = newTopic;
        }

        // Update current intent and merge active entities
        state.currentIntent = intentName;
        state.entities = {
            ...state.entities,
            ...turnEntities,
        };

        // -------------------------------------------------------------
        // 4. Update Mentioned Projects (deduped, latest first, bounded to 5)
        // -------------------------------------------------------------
        if (turnEntities.projectName) {
            const pName = turnEntities.projectName;
            state.mentionedProjects = [
                pName,
                ...state.mentionedProjects.filter((p) => p.toLowerCase() !== pName.toLowerCase()),
            ].slice(0, 5);
        }

        // -------------------------------------------------------------
        // 5. Update Mentioned Equipment (deduped, latest first, bounded to 5)
        // -------------------------------------------------------------
        if (turnEntities.equipment) {
            const eqList = Array.isArray(turnEntities.equipment)
                ? turnEntities.equipment
                : [turnEntities.equipment];
            eqList.forEach((eq) => {
                if (typeof eq === "string" && eq.trim()) {
                    state.mentionedEquipment = [
                        eq.trim(),
                        ...state.mentionedEquipment.filter((e) => e.toLowerCase() !== eq.toLowerCase().trim()),
                    ].slice(0, 5);
                }
            });
        }

        // Extract equipment mentions from retrieved knowledge if applicable
        if (state.currentTopic === "technical" && Array.isArray(retrievalResult?.results)) {
            retrievalResult.results.forEach((rec) => {
                if (rec.title?.includes("FX3") || rec.content?.includes("Sony FX3")) {
                    if (!state.mentionedEquipment.includes("Sony FX3")) {
                        state.mentionedEquipment.push("Sony FX3");
                    }
                }
                if (rec.title?.includes("FX6") || rec.content?.includes("Sony FX6")) {
                    if (!state.mentionedEquipment.includes("Sony FX6")) {
                        state.mentionedEquipment.push("Sony FX6");
                    }
                }
            });
            state.mentionedEquipment = [...new Set(state.mentionedEquipment)].slice(0, 5);
        }

        // -------------------------------------------------------------
        // 6. Track Visitor Interests
        // -------------------------------------------------------------
        if (turnEntities.projectType) {
            state.visitorInterests = [
                turnEntities.projectType,
                ...state.visitorInterests.filter((i) => i !== turnEntities.projectType),
            ].slice(0, 5);
        }
        if (intentName === INTENTS.COMMERCIAL_INQUIRY && !state.visitorInterests.includes("commercial")) {
            state.visitorInterests.unshift("commercial");
        }

        // -------------------------------------------------------------
        // 7. Track Pending Clarification Question
        // -------------------------------------------------------------
        // If the response engine asked the visitor a multiple-choice clarification question
        if (
            generationResult.fallbackStatus === null &&
            generationResult.reply &&
            generationResult.suggestions &&
            generationResult.suggestions.length > 1 &&
            (generationResult.reply.includes("Which one would you like to explore?") ||
                generationResult.reply.includes("किस प्रोजेक्ट का विवरण देखना चाहेंगे") ||
                generationResult.reply.includes("kaunsa project explore karna chahenge"))
        ) {
            state.pendingQuestion = {
                type: "PROJECT_SELECTION",
                question: generationResult.reply,
                options: generationResult.suggestions.slice(0, 3),
                askedAt: new Date().toISOString(),
            };
        } else if (!state.pendingQuestion || generationResult.clarificationResolved) {
            // If normal reply or already answered, ensure pendingQuestion is cleared
            state.pendingQuestion = null;
        }

        // -------------------------------------------------------------
        // 8. Track Last Relevant Knowledge IDs
        // -------------------------------------------------------------
        if (Array.isArray(retrievalResult?.results)) {
            state.lastRelevantKnowledgeIds = retrievalResult.results
                .map((r) => r.id)
                .filter(Boolean)
                .slice(0, 5);
        }

        state.lastUpdatedAt = new Date().toISOString();

        // -------------------------------------------------------------
        // 9. Persist to Neon PostgreSQL
        // -------------------------------------------------------------
        if (conversationId) {
            await chatRepository
                .updateConversationState(conversationId, state)
                .catch((err) => {
                    console.warn("[ConversationStateService] Failed to persist state to DB:", err.message);
                });
        }

        return state;
    },
};

export default conversationStateService;
