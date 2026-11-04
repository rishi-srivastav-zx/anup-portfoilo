import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import app from "../src/server.js";
import { chatService, ChatError } from "../src/services/chat.service.js";
import { intentService } from "../src/modules/intent/intent.service.js";
import { INTENTS, INTENT_CATEGORIES } from "../src/modules/intent/intent.constants.js";
import { smartSearchService } from "../src/services/smartSearch.service.js";
import { searchQueryExpander } from "../src/services/smartSearch/searchQueryExpander.js";
import { knowledgeRetrievalService } from "../src/services/knowledgeRetrieval.service.js";
import { responseGenerationService } from "../src/services/responseGeneration.service.js";
import { validateAction } from "../src/services/responseGeneration/actionDispatcher.js";
import { ACTION_TYPES } from "../src/constants/action.constants.js";
import { conversationStateService } from "../src/services/conversationState/conversationState.service.js";
import { leadService } from "../src/services/lead/lead.service.js";
import { chatLeadRepository } from "../src/repositories/chatLead.repository.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { generateAccessToken } from "../src/utils/tokens.js";
import { sessionRepository } from "../src/repositories/session.repository.js";

describe("Step 12: Complete AI Portfolio Assistant – End-to-End, Security & Production Audit Suite", () => {
    let server;
    let baseApiUrl;
    let adminToken;
    let userToken;
    let mockAdminId;
    let mockAdminSessionId;
    let mockUserId;
    let mockUserSessionId;

    let testConversationId;
    let testVisitorToken;

    before(async () => {
        // Start ephemeral server
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseApiUrl = `http://127.0.0.1:${port}/api`;
                resolve();
            });
        });

        // Seed mock sessions for authorization tests
        mockAdminId = crypto.randomUUID();
        mockAdminSessionId = crypto.randomUUID();
        mockUserId = crypto.randomUUID();
        mockUserSessionId = crypto.randomUUID();

        sessionRepository.seedSessionWithUser(mockAdminSessionId, {
            session: {
                id: mockAdminSessionId,
                user_id: mockAdminId,
                is_revoked: false,
                expires_at: new Date(Date.now() + 86400000).toISOString(),
            },
            user: {
                id: mockAdminId,
                name: "Auditor Admin",
                email: "auditor@anuprawat.com",
                role: "admin",
                is_active: true,
            },
        });

        sessionRepository.seedSessionWithUser(mockUserSessionId, {
            session: {
                id: mockUserSessionId,
                user_id: mockUserId,
                is_revoked: false,
                expires_at: new Date(Date.now() + 86400000).toISOString(),
            },
            user: {
                id: mockUserId,
                name: "Regular Visitor",
                email: "visitor@test.com",
                role: "user",
                is_active: true,
            },
        });

        adminToken = generateAccessToken({
            userId: mockAdminId,
            role: "admin",
            sessionId: mockAdminSessionId,
        });

        userToken = generateAccessToken({
            userId: mockUserId,
            role: "user",
            sessionId: mockUserSessionId,
        });

        // Initialize a clean test conversation
        const initRes = await fetch(`${baseApiUrl}/chat/conversation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visitorId: "prod_audit_visitor_1",
                metadata: { source: "Production Audit Suite" },
            }),
        });
        const initData = await initRes.json();
        testConversationId = initData.data.conversationId;
        testVisitorToken = initData.data.visitorToken;
    });

    after(async () => {
        if (server) {
            if (typeof server.closeAllConnections === "function") {
                server.closeAllConnections();
            }
            await new Promise((resolve) => server.close(resolve));
        }
    });

    // =========================================================================
    // 1. CHAT API ENDPOINTS & LIFECYCLE
    // =========================================================================
    describe("1. Chat API Endpoints & Lifecycle", () => {
        test("1.1 POST /api/chat/conversation initializes conversation with UUID and visitor token", async () => {
            const res = await fetch(`${baseApiUrl}/chat/conversation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metadata: { channel: "desktop_widget" } }),
            });
            assert.strictEqual(res.status, 201);
            const json = await res.json();
            assert.strictEqual(json.success, true);
            assert.ok(json.data.conversationId);
            assert.ok(json.data.visitorToken);
            assert.match(json.data.conversationId, /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        test("1.2 POST /api/chat/message processes visitor message and saves to history", async () => {
            const res = await fetch(`${baseApiUrl}/chat/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-visitor-token": testVisitorToken,
                },
                body: JSON.stringify({
                    conversationId: testConversationId,
                    message: "Tell me about Anup Rawat and his background",
                }),
            });
            assert.strictEqual(res.status, 200);
            const json = await res.json();
            assert.strictEqual(json.success, true);
            assert.ok(typeof json.data.reply === "string" && json.data.reply.length > 20);
            assert.strictEqual(json.data.conversationId, testConversationId);
            assert.ok(json.data.intent);
        });

        test("1.3 GET /api/chat/conversation/:id retrieves conversation history with valid token", async () => {
            const res = await fetch(`${baseApiUrl}/chat/conversation/${testConversationId}`, {
                headers: { "x-visitor-token": testVisitorToken },
            });
            assert.strictEqual(res.status, 200);
            const json = await res.json();
            assert.strictEqual(json.success, true);
            assert.strictEqual(json.data.conversationId, testConversationId);
            assert.ok(Array.isArray(json.data.messages));
            assert.ok(json.data.messages.length >= 2);
        });

        test("1.4 Rejects malformed payload and empty message with 400 Bad Request", async () => {
            const resEmpty = await fetch(`${baseApiUrl}/chat/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-visitor-token": testVisitorToken,
                },
                body: JSON.stringify({
                    conversationId: testConversationId,
                    message: "     ",
                }),
            });
            assert.strictEqual(resEmpty.status, 400);

            const resNoConv = await fetch(`${baseApiUrl}/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Hello without convId" }),
            });
            assert.strictEqual(resNoConv.status, 400);
        });
    });

    // =========================================================================
    // 2. INTENT DETECTION (MULTILINGUAL, HINGLISH, TYPOS)
    // =========================================================================
    describe("2. Multilingual Intent Detection Engine", () => {
        test("2.1 English inquiries detect correct intent and category", async () => {
            const resAbout = await intentService.detectIntent({ message: "Who is Anup Rawat?" });
            assert.strictEqual(resAbout.intent, INTENTS.ABOUT_PERSON);
            assert.strictEqual(resAbout.category, INTENT_CATEGORIES.PERSONAL);

            const resCamera = await intentService.detectIntent({ message: "What cinema cameras does Anup use for filming?" });
            assert.strictEqual(resCamera.intent, INTENTS.CAMERA_INQUIRY);
            assert.strictEqual(resCamera.category, INTENT_CATEGORIES.TECHNICAL);

            const resHire = await intentService.detectIntent({ message: "I want to hire Anup for an upcoming commercial project" });
            assert.strictEqual(resHire.intent, INTENTS.HIRE_INQUIRY);
            assert.strictEqual(resHire.category, INTENT_CATEGORIES.BUSINESS);
        });

        test("2.2 Hindi and Hinglish queries are accurately classified", async () => {
            const resHinglish1 = await intentService.detectIntent({ message: "Anup ke baare mein batao" });
            assert.strictEqual(resHinglish1.intent, INTENTS.ABOUT_PERSON);

            const resHinglish2 = await intentService.detectIntent({ message: "Camera konsa use karte ho?" });
            assert.strictEqual(resHinglish2.intent, INTENTS.CAMERA_INQUIRY);

            const resHinglish3 = await intentService.detectIntent({ message: "Wedding shoot karte ho kya?" });
            assert.strictEqual(resHinglish3.intent, INTENTS.WEDDING_INQUIRY);

            const resHindiDevanagari = await intentService.detectIntent({ message: "शादी का वीडियो shoot karte ho kya?" });
            assert.strictEqual(resHindiDevanagari.intent, INTENTS.WEDDING_INQUIRY);
        });

        test("2.3 Typo-tolerance handles noisy visitor messages", async () => {
            const resTypo1 = await intentService.detectIntent({ message: "cinematograper gear dikhao" });
            assert.strictEqual(resTypo1.intent, INTENTS.EQUIPMENT_INQUIRY);

            const resTypo2 = await intentService.detectIntent({ message: "wanna hire u for ad shoot plz" });
            assert.strictEqual(resTypo2.intent, INTENTS.HIRE_INQUIRY);
        });

        test("2.4 Greetings and generic questions return appropriate intents", async () => {
            const resGreeting = await intentService.detectIntent({ message: "Hello! Good morning" });
            assert.strictEqual(resGreeting.intent, INTENTS.GREETING);

            const resNav = await intentService.detectIntent({ message: "Show me your latest projects" });
            assert.strictEqual(resNav.intent, INTENTS.VIEW_PORTFOLIO);
        });
    });

    // =========================================================================
    // 3. KNOWLEDGE RETRIEVAL & PUBLICATION INTEGRITY
    // =========================================================================
    describe("3. Knowledge Retrieval & Publication Filtering", () => {
        let draftRecordId;
        let publishedRecordId;

        before(async () => {
            draftRecordId = crypto.randomUUID();
            publishedRecordId = crypto.randomUUID();

            await portfolioKnowledgeRepository.createKnowledge({
                id: draftRecordId,
                title: "Internal Unreleased Secret Project 2027",
                content: "Secret project shot on undisclosed camera gear.",
                category: "Upcoming Work",
                status: "draft",
                isPublished: false,
                keywords: ["secret", "confidential", "internal"],
            });

            await portfolioKnowledgeRepository.createKnowledge({
                id: publishedRecordId,
                title: "Sony FX6 Cinema Line Specifications",
                content: "Anup pairs the Sony FX6 with G-Master prime lenses for high mobility handheld work.",
                category: "Camera Equipment",
                status: "published",
                isPublished: true,
                keywords: ["sony fx6", "specifications", "cinema line"],
            });
        });

        after(async () => {
            await portfolioKnowledgeRepository.deleteKnowledge(draftRecordId);
            await portfolioKnowledgeRepository.deleteKnowledge(publishedRecordId);
        });

        test("3.1 Public search strictly retrieves published records and excludes drafts", async () => {
            const res = await smartSearchService.search({ query: "secret unreleased internal project" });
            const hasDraft = res.results.some((r) => r.id === draftRecordId);
            assert.strictEqual(hasDraft, false, "Draft knowledge must never appear in search results");
        });

        test("3.2 Published knowledge is retrieved with high relevance score", async () => {
            const res = await smartSearchService.search({ query: "Sony FX6 Cinema Line" });
            assert.ok(res.results.length > 0);
            assert.ok(res.results.some((r) => r.id === publishedRecordId));
        });

        test("3.3 Completely irrelevant queries return fallback with hasRelevantKnowledge = false", async () => {
            const retrieval = await knowledgeRetrievalService.retrieveKnowledge({
                query: "how do I bake a chocolate cake at home?",
                intent: INTENTS.GENERAL_QUERY,
                category: INTENT_CATEGORIES.GENERAL,
                entities: {},
            });
            assert.strictEqual(retrieval.hasRelevantKnowledge, false);
            assert.strictEqual(retrieval.results.length, 0);
        });
    });

    // =========================================================================
    // 4. SMART SEARCH (FULL-TEXT, TRIGRAM, SYNONYMS)
    // =========================================================================
    describe("4. Smart Search Engine (Hybrid FTS & Trigram)", () => {
        test("4.1 Synonyms and slang expand to canonical keywords", () => {
            const expanded = searchQueryExpander.expand("gear and rates for ad shoot");
            assert.ok(expanded.searchTokens.some((t) => t.includes("camera") || t.includes("equipment") || t.includes("gear")));
            assert.ok(expanded.searchTokens.some((t) => t.includes("price") || t.includes("pricing") || t.includes("rate") || t.includes("commercial")));
        });

        test("4.2 Trigram fuzzy search matches project names with typos", async () => {
            const res = await smartSearchService.search({ query: "Delhy Metro Transitt" });
            assert.ok(res.results.length > 0);
            assert.ok(res.results.some((r) => (r.title || "").toLowerCase().includes("delhi") || (r.projectName || "").toLowerCase().includes("delhi")));
        });
    });

    // =========================================================================
    // 5. RESPONSE GENERATION & GROUNDING
    // =========================================================================
    describe("5. Response Generation Engine & Grounding", () => {
        test("5.1 Grounded response references verified facts without hallucinating external details", () => {
            const response = responseGenerationService.generateResponse({
                userMessage: "What cameras do you use?",
                intentResult: { intent: INTENTS.CAMERA_INQUIRY, category: INTENT_CATEGORIES.TECHNICAL, entities: {} },
                retrievalResult: {
                    hasRelevantKnowledge: true,
                    results: [
                        {
                            title: "Sony FX3 and Sony FX6 Cinema Packages",
                            content: "Anup shoots primarily on the Sony FX3 and Sony FX6 cine bodies.",
                            category: "Camera Equipment",
                            relevanceScore: 0.95,
                        },
                    ],
                },
                conversationContext: {},
            });

            assert.ok(response.reply.includes("Sony FX3") || response.reply.includes("Sony FX6"));
            // Ensure no made-up Hollywood cameras are added
            assert.strictEqual(response.reply.includes("ARRI Alexa Mini LF 65"), false);
        });

        test("5.2 Politely provides honest fallback when knowledge is missing", () => {
            const response = responseGenerationService.generateResponse({
                userMessage: "What is Anup's favorite pizza topping?",
                intentResult: { intent: INTENTS.GENERAL_QUERY, category: INTENT_CATEGORIES.GENERAL, entities: {} },
                retrievalResult: {
                    hasRelevantKnowledge: false,
                    results: [],
                },
                conversationContext: {},
            });

            assert.ok(response.reply.toLowerCase().includes("don't have") || response.reply.toLowerCase().includes("reach out") || response.reply.toLowerCase().includes("anup"));
        });

        test("5.3 Hinglish queries receive respectful Hinglish/English answers", () => {
            const response = responseGenerationService.generateResponse({
                userMessage: "Anup ke camera setup ke baare me batao",
                intentResult: { intent: INTENTS.CAMERA_INQUIRY, category: INTENT_CATEGORIES.TECHNICAL, entities: {} },
                retrievalResult: {
                    hasRelevantKnowledge: true,
                    results: [
                        {
                            title: "Sony FX3 and FX6 Packages",
                            content: "Anup uses Sony FX3 and Sony FX6 cameras.",
                            category: "Camera Equipment",
                            relevanceScore: 0.92,
                        },
                    ],
                },
                conversationContext: {},
            });

            assert.ok(response.reply.length > 20);
        });
    });

    // =========================================================================
    // 6. SECTION NAVIGATION & INTERACTIVE ACTIONS
    // =========================================================================
    describe("6. Section Navigation & Interactive Actions", () => {
        test("6.1 Validates allowed DOM sections and routes strictly", () => {
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_SECTION, target: "#work", label: "View Work" }), true);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_SECTION, target: "#about", label: "About Anup" }), true);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_ROUTE, target: "/blog", label: "Read Blog" }), true);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.OPEN_CONTACT_MODAL, target: "#contact", label: "Contact Modal" }), true);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.SCROLL_TO_TOP, target: "#home", label: "Back to Top" }), true);
        });

        test("6.2 Rejects malicious scripts, protocols, missing labels, and path traversals", () => {
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_SECTION, target: "javascript:alert(1)", label: "Attack" }), false);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_ROUTE, target: "https://evil.com/phish", label: "External" }), false);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_ROUTE, target: "/../../etc/passwd", label: "Traversal" }), false);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_SECTION, target: "#nonExistentSection", label: "Invalid" }), false);
            assert.strictEqual(validateAction({ type: ACTION_TYPES.NAVIGATE_TO_SECTION, target: "#work" }), false); // missing label rejected
        });
    });

    // =========================================================================
    // 7. CONVERSATION STATE & MULTI-TURN PERSISTENCE
    // =========================================================================
    describe("7. Conversation State Management & Persistence", () => {
        let multiTurnConvId;
        let multiTurnToken;

        before(async () => {
            const initRes = await fetch(`${baseApiUrl}/chat/conversation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metadata: { source: "State Test" } }),
            });
            const data = await initRes.json();
            multiTurnConvId = data.data.conversationId;
            multiTurnToken = data.data.visitorToken;
        });

        test("7.1 Turn 1 establishes topic and persists state to Neon PostgreSQL", async () => {
            const res1 = await chatService.processMessage({
                conversationId: multiTurnConvId,
                visitorToken: multiTurnToken,
                message: "Which camera does Anup use?",
            });
            assert.ok(res1.conversationState);
            assert.strictEqual(res1.conversationState.currentTopic, "technical");
        });

        test("7.2 Turn 2 resolves pronoun follow-up ('with it') using persisted state", async () => {
            const res2 = await chatService.processMessage({
                conversationId: multiTurnConvId,
                visitorToken: multiTurnToken,
                message: "Which lens does he use with it?",
            });
            assert.ok(res2.reply);
            assert.ok(res2.reply.toLowerCase().includes("lens") || res2.reply.toLowerCase().includes("sony") || res2.reply.toLowerCase().includes("prime"));
        });
    });

    // =========================================================================
    // 8. LEAD GENERATION WORKFLOW & CONVERSATIONAL VALIDATION
    // =========================================================================
    describe("8. Conversational Lead Collection & Field Validation", () => {
        let leadConvId;
        let leadConvToken;

        before(async () => {
            const initRes = await fetch(`${baseApiUrl}/chat/conversation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metadata: { source: "Lead Test" } }),
            });
            const data = await initRes.json();
            leadConvId = data.data.conversationId;
            leadConvToken = data.data.visitorToken;
        });

        test("8.1 Hiring intent triggers conversational lead flow", async () => {
            const res = await chatService.processMessage({
                conversationId: leadConvId,
                visitorToken: leadConvToken,
                message: "I want to hire Anup for an ad commercial in Mumbai",
            });
            assert.strictEqual(res.conversationState.leadState.isLeadFlowActive, true);
            assert.strictEqual(res.conversationState.leadState.currentLeadField, "visitorName");
        });

        test("8.2 Name collection advances to phone number request", async () => {
            const res = await chatService.processMessage({
                conversationId: leadConvId,
                visitorToken: leadConvToken,
                message: "Rohan Kapoor",
            });
            assert.strictEqual(res.conversationState.leadState.collectedLeadData.visitorName, "Rohan Kapoor");
            assert.strictEqual(res.conversationState.leadState.currentLeadField, "phone");
        });

        test("8.3 Phone validation: Rejects invalid input and accepts Indian & International formats", async () => {
            // Invalid phone
            const invalidRes = await chatService.processMessage({
                conversationId: leadConvId,
                visitorToken: leadConvToken,
                message: "not a phone number 123",
            });
            assert.strictEqual(invalidRes.conversationState.leadState.currentLeadField, "phone");
            assert.ok(invalidRes.reply.toLowerCase().includes("phone") || invalidRes.reply.toLowerCase().includes("number"));

            // Valid Indian Phone (+91 9876543210)
            const validRes = await chatService.processMessage({
                conversationId: leadConvId,
                visitorToken: leadConvToken,
                message: "+91 9876543210",
            });
            assert.strictEqual(validRes.conversationState.leadState.collectedLeadData.phone, "+919876543210");
            assert.notStrictEqual(validRes.conversationState.leadState.currentLeadField, "phone");
        });

        test("8.4 Cancellation command cleanly terminates active lead flow", async () => {
            const cancelRes = await chatService.processMessage({
                conversationId: leadConvId,
                visitorToken: leadConvToken,
                message: "cancel enquiry",
            });
            assert.strictEqual(cancelRes.conversationState.leadState.isLeadFlowActive, false);
            assert.ok(cancelRes.reply.toLowerCase().includes("cancelled") || cancelRes.reply.toLowerCase().includes("no problem"));
        });
    });

    // =========================================================================
    // 9. LEAD PERSISTENCE & DATABASE INTEGRITY
    // =========================================================================
    describe("9. Lead Submission & Neon PostgreSQL Insertion", () => {
        let createdLeadId;

        test("9.1 Submitting validated lead inserts into chat_leads with reference ID", async () => {
            const leadPayload = {
                conversationId: testConversationId,
                visitorName: "Sunil Narang",
                phone: "+91 9811223344",
                email: "sunil@brandfilms.in",
                projectType: "Commercial TVC",
                projectDescription: "Two day studio and outdoor shoot in Goa for fashion brand",
                budget: "₹3,00,000",
                location: "Goa",
                source: "Audit Test Suite",
            };

            const res = await fetch(`${baseApiUrl}/chat/lead`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-visitor-token": testVisitorToken,
                },
                body: JSON.stringify(leadPayload),
            });

            assert.strictEqual(res.status, 201);
            const json = await res.json();
            assert.strictEqual(json.success, true);
            assert.ok(json.data.referenceId);
            assert.match(json.data.referenceId, /^AR-LEAD-[A-Z0-9]{5,8}$/);
            assert.strictEqual(json.data.lead.visitor_name, "Sunil Narang");
            assert.strictEqual(json.data.lead.email, "sunil@brandfilms.in");
            createdLeadId = json.data.lead.id;
        });

        test("9.2 Lead is queryable in database and linked to conversation", async () => {
            assert.ok(createdLeadId);
            const lead = await chatLeadRepository.getLeadById(createdLeadId);
            assert.ok(lead);
            assert.strictEqual(lead.visitor_name, "Sunil Narang");
            assert.strictEqual(lead.lead_status, "new");
        });

        after(async () => {
            if (createdLeadId) {
                await chatLeadRepository.deleteLead(createdLeadId);
            }
        });
    });

    // =========================================================================
    // 10. ADMIN DASHBOARD & SECURITY AUTHORIZATION
    // =========================================================================
    describe("10. Admin APIs & Authorization Protection", () => {
        test("10.1 Public request without token is rejected with 401 Unauthorized", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/stats`);
            assert.strictEqual(res.status, 401);
        });

        test("10.2 Non-admin user token is rejected with 403 Forbidden", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/stats`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            assert.strictEqual(res.status, 403);
        });

        test("10.3 Valid admin token retrieves lead statistics and paginated leads", async () => {
            const statsRes = await fetch(`${baseApiUrl}/admin/leads/stats`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(statsRes.status, 200);
            const statsJson = await statsRes.json();
            assert.strictEqual(statsJson.success, true);
            assert.ok(typeof statsJson.data.total === "number");

            const leadsRes = await fetch(`${baseApiUrl}/admin/leads?page=1&limit=5`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(leadsRes.status, 200);
            const leadsJson = await leadsRes.json();
            assert.strictEqual(leadsJson.success, true);
            assert.ok(Array.isArray(leadsJson.data));
            assert.ok(leadsJson.pagination);
        });

        test("10.4 Admin can list, create, and test knowledge base search", async () => {
            const catRes = await fetch(`${baseApiUrl}/admin/knowledge/categories`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(catRes.status, 200);
            const catJson = await catRes.json();
            assert.strictEqual(catJson.success, true);

            const searchRes = await fetch(`${baseApiUrl}/admin/knowledge/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ query: "camera lenses" }),
            });
            assert.strictEqual(searchRes.status, 200);
            const searchJson = await searchRes.json();
            assert.strictEqual(searchJson.success, true);
            assert.ok(Array.isArray(searchJson.data.results));
        });
    });

    // =========================================================================
    // 11. SECURITY AUDIT: IDOR & VISITOR TOKEN OWNERSHIP
    // =========================================================================
    describe("11. Security Audit: IDOR & Visitor Token Ownership", () => {
        let protectedConvId;
        let protectedConvToken;

        before(async () => {
            const initRes = await fetch(`${baseApiUrl}/chat/conversation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ metadata: { source: "IDOR Test" } }),
            });
            const data = await initRes.json();
            protectedConvId = data.data.conversationId;
            protectedConvToken = data.data.visitorToken;
        });

        test("11.1 Unauthorized visitor cannot read another visitor's conversation without token (403)", async () => {
            const res = await fetch(`${baseApiUrl}/chat/conversation/${protectedConvId}`);
            assert.strictEqual(res.status, 403);
            const json = await res.json();
            assert.strictEqual(json.code, "UNAUTHORIZED_CONVERSATION_ACCESS");
        });

        test("11.2 Unauthorized visitor cannot read conversation with mismatched token (403)", async () => {
            const res = await fetch(`${baseApiUrl}/chat/conversation/${protectedConvId}`, {
                headers: { "x-visitor-token": "hacker-tampered-token-xyz" },
            });
            assert.strictEqual(res.status, 403);
            const json = await res.json();
            assert.strictEqual(json.code, "UNAUTHORIZED_CONVERSATION_ACCESS");
        });

        test("11.3 Unauthorized visitor cannot delete another visitor's conversation (403)", async () => {
            const res = await fetch(`${baseApiUrl}/chat/conversation/${protectedConvId}`, {
                method: "DELETE",
                headers: { "x-visitor-token": "attacker-token" },
            });
            assert.strictEqual(res.status, 403);
        });

        test("11.4 Legitimate visitor with correct token can delete their conversation (200)", async () => {
            const res = await fetch(`${baseApiUrl}/chat/conversation/${protectedConvId}`, {
                method: "DELETE",
                headers: { "x-visitor-token": protectedConvToken },
            });
            assert.strictEqual(res.status, 200);
        });
    });

    // =========================================================================
    // 12. SECURITY AUDIT: SQL INJECTION & PAYLOAD LIMITS
    // =========================================================================
    describe("12. Security Audit: SQL Injection & Payload Protection", () => {
        test("12.1 SQL Injection payloads in search query are safely handled by parameterized queries", async () => {
            const sqlInjections = [
                "' OR 1=1 --",
                "'; DROP TABLE chat_leads; --",
                "UNION SELECT null, username, password FROM users --",
                "' AND pg_sleep(5) --",
            ];

            for (const payload of sqlInjections) {
                const searchResult = await smartSearchService.search({ query: payload });
                // Must execute safely and return array without crashing DB
                assert.ok(Array.isArray(searchResult.results));
            }
        });

        test("12.2 Excessive chat payload exceeding 32KB is rejected with 413 Payload Too Large", async () => {
            const hugePayload = "A".repeat(40 * 1024); // 40KB
            const res = await fetch(`${baseApiUrl}/chat/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-visitor-token": testVisitorToken,
                },
                body: JSON.stringify({
                    conversationId: testConversationId,
                    message: hugePayload,
                }),
            });
            assert.strictEqual(res.status, 413);
        });

        test("12.3 HTML script injection in chat message is sanitized", async () => {
            const xssMessage = "<script>alert('xss')</script>Hello Anup<b>Test</b>";
            const res = await fetch(`${baseApiUrl}/chat/message`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-visitor-token": testVisitorToken,
                },
                body: JSON.stringify({
                    conversationId: testConversationId,
                    message: xssMessage,
                }),
            });
            assert.strictEqual(res.status, 200);
            const json = await res.json();
            assert.strictEqual(json.success, true);
            // Verify stored or replied message does not render raw script tags
            assert.strictEqual(json.data.reply.includes("<script>"), false);
        });
    });
});
