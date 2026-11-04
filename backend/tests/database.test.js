import { test, describe } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { chatRepository } from "../src/repositories/chat.repository.js";
import { chatLeadRepository } from "../src/repositories/chatLead.repository.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import {
    generateVisitorToken,
    hashSessionToken,
    verifySessionToken,
} from "../src/utils/chat.utils.js";

describe("Cinematographer Portfolio Database & Repository Suite (Step 4)", () => {
    let testConversationId;
    let testVisitorToken;
    let testSessionHash;

    // -------------------------------------------------------------
    // Test 1: Conversation Creation & Session Token Hashing
    // -------------------------------------------------------------
    test("1. Database: Creates chat conversation with hashed session token and timestamps", async () => {
        testConversationId = crypto.randomUUID();
        testVisitorToken = generateVisitorToken();
        testSessionHash = hashSessionToken(testVisitorToken);

        const conv = await chatRepository.createConversation({
            id: testConversationId,
            visitorId: "visitor_db_test_01",
            sessionTokenHash: testSessionHash,
            visitorToken: testVisitorToken,
            metadata: { client: "Automated Suite" },
            status: "active",
        });

        assert.equal(conv.id, testConversationId);
        assert.equal(conv.visitor_id, "visitor_db_test_01");
        assert.equal(conv.session_token_hash, testSessionHash);
        assert.equal(conv.status, "active");
        assert.ok(conv.started_at, "started_at must be populated");
        assert.ok(conv.last_message_at, "last_message_at must be populated");

        // Verify token hashing authentication
        const isAuthValid = verifySessionToken(testVisitorToken, conv.session_token_hash);
        assert.equal(isAuthValid, true, "Plaintext token must verify against SHA-256 hash");

        const isWrongTokenValid = verifySessionToken("invalid_fake_token", conv.session_token_hash);
        assert.equal(isWrongTokenValid, false, "Invalid token must fail verification");
    });

    // -------------------------------------------------------------
    // Test 2: Message Insertion with Intent & Entity Metadata
    // -------------------------------------------------------------
    test("2. Database: Inserts user message with detected_intent, intent_category, and entities", async () => {
        const userMsgId = crypto.randomUUID();
        const msg = await chatRepository.saveMessage({
            id: userMsgId,
            conversationId: testConversationId,
            sender: "user",
            messageContent: "I want to hire you for a commercial shoot in Delhi.",
            detectedIntent: "hire_inquiry",
            intentCategory: "business",
            confidenceScore: 0.95,
            extractedEntities: { projectType: "commercial", location: "Delhi" },
            metadata: { source: "chat_widget" },
        });

        assert.equal(msg.id, userMsgId);
        assert.equal(msg.conversation_id, testConversationId);
        assert.equal(msg.sender, "user");
        assert.equal(msg.message_content, "I want to hire you for a commercial shoot in Delhi.");
        assert.equal(msg.detected_intent, "hire_inquiry");
        assert.equal(msg.intent_category, "business");
        assert.equal(Number(msg.confidence_score), 0.95);

        const entities = typeof msg.extracted_entities === "string"
            ? JSON.parse(msg.extracted_entities)
            : msg.extracted_entities;
        assert.equal(entities.projectType, "commercial");
        assert.equal(entities.location, "Delhi");
    });

    // -------------------------------------------------------------
    // Test 3: Assistant Reply Message & Conversation History Retrieval
    // -------------------------------------------------------------
    test("3. Database: Inserts assistant message and retrieves ordered message history", async () => {
        const assistantMsgId = crypto.randomUUID();
        await chatRepository.saveMessage({
            id: assistantMsgId,
            conversationId: testConversationId,
            sender: "assistant",
            messageContent: "I would be thrilled to shoot your commercial in Delhi! Let's discuss details.",
            detectedIntent: "hire_inquiry",
            intentCategory: "business",
            confidenceScore: 0.95,
            extractedEntities: {},
            metadata: { suggestions: ["View Showreel", "Discuss Dates"] },
        });

        const history = await chatRepository.getMessagesByConversationId(testConversationId);
        assert.ok(Array.isArray(history));
        assert.ok(history.length >= 2, "Conversation must contain at least 2 messages");
        assert.equal(history[0].sender, "user");
        assert.equal(history[1].sender, "assistant");
    });

    // -------------------------------------------------------------
    // Test 4: Conversation Status Lifecycle
    // -------------------------------------------------------------
    test("4. Database: Updates conversation status ('active' -> 'completed')", async () => {
        const updated = await chatRepository.updateConversationStatus(testConversationId, "completed");
        assert.ok(updated);
        assert.equal(updated.status, "completed");

        const fetched = await chatRepository.getConversationById(testConversationId);
        assert.equal(fetched.status, "completed");
    });

    // -------------------------------------------------------------
    // Test 5: Chat Lead Creation & Retrieval
    // -------------------------------------------------------------
    test("5. Database: Creates and queries lead in chat_leads table", async () => {
        const leadId = crypto.randomUUID();
        const lead = await chatLeadRepository.createLead({
            id: leadId,
            conversationId: testConversationId,
            visitorName: "Vikram Malhotra",
            email: "vikram@productionhouse.com",
            phone: "+91 9876543210",
            projectType: "commercial",
            projectDescription: "National TVC campaign for beverage brand, shooting in Delhi",
            budget: "₹2,50,000",
            preferredDate: "December 2026",
            location: "Delhi NCR",
            leadStatus: "new",
        });

        assert.equal(lead.id, leadId);
        assert.equal(lead.conversation_id, testConversationId);
        assert.equal(lead.visitor_name, "Vikram Malhotra");
        assert.equal(lead.email, "vikram@productionhouse.com");
        assert.equal(lead.project_type, "commercial");
        assert.equal(lead.lead_status, "new");

        // Query by conversation ID
        const conversationLeads = await chatLeadRepository.getLeadsByConversationId(testConversationId);
        assert.ok(Array.isArray(conversationLeads));
        assert.ok(conversationLeads.some((l) => l.id === leadId));

        // Update status to 'qualified'
        const updatedLead = await chatLeadRepository.updateLeadStatus(leadId, "qualified");
        assert.equal(updatedLead.lead_status, "qualified");

        // List leads with status filter
        const result = await chatLeadRepository.listLeads({ status: "qualified" });
        const qualifiedLeads = Array.isArray(result) ? result : result.leads;
        assert.ok(qualifiedLeads.some((l) => l.id === leadId));
    });

    // -------------------------------------------------------------
    // Test 6: Portfolio Knowledge Storage (Preparation for Step 5)
    // -------------------------------------------------------------
    test("6. Database: Stores and queries structured portfolio knowledge records", async () => {
        const knowledgeId = crypto.randomUUID();
        const entry = await portfolioKnowledgeRepository.createKnowledge({
            id: knowledgeId,
            title: "Delhi Metro Transit Line Cinematography",
            content: "Shot with Sony FX6 and Anamorphic primes capturing the dynamic transit architecture across Delhi NCR with rich tungsten and natural light grading.",
            category: "commercial",
            projectName: "Delhi Metro Transit Project",
            keywords: ["delhi metro", "transit", "sony fx6", "anamorphic", "commercial"],
            metadata: {
                director: "Anup Rawat",
                year: 2024,
                aspectRatio: "2.39:1",
            },
            isPublished: true,
        });

        assert.equal(entry.id, knowledgeId);
        assert.equal(entry.title, "Delhi Metro Transit Line Cinematography");
        assert.equal(entry.project_name, "Delhi Metro Transit Project");
        assert.equal(entry.is_published, true);

        // Fetch by ID
        const fetched = await portfolioKnowledgeRepository.getKnowledgeById(knowledgeId);
        assert.equal(fetched.id, knowledgeId);
        assert.equal(fetched.category, "commercial");

        // Update record
        const updated = await portfolioKnowledgeRepository.updateKnowledge(knowledgeId, {
            title: "Delhi Metro Transit Line Cinematography (Official Case Study)",
        });
        assert.equal(updated.title, "Delhi Metro Transit Line Cinematography (Official Case Study)");

        // List by category
        const commercialResult = await portfolioKnowledgeRepository.listKnowledge({
            category: "commercial",
            isPublished: true,
        });
        const commercialEntries = Array.isArray(commercialResult) ? commercialResult : (commercialResult?.items || []);
        assert.ok(commercialEntries.some((e) => e.id === knowledgeId));
    });

    // -------------------------------------------------------------
    // Test 7: Conversation Deletion Cascade
    // -------------------------------------------------------------
    test("7. Database: Deleting conversation cleans up conversation messages", async () => {
        const tempConvId = crypto.randomUUID();
        await chatRepository.createConversation({ id: tempConvId });

        await chatRepository.saveMessage({
            id: crypto.randomUUID(),
            conversationId: tempConvId,
            sender: "user",
            content: "Temporary message",
        });

        const deleted = await chatRepository.deleteConversation(tempConvId);
        assert.equal(deleted, true);

        const fetchedConv = await chatRepository.getConversationById(tempConvId);
        assert.equal(fetchedConv, null);

        const msgs = await chatRepository.getMessagesByConversationId(tempConvId);
        assert.equal(msgs.length, 0);
    });
});

