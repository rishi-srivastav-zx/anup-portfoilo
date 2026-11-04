import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { smartSearchService } from "../src/services/smartSearch.service.js";
import { searchQueryExpander } from "../src/services/smartSearch/searchQueryExpander.js";
import { conversationContextResolver } from "../src/services/smartSearch/conversationContextResolver.js";
import { KNOWLEDGE_STATUS } from "../src/constants/portfolioKnowledge.constants.js";

describe("Cinematographer Portfolio Smart Search Engine Suite (Step 6)", () => {
    // Unique test IDs
    const metroId = crypto.randomUUID();
    const cameraPackageId = crypto.randomUUID();
    const weddingServiceId = crypto.randomUUID();
    const pricingId = crypto.randomUUID();
    const bioId = crypto.randomUUID();
    const draftId = crypto.randomUUID();
    const archivedId = crypto.randomUUID();

    before(async () => {
        // 1. Seed Published Portfolio Knowledge Records
        await portfolioKnowledgeRepository.createKnowledge({
            id: metroId,
            title: "Delhi Metro Transit Line Cinematography",
            content: "Official cinematography campaign capturing Delhi Metro lines with cinematic anamorphic lenses in Delhi NCR.",
            category: "Portfolio Projects",
            projectName: "Delhi Metro Transit",
            keywords: ["delhi metro", "transit", "anamorphic", "commercial"],
            metadata: { director: "Anup Rawat", client: "DMRC" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: cameraPackageId,
            title: "Sony FX3 and FX6 Camera Gear Package",
            content: "Anup Rawat shoots with Sony FX3 and Sony FX6 cinema cameras equipped with Sony G-Master prime lenses and DJI Ronin RS3 gimbal stabilization.",
            category: "Camera Equipment",
            projectName: null,
            keywords: ["camera", "gear", "equipment", "sony fx3", "sony fx6", "cinematography equipment"],
            metadata: { primaryCamera: "Sony FX3", secondaryCamera: "Sony FX6" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: weddingServiceId,
            title: "Wedding and Event Cinematography Services",
            content: "Cinematic wedding films, pre-wedding shoots, and marriage ceremonies captured with high-end cinema equipment and natural lighting.",
            category: "Services",
            projectName: null,
            keywords: ["wedding", "shaadi", "marriage", "services", "pre-wedding"],
            metadata: { specialty: "Cinematic Wedding Stories" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: pricingId,
            title: "Commercial Cinematography Pricing and Day Rates",
            content: "Daily rates and complete commercial filming packages for TVCs, brand films, music videos, and advertising campaigns.",
            category: "Pricing Information",
            projectName: null,
            keywords: ["rates", "pricing", "commercial", "day rate", "cost", "charge"],
            metadata: { dayRatesAvailable: true },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: bioId,
            title: "About Anup Rawat - Director of Photography",
            content: "Anup Rawat is an Indian Director of Photography and Cinematographer based in New Delhi with 8+ years of visual storytelling experience in narrative and commercial films.",
            category: "Personal Information",
            projectName: null,
            keywords: ["about", "bio", "anup rawat", "cinematographer", "dop", "experience"],
            metadata: { experienceYears: 8, location: "New Delhi" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        // 2. Draft & Archived Records (Must NEVER be returned)
        await portfolioKnowledgeRepository.createKnowledge({
            id: draftId,
            title: "Confidential Unannounced OTT Feature",
            content: "Top secret feature film in post-production with confidential actors.",
            category: "Portfolio Projects",
            projectName: "Project Classified",
            keywords: ["confidential", "secret", "ott"],
            metadata: { confidential: true },
            status: KNOWLEDGE_STATUS.DRAFT,
            isPublished: false,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: archivedId,
            title: "Archived Vintage Bolex 16mm Kit",
            content: "Decommissioned analog film camera gear no longer in active use.",
            category: "Camera Equipment",
            projectName: null,
            keywords: ["vintage", "bolex", "archived"],
            metadata: { retired: true },
            status: KNOWLEDGE_STATUS.ARCHIVED,
            isPublished: false,
        });
    });

    after(async () => {
        // Cleanup test records
        await portfolioKnowledgeRepository.deleteKnowledge(metroId);
        await portfolioKnowledgeRepository.deleteKnowledge(cameraPackageId);
        await portfolioKnowledgeRepository.deleteKnowledge(weddingServiceId);
        await portfolioKnowledgeRepository.deleteKnowledge(pricingId);
        await portfolioKnowledgeRepository.deleteKnowledge(bioId);
        await portfolioKnowledgeRepository.deleteKnowledge(draftId);
        await portfolioKnowledgeRepository.deleteKnowledge(archivedId);

        try {
            await pool.end();
        } catch {
            // ignore
        }
        process.exit(0);
    });

    // -----------------------------------------------------------------
    // Test 1: Query Expander - Synonyms & Normalization
    // -----------------------------------------------------------------
    test("1. Expander: Normalizes Hinglish/Devanagari and expands domain synonyms", () => {
        const expanded = searchQueryExpander.expand("Anup konsa camera gear use karta hai?");
        assert.equal(expanded.originalQuery, "Anup konsa camera gear use karta hai?");
        assert.ok(expanded.searchTokens.includes("camera"));
        assert.ok(
            expanded.searchTokens.includes("gear") ||
            expanded.searchTokens.includes("equipment")
        );
    });

    // -----------------------------------------------------------------
    // Test 2: Core Prompt Objective - Different Wording for Camera Setup
    // -----------------------------------------------------------------
    test("2. Smart Search: Multiple different wordings for camera equipment all retrieve camera knowledge", async () => {
        const queries = [
            { q: "Which camera does Anup use?", intent: "camera_inquiry" },
            { q: "What shooting equipment does he have?", intent: "equipment_inquiry" },
            { q: "Anup konsa camera use karta hai?", intent: "camera_inquiry" },
            { q: "Tell me about his camera setup.", intent: "equipment_inquiry" },
            { q: "What gear does he shoot with?", intent: "equipment_inquiry" },
        ];

        for (const item of queries) {
            const res = await smartSearchService.search({
                query: item.q,
                intent: item.intent,
            });

            assert.equal(res.hasRelevantKnowledge, true, `Should find camera record for: "${item.q}"`);
            assert.ok(res.results.length > 0);
            const foundCamera = res.results.some(
                (r) => r.id === cameraPackageId || r.category === "Camera Equipment"
            );
            assert.ok(foundCamera, `Record must be found for query: "${item.q}"`);
        }
    });

    // -----------------------------------------------------------------
    // Test 3: Hinglish Queries (Projects, Weddings, Commercials)
    // -----------------------------------------------------------------
    test("3. Multilingual: Hinglish questions accurately retrieve relevant portfolio sections", async () => {
        // Hinglish: "Anup ke projects dikhao"
        const projectsRes = await smartSearchService.search({
            query: "Anup ke projects dikhao",
            intent: "view_portfolio",
        });
        assert.equal(projectsRes.hasRelevantKnowledge, true);
        assert.ok(projectsRes.results.some((r) => r.category === "Portfolio Projects" || r.id === metroId));

        // Hinglish: "Shadi ke shoots karte ho?"
        const weddingRes = await smartSearchService.search({
            query: "Shadi ke shoots karte ho?",
            intent: "wedding_inquiry",
            entities: { projectType: "wedding" },
        });
        assert.equal(weddingRes.hasRelevantKnowledge, true);
        assert.ok(weddingRes.results.some((r) => r.id === weddingServiceId));

        // Hinglish: "Kya Anup ne commercial films banayi hain?"
        const commercialRes = await smartSearchService.search({
            query: "Kya Anup ne commercial films banayi hain?",
            intent: "commercial_inquiry",
            entities: { projectType: "commercial" },
        });
        assert.equal(commercialRes.hasRelevantKnowledge, true);
        assert.ok(
            commercialRes.results.some(
                (r) =>
                    r.id === metroId ||
                    r.id === pricingId ||
                    r.title.includes("Delhi Metro") ||
                    (r.keywords && r.keywords.includes("commercial"))
            )
        );
    });

    // -----------------------------------------------------------------
    // Test 4: Hindi Devanagari Queries
    // -----------------------------------------------------------------
    test("4. Multilingual: Devanagari Hindi questions retrieve matching records", async () => {
        const hindiRes = await smartSearchService.search({
            query: "कैमरा कौन सा इस्तेमाल करते हैं?",
            intent: "camera_inquiry",
        });

        assert.equal(hindiRes.hasRelevantKnowledge, true);
        assert.ok(hindiRes.results.some((r) => r.id === cameraPackageId));
    });

    // -----------------------------------------------------------------
    // Test 5: Typo & Spelling Mistake Tolerance (pg_trgm Fuzzy Search)
    // -----------------------------------------------------------------
    test("5. Fuzzy Matching: Tolerates misspelled and noisy input words", async () => {
        // "cinematograper gear packge"
        const typoRes = await smartSearchService.search({
            query: "cinematograper gear packge",
            intent: "equipment_inquiry",
        });

        assert.equal(typoRes.hasRelevantKnowledge, true);
        assert.ok(typoRes.results.some((r) => r.id === cameraPackageId));
    });

    // -----------------------------------------------------------------
    // Test 6: Synonym Matching (Rates / Pricing / Cost)
    // -----------------------------------------------------------------
    test("6. Synonyms: Searches pricing knowledge when visitor asks about rates or cost", async () => {
        const ratesRes = await smartSearchService.search({
            query: "What are your commercial day rates and cost?",
            intent: "pricing_inquiry",
        });

        assert.equal(ratesRes.hasRelevantKnowledge, true);
        assert.ok(ratesRes.results.some((r) => r.id === pricingId));
    });

    // -----------------------------------------------------------------
    // Test 7: Context-Aware Search (Follow-Up Pronoun Resolution)
    // -----------------------------------------------------------------
    test("7. Context-Aware: Follow-up question 'Which lens do you use with it?' uses prior camera context", async () => {
        // Simulated previous message turn in conversation
        const recentMessages = [
            {
                id: crypto.randomUUID(),
                sender: "user",
                content: "Tell me about your camera equipment.",
                detected_intent: "camera_inquiry",
                extracted_entities: JSON.stringify({ equipmentType: "Sony FX3" }),
            },
            {
                id: crypto.randomUUID(),
                sender: "assistant",
                content: "I shoot primarily with Sony FX3 cinema cameras.",
                detected_intent: "camera_inquiry",
            },
        ];

        // Current turn: Anaphoric query
        const followUpRes = await smartSearchService.search({
            query: "Which lens do you use with it?",
            intent: "lens_inquiry",
            recentMessages,
            limit: 10,
        });

        assert.equal(followUpRes.hasRelevantKnowledge, true);
        assert.equal(followUpRes.contextUsed, true, "Must detect context from previous turn");
        assert.ok(followUpRes.searchTechniques.includes("context_anaphora_resolution"));
        assert.ok(
            followUpRes.results.some(
                (r) =>
                    r.id === cameraPackageId ||
                    r.category === "Lenses and Gear" ||
                    r.category === "Camera Equipment"
            ),
            "Should retrieve lens and equipment knowledge using prior turn context"
        );
    });

    // -----------------------------------------------------------------
    // Test 8: Project-Specific Search (Delhi Metro)
    // -----------------------------------------------------------------
    test("8. Project Matching: Accurately identifies case study for Delhi Metro Transit", async () => {
        const metroRes = await smartSearchService.search({
            query: "Show me the Delhi Metro Transit Line campaign",
            intent: "project_details",
            entities: { projectName: "Delhi Metro Transit" },
        });

        assert.equal(metroRes.hasRelevantKnowledge, true);
        assert.ok(metroRes.results.length > 0);
        assert.ok(
            metroRes.results.some((r) => r.id === metroId || r.title.includes("Delhi Metro Transit")),
            "Should find Delhi Metro Transit campaign case study"
        );
        assert.ok(metroRes.results[0].title.includes("Delhi Metro Transit"));
    });

    // -----------------------------------------------------------------
    // Test 9: Strict Exclusion of Draft and Archived Knowledge
    // -----------------------------------------------------------------
    test("9. Security: Draft and archived records are strictly excluded from search results", async () => {
        const draftSearch = await smartSearchService.search({
            query: "Confidential Unannounced OTT Feature Project Classified",
        });
        assert.equal(
            draftSearch.results.some((r) => r.id === draftId),
            false,
            "Draft records must never appear"
        );

        const archivedSearch = await smartSearchService.search({
            query: "Archived Vintage Bolex 16mm analog camera",
        });
        assert.equal(
            archivedSearch.results.some((r) => r.id === archivedId),
            false,
            "Archived records must never appear"
        );
    });

    // -----------------------------------------------------------------
    // Test 10: Irrelevant Question Handling & Fallback Status
    // -----------------------------------------------------------------
    test("10. Fallback: Irrelevant questions return empty results with fallbackStatus", async () => {
        const cakeRes = await smartSearchService.search({
            query: "How do I bake a chocolate cake with fresh strawberries?",
            intent: "out_of_scope",
        });

        assert.equal(cakeRes.hasRelevantKnowledge, false);
        assert.equal(cakeRes.totalResults, 0);
        assert.deepEqual(cakeRes.results, []);
        assert.equal(cakeRes.relevanceLevel, "none");
        assert.equal(cakeRes.fallbackStatus, "NO_RELEVANT_KNOWLEDGE");
    });

    // -----------------------------------------------------------------
    // Test 11: Ranking Order (Descending Relevance Scores)
    // -----------------------------------------------------------------
    test("11. Ranking: Returned results are strictly sorted descending by relevance score", async () => {
        const res = await smartSearchService.search({
            query: "commercial filming and TVC projects in Delhi",
            intent: "commercial_inquiry",
            entities: { projectType: "commercial" },
        });

        assert.equal(res.hasRelevantKnowledge, true);
        assert.ok(res.results.length >= 2);

        for (let i = 0; i < res.results.length - 1; i++) {
            assert.ok(
                res.results[i].relevanceScore >= res.results[i + 1].relevanceScore,
                `Result ${i} (${res.results[i].relevanceScore}) should be >= Result ${i + 1} (${res.results[i + 1].relevanceScore})`
            );
        }
    });
});
