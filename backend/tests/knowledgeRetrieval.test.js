import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import app from "../src/server.js";
import { generateAccessToken } from "../src/utils/tokens.js";
import { sessionRepository } from "../src/repositories/session.repository.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { knowledgeRetrievalService } from "../src/services/knowledgeRetrieval.service.js";
import { knowledgeScorer } from "../src/services/knowledgeRetrieval/knowledgeScorer.js";
import { chatService } from "../src/services/chat.service.js";
import { KNOWLEDGE_STATUS } from "../src/constants/portfolioKnowledge.constants.js";
import { pool } from "../src/config/db.js";

describe("Cinematographer Portfolio Knowledge Retrieval Engine Suite (Step 5)", () => {
    let server;
    let baseUrl;
    let adminToken;
    let userToken;
    let mockAdminSessionId;
    let mockUserSessionId;

    // Test record IDs
    const metroProjectId = crypto.randomUUID();
    const cameraPackageId = crypto.randomUUID();
    const bioId = crypto.randomUUID();
    const servicesId = crypto.randomUUID();
    const draftId = crypto.randomUUID();
    const archivedId = crypto.randomUUID();

    before(async () => {
        // Start ephemeral HTTP server for endpoint testing
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}/api/admin/knowledge/search`;
                resolve();
            });
        });

        // Setup mock admin and regular user sessions
        const mockAdminId = crypto.randomUUID();
        const mockUserId = crypto.randomUUID();
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
                name: "Knowledge Admin",
                email: "admin_retrieval@test.com",
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
                name: "Normal Visitor",
                email: "user_retrieval@test.com",
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

        // Seed Knowledge Records
        // 1. Published Project
        await portfolioKnowledgeRepository.createKnowledge({
            id: metroProjectId,
            title: "Delhi Metro Transit Line Cinematography",
            content: "Official cinematography case study for Delhi Metro commercial campaign shot on Sony FX3 and anamorphic lenses in Delhi NCR.",
            category: "Portfolio Projects",
            projectName: "Delhi Metro Transit",
            keywords: ["commercial", "transit", "delhi", "metro", "anamorphic"],
            metadata: { client: "DMRC", director: "Anup Rawat", year: 2024 },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        // 2. Published Equipment
        await portfolioKnowledgeRepository.createKnowledge({
            id: cameraPackageId,
            title: "Sony FX3 and FX6 Camera Gear Package",
            content: "Primary cinema cameras include Sony FX3 and Sony FX6 equipped with Sony G-Master primes and DJI Ronin RS3 gimbal stabilization.",
            category: "Camera Equipment",
            projectName: null,
            keywords: ["camera", "sony fx3", "sony fx6", "g-master", "ronin", "cinematography gear"],
            metadata: { primaryCamera: "Sony FX3", secondaryCamera: "Sony FX6" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        // 3. Published Personal Biography
        await portfolioKnowledgeRepository.createKnowledge({
            id: bioId,
            title: "About Anup Rawat - Director of Photography",
            content: "Anup Rawat is an Indian Director of Photography and Cinematographer based in New Delhi with 8+ years of visual storytelling experience in narrative, commercials, and brand films.",
            category: "Personal Information",
            projectName: null,
            keywords: ["about", "bio", "anup rawat", "cinematographer", "dop", "experience"],
            metadata: { experienceYears: 8, baseLocation: "New Delhi" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        // 4. Published Services
        await portfolioKnowledgeRepository.createKnowledge({
            id: servicesId,
            title: "Commercial and Brand Film Cinematography Services",
            content: "Full-scale cinematography services including commercial shoots, TVCs, brand films, music videos, and fashion films with complete lighting and camera packages.",
            category: "Services",
            projectName: null,
            keywords: ["services", "commercial", "brand film", "music video", "pricing", "hire"],
            metadata: { dayRatesAvailable: true },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        // 5. DRAFT record (MUST NEVER BE RETRIEVED)
        await portfolioKnowledgeRepository.createKnowledge({
            id: draftId,
            title: "Unannounced Confidential Feature Film",
            content: "Top secret unreleased feature film project currently in post-production with confidential cast and crew details.",
            category: "Portfolio Projects",
            projectName: "Confidential Project X",
            keywords: ["confidential", "secret", "feature film", "unannounced"],
            metadata: { confidential: true },
            status: KNOWLEDGE_STATUS.DRAFT,
            isPublished: false,
        });

        // 6. ARCHIVED record (MUST NEVER BE RETRIEVED)
        await portfolioKnowledgeRepository.createKnowledge({
            id: archivedId,
            title: "Decommissioned Vintage Camera Rig",
            content: "Retired Canon 5D Mark II vintage camera equipment no longer in active production use.",
            category: "Camera Equipment",
            projectName: null,
            keywords: ["canon 5d", "vintage", "retired", "archived"],
            metadata: { retired: true },
            status: KNOWLEDGE_STATUS.ARCHIVED,
            isPublished: false,
        });
    });

    after(async () => {
        // Clean up test records
        await portfolioKnowledgeRepository.deleteKnowledge(metroProjectId);
        await portfolioKnowledgeRepository.deleteKnowledge(cameraPackageId);
        await portfolioKnowledgeRepository.deleteKnowledge(bioId);
        await portfolioKnowledgeRepository.deleteKnowledge(servicesId);
        await portfolioKnowledgeRepository.deleteKnowledge(draftId);
        await portfolioKnowledgeRepository.deleteKnowledge(archivedId);

        if (server) {
            if (typeof server.closeAllConnections === "function") {
                server.closeAllConnections();
            }
            await new Promise((resolve) => server.close(resolve));
        }

        try {
            await pool.end();
        } catch {
            // ignore
        }
        process.exit(0);
    });

    // -----------------------------------------------------------------
    // Test 1: Exact Title Matching
    // -----------------------------------------------------------------
    test("1. Retrieval: Exact or phrase title matching retrieves the correct record with high relevance", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Delhi Metro Transit Line Cinematography",
            intent: "project_details",
        });

        assert.equal(result.hasRelevantKnowledge, true);
        assert.ok(result.results.length >= 1);
        const topResult = result.results[0];
        assert.equal(topResult.id, metroProjectId);
        assert.ok(topResult.relevanceScore >= 0.70, `Score ${topResult.relevanceScore} should be high`);
    });

    // -----------------------------------------------------------------
    // Test 2: Keyword Matching
    // -----------------------------------------------------------------
    test("2. Retrieval: Keyword matching retrieves records containing matching keywords", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "anamorphic lenses transit",
            intent: "project_details",
        });

        assert.equal(result.hasRelevantKnowledge, true);
        const matched = result.results.find((r) => r.id === metroProjectId || (r.keywords && r.keywords.includes("anamorphic")));
        assert.ok(matched, "Should find records matching keywords anamorphic and transit");
    });

    // -----------------------------------------------------------------
    // Test 3: Intent-Based Category Prioritization
    // -----------------------------------------------------------------
    test("3. Retrieval: camera_inquiry intent prioritizes Camera Equipment category", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "What cameras do you use on shoots?",
            intent: "camera_inquiry",
            category: "technical",
        });

        assert.equal(result.hasRelevantKnowledge, true);
        assert.ok(result.results.length > 0);
        assert.equal(result.results[0].id, cameraPackageId);
        assert.equal(result.results[0].category, "Camera Equipment");
        assert.ok(result.results[0].relevanceScore >= 0.40);
    });

    // -----------------------------------------------------------------
    // Test 4: Project Name Matching
    // -----------------------------------------------------------------
    test("4. Retrieval: Project name matching identifies project specific knowledge", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Tell me about the Delhi Metro Transit project",
            intent: "project_details",
            entities: {
                projectName: "Delhi Metro Transit",
            },
        });

        assert.equal(result.hasRelevantKnowledge, true);
        assert.ok(result.results.length > 0);
        assert.ok(result.results.some((r) => r.id === metroProjectId || r.title.includes("Delhi Metro Transit")));
        assert.ok(result.results[0].title.includes("Delhi Metro Transit"));
    });

    // -----------------------------------------------------------------
    // Test 5: Entity-Based Retrieval (equipmentType)
    // -----------------------------------------------------------------
    test("5. Retrieval: Extracted equipmentType entity boosts matching equipment record", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Do you have the Sony FX3?",
            intent: "equipment_inquiry",
            entities: {
                equipmentType: "Sony FX3",
            },
        });

        assert.equal(result.hasRelevantKnowledge, true);
        const topResult = result.results[0];
        assert.equal(topResult.id, cameraPackageId);
        assert.ok(topResult.content.includes("Sony FX3"));
    });

    // -----------------------------------------------------------------
    // Test 6: Entity-Based Retrieval (projectType: commercial)
    // -----------------------------------------------------------------
    test("6. Retrieval: Extracted projectType entity boosts commercial service/portfolio records", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "We want to produce a commercial video",
            intent: "commercial_inquiry",
            entities: {
                projectType: "commercial",
            },
        });

        assert.equal(result.hasRelevantKnowledge, true);
        const ids = result.results.map((r) => r.id);
        assert.ok(ids.includes(servicesId) || ids.includes(metroProjectId));
    });

    // -----------------------------------------------------------------
    // Test 7: Personal Information Intent (about_person)
    // -----------------------------------------------------------------
    test("7. Retrieval: about_person intent retrieves Anup Rawat biographical knowledge", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Who is Anup Rawat?",
            intent: "about_person",
            category: "personal",
        });

        assert.equal(result.hasRelevantKnowledge, true);
        assert.ok(result.results.length > 0);
        assert.equal(result.results[0].category, "Personal Information");
        const foundAnupBio = result.results.some((r) => r.id === bioId || r.title.toLowerCase().includes("anup rawat"));
        assert.ok(foundAnupBio, "Should retrieve personal biography record for Anup Rawat");
    });

    // -----------------------------------------------------------------
    // Test 8: STRICT SECURITY - Exclusion of Draft and Archived Knowledge
    // -----------------------------------------------------------------
    test("8. Security: Never retrieves draft, archived, or unpublished knowledge records", async () => {
        // Query targeting the draft record
        const draftResult = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Confidential Project X unannounced feature film",
            intent: "project_details",
        });

        const draftFound = draftResult.results.some((r) => r.id === draftId);
        assert.equal(draftFound, false, "Draft knowledge must strictly NEVER be returned");

        // Query targeting the archived record
        const archivedResult = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Decommissioned Vintage Camera Rig Canon 5D",
            intent: "camera_inquiry",
        });

        const archivedFound = archivedResult.results.some((r) => r.id === archivedId);
        assert.equal(archivedFound, false, "Archived knowledge must strictly NEVER be returned");
    });

    // -----------------------------------------------------------------
    // Test 9: No Knowledge Found & Irrelevant Question Handling
    // -----------------------------------------------------------------
    test("9. Fallback: Irrelevant questions return empty results and hasRelevantKnowledge = false", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "Can you bake me a chocolate cake with strawberries for tomorrow?",
            intent: "out_of_scope",
        });

        assert.equal(result.hasRelevantKnowledge, false);
        assert.equal(result.totalResults, 0);
        assert.deepEqual(result.results, []);
        assert.equal(result.relevanceLevel, "none");
    });

    // -----------------------------------------------------------------
    // Test 10: Relevance Ranking Order (Descending Scores)
    // -----------------------------------------------------------------
    test("10. Ranking: Multiple matching records are strictly sorted in descending relevance order", async () => {
        const result = await knowledgeRetrievalService.retrieveKnowledge({
            query: "commercial shoot in Delhi",
            intent: "commercial_inquiry",
            entities: {
                projectType: "commercial",
                location: "Delhi",
            },
        });

        assert.equal(result.hasRelevantKnowledge, true);
        assert.ok(result.results.length >= 2);

        for (let i = 0; i < result.results.length - 1; i++) {
            assert.ok(
                result.results[i].relevanceScore >= result.results[i + 1].relevanceScore,
                `Result at index ${i} (${result.results[i].relevanceScore}) should be >= index ${i + 1} (${result.results[i + 1].relevanceScore})`
            );
        }
    });

    // -----------------------------------------------------------------
    // Test 11: HTTP POST /api/admin/knowledge/search Admin Testing Endpoint
    // -----------------------------------------------------------------
    test("11. HTTP API: Admin search endpoint returns structured retrieval response", async () => {
        const res = await fetch(baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${adminToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: "Tell me about commercial projects",
                intent: "commercial_inquiry",
                entities: {
                    projectType: "commercial",
                },
            }),
        });

        assert.equal(res.status, 200);
        const json = await res.json();
        assert.equal(json.success, true);
        assert.ok(json.data);
        assert.equal(json.data.query, "Tell me about commercial projects");
        assert.equal(typeof json.data.hasRelevantKnowledge, "boolean");
        assert.ok(Array.isArray(json.data.results));
        assert.equal(typeof json.data.totalResults, "number");

        if (json.data.results.length > 0) {
            const first = json.data.results[0];
            assert.ok(first.id);
            assert.ok(first.title);
            assert.ok(first.category);
            assert.ok(first.content);
            assert.equal(typeof first.relevanceScore, "number");
        }
    });

    // -----------------------------------------------------------------
    // Test 12: HTTP API Security - Rejects non-admin users
    // -----------------------------------------------------------------
    test("12. HTTP Security: Rejects non-admin users with 403 Forbidden", async () => {
        const res = await fetch(baseUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${userToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: "Test query",
            }),
        });

        assert.equal(res.status, 403);
    });

    // -----------------------------------------------------------------
    // Test 13: Chat Service Integration - processMessage triggers retrieval
    // -----------------------------------------------------------------
    test("13. Integration: chatService.processMessage integrates retrieval engine seamlessly", async () => {
        const conv = await chatService.initializeConversation();

        const chatRes = await chatService.processMessage({
            conversationId: conv.conversationId,
            message: "What camera gear does Anup use?",
            visitorToken: conv.visitorToken,
        });

        assert.equal(chatRes.conversationId, conv.conversationId);
        assert.ok(chatRes.intent);
        assert.equal(chatRes.intent.name, "camera_inquiry");
        assert.equal(chatRes.hasRelevantKnowledge, true);
        assert.ok(Array.isArray(chatRes.retrievedKnowledge));
        assert.ok(chatRes.retrievedKnowledge.length > 0);
        assert.ok(
            chatRes.retrievedKnowledge.some((k) => k.id === cameraPackageId || k.id === "8c17c86a-8e4b-49e6-9390-4fef195270d2"),
            "Retrieved knowledge must contain relevant camera equipment record"
        );
    });
});
