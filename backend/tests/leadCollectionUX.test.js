/**
 * Natural Conversational Lead Collection UX Test Suite
 * 
 * Verifies:
 * 1. Required contact fields (Name & Phone) have NO Cancel/Skip buttons.
 * 2. Typing 'skip' or invalid inputs during Name/Phone prompts friendly retry without canceling.
 * 3. Visitor name is saved immediately into Neon PostgreSQL on first collection.
 * 4. Phone is strictly validated (10 digits) and updates the SAME lead record in Neon PostgreSQL.
 * 5. Optional project fields (Project Type, Description, Budget/Timeline) display compact 'Skip' buttons.
 * 6. Clicking/typing 'Skip' advances to the next question and saves NULL in PostgreSQL.
 * 7. Old confirmation flow (summary cards, "Are these details correct?", submit button) is completely removed.
 * 8. Incremental persistence is automatic: once finished, enquiry is already saved in PostgreSQL with Reference ID.
 * 9. Normal portfolio questions (cameras, showreel, work) can be asked freely without phone interruption.
 * 10. Exactly one lead record per conversation (no duplicates).
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/server.js";
import { chatService } from "../src/services/chat.service.js";
import { chatLeadRepository } from "../src/repositories/chatLead.repository.js";
import { chatRepository } from "../src/repositories/chat.repository.js";

describe("Natural Conversational Lead Collection UX Test Suite", () => {
    let server;
    let baseApiUrl;
    let testConversationId;
    let testVisitorToken;
    const createdLeadIds = [];

    before(async () => {
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseApiUrl = `http://127.0.0.1:${port}/api`;
                resolve();
            });
        });

        const init = await chatService.initializeConversation({
            visitorId: "natural-lead-flow-visitor",
            metadata: { source: "NaturalLeadCollectionUXTest" },
        });
        testConversationId = init.conversationId;
        testVisitorToken = init.visitorToken;
    });

    after(async () => {
        for (const leadId of createdLeadIds) {
            try {
                await chatLeadRepository.deleteLead(leadId);
            } catch {
                // ignore
            }
        }
        if (testConversationId) {
            try {
                const leads = await chatLeadRepository.getLeadsByConversationId(testConversationId);
                for (const l of leads) {
                    await chatLeadRepository.deleteLead(l.id).catch(() => {});
                }
                await chatRepository.deleteConversation(testConversationId);
            } catch {
                // ignore
            }
        }
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test("1. Required Contact: AI asks for Name without Cancel or Skip buttons", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "I want to hire Anup",
            visitorToken: testVisitorToken,
        });

        assert.ok(res.conversationState?.leadState?.isLeadFlowActive);
        assert.strictEqual(res.conversationState.leadState.currentLeadField, "visitorName");
        assert.ok(res.reply.toLowerCase().includes("what's your name") || res.reply.toLowerCase().includes("your name"));

        // Must NOT display Cancel or Skip buttons
        const actions = res.actions || [];
        const hasSkip = actions.some((a) => a.action === "SKIP_LEAD_FIELD" || a.label?.toLowerCase() === "skip");
        const hasCancel = actions.some((a) => a.action === "CANCEL_LEAD" || a.label?.toLowerCase() === "cancel");
        assert.strictEqual(hasSkip, false, "Must not display Skip button on visitorName");
        assert.strictEqual(hasCancel, false, "Must not display Cancel button on visitorName");
        assert.strictEqual(actions.length, 0, "Actions must be empty on visitorName");
    });

    test("2. Required Contact: Typing 'skip' or invalid name re-prompts without canceling", async () => {
        // User attempts to skip name
        const skipRes = await chatService.processMessage({
            conversationId: testConversationId,
            message: "skip",
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(skipRes.conversationState?.leadState?.isLeadFlowActive, true, "Flow must not cancel on skip attempt");
        assert.strictEqual(skipRes.conversationState.leadState.currentLeadField, "visitorName");
        assert.ok(skipRes.reply.toLowerCase().includes("share your name") || skipRes.reply.toLowerCase().includes("name"));
        assert.strictEqual((skipRes.actions || []).length, 0);

        // User enters invalid name (pure digits)
        const invalidRes = await chatService.processMessage({
            conversationId: testConversationId,
            message: "123456",
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(invalidRes.conversationState?.leadState?.isLeadFlowActive, true, "Flow must not cancel on invalid name");
        assert.strictEqual(invalidRes.conversationState.leadState.currentLeadField, "visitorName");
        assert.ok(invalidRes.reply.toLowerCase().includes("letters") || invalidRes.reply.toLowerCase().includes("valid name"));
    });

    test("3. Required Contact: Valid name is saved to DB immediately and advances to Phone", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "Rahul Verma",
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(res.conversationState?.leadState?.isLeadFlowActive, true);
        assert.strictEqual(res.conversationState.leadState.collectedLeadData.visitorName, "Rahul Verma");
        assert.strictEqual(res.conversationState.leadState.currentLeadField, "phone");
        assert.ok(res.reply.includes("Rahul"));
        assert.ok(res.reply.toLowerCase().includes("phone"));

        // Must NOT display Cancel or Skip buttons
        const actions = res.actions || [];
        const hasSkip = actions.some((a) => a.action === "SKIP_LEAD_FIELD" || a.label?.toLowerCase() === "skip");
        const hasCancel = actions.some((a) => a.action === "CANCEL_LEAD" || a.label?.toLowerCase() === "cancel");
        assert.strictEqual(hasSkip, false, "Must not display Skip button on phone");
        assert.strictEqual(hasCancel, false, "Must not display Cancel button on phone");
        assert.strictEqual(actions.length, 0, "Actions must be empty on phone");

        // Verify name was immediately persisted in PostgreSQL
        const dbLead = await chatLeadRepository.getLeadByConversationId(testConversationId);
        assert.ok(dbLead, "Lead record must exist in DB immediately after name collection");
        assert.strictEqual(dbLead.visitor_name, "Rahul Verma");
        if (!createdLeadIds.includes(dbLead.id)) {
            createdLeadIds.push(dbLead.id);
        }
    });

    test("4. Required Contact: Typing 'skip' or invalid phone re-prompts without canceling", async () => {
        // User attempts to skip phone
        const skipRes = await chatService.processMessage({
            conversationId: testConversationId,
            message: "skip",
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(skipRes.conversationState?.leadState?.isLeadFlowActive, true, "Flow must not cancel on skip attempt");
        assert.strictEqual(skipRes.conversationState.leadState.currentLeadField, "phone");
        assert.ok(skipRes.reply.toLowerCase().includes("phone") || skipRes.reply.toLowerCase().includes("whatsapp"));
        assert.strictEqual((skipRes.actions || []).length, 0);

        // User enters invalid phone (incomplete number)
        const invalidRes = await chatService.processMessage({
            conversationId: testConversationId,
            message: "98765",
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(invalidRes.conversationState?.leadState?.isLeadFlowActive, true);
        assert.strictEqual(invalidRes.conversationState.leadState.currentLeadField, "phone");
        assert.strictEqual(invalidRes.conversationState.leadState.collectedLeadData.visitorName, "Rahul Verma", "Preserves name");
    });

    test("5. Optional Info: Valid phone updates SAME lead and moves to Project Type with compact 'Skip'", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "9876543210",
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(res.conversationState?.leadState?.isLeadFlowActive, true);
        assert.strictEqual(res.conversationState.leadState.collectedLeadData.phone, "+919876543210");
        assert.strictEqual(res.conversationState.leadState.currentLeadField, "projectType");
        assert.ok(res.reply.toLowerCase().includes("project"));

        // Must display compact Skip action
        const actions = res.actions || [];
        const skipAction = actions.find((a) => a.action === "SKIP_LEAD_FIELD" || a.label === "Skip");
        assert.ok(skipAction, "Must display Skip button on projectType");
        assert.strictEqual(skipAction.type, "SKIP_LEAD_FIELD");

        // Verify phone was updated in DB
        const dbLead = await chatLeadRepository.getLeadByConversationId(testConversationId);
        assert.strictEqual(dbLead.phone, "+919876543210");
        assert.strictEqual(dbLead.visitor_name, "Rahul Verma");
    });

    test("6. Optional Info: Clicking 'Skip' on Project Type moves to Project Description", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "Skip",
            action: "SKIP_LEAD_FIELD",
            actionPayload: { field: "projectType", skip: true },
            visitorToken: testVisitorToken,
        });

        assert.strictEqual(res.conversationState?.leadState?.isLeadFlowActive, true, "Flow continues");
        assert.strictEqual(res.conversationState.leadState.collectedLeadData.projectType, null, "projectType saved as null");
        assert.strictEqual(res.conversationState.leadState.collectedLeadData.visitorName, "Rahul Verma", "Preserves name");
        assert.strictEqual(res.conversationState.leadState.collectedLeadData.phone, "+919876543210", "Preserves phone");
        assert.strictEqual(res.conversationState.leadState.currentLeadField, "projectDescription");

        // Must display compact Skip action
        const actions = res.actions || [];
        const skipAction = actions.find((a) => a.action === "SKIP_LEAD_FIELD" || a.label === "Skip");
        assert.ok(skipAction, "Must display Skip button on projectDescription");
    });

    test("7. Optional Info: Clicking 'Skip' on Project Description advances to Budget & Timeline", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "Skip",
            action: "SKIP_LEAD_FIELD",
            actionPayload: { field: "projectDescription", skip: true },
            visitorToken: testVisitorToken,
        });

        const leadState = res.conversationState?.leadState;
        assert.ok(leadState);
        assert.strictEqual(leadState.currentLeadField, "budgetTimeline");
        assert.strictEqual(leadState.collectedLeadData.projectDescription, null, "projectDescription saved as null");
        assert.ok(res.reply.toLowerCase().includes("budget") || res.reply.toLowerCase().includes("dates"));

        // Must display compact Skip action
        const actions = res.actions || [];
        const skipAction = actions.find((a) => a.action === "SKIP_LEAD_FIELD" || a.label === "Skip");
        assert.ok(skipAction, "Must display Skip button on budgetTimeline");
    });

    test("8. Natural Completion: Skipping Budget completes enquiry with NO summary or submit button", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "Skip",
            action: "SKIP_LEAD_FIELD",
            actionPayload: { field: "budgetTimeline", skip: true },
            visitorToken: testVisitorToken,
        });

        const leadState = res.conversationState?.leadState;
        assert.strictEqual(leadState.isLeadFlowActive, false);
        assert.strictEqual(leadState.currentLeadField, null);
        assert.strictEqual(leadState.leadSubmissionStatus, "submitted");
        assert.ok(leadState.referenceId);
        assert.ok(leadState.referenceId.startsWith("AR-LEAD-"));

        // NO confirmation summary ("Are these details correct?") and NO manual SUBMIT_LEAD action button
        const actions = res.actions || [];
        const hasSubmitButton = actions.some((a) => a.action === "SUBMIT_LEAD");
        assert.strictEqual(hasSubmitButton, false, "Must NOT have manual SUBMIT_LEAD button");
        assert.strictEqual(res.reply.includes("Are these details correct?"), false, "Must NOT show confirmation summary prompt");

        // Natural closing message thanking them by name
        assert.ok(res.reply.includes("Rahul Verma"));
        assert.ok(res.reply.includes("+919876543210"));
        assert.ok(res.reply.includes(leadState.referenceId));

        // Verify DB values
        const dbLead = await chatLeadRepository.getLeadByConversationId(testConversationId);
        assert.ok(dbLead);
        assert.strictEqual(dbLead.visitor_name, "Rahul Verma");
        assert.strictEqual(dbLead.phone, "+919876543210");
        assert.strictEqual(dbLead.project_type, null);
        assert.strictEqual(dbLead.project_description, null);
    });

    test("9. Normal Conversation: Asking about camera packages proceeds without phone interruptions", async () => {
        const res = await chatService.processMessage({
            conversationId: testConversationId,
            message: "What camera does Anup use?",
            visitorToken: testVisitorToken,
        });

        // Flow should NOT trigger phone or lead collection
        assert.strictEqual(res.conversationState?.leadState?.isLeadFlowActive, false);
        assert.strictEqual(res.conversationState?.leadState?.currentLeadField, null);
        assert.ok(res.reply.includes("Sony FX6") || res.reply.includes("FX3") || res.reply.toLowerCase().includes("camera"));
    });

    test("10. Deduplication Check: Exactly one lead record exists in Neon PostgreSQL for conversation", async () => {
        const leads = await chatLeadRepository.getLeadsByConversationId(testConversationId);
        assert.strictEqual(leads.length, 1, `Expected exactly 1 lead record for conversation, found ${leads.length}`);
    });
});
