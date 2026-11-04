/**
 * Conversation Context Resolver
 * Step 6 & Step 9: Conversation State Management & Smart Search Integration
 * 
 * Reuses and improves Step 6 antecedent extraction by coupling with Step 9 Conversation State.
 * Resolves pronouns, anaphoric references, and ellipsis questions (e.g. "Which lens does he use with it?",
 * "Who was the client?", "What about for a two-day shoot?").
 */

import { conversationStateService } from "../conversationState/conversationState.service.js";

const ANAPHORIC_PATTERNS = [
    /\b(with it|for it|with that|for that|about it|in it|on it)\b/i,
    /\b(it|its|that|this|them|these|those)\b/i,
    /\b(uske|iska|iske|uski|usme|isme|unka)\b/i,
    /^(which|what|who|how|where|konsa|kaunsa|kitna|kaisa)\s+(about|lens|lenses|gear|camera|client|cost|rates?|pricing|charges?|date)\b/i,
    /^(who was the client|what was the client|client kaun tha|client kaun hai)\b/i,
    /^(what about for a|what about a|and for|how about)\b/i,
];

export const conversationContextResolver = {
    /**
     * Resolves context from conversation state or previous messages
     * @param {object} params
     * @param {string} params.query - Current visitor query
     * @param {Array<object>} [params.recentMessages] - Previous messages in this conversation
     * @param {object} [params.currentEntities] - Entities already extracted from current turn
     * @param {object} [params.conversationState] - Active Step 9 conversation state
     * @returns {object}
     */
    resolve({
        query = "",
        recentMessages = [],
        currentEntities = {},
        conversationState = null,
    }) {
        if (!query) {
            return {
                contextUsed: false,
                injectedContextTerms: [],
                mergedEntities: { ...currentEntities },
                priorTopic: null,
            };
        }

        const isAnaphoric = ANAPHORIC_PATTERNS.some((pattern) => pattern.test(query));
        const isShortFollowUp = query.split(/\s+/).length <= 5;

        // 1. If explicit conversationState is provided (Step 9), utilize structured state
        if (conversationState) {
            const { resolvedEntities } = conversationStateService.resolveTurnContext({
                currentState: conversationState,
                message: query,
                recentMessages,
            });

            const injectedTerms = [];

            // A. Camera / Lens antecedent resolution
            if (
                /\b(lens|lenses|glass|optics)\b/i.test(query) &&
                Array.isArray(conversationState.mentionedEquipment) &&
                conversationState.mentionedEquipment.length > 0
            ) {
                injectedTerms.push(...conversationState.mentionedEquipment.slice(0, 2), "camera");
            }

            // B. Project reference resolution
            if (
                (/\b(client|director|producer|brand)\b/i.test(query) || isAnaphoric) &&
                Array.isArray(conversationState.mentionedProjects) &&
                conversationState.mentionedProjects.length > 0
            ) {
                injectedTerms.push(conversationState.mentionedProjects[0]);
            }

            // C. Pricing reference resolution
            if (
                /\b(shoot|days?|commercial)\b/i.test(query) &&
                conversationState.currentTopic === "business"
            ) {
                injectedTerms.push("commercial", "day rate", "pricing");
            }

            if (injectedTerms.length > 0 || Object.keys(resolvedEntities).length > Object.keys(currentEntities).length) {
                return {
                    contextUsed: true,
                    injectedContextTerms: [...new Set(injectedTerms)],
                    mergedEntities: { ...resolvedEntities, ...currentEntities },
                    priorTopic: conversationState.currentTopic || null,
                };
            }
        }

        // 2. Fallback to extracting from recentMessages (backward compatibility with Step 6)
        if (!Array.isArray(recentMessages) || recentMessages.length === 0 || (!isAnaphoric && !isShortFollowUp)) {
            return {
                contextUsed: false,
                injectedContextTerms: [],
                mergedEntities: { ...currentEntities },
                priorTopic: null,
            };
        }

        const priorTurn = [...recentMessages].reverse().find(
            (m) =>
                (m.detected_intent || m.intent) &&
                m.sender === "user"
        );

        if (!priorTurn) {
            return {
                contextUsed: false,
                injectedContextTerms: [],
                mergedEntities: { ...currentEntities },
                priorTopic: null,
            };
        }

        const priorEntities = typeof priorTurn.extracted_entities === "string"
            ? JSON.parse(priorTurn.extracted_entities)
            : (priorTurn.extracted_entities || priorTurn.metadata?.entities || {});

        const priorIntent = priorTurn.detected_intent || priorTurn.intent;
        const injectedTerms = [];
        const mergedEntities = { ...priorEntities, ...currentEntities };

        if (
            (priorIntent === "camera_inquiry" || priorIntent === "equipment_inquiry") &&
            /\b(lens|lenses|glass|optics)\b/i.test(query)
        ) {
            injectedTerms.push("Sony FX3", "Sony FX6", "camera");
        }

        if (priorEntities.equipmentType && !currentEntities.equipmentType) {
            injectedTerms.push(priorEntities.equipmentType);
        }
        if (priorEntities.projectName && !currentEntities.projectName) {
            injectedTerms.push(priorEntities.projectName);
        }
        if (priorEntities.projectType && !currentEntities.projectType) {
            injectedTerms.push(priorEntities.projectType);
        }

        return {
            contextUsed: injectedTerms.length > 0,
            injectedContextTerms: injectedTerms,
            mergedEntities,
            priorTopic: priorIntent || null,
        };
    },
};

export default conversationContextResolver;
