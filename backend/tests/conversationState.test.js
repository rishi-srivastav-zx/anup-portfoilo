/**
 * Conversation State Management Engine Test Suite (Step 9)
 * Verifies context persistence, follow-up resolution, project/equipment memory,
 * topic switching, clarification choices, and ownership protection.
 */

import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { conversationStateService, createInitialState } from "../src/services/conversationState/conversationState.service.js";
import { chatService } from "../src/services/chat.service.js";
import { chatRepository } from "../src/repositories/chat.repository.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { KNOWLEDGE_STATUS } from "../src/constants/portfolioKnowledge.constants.js";
import { pool } from "../src/config/db.js";
import { INTENTS, INTENT_CATEGORIES } from "../src/modules/intent/intent.constants.js";

describe("Conversation State Management Engine Suite (Step 9)", () => {
    let testConversationId = null;
    let testVisitorToken = null;
    const testCameraId = crypto.randomUUID();
    const testLensId = crypto.randomUUID();

    before(async () => {
        // Initialize test knowledge records for cameras and lenses
        await portfolioKnowledgeRepository.createKnowledge({
            id: testCameraId,
            title: "Sony FX3 and Sony FX6 Primary Cinema Camera Package",
            content: "Anup Rawat shoots primarily on the Sony FX3 and Sony FX6 cinema cameras for commercial and narrative productions.",
            category: "Camera Equipment",
            keywords: ["sony fx3", "sony fx6", "camera", "cinema"],
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: testLensId,
            title: "Sony G Master and Vintage Anamorphic Lenses for Sony FX3 and FX6",
            content: "Anup pairs his Sony FX3 and FX6 cinema cameras with Sony G Master prime lenses and vintage anamorphic glass.",
            category: "Lenses and Gear",
            keywords: ["sony fx3", "sony fx6", "lens", "lenses", "anamorphic"],
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        // Initialize a clean test conversation
        const init = await chatService.initializeConversation({
            visitorId: "state-test-visitor",
            metadata: { testSuite: "Step9_ConversationState" },
        });
        testConversationId = init.conversationId;
        testVisitorToken = init.visitorToken;
    });

    after(async () => {
        if (testConversationId) {
            try {
                await chatRepository.deleteConversation(testConversationId);
            } catch {
                // Ignore cleanup error
            }
        }
        try {
            await portfolioKnowledgeRepository.deleteKnowledge(testCameraId);
            await portfolioKnowledgeRepository.deleteKnowledge(testLensId);
        } catch {
            // Ignore knowledge cleanup error
        }
        try {
            await pool.end();
        } catch {
            // Ignore if pool closed
        }
    });

    // -------------------------------------------------------------
    // 1. Initial State Structure
    // -------------------------------------------------------------
    test("1. State Structure: createInitialState returns standard extensible schema", () => {
        const state = createInitialState();
        assert.equal(state.currentTopic, null);
        assert.equal(state.currentIntent, null);
        assert.deepEqual(state.entities, {});
        assert.deepEqual(state.mentionedProjects, []);
        assert.deepEqual(state.mentionedEquipment, []);
        assert.deepEqual(state.visitorInterests, []);
        assert.equal(state.pendingQuestion, null);
        assert.deepEqual(state.lastRelevantKnowledgeIds, []);
        assert.ok(typeof state.lastUpdatedAt === "string");
    });

    // -------------------------------------------------------------
    // 2. Equipment Follow-Up Resolution (Example 1)
    // -------------------------------------------------------------
    test("2. Equipment Follow-Up: 'Which lens does he use with it?' resolves 'it' to previously discussed camera", () => {
        const existingState = {
            currentTopic: "technical",
            currentIntent: INTENTS.CAMERA_INQUIRY,
            entities: { equipment: ["camera"] },
            mentionedEquipment: ["Sony FX3", "Sony FX6"],
            mentionedProjects: [],
            visitorInterests: [],
            pendingQuestion: null,
            lastRelevantKnowledgeIds: [],
        };

        const turn = conversationStateService.resolveTurnContext({
            currentState: existingState,
            message: "Which lens does he use with it?",
        });

        assert.equal(turn.resolvedEntities.parentEquipment, "Sony FX3");
        assert.equal(turn.resolvedEntities.equipmentType, "lens");
        assert.ok(turn.resolvedMessage.includes("Sony FX3"));
    });

    // -------------------------------------------------------------
    // 3. Project Follow-Up Resolution (Example 2)
    // -------------------------------------------------------------
    test("3. Project Follow-Up: 'Who was the client?' resolves to previously discussed project", () => {
        const existingState = {
            currentTopic: "portfolio",
            currentIntent: INTENTS.PROJECT_DETAILS,
            entities: { projectName: "Delhi Metro Transit Line" },
            mentionedProjects: ["Delhi Metro Transit Line"],
            mentionedEquipment: [],
            visitorInterests: ["commercial"],
            pendingQuestion: null,
            lastRelevantKnowledgeIds: [],
        };

        const turn = conversationStateService.resolveTurnContext({
            currentState: existingState,
            message: "Who was the client?",
        });

        assert.equal(turn.resolvedEntities.projectName, "Delhi Metro Transit Line");
        assert.ok(turn.resolvedMessage.includes("Delhi Metro Transit Line"));
    });

    // -------------------------------------------------------------
    // 4. Pricing Follow-Up Resolution (Example 3)
    // -------------------------------------------------------------
    test("4. Pricing Follow-Up: 'What about for a two-day shoot?' maintains commercial DP rates context", () => {
        const existingState = {
            currentTopic: "business",
            currentIntent: INTENTS.PRICING_INQUIRY,
            entities: {},
            mentionedProjects: [],
            mentionedEquipment: [],
            visitorInterests: [],
            pendingQuestion: null,
            lastRelevantKnowledgeIds: [],
        };

        const turn = conversationStateService.resolveTurnContext({
            currentState: existingState,
            message: "What about for a two-day shoot?",
        });

        assert.equal(turn.resolvedEntities.pricingTopic, "commercial_day_rate");
    });

    // -------------------------------------------------------------
    // 5. Topic Switching & Stale Entity Invalidation
    // -------------------------------------------------------------
    test("5. Topic Switching: Switches topic and clears stale active entities when changing subject", async () => {
        const stateBefore = {
            currentTopic: "technical",
            currentIntent: INTENTS.CAMERA_INQUIRY,
            entities: { equipmentType: "camera", specificCamera: "Sony FX3" },
            mentionedEquipment: ["Sony FX3"],
            mentionedProjects: [],
            visitorInterests: [],
            pendingQuestion: null,
            lastRelevantKnowledgeIds: [],
        };

        // Visitor now asks: "Show me your projects" -> Portfolio intent
        const updated = await conversationStateService.commitTurnState({
            conversationId: null,
            previousState: stateBefore,
            intentResult: {
                intent: INTENTS.NAVIGATE_WORK,
                category: INTENT_CATEGORIES.PORTFOLIO,
                entities: {},
            },
            retrievalResult: { results: [] },
            generationResult: { reply: "Here is Anup's portfolio work." },
        });

        // Current topic switches to portfolio
        assert.equal(updated.currentTopic, "portfolio");
        // Stale camera entity from technical inquiry is cleared
        assert.equal(updated.entities.specificCamera, undefined);
        // But long-term historical mentioned equipment is retained
        assert.ok(updated.mentionedEquipment.includes("Sony FX3"));
    });

    // -------------------------------------------------------------
    // 6. Clarification State & "The First One" / "Second One" Selection
    // -------------------------------------------------------------
    test("6. Clarification Resolution: 'The first one' selects option 0 from pending clarification", () => {
        const stateWithClarification = {
            currentTopic: "portfolio",
            currentIntent: INTENTS.PROJECT_DETAILS,
            entities: {},
            mentionedProjects: [],
            mentionedEquipment: [],
            visitorInterests: [],
            pendingQuestion: {
                type: "PROJECT_SELECTION",
                question: "Which one would you like to explore?",
                options: ["Delhi Metro Transit Line Campaign", "Jio Hotstar Series Campaign"],
            },
            lastRelevantKnowledgeIds: [],
        };

        const turn = conversationStateService.resolveTurnContext({
            currentState: stateWithClarification,
            message: "The first one",
        });

        assert.equal(turn.clarificationResolved, true);
        assert.equal(turn.resolvedEntities.projectName, "Delhi Metro Transit Line Campaign");
        assert.equal(turn.state.pendingQuestion, null); // Cleared upon resolution
    });

    test("7. Clarification Resolution: 'The second one' selects option 1 from pending clarification", () => {
        const stateWithClarification = {
            currentTopic: "portfolio",
            currentIntent: INTENTS.PROJECT_DETAILS,
            entities: {},
            mentionedProjects: [],
            mentionedEquipment: [],
            visitorInterests: [],
            pendingQuestion: {
                type: "PROJECT_SELECTION",
                question: "Which one would you like to explore?",
                options: ["Delhi Metro Transit Line Campaign", "Jio Hotstar Series Campaign"],
            },
            lastRelevantKnowledgeIds: [],
        };

        const turn = conversationStateService.resolveTurnContext({
            currentState: stateWithClarification,
            message: "the second project please",
        });

        assert.equal(turn.clarificationResolved, true);
        assert.equal(turn.resolvedEntities.projectName, "Jio Hotstar Series Campaign");
        assert.equal(turn.state.pendingQuestion, null);
    });

    // -------------------------------------------------------------
    // 8. End-to-End Chat Service Context Persistence
    // -------------------------------------------------------------
    test("8. End-to-End Persistence: Multi-turn flow persists state to Neon PostgreSQL and resolves follow-ups", async () => {
        assert.ok(testConversationId);

        // Turn 1: Ask about cameras
        const res1 = await chatService.processMessage({
            conversationId: testConversationId,
            visitorToken: testVisitorToken,
            message: "Which camera does Anup use for filming?",
        });

        assert.ok(res1.reply);
        assert.ok(res1.conversationState);
        assert.equal(res1.conversationState.currentTopic, "technical");

        // Turn 2: Follow-up using pronoun "with it"
        const res2 = await chatService.processMessage({
            conversationId: testConversationId,
            visitorToken: testVisitorToken,
            message: "Which lens does he shoot with it?",
        });

        assert.ok(res2.reply);
        // Reply must mention lenses or camera setup grounded with camera context
        assert.ok(
            res2.reply.includes("lens") ||
            res2.reply.includes("Sony") ||
            res2.reply.includes("Master") ||
            res2.reply.includes("anamorphic") ||
            res2.reply.includes("camera")
        );

        // Turn 3: Verify PostgreSQL state via getConversation
        const loaded = await chatService.getConversation({
            conversationId: testConversationId,
            visitorToken: testVisitorToken,
        });

        assert.equal(loaded.conversationId, testConversationId);
        assert.ok(loaded.conversationState);
        assert.equal(loaded.conversationState.currentTopic, "technical");
        assert.ok(loaded.messages.length >= 4); // 2 user turns + 2 assistant turns
    });

    // -------------------------------------------------------------
    // 9. Ownership Protection
    // -------------------------------------------------------------
    test("9. Ownership Protection: Rejects unauthorized token with 403", async () => {
        await assert.rejects(
            async () => {
                await chatService.processMessage({
                    conversationId: testConversationId,
                    visitorToken: "invalid-hacker-token-12345",
                    message: "Can I read someone else's chat?",
                });
            },
            {
                name: "ChatError",
                statusCode: 403,
                code: "UNAUTHORIZED_CONVERSATION_ACCESS",
            }
        );
    });
});
