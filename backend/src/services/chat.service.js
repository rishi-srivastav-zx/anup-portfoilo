import crypto from "crypto";
import { chatRepository } from "../repositories/chat.repository.js";
import {
    sanitizeChatMessage,
    generateVisitorToken,
    hashSessionToken,
    verifySessionToken,
    buildMessageResponse,
} from "../utils/chat.utils.js";
import { intentService } from "../modules/intent/intent.service.js";
import { INTENTS, INTENT_CATEGORIES } from "../modules/intent/intent.constants.js";
import { knowledgeRetrievalService } from "./knowledgeRetrieval.service.js";
import { responseGenerationService } from "./responseGeneration.service.js";
import { conversationStateService } from "./conversationState/conversationState.service.js";
import { leadService } from "./lead/lead.service.js";

/**
 * Custom Error Class for Chat Business Logic
 */
export class ChatError extends Error {
    constructor(message, statusCode = 400, code = "CHAT_ERROR") {
        super(message);
        this.name = "ChatError";
        this.statusCode = statusCode;
        this.code = code;
    }
}

export const chatService = {
    /**
     * Validates that the provided visitorToken matches either session_token_hash or visitor_token
     * @param {object} conversation
     * @param {string|null} visitorToken
     */
    validateVisitorAccess(conversation, visitorToken) {
        if (!conversation.session_token_hash && !conversation.visitor_token) {
            return;
        }
        if (!visitorToken) {
            throw new ChatError(
                "Access denied: visitor token required for this conversation.",
                403,
                "UNAUTHORIZED_CONVERSATION_ACCESS"
            );
        }

        let isAuthorized = false;
        if (conversation.session_token_hash) {
            isAuthorized = verifySessionToken(visitorToken, conversation.session_token_hash);
        } else if (conversation.visitor_token) {
            isAuthorized = conversation.visitor_token === visitorToken;
        }

        if (!isAuthorized) {
            throw new ChatError(
                "Access denied: unauthorized token for this conversation.",
                403,
                "UNAUTHORIZED_CONVERSATION_ACCESS"
            );
        }
    },

    /**
     * Initializes a new conversation
     * @param {object} params
     * @param {string} [params.visitorId] - Optional external visitor client identifier
     * @param {object} [params.metadata] - Optional initial metadata
     * @returns {Promise<object>}
     */
    async initializeConversation({ visitorId = null, metadata = {} } = {}) {
        const conversationId = crypto.randomUUID();
        const visitorToken = generateVisitorToken();
        const sessionTokenHash = hashSessionToken(visitorToken);
        const now = new Date().toISOString();

        const conversation = await chatRepository.createConversation({
            id: conversationId,
            visitorId: visitorId || null,
            sessionTokenHash,
            visitorToken,
            metadata: {
                ...metadata,
                visitorId: visitorId || null,
                initiatedFrom: metadata.source || "Portfolio Web Client",
            },
            status: "active",
            startedAt: now,
            lastMessageAt: now,
        });

        return {
            conversationId: conversation.id,
            visitorToken,
            status: conversation.status,
            createdAt: conversation.created_at,
        };
    },

    /**
     * Processes an incoming user message and prepares a structured assistant reply
     * Clean integration point for future Intent Detection, Retrieval & LLM Generation (Steps 3-4)
     * @param {object} params
     * @param {string} params.conversationId
     * @param {string} params.message
     * @param {string} [params.visitorToken] - Token for anonymous conversation isolation
     * @param {string} [params.action] - Optional triggered interactive action
     * @param {object} [params.actionPayload] - Optional payload for action
     * @returns {Promise<object>}
     */
    async processMessage({ conversationId, message, visitorToken = null, action = null, actionPayload = null }) {
        // 1. Verify that the conversation exists
        const conversation = await chatRepository.getConversationById(conversationId);
        if (!conversation) {
            throw new ChatError(
                `Conversation not found with ID '${conversationId}'. Please initialize a conversation first.`,
                404,
                "CONVERSATION_NOT_FOUND"
            );
        }

        // 2. Validate visitor token for conversation privacy
        this.validateVisitorAccess(conversation, visitorToken);

        // 3. Sanitize user input message
        const cleanedContent = sanitizeChatMessage(message);
        if (!cleanedContent) {
            throw new ChatError(
                "Message content cannot be empty or contain only invalid characters.",
                400,
                "EMPTY_MESSAGE"
            );
        }

        // 4. Retrieve conversation state & bounded context window of recent messages
        const currentState = conversation.conversation_state || null;
        const recentMessages = await chatRepository.getRecentMessages(conversationId, 6);

        // 5. Context-Aware Turn Resolution (Anaphoric references, project follow-ups, pending clarifications)
        const {
            resolvedMessage,
            resolvedEntities,
            state: activeState,
            clarificationResolved,
        } = conversationStateService.resolveTurnContext({
            currentState,
            message: cleanedContent,
            recentMessages,
        });

        // 6. Detect visitor intent & extract entities using resolved context
        let intentResult = await intentService.detectIntent({
            message: resolvedMessage,
            previousIntent: activeState.currentIntent,
            context: {
                conversationId,
                state: activeState,
                clarificationResolved,
            },
        });

        // If clarification was resolved for a project (e.g. "the first one"), map to PROJECT_DETAILS
        if (clarificationResolved && resolvedEntities.projectName) {
            intentResult = {
                intent: INTENTS.PROJECT_DETAILS,
                category: INTENT_CATEGORIES.PORTFOLIO,
                confidence: 0.95,
                entities: { ...intentResult.entities, ...resolvedEntities },
                requiresClarification: false,
            };
        }

        const structuredIntent = intentResult.intent
            ? {
                  name: intentResult.intent,
                  category: intentResult.category,
                  confidence: intentResult.confidence,
              }
            : null;

        // 6b. Step 10: Check Lead Generation & Conversational Collection Flow
        const isLeadTurn = leadService.shouldHandleTurn({
            state: activeState,
            intentResult,
            message: cleanedContent,
        });

        if (isLeadTurn) {
            const leadResult = await leadService.handleConversationalTurn({
                conversationId,
                message: cleanedContent,
                state: activeState,
                intentResult,
                actionPayload: actionPayload || (action ? { action } : null),
            });

            // Persist User Message
            const userMsgId = crypto.randomUUID();
            await chatRepository.saveMessage({
                id: userMsgId,
                conversationId,
                sender: "user",
                content: cleanedContent,
                messageContent: cleanedContent,
                intent: intentResult?.intent || INTENTS.HIRE_INQUIRY,
                detectedIntent: intentResult?.intent || INTENTS.HIRE_INQUIRY,
                intentCategory: intentResult?.category || INTENT_CATEGORIES.BUSINESS,
                confidenceScore: intentResult?.confidence || 0.95,
                extractedEntities: { ...(intentResult?.entities || {}), ...resolvedEntities },
                metadata: {
                    leadTurn: true,
                    action,
                    actionPayload,
                    resolvedMessage: resolvedMessage !== cleanedContent ? resolvedMessage : undefined,
                },
            });

            // Persist Assistant Reply
            const assistantMsgId = crypto.randomUUID();
            await chatRepository.saveMessage({
                id: assistantMsgId,
                conversationId,
                sender: "assistant",
                content: leadResult.reply,
                messageContent: leadResult.reply,
                intent: intentResult?.intent || INTENTS.HIRE_INQUIRY,
                detectedIntent: intentResult?.intent || INTENTS.HIRE_INQUIRY,
                intentCategory: intentResult?.category || INTENT_CATEGORIES.BUSINESS,
                confidenceScore: 0.95,
                extractedEntities: leadResult.updatedLeadState?.collectedLeadData || {},
                metadata: {
                    actions: leadResult.actions,
                    suggestions: leadResult.suggestions,
                    leadState: leadResult.updatedLeadState,
                    leadId: leadResult.lead?.id || null,
                    referenceId: leadResult.referenceId || null,
                },
            });

            // Update conversation state with committed leadState
            activeState.leadState = leadResult.updatedLeadState;
            activeState.currentIntent = intentResult?.intent || INTENTS.HIRE_INQUIRY;
            activeState.currentTopic = "business";
            if (leadResult.lead?.project_type) {
                activeState.visitorInterests = [
                    leadResult.lead.project_type,
                    ...activeState.visitorInterests.filter((i) => i !== leadResult.lead.project_type),
                ].slice(0, 5);
            }
            activeState.lastUpdatedAt = new Date().toISOString();

            await chatRepository
                .updateConversationState(conversationId, activeState)
                .catch((err) => {
                    console.warn("[ChatService] Failed to persist lead turn state to DB:", err.message);
                });

            return buildMessageResponse({
                conversationId,
                userMessage: cleanedContent,
                reply: leadResult.reply,
                intent: structuredIntent || {
                    name: INTENTS.HIRE_INQUIRY,
                    category: INTENT_CATEGORIES.BUSINESS,
                    confidence: 0.95,
                },
                entities: { ...(activeState.entities || {}), ...(leadResult.updatedLeadState?.collectedLeadData || {}) },
                requiresClarification: false,
                retrievedKnowledge: [],
                hasRelevantKnowledge: false,
                actions: leadResult.actions || [],
                suggestions: leadResult.suggestions || [],
                fallbackStatus: null,
                conversationState: activeState,
            });
        }

        // 7. Retrieve relevant published portfolio knowledge (Step 5, 6 Smart Search & Step 9 Context)
        const retrievalResult = await knowledgeRetrievalService.retrieveKnowledge({
            query: resolvedMessage,
            intent: intentResult.intent || null,
            category: intentResult.category || null,
            entities: { ...activeState.entities, ...intentResult.entities, ...resolvedEntities },
            recentMessages,
            conversationState: activeState,
        });

        // 8. Persist User Message with detected intent and entities
        const userMsgId = crypto.randomUUID();
        await chatRepository.saveMessage({
            id: userMsgId,
            conversationId,
            sender: "user",
            content: cleanedContent,
            messageContent: cleanedContent,
            intent: intentResult.intent || null,
            detectedIntent: intentResult.intent || null,
            intentCategory: intentResult.category || null,
            confidenceScore: intentResult.confidence || null,
            extractedEntities: { ...intentResult.entities, ...resolvedEntities },
            metadata: {
                resolvedMessage: resolvedMessage !== cleanedContent ? resolvedMessage : undefined,
                clarificationResolved,
                entities: intentResult.entities || {},
                confidence: intentResult.confidence,
                requiresClarification: intentResult.requiresClarification,
                retrievedKnowledgeCount: retrievalResult.totalResults,
                hasRelevantKnowledge: retrievalResult.hasRelevantKnowledge,
            },
        });

        // 9. Generate grounded natural language response (Step 7 Response Generation Engine)
        const generated = responseGenerationService.generateResponse({
            userMessage: cleanedContent,
            intentResult,
            retrievalResult,
            recentMessages,
            context: {
                conversationId,
                conversationState: activeState,
                clarificationResolved,
            },
        });

        // 10. Persist Assistant Reply
        const assistantMsgId = crypto.randomUUID();
        await chatRepository.saveMessage({
            id: assistantMsgId,
            conversationId,
            sender: "assistant",
            content: generated.reply,
            messageContent: generated.reply,
            intent: intentResult.intent || null,
            detectedIntent: intentResult.intent || null,
            intentCategory: intentResult.category || null,
            confidenceScore: intentResult.confidence || null,
            extractedEntities: {},
            metadata: {
                actions: generated.actions,
                suggestions: generated.suggestions,
                requiresClarification: intentResult.requiresClarification,
                language: generated.language,
                fallbackStatus: generated.fallbackStatus,
                retrieval: {
                    hasRelevantKnowledge: retrievalResult.hasRelevantKnowledge,
                    totalResults: retrievalResult.totalResults,
                    relevanceLevel: retrievalResult.relevanceLevel,
                },
            },
        });

        // 11. Commit updated conversation state into Neon PostgreSQL (Step 9)
        const updatedState = await conversationStateService.commitTurnState({
            conversationId,
            previousState: activeState,
            intentResult,
            retrievalResult,
            generationResult: {
                ...generated,
                clarificationResolved,
            },
        });

        // 12. Return exact required API response contract
        return buildMessageResponse({
            conversationId,
            userMessage: cleanedContent,
            reply: generated.reply,
            intent: generated.intent,
            entities: generated.entities || {},
            requiresClarification: generated.requiresClarification || false,
            retrievedKnowledge: generated.retrievedKnowledge || [],
            hasRelevantKnowledge: generated.hasRelevantKnowledge || false,
            actions: generated.actions || [],
            suggestions: generated.suggestions || [],
            fallbackStatus: generated.fallbackStatus || null,
            conversationState: updatedState,
        });
    },

    /**
     * Retrieves conversation details and message history
     * @param {object} params
     * @param {string} params.conversationId
     * @param {string} [params.visitorToken]
     * @returns {Promise<object>}
     */
    async getConversation({ conversationId, visitorToken = null }) {
        const conversation = await chatRepository.getConversationById(conversationId);
        if (!conversation) {
            throw new ChatError(
                `Conversation not found with ID '${conversationId}'.`,
                404,
                "CONVERSATION_NOT_FOUND"
            );
        }

        this.validateVisitorAccess(conversation, visitorToken);

        const rawMessages = await chatRepository.getMessagesByConversationId(conversationId);

        const messages = rawMessages.map((m) => ({
            id: m.id,
            sender: m.sender,
            content: m.message_content || m.content,
            intent: m.detected_intent || m.intent,
            intentCategory: m.intent_category || null,
            confidenceScore: m.confidence_score !== null && m.confidence_score !== undefined ? Number(m.confidence_score) : null,
            extractedEntities: typeof m.extracted_entities === "string" ? JSON.parse(m.extracted_entities) : (m.extracted_entities || {}),
            metadata: typeof m.metadata === "string" ? JSON.parse(m.metadata) : m.metadata,
            createdAt: m.created_at,
        }));

        return {
            conversationId: conversation.id,
            status: conversation.status,
            createdAt: conversation.created_at,
            updatedAt: conversation.updated_at,
            startedAt: conversation.started_at,
            lastMessageAt: conversation.last_message_at,
            conversationState: conversation.conversation_state || {},
            messages,
        };
    },

    /**
     * Deletes a conversation and associated messages
     * @param {object} params
     * @param {string} params.conversationId
     * @param {string} [params.visitorToken]
     * @returns {Promise<boolean>}
     */
    async deleteConversation({ conversationId, visitorToken = null }) {
        const conversation = await chatRepository.getConversationById(conversationId);
        if (!conversation) {
            throw new ChatError(
                `Conversation not found with ID '${conversationId}'.`,
                404,
                "CONVERSATION_NOT_FOUND"
            );
        }

        this.validateVisitorAccess(conversation, visitorToken);

        return await chatRepository.deleteConversation(conversationId);
    },
};

export default chatService;

