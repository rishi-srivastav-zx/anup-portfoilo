import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import app from "../src/server.js";
import { portfolioKnowledgeService } from "../src/services/portfolioKnowledge.service.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { KNOWLEDGE_STATUS } from "../src/constants/portfolioKnowledge.constants.js";
import { generateAccessToken } from "../src/utils/tokens.js";
import { pool } from "../src/config/db.js";
import { sessionRepository } from "../src/repositories/session.repository.js";

describe("Cinematographer Portfolio Knowledge Management Suite", () => {
    let server;
    let baseUrl;
    let adminToken;
    let userToken;
    let mockAdminSessionId;
    let mockUserSessionId;
    let mockAdminId;
    let mockUserId;

    before(async () => {
        // Start ephemeral HTTP server for endpoint testing
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}/api/admin/knowledge`;
                resolve();
            });
        });

        // Setup mock admin and regular user sessions in database
        mockAdminId = crypto.randomUUID();
        mockUserId = crypto.randomUUID();
        mockAdminSessionId = crypto.randomUUID();
        mockUserSessionId = crypto.randomUUID();

        // Seed session cache for guaranteed resilient auth in test environments
        sessionRepository.seedSessionWithUser(mockAdminSessionId, {
            session: {
                id: mockAdminSessionId,
                user_id: mockAdminId,
                is_revoked: false,
                expires_at: new Date(Date.now() + 86400000).toISOString(),
            },
            user: {
                id: mockAdminId,
                name: "Knowledge Admin",
                email: "admin_know@test.com",
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
                name: "Normal User",
                email: "user_know@test.com",
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
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }

        try {
            await pool.query("DELETE FROM auth_sessions WHERE id IN ($1, $2)", [
                mockAdminSessionId,
                mockUserSessionId,
            ]);
            await pool.query("DELETE FROM users WHERE id IN ($1, $2)", [
                mockAdminId,
                mockUserId,
            ]);
        } catch {
            // Ignore DB disconnects on shutdown
        }
    });

    // -------------------------------------------------------------
    // Service Unit Tests: Flexible Knowledge Formats
    // -------------------------------------------------------------
    test("1. Service: Creates Simple Text knowledge record", async () => {
        const item = await portfolioKnowledgeService.createKnowledge({
            title: "Who is Anup Rawat?",
            content: "Anup Rawat is a contemporary cinematographer and Director of Photography based in Delhi and Uttarakhand.",
            category: "Personal Information",
            keywords: ["anup rawat", "bio", "cinematographer", "dop"],
            status: KNOWLEDGE_STATUS.PUBLISHED,
        });

        assert.ok(item.id);
        assert.equal(item.title, "Who is Anup Rawat?");
        assert.equal(item.category, "Personal Information");
        assert.equal(item.status, KNOWLEDGE_STATUS.PUBLISHED);
        assert.equal(item.is_published, true);
    });

    test("2. Service: Creates Project Knowledge with rich metadata", async () => {
        const item = await portfolioKnowledgeService.createKnowledge({
            title: "Delhi Metro Transit Line Campaign",
            content: "Official cinematography campaign capturing Delhi Metro lines with cinematic anamorphic lenses.",
            category: "Portfolio Projects",
            projectName: "Delhi Metro Transit",
            keywords: ["delhi metro", "transit", "anamorphic", "commercial"],
            metadata: {
                director: "Anup Rawat",
                gearUsed: "Sony FX6, Cooke Anamorphic",
                location: "Delhi NCR",
                year: 2024,
            },
            status: KNOWLEDGE_STATUS.PUBLISHED,
        });

        assert.ok(item.id);
        assert.equal(item.project_name, "Delhi Metro Transit");
        assert.equal(item.metadata.gearUsed, "Sony FX6, Cooke Anamorphic");
    });

    test("3. Service: Creates FAQ knowledge record", async () => {
        const item = await portfolioKnowledgeService.createKnowledge({
            title: "What is your typical day rate for commercial shoots?",
            content: "Commercial shoot day rates start from ₹45,000 depending on camera packages and crew scale.",
            category: "Frequently Asked Questions",
            keywords: ["rate", "pricing", "cost", "day rate", "commercial"],
            status: KNOWLEDGE_STATUS.PUBLISHED,
        });

        assert.ok(item.id);
        assert.equal(item.category, "Frequently Asked Questions");
    });

    test("4. Service: Creates Custom Knowledge without restrictive category checks", async () => {
        const item = await portfolioKnowledgeService.createKnowledge({
            title: "Underwater Cinematography Protocol",
            content: "Specialized dive casing certification and underwater lighting setups for narrative sequences.",
            category: "Specialized Water Shoots", // Completely custom category
            keywords: ["underwater", "scuba", "housing", "lighting"],
            status: KNOWLEDGE_STATUS.DRAFT,
        });

        assert.ok(item.id);
        assert.equal(item.category, "Specialized Water Shoots");
        assert.equal(item.status, KNOWLEDGE_STATUS.DRAFT);
        assert.equal(item.is_published, false);
    });

    // -------------------------------------------------------------
    // Publishing System & Public Filtering Tests
    // -------------------------------------------------------------
    test("5. Service: Public retrieval strictly excludes Draft and Archived records", async () => {
        // Create draft item
        const draft = await portfolioKnowledgeService.createKnowledge({
            title: "Secret Upcoming Feature Film",
            content: "Unannounced feature film in pre-production.",
            category: "Portfolio Projects",
            status: KNOWLEDGE_STATUS.DRAFT,
        });

        // Create archived item
        const archived = await portfolioKnowledgeService.createKnowledge({
            title: "Deprecated Camera Kit 2021",
            content: "Old camera gear no longer in service.",
            category: "Camera Equipment",
            status: KNOWLEDGE_STATUS.ARCHIVED,
        });

        // Retrieve public knowledge
        const publicList = await portfolioKnowledgeService.getPublishedKnowledge();
        assert.ok(Array.isArray(publicList.items));

        const hasDraft = publicList.items.some((i) => i.id === draft.id);
        const hasArchived = publicList.items.some((i) => i.id === archived.id);

        assert.equal(hasDraft, false, "Draft records must NEVER be returned in public chatbot knowledge");
        assert.equal(hasArchived, false, "Archived records must NEVER be returned in public chatbot knowledge");
    });

    test("6. Service: Transitions status between Draft, Published, and Archived", async () => {
        const item = await portfolioKnowledgeService.createKnowledge({
            title: "Test Status Transitions",
            content: "Content about transition testing.",
            category: "Working Process",
            status: KNOWLEDGE_STATUS.DRAFT,
        });

        // 1. Publish
        const published = await portfolioKnowledgeService.updateKnowledgeStatus(item.id, {
            status: KNOWLEDGE_STATUS.PUBLISHED,
        });
        assert.equal(published.status, KNOWLEDGE_STATUS.PUBLISHED);
        assert.equal(published.is_published, true);

        // 2. Unpublish / Archive
        const archived = await portfolioKnowledgeService.updateKnowledgeStatus(item.id, {
            status: KNOWLEDGE_STATUS.ARCHIVED,
        });
        assert.equal(archived.status, KNOWLEDGE_STATUS.ARCHIVED);
        assert.equal(archived.is_published, false);
    });

    // -------------------------------------------------------------
    // Search & Filter Tests
    // -------------------------------------------------------------
    test("7. Service: Searches records by keyword, title, and content", async () => {
        const uniqueKey = `anamorphic_glow_${Date.now()}`;
        await portfolioKnowledgeService.createKnowledge({
            title: `Lenses and Look: ${uniqueKey}`,
            content: "Using vintage anamorphic glass produces characteristic horizontal flares.",
            category: "Lenses and Gear",
            keywords: [uniqueKey, "anamorphic", "flares"],
            status: KNOWLEDGE_STATUS.PUBLISHED,
        });

        const searchRes = await portfolioKnowledgeService.listKnowledge({
            search: uniqueKey,
        });

        assert.ok(searchRes.items.length >= 1);
        assert.ok(searchRes.items.some((k) => k.keywords.includes(uniqueKey)));
    });

    // -------------------------------------------------------------
    // HTTP API Endpoints & Security Tests
    // -------------------------------------------------------------
    test("8. HTTP Security: Rejects unauthenticated requests with 401", async () => {
        const res = await fetch(baseUrl, {
            method: "GET",
        });

        assert.equal(res.status, 401);
        const json = await res.json();
        assert.equal(json.success, false);
    });

    test("9. HTTP Security: Rejects non-admin users with 403 Forbidden", async () => {
        const res = await fetch(baseUrl, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${userToken}`,
            },
        });

        assert.equal(res.status, 403);
        const json = await res.json();
        assert.equal(json.success, false);
    });

    test("10. HTTP POST /api/admin/knowledge creates record and validates body", async () => {
        // Validation failure test (missing title)
        const badRes = await fetch(baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${adminToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: "Content without title",
                category: "Services",
            }),
        });
        assert.equal(badRes.status, 400);

        // Successful creation test
        const goodRes = await fetch(baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${adminToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: "Music Video Cinematography",
                content: "Comprehensive music video shoot packages including lighting, gimbals, and high framerate Sony FX3 setups.",
                category: "Services",
                keywords: ["music video", "song", "fx3"],
                metadata: { maxFramerate: "120fps 4K" },
                status: "published",
            }),
        });

        assert.equal(goodRes.status, 201);
        const json = await goodRes.json();
        assert.equal(json.success, true);
        assert.ok(json.data.id);
        assert.equal(json.data.title, "Music Video Cinematography");
    });

    test("11. HTTP GET /api/admin/knowledge supports pagination & category filters", async () => {
        const res = await fetch(`${baseUrl}?category=Services&page=1&limit=5`, {
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });

        assert.equal(res.status, 200);
        const json = await res.json();
        assert.equal(json.success, true);
        assert.ok(Array.isArray(json.data));
        assert.ok(json.pagination);
        assert.equal(json.pagination.page, 1);
        assert.equal(json.pagination.limit, 5);
    });

    test("12. HTTP PATCH /api/admin/knowledge/:id/status updates status and DELETE removes safely", async () => {
        // Create an item first
        const createRes = await fetch(baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${adminToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: "Temporary Record for Lifecycle Test",
                content: "This record will be unpublished then deleted.",
                category: "Custom Knowledge",
                status: "published",
            }),
        });
        const created = await createRes.json();
        const id = created.data.id;

        // PATCH status to draft
        const patchRes = await fetch(`${baseUrl}/${id}/status`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${adminToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                status: "draft",
            }),
        });
        assert.equal(patchRes.status, 200);
        const patchJson = await patchRes.json();
        assert.equal(patchJson.data.status, "draft");
        assert.equal(patchJson.data.is_published, false);

        // DELETE record
        const deleteRes = await fetch(`${baseUrl}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });
        assert.equal(deleteRes.status, 200);

        // Subsequent GET returns 404
        const getRes = await fetch(`${baseUrl}/${id}`, {
            headers: {
                Authorization: `Bearer ${adminToken}`,
            },
        });
        assert.equal(getRes.status, 404);
    });
});
