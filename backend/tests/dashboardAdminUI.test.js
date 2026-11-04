/**
 * Step 11: Chatbot Admin Dashboard UI & API Integration Test Suite
 * Validates lead management & portfolio knowledge backend endpoints and contracts
 * consumed by the Step 11 Admin Dashboard.
 */

import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import app from "../src/server.js";
import { chatLeadRepository } from "../src/repositories/chatLead.repository.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { generateAccessToken } from "../src/utils/tokens.js";
import { sessionRepository } from "../src/repositories/session.repository.js";

describe("Step 11 – Chatbot Admin Dashboard UI Integration Suite", () => {
    let server;
    let baseApiUrl;
    let adminToken;
    let userToken;
    let mockAdminSessionId;
    let mockUserSessionId;
    let mockAdminId;
    let mockUserId;

    let testLeadId;
    let testKnowledgeId;

    before(async () => {
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseApiUrl = `http://127.0.0.1:${port}/api`;
                resolve();
            });
        });

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
                name: "Step 11 Admin",
                email: "admin_step11@test.com",
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
                email: "viewer@test.com",
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

        // Seed a test lead
        const lead = await chatLeadRepository.createLead({
            id: crypto.randomUUID(),
            visitorName: "Dashboard Test Client",
            phone: "+919876500000",
            email: "client@brand.com",
            projectType: "Commercial",
            projectDescription: "Fashion commercial shoot in Mumbai",
            budget: "₹3,50,000",
            preferredDate: "15th Dec",
            location: "Mumbai",
            leadStatus: "new",
            source: "AI Chat Assistant",
        });
        testLeadId = lead.id;

        // Seed a test knowledge record
        const know = await portfolioKnowledgeRepository.createKnowledge({
            id: crypto.randomUUID(),
            title: "Sony FX3 Camera Gear Package for Dailies",
            category: "Camera Equipment",
            content: "Anup uses the Sony FX3 camera package with top handle and XLR audio module.",
            projectName: "Fashion TVC",
            keywords: ["fx3", "camera", "sony", "audio"],
            status: "published",
            isPublished: true,
        });
        testKnowledgeId = know.id;
    });

    after(async () => {
        if (testLeadId) {
            try {
                await chatLeadRepository.deleteLead(testLeadId);
            } catch {
                // Ignore
            }
        }

        if (testKnowledgeId) {
            try {
                await portfolioKnowledgeRepository.deleteKnowledge(testKnowledgeId);
            } catch {
                // Ignore
            }
        }

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    // =========================================================================
    // 1. Lead Management API Verification
    // =========================================================================
    describe("1. Lead Management APIs for Admin Dashboard", () => {
        test("1.1 GET /api/admin/leads/stats returns aggregated KPI metrics", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/stats`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.ok(typeof body.data.total === "number");
            assert.ok(typeof body.data.new === "number");
            assert.ok(typeof body.data.in_discussion === "number");
            assert.ok(typeof body.data.qualified === "number");
            assert.ok(typeof body.data.converted === "number");
        });

        test("1.2 GET /api/admin/leads returns paginated list with totalPages", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads?page=1&limit=10`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.ok(Array.isArray(body.data));
            assert.ok(body.pagination);
            assert.strictEqual(body.pagination.page, 1);
            assert.strictEqual(body.pagination.limit, 10);
        });

        test("1.3 GET /api/admin/leads?search=Dashboard+Test+Client filters matching leads", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads?search=Dashboard+Test+Client`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.ok(body.data.length >= 1);
            assert.strictEqual(body.data[0].id, testLeadId);
        });

        test("1.4 GET /api/admin/leads/:id returns single lead with referenceId and context", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${testLeadId}`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.strictEqual(body.data.id, testLeadId);
            assert.ok(body.data.referenceId.startsWith("AR-LEAD-"));
        });

        test("1.5 PATCH /api/admin/leads/:id/status updates lead pipeline status", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${testLeadId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ status: "in_discussion" }),
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.strictEqual(body.data.lead_status, "in_discussion");
        });

        test("1.6 PATCH /api/admin/leads/:id updates editable lead attributes", async () => {
            const res = await fetch(`${baseApiUrl}/admin/leads/${testLeadId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    location: "South Mumbai & Alibaug",
                    budget: "₹4,00,000",
                }),
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.strictEqual(body.data.location, "South Mumbai & Alibaug");
            assert.strictEqual(body.data.budget, "₹4,00,000");
        });
    });

    // =========================================================================
    // 2. Portfolio Knowledge Management API Verification
    // =========================================================================
    describe("2. Portfolio Knowledge Management APIs for Admin Dashboard", () => {
        test("2.1 GET /api/admin/knowledge lists knowledge records", async () => {
            const res = await fetch(`${baseApiUrl}/admin/knowledge?page=1&limit=10`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.ok(Array.isArray(body.data));
        });

        test("2.2 GET /api/admin/knowledge/categories retrieves category list", async () => {
            const res = await fetch(`${baseApiUrl}/admin/knowledge/categories`, {
                headers: { Authorization: `Bearer ${adminToken}` },
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            const categories = Array.isArray(body.data)
                ? body.data
                : [...(body.data?.suggestedCategories || []), ...(body.data?.activeCategories || [])];
            assert.ok(categories.length > 0);
            assert.ok(categories.includes("Camera Equipment"));
        });

        test("2.3 POST /api/admin/knowledge creates a new knowledge record", async () => {
            const res = await fetch(`${baseApiUrl}/admin/knowledge`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    title: "Test Day Rates for High-End Commercials",
                    category: "Rates and Commercials",
                    content: "Anup's standard commercial DP day rate is ₹75,000 per 10-hour day.",
                    projectName: null,
                    keywords: ["rate", "commercial", "pricing", "cost"],
                    status: "published",
                    isPublished: true,
                }),
            });
            assert.strictEqual(res.status, 201);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.strictEqual(body.data.title, "Test Day Rates for High-End Commercials");

            // Clean up created record
            if (body.data?.id) {
                await portfolioKnowledgeRepository.deleteKnowledge(body.data.id);
            }
        });

        test("2.4 PATCH /api/admin/knowledge/:id/status updates publication status", async () => {
            const res = await fetch(`${baseApiUrl}/admin/knowledge/${testKnowledgeId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ status: "draft" }),
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.strictEqual(body.data.status, "draft");
            assert.strictEqual(body.data.is_published, false);
        });

        test("2.5 POST /api/admin/knowledge/search executes simulated AI retrieval query", async () => {
            const res = await fetch(`${baseApiUrl}/admin/knowledge/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({ query: "Which camera does Anup use?" }),
            });
            assert.strictEqual(res.status, 200);
            const body = await res.json();
            assert.strictEqual(body.success, true);
            assert.ok(Array.isArray(body.data.results));
        });
    });
});
