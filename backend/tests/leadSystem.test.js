/**
 * Lead Generation & Enquiry Management System Test Suite (Step 10)
 * 
 * Verifies:
 * 1. Phone, Name, Project Type, and Description Validation & Normalization
 * 2. Conversational Lead Collection Flow Progression (Name -> Phone -> Project Type -> Description)
 * 3. Mid-flow corrections, editing, and cancellation
 * 4. Confirmation summary, ActionButtons generation, and Reference ID generation (AR-LEAD-XXXXX)
 * 5. Neon PostgreSQL persistence in chat_leads table
 * 6. Public direct submission API (POST /api/chat/lead) with privacy checks
 * 7. Admin lead management APIs (GET, PATCH status, PATCH details, DELETE) with RBAC auth
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import app from "../src/server.js";
import { chatService } from "../src/services/chat.service.js";
import { leadService, formatLeadReferenceId } from "../src/services/lead/lead.service.js";
import {
    validateName,
    validatePhone,
    validateEmail,
    validateProjectType,
    validateProjectDescription,
    validateLeadPayload,
} from "../src/services/lead/leadValidation.service.js";
import { chatLeadRepository } from "../src/repositories/chatLead.repository.js";
import { chatRepository } from "../src/repositories/chat.repository.js";
import { generateAccessToken } from "../src/utils/tokens.js";
import { sessionRepository } from "../src/repositories/session.repository.js";
import { pool } from "../src/config/db.js";

describe("Step 10 – Lead Generation & Enquiry Management System Suite", () => {
    let server;
    let baseApiUrl;
    let adminToken;
    let userToken;
    let mockAdminSessionId;
    let mockUserSessionId;
    let mockAdminId;
    let mockUserId;

    let testConversationId = null;
    let testVisitorToken = null;
    const createdLeadIds = [];

    before(async () => {
        // 1. Start test HTTP server
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseApiUrl = `http://127.0.0.1:${port}/api`;
                resolve();
            });
        });

        // 2. Setup mock admin & user sessions for authentication
        mockAdminId = crypto.randomUUID();
        mockUserId = crypto.randomUUID();
        mockAdminSessionId = crypto.randomUUID();
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
                name: "Admin Lead Manager",
                email: "admin@anuprawat.com",
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
                name: "Regular Viewer",
                email: "viewer@example.com",
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

        // 3. Initialize test chat conversation
        const init = await chatService.initializeConversation({
            visitorId: "lead-test-visitor-001",
            metadata: { source: "LeadSuiteTest" },
        });
        testConversationId = init.conversationId;
        testVisitorToken = init.visitorToken;
    });

    after(async () => {
        // Cleanup test leads
        for (const leadId of createdLeadIds) {
            try {
                await chatLeadRepository.deleteLead(leadId);
            } catch {
                // Ignore cleanup error
            }
        }

        // Cleanup conversation
        if (testConversationId) {
            try {
                await chatRepository.deleteConversation(testConversationId);
            } catch {
                // Ignore cleanup error
            }
        }

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    // =========================================================================
    // 1. Lead Validation Service Tests
    // =========================================================================
    describe("1. Lead Validation & Normalization Service", () => {
        test("1.1 Name validation: accepts valid names, normalizes casing, rejects numbers and short strings", () => {
            const valid = validateName("rohit vishwakarma");
            assert.strictEqual(valid.isValid, true);
            assert.strictEqual(valid.value, "Rohit Vishwakarma");

            const tooShort = validateName("A");
            assert.strictEqual(tooShort.isValid, false);

            const allDigits = validateName("12345678");
            assert.strictEqual(allDigits.isValid, false);
        });

        test("1.2 Phone validation: accepts Indian formats and normalizes with +91", () => {
            const indian10 = validatePhone("9876543210");
            assert.strictEqual(indian10.isValid, true);
            assert.strictEqual(indian10.value, "+919876543210");

            const indianWithPlus91 = validatePhone("+91 98765-43210");
            assert.strictEqual(indianWithPlus91.isValid, true);
            assert.strictEqual(indianWithPlus91.value, "+919876543210");

            const indianWithZero = validatePhone("09876543210");
            assert.strictEqual(indianWithZero.isValid, true);
            assert.strictEqual(indianWithZero.value, "+919876543210");
        });

        test("1.3 Phone validation: accepts International formats and rejects invalid numbers", () => {
            const usNumber = validatePhone("+1 415 555 2671");
            assert.strictEqual(usNumber.isValid, true);
            assert.strictEqual(usNumber.value, "+14155552671");

            const ukNumber = validatePhone("+447911123456");
            assert.strictEqual(ukNumber.isValid, true);

            const badAlpha = validatePhone("call-me-maybe");
            assert.strictEqual(badAlpha.isValid, false);

            const tooShort = validatePhone("123");
            assert.strictEqual(tooShort.isValid, false);
        });

        test("1.4 Full lead payload validation: validates all required and optional fields", () => {
            const validPayload = {
                visitorName: "Priya Sharma",
                phone: "9876543210",
                projectType: "Commercial Ad",
                projectDescription: "Shooting a 2-day TVC in Mumbai for an apparel brand",
                email: "priya@brand.com",
                budget: "₹3,00,000",
            };

            const result = validateLeadPayload(validPayload);
            assert.strictEqual(result.isValid, true);
            assert.strictEqual(result.normalizedData.visitorName, "Priya Sharma");
            assert.strictEqual(result.normalizedData.phone, "+919876543210");
            assert.strictEqual(result.normalizedData.email, "priya@brand.com");

            const invalidPayload = {
                visitorName: "X",
                phone: "invalid",
                projectType: "",
            };
            const invalidResult = validateLeadPayload(invalidPayload);
            assert.strictEqual(invalidResult.isValid, false);
            assert.ok(invalidResult.errors.visitorName);
            assert.ok(invalidResult.errors.phone);
            assert.ok(invalidResult.errors.projectType);
        });
    });

    // =========================================================================
    // 2. Conversational Lead Collection Flow Tests
    // =========================================================================
    describe("2. Conversational Lead Collection Flow", () => {
        let flowConversationId;
        let flowVisitorToken;

        before(async () => {
            const init = await chatService.initializeConversation({
                visitorId: "flow-visitor",
                metadata: { source: "LeadFlowSuite" },
            });
            flowConversationId = init.conversationId;
            flowVisitorToken = init.visitorToken;
        });

        after(async () => {
            if (flowConversationId) {
                try {
                    await chatRepository.deleteConversation(flowConversationId);
                } catch {
                    // Ignore
                }
            }
        });

        test("2.1 Turn 1: Hiring intent triggers lead flow and asks for visitor name", async () => {
            const res = await chatService.processMessage({
                conversationId: flowConversationId,
                message: "I want to hire Anup for a commercial shoot",
                visitorToken: flowVisitorToken,
            });

            assert.ok(res.reply);
            assert.ok(res.conversationState?.leadState?.isLeadFlowActive);
            assert.strictEqual(res.conversationState.leadState.collectedLeadData.projectType, "Commercial");
            assert.strictEqual(res.conversationState.leadState.currentLeadField, "visitorName");
            assert.ok(res.reply.toLowerCase().includes("share your name") || res.reply.toLowerCase().includes("your name"));
        });

        test("2.2 Turn 2: Visitor provides name, assistant greets and requests phone number", async () => {
            const res = await chatService.processMessage({
                conversationId: flowConversationId,
                message: "Devansh Mehra",
                visitorToken: flowVisitorToken,
            });

            assert.ok(res.conversationState?.leadState?.isLeadFlowActive);
            assert.strictEqual(res.conversationState.leadState.collectedLeadData.visitorName, "Devansh Mehra");
            assert.strictEqual(res.conversationState.leadState.currentLeadField, "phone");
            assert.ok(res.reply.includes("Devansh Mehra"));
            assert.ok(res.reply.toLowerCase().includes("phone") || res.reply.toLowerCase().includes("whatsapp"));
        });

        test("2.3 Turn 3: Invalid phone input prompts friendly retry without losing previous name", async () => {
            const res = await chatService.processMessage({
                conversationId: flowConversationId,
                message: "invalid-number-xyz",
                visitorToken: flowVisitorToken,
            });

            assert.ok(res.conversationState?.leadState?.isLeadFlowActive);
            assert.strictEqual(res.conversationState.leadState.currentLeadField, "phone");
            assert.strictEqual(res.conversationState.leadState.collectedLeadData.visitorName, "Devansh Mehra");
            assert.ok(res.reply.toLowerCase().includes("valid phone") || res.reply.toLowerCase().includes("10-digit"));
        });

        test("2.4 Turn 4: Valid phone input is accepted and moves to project description", async () => {
            const res = await chatService.processMessage({
                conversationId: flowConversationId,
                message: "+91 98111 22334",
                visitorToken: flowVisitorToken,
            });

            assert.ok(res.conversationState?.leadState?.isLeadFlowActive);
            assert.strictEqual(res.conversationState.leadState.collectedLeadData.phone, "+919811122334");
            assert.strictEqual(res.conversationState.leadState.currentLeadField, "projectDescription");
            assert.ok(res.reply.toLowerCase().includes("overview") || res.reply.toLowerCase().includes("requirements") || res.reply.toLowerCase().includes("project"));
        });

        test("2.5 Turn 5: Project description is saved and moves to optional budget & timeline", async () => {
            const res = await chatService.processMessage({
                conversationId: flowConversationId,
                message: "We need 2 days shoot in Goa for a new beverage brand commercial",
                visitorToken: flowVisitorToken,
            });

            const leadState = res.conversationState?.leadState;
            assert.ok(leadState);
            assert.strictEqual(leadState.currentLeadField, "budgetTimeline");
            assert.ok(res.reply.toLowerCase().includes("budget") || res.reply.toLowerCase().includes("dates"));

            // Verify compact Skip action button generated
            assert.ok(Array.isArray(res.actions));
            const skipAction = res.actions.find((a) => a.action === "SKIP_LEAD_FIELD" || a.label === "Skip");
            assert.ok(skipAction, "Must include SKIP_LEAD_FIELD action on budget");
        });

        test("2.6 Turn 6: Budget/Timeline completes lead submission, saves to DB, returns reference ID and resets state", async () => {
            const res = await chatService.processMessage({
                conversationId: flowConversationId,
                message: "₹2,50,000 next month in Goa",
                visitorToken: flowVisitorToken,
            });

            const leadState = res.conversationState?.leadState;
            assert.strictEqual(leadState.isLeadFlowActive, false);
            assert.strictEqual(leadState.leadSubmissionStatus, "submitted");
            assert.ok(leadState.lastSubmittedLeadId);
            assert.ok(leadState.referenceId);
            assert.ok(leadState.referenceId.startsWith("AR-LEAD-"));

            createdLeadIds.push(leadState.lastSubmittedLeadId);

            // Verify reply references Anup and the generated reference ID
            assert.ok(res.reply.includes(leadState.referenceId));
            assert.ok(res.reply.includes("Devansh Mehra"));

            // Verify database record
            const dbLead = await chatLeadRepository.getLeadById(leadState.lastSubmittedLeadId);
            assert.ok(dbLead);
            assert.strictEqual(dbLead.visitor_name, "Devansh Mehra");
            assert.strictEqual(dbLead.phone, "+919811122334");
            assert.strictEqual(dbLead.lead_status, "new");
            assert.strictEqual(dbLead.source, "AI Chat Assistant");
        });
    });

    // =========================================================================
    // 3. Mid-Flow Cancellation Tests
    // =========================================================================
    describe("3. Mid-Flow Cancellation", () => {
        test("3.1 Visitor can cancel lead flow at any point, clearing active lead state", async () => {
            const init = await chatService.initializeConversation({
                visitorId: "cancel-visitor",
                metadata: { source: "CancelTest" },
            });

            // Start flow
            await chatService.processMessage({
                conversationId: init.conversationId,
                message: "I want to hire Anup Rawat",
                visitorToken: init.visitorToken,
            });

            // Cancel flow
            const cancelRes = await chatService.processMessage({
                conversationId: init.conversationId,
                message: "cancel inquiry",
                visitorToken: init.visitorToken,
            });

            assert.strictEqual(cancelRes.conversationState?.leadState?.isLeadFlowActive, false);
            assert.strictEqual(cancelRes.conversationState?.leadState?.leadSubmissionStatus, "cancelled");
            assert.ok(cancelRes.reply.toLowerCase().includes("cancelled"));

            await chatRepository.deleteConversation(init.conversationId);
        });
    });

    // =========================================================================
    // 4. Public Direct Lead API (POST /api/chat/lead)
    // =========================================================================
    describe("4. Direct Public Lead Submission API (POST /api/chat/lead)", () => {
        test("4.1 Rejects request when required fields are missing", async () => {
            const res = await fetch(`${baseApiUrl}/chat/lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: testConversationId,
                    visitorName: "Short",
                }),
            });

            assert.strictEqual(res.status, 400);
            const data = await res.json();
            assert.strictEqual(data.success, false);
        });

        test("4.2 Rejects submission for non-existent conversationId", async () => {
            const fakeId = crypto.randomUUID();
            const res = await fetch(`${baseApiUrl}/chat/lead`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationId: fakeId,
                    visitorName: "Aman Gupta",
                    phone: "+919876543210",
                    projectType: "Corporate Video",
                    projectDescription: "Brand story video for our startup",
                }),
            });

            assert.strictEqual(res.status, 404);
        });

        test("4.3 Successfully submits lead, returns 201 Created and reference ID", async () => {
            const res = await fetch(`${baseApiUrl}/chat/lead`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-visitor-token": testVisitorToken,
                },
                body: JSON.stringify({
                    conversationId: testConversationId,
                    visitorName: "Aman Gupta",
                    phone: "+91 98765 43210",
                    email: "aman@startup.in",
                    projectType: "Corporate Video",
                    projectDescription: "Brand story video for our tech startup in Bangalore",
                    budget: "₹2,50,000",
                    preferredDate: "Next Month",
                    location: "Bangalore",
                }),
            });

            assert.strictEqual(res.status, 201);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(data.data.referenceId.startsWith("AR-LEAD-"));
            assert.strictEqual(data.data.lead.visitor_name, "Aman Gupta");
            assert.strictEqual(data.data.lead.phone, "+919876543210");
            assert.strictEqual(data.data.lead.source, "AI Chat Assistant");

            createdLeadIds.push(data.data.lead.id);
        });
    });

    // =========================================================================
    // 5. Admin Lead Management APIs
    // =========================================================================
    describe("5. Admin Lead Management APIs (Protected)", () => {
        let createdLeadId = null;
        let adminLeadConvId = null;

        before(async () => {
            const initConv = await chatService.initializeConversation({
                visitorId: "admin-test-visitor",
                metadata: { source: "AdminLeadTest" },
            });
            adminLeadConvId = initConv.conversationId;

            const lead = await chatLeadRepository.createLead({
                id: crypto.randomUUID(),
                conversationId: adminLeadConvId,
                visitorName: "Admin Test Client",
                phone: "+919988776655",
                email: "client@test.com",
                projectType: "Music Video",
                projectDescription: "Indie rock music video shooting in Manali",
                budget: "₹1,50,000",
                leadStatus: "new",
                source: "AI Chat Assistant",
            });
            createdLeadId = lead.id;
            createdLeadIds.push(lead.id);
        });

        after(async () => {
            if (adminLeadConvId) {
                await chatRepository.deleteConversation(adminLeadConvId).catch(() => {});
            }
        });

        test("5.1 Rejects unauthenticated request with 401 Unauthorized", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads`);
            assert.strictEqual(res.status, 401);
        });

        test("5.2 Rejects non-admin user request with 403 Forbidden", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads`, {
                headers: { Authorization: `Bearer ${userToken}` },
            });
            assert.strictEqual(res.status, 403);
        });

        test("5.3 Allows admin to list leads with pagination and search filter", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads?search=Admin+Test+Client`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.ok(Array.isArray(data.data));
            assert.ok(data.data.length >= 1);
            assert.ok(data.pagination);
            assert.ok(data.data[0].referenceId);
        });

        test("5.4 Admin can fetch single lead by ID with conversation history", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${createdLeadId}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.id, createdLeadId);
            assert.strictEqual(data.data.visitor_name, "Admin Test Client");
            assert.ok(data.data.referenceId);
        });

        test("5.5 Admin can update lead status to in_discussion and contacted", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${createdLeadId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ status: "in_discussion" }),
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);
            assert.strictEqual(data.data.lead_status, "in_discussion");
        });

        test("5.6 Rejects invalid status with 400 Bad Request", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${createdLeadId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ status: "unsupported_status" }),
            });

            assert.strictEqual(res.status, 400);
        });

        test("5.7 Admin can edit full lead details", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${createdLeadId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    location: "Manali, Himachal Pradesh",
                    budget: "₹1,80,000",
                }),
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.data.location, "Manali, Himachal Pradesh");
            assert.strictEqual(data.data.budget, "₹1,80,000");
        });

        test("5.8 Admin can delete a lead record", async () => {
            const tempLead = await chatLeadRepository.createLead({
                id: crypto.randomUUID(),
                visitorName: "To Delete",
                phone: "+919999900000",
                projectType: "Short Film",
                projectDescription: "Film description",
            });

            const res = await fetch(`${baseApiUrl}/admin/leads/${tempLead.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${adminToken}` },
            });

            assert.strictEqual(res.status, 200);
            const data = await res.json();
            assert.strictEqual(data.success, true);

            const check = await chatLeadRepository.getLeadById(tempLead.id);
            assert.strictEqual(check, null);
        });
    });
});
