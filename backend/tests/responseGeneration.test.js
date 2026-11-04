import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { portfolioKnowledgeRepository } from "../src/repositories/portfolioKnowledge.repository.js";
import { responseGenerationService } from "../src/services/responseGeneration.service.js";
import { languageDetector, SUPPORTED_LANGUAGES } from "../src/services/responseGeneration/languageDetector.js";
import { chatService } from "../src/services/chat.service.js";
import { KNOWLEDGE_STATUS } from "../src/constants/portfolioKnowledge.constants.js";
import { INTENTS, INTENT_CATEGORIES } from "../src/modules/intent/intent.constants.js";

describe("Cinematographer Portfolio Response Generation Engine Suite (Step 7)", () => {
    // Unique test IDs
    const cameraRecordId = crypto.randomUUID();
    const projectRecordId = crypto.randomUUID();
    const pricingRecordId = crypto.randomUUID();
    const bioRecordId = crypto.randomUUID();
    const draftRecordId = crypto.randomUUID();

    before(async () => {
        // Seed published knowledge records for response grounding
        await portfolioKnowledgeRepository.createKnowledge({
            id: cameraRecordId,
            title: "Sony FX3 and FX6 Cinema Package",
            content: "Anup Rawat uses the Sony FX3 and Sony FX6 as his primary cinema cameras, equipped with Sony G-Master prime lenses and DJI Ronin RS3 gimbal stabilization.",
            category: "Camera Equipment",
            projectName: null,
            keywords: ["camera", "sony fx3", "sony fx6", "g-master", "ronin"],
            metadata: { primaryCamera: "Sony FX3", secondaryCamera: "Sony FX6" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: projectRecordId,
            title: "Delhi Metro Transit Line Cinematography",
            content: "Official commercial campaign case study for the Delhi Metro Transit Line captured using cinematic anamorphic lenses in Delhi NCR.",
            category: "Portfolio Projects",
            projectName: "Delhi Metro Transit",
            keywords: ["delhi metro", "transit", "anamorphic", "commercial"],
            metadata: { client: "DMRC", director: "Anup Rawat" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: pricingRecordId,
            title: "Commercial Filming Rates and Packages",
            content: "Day rates for commercial DP services start at ₹45,000 per day including basic camera monitoring and lighting consultation.",
            category: "Pricing Information",
            projectName: null,
            keywords: ["pricing", "rates", "day rate", "commercial"],
            metadata: { baseRate: "₹45,000/day" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: bioRecordId,
            title: "About Anup Rawat - Director of Photography",
            content: "Anup Rawat is an Indian Director of Photography and Cinematographer based in New Delhi with 8+ years of visual storytelling experience across commercials, documentaries, and narrative features.",
            category: "Personal Information",
            projectName: null,
            keywords: ["about", "bio", "anup rawat", "dop"],
            metadata: { experienceYears: 8, location: "New Delhi" },
            status: KNOWLEDGE_STATUS.PUBLISHED,
            isPublished: true,
        });

        await portfolioKnowledgeRepository.createKnowledge({
            id: draftRecordId,
            title: "Draft Secret Script Notes",
            content: "Top secret unannounced movie project.",
            category: "Portfolio Projects",
            status: KNOWLEDGE_STATUS.DRAFT,
            isPublished: false,
        });
    });

    after(async () => {
        // Cleanup test records
        await portfolioKnowledgeRepository.deleteKnowledge(cameraRecordId);
        await portfolioKnowledgeRepository.deleteKnowledge(projectRecordId);
        await portfolioKnowledgeRepository.deleteKnowledge(pricingRecordId);
        await portfolioKnowledgeRepository.deleteKnowledge(bioRecordId);
        await portfolioKnowledgeRepository.deleteKnowledge(draftRecordId);

        try {
            await pool.end();
        } catch {
            // ignore
        }
        process.exit(0);
    });

    // -----------------------------------------------------------------
    // Test 1: Language Detection (English, Hindi, Hinglish)
    // -----------------------------------------------------------------
    test("1. Language: Accurately detects English, Hindi (Devanagari), and Hinglish", () => {
        assert.equal(languageDetector.detect("Which camera does Anup use?"), SUPPORTED_LANGUAGES.ENGLISH);
        assert.equal(languageDetector.detect("Anup konsa camera use karta hai?"), SUPPORTED_LANGUAGES.HINGLISH);
        assert.equal(languageDetector.detect("अनूप कौन सा कैमरा इस्तेमाल करते हैं?"), SUPPORTED_LANGUAGES.HINDI);
        assert.equal(languageDetector.detect("Shadi ke shoots karte ho kya?"), SUPPORTED_LANGUAGES.HINGLISH);
    });

    // -----------------------------------------------------------------
    // Test 2: Natural English Response for Camera Equipment
    // -----------------------------------------------------------------
    test("2. English: Generates grounded English reply for camera equipment inquiry", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "Which camera does Anup use for his commercial shoots?",
            intentResult: {
                intent: INTENTS.CAMERA_INQUIRY,
                category: INTENT_CATEGORIES.TECHNICAL,
                confidence: 0.95,
                entities: { equipmentType: "camera" },
            },
            retrievalResult: {
                hasRelevantKnowledge: true,
                results: [
                    {
                        id: cameraRecordId,
                        title: "Sony FX3 and FX6 Cinema Package",
                        content: "Anup Rawat uses the Sony FX3 and Sony FX6 as his primary cinema cameras, equipped with Sony G-Master prime lenses and DJI Ronin RS3 gimbal stabilization.",
                        category: "Camera Equipment",
                        relevanceScore: 0.92,
                    },
                ],
            },
        });

        assert.equal(response.language, SUPPORTED_LANGUAGES.ENGLISH);
        assert.ok(response.reply.includes("Sony FX3"));
        assert.ok(response.reply.includes("Sony FX6"));
        assert.ok(response.reply.includes("Sony G-Master"));
        assert.equal(response.hasRelevantKnowledge, true);
        assert.equal(response.fallbackStatus, null);
        assert.ok(Array.isArray(response.suggestions));
        assert.ok(response.suggestions.length > 0);
    });

    // -----------------------------------------------------------------
    // Test 3: Natural Hinglish Response for Camera Equipment
    // -----------------------------------------------------------------
    test("3. Hinglish: Generates natural Hinglish reply using the same verified facts", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "Anup konsa camera use karta hai?",
            intentResult: {
                intent: INTENTS.CAMERA_INQUIRY,
                category: INTENT_CATEGORIES.TECHNICAL,
                confidence: 0.95,
            },
            retrievalResult: {
                hasRelevantKnowledge: true,
                results: [
                    {
                        id: cameraRecordId,
                        title: "Sony FX3 and FX6 Cinema Package",
                        content: "Anup Rawat uses the Sony FX3 and Sony FX6 as his primary cinema cameras, equipped with Sony G-Master prime lenses.",
                        category: "Camera Equipment",
                        relevanceScore: 0.90,
                    },
                ],
            },
        });

        assert.equal(response.language, SUPPORTED_LANGUAGES.HINGLISH);
        assert.ok(response.reply.includes("Anup ke camera setup"));
        assert.ok(response.reply.includes("Sony FX3"));
        assert.ok(response.reply.includes("Sony FX6"));
    });

    // -----------------------------------------------------------------
    // Test 4: Natural Hindi (Devanagari) Response
    // -----------------------------------------------------------------
    test("4. Hindi: Generates respectful Devanagari Hindi reply", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "अनूप कौन सा कैमरा इस्तेमाल करते हैं?",
            intentResult: {
                intent: INTENTS.CAMERA_INQUIRY,
                category: INTENT_CATEGORIES.TECHNICAL,
                confidence: 0.95,
            },
            retrievalResult: {
                hasRelevantKnowledge: true,
                results: [
                    {
                        id: cameraRecordId,
                        title: "Sony FX3 and FX6 Cinema Package",
                        content: "Anup Rawat uses the Sony FX3 and Sony FX6 as his primary cinema cameras.",
                        category: "Camera Equipment",
                        relevanceScore: 0.88,
                    },
                ],
            },
        });

        assert.equal(response.language, SUPPORTED_LANGUAGES.HINDI);
        assert.ok(response.reply.includes("अनूप के कैमरा सेटअप"));
        assert.ok(response.reply.includes("Sony FX3"));
    });

    // -----------------------------------------------------------------
    // Test 5: Grounded Project & Portfolio Case Study Reply
    // -----------------------------------------------------------------
    test("5. Portfolio: Generates case study response for specific project inquiry", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "Tell me about the Delhi Metro Transit Line campaign",
            intentResult: {
                intent: INTENTS.PROJECT_DETAILS,
                category: INTENT_CATEGORIES.PORTFOLIO,
                confidence: 0.92,
                entities: { projectName: "Delhi Metro Transit" },
            },
            retrievalResult: {
                hasRelevantKnowledge: true,
                results: [
                    {
                        id: projectRecordId,
                        title: "Delhi Metro Transit Line Cinematography",
                        projectName: "Delhi Metro Transit",
                        content: "Official commercial campaign case study for the Delhi Metro Transit Line captured using cinematic anamorphic lenses in Delhi NCR.",
                        category: "Portfolio Projects",
                        relevanceScore: 0.94,
                    },
                ],
            },
        });

        assert.ok(response.reply.includes("Delhi Metro Transit"));
        assert.ok(response.reply.includes("anamorphic lenses"));
        assert.equal(response.hasRelevantKnowledge, true);
    });

    // -----------------------------------------------------------------
    // Test 6: Pricing and Availability Inquiries with Action Dispatch
    // -----------------------------------------------------------------
    test("6. Pricing: Answers with verified day rates and provides contact action without false booking claim", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "What are your commercial day rates?",
            intentResult: {
                intent: INTENTS.PRICING_INQUIRY,
                category: INTENT_CATEGORIES.BUSINESS,
                confidence: 0.90,
            },
            retrievalResult: {
                hasRelevantKnowledge: true,
                results: [
                    {
                        id: pricingRecordId,
                        title: "Commercial Filming Rates and Packages",
                        content: "Day rates for commercial DP services start at ₹45,000 per day including basic camera monitoring and lighting consultation.",
                        category: "Pricing Information",
                        relevanceScore: 0.89,
                    },
                ],
            },
        });

        assert.ok(response.reply.includes("₹45,000"));
        assert.equal(response.hasRelevantKnowledge, true);
        assert.ok(Array.isArray(response.actions));
        assert.ok(response.actions.some((a) => a.type === "OPEN_CONTACT_MODAL"));
        // Must never claim that booking has been confirmed
        assert.equal(response.reply.includes("booking confirmed"), false);
    });

    // -----------------------------------------------------------------
    // Test 7: Missing Knowledge Fallback (Strict Grounding)
    // -----------------------------------------------------------------
    test("7. Fallback: Politely explains information is unavailable when hasRelevantKnowledge is false", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "Does Anup shoot helicopter aerial stunts in Antarctica?",
            intentResult: {
                intent: INTENTS.GENERAL_QUESTION,
                category: INTENT_CATEGORIES.GENERAL,
                confidence: 0.50,
            },
            retrievalResult: {
                hasRelevantKnowledge: false,
                results: [],
                totalResults: 0,
            },
        });

        assert.equal(response.hasRelevantKnowledge, false);
        assert.equal(response.fallbackStatus, "NO_RELEVANT_KNOWLEDGE");
        assert.ok(response.reply.includes("verified details about that in Anup's published portfolio"));
        // Does not hallucinate stunts or Antarctica
        assert.equal(response.reply.includes("Antarctica"), false);
        assert.ok(response.suggestions.length > 0);
    });

    // -----------------------------------------------------------------
    // Test 8: Ambiguous Message Clarification
    // -----------------------------------------------------------------
    test("8. Clarification: Asks short clarifying question when message is ambiguous", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "shoot work details",
            intentResult: {
                intent: INTENTS.UNCLEAR_INTENT,
                category: INTENT_CATEGORIES.GENERAL,
                confidence: 0.40,
                requiresClarification: true,
            },
            retrievalResult: {
                hasRelevantKnowledge: false,
                results: [],
            },
        });

        assert.equal(response.requiresClarification, true);
        assert.equal(response.fallbackStatus, "REQUIRES_CLARIFICATION");
        assert.ok(response.reply.includes("clarify"));
    });

    // -----------------------------------------------------------------
    // Test 9: Prevention of Invented Facts
    // -----------------------------------------------------------------
    test("9. Strict Fact Grounding: Never invents equipment or rates not in retrieved knowledge", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "What underwater camera does Anup use?",
            intentResult: {
                intent: INTENTS.CAMERA_INQUIRY,
                category: INTENT_CATEGORIES.TECHNICAL,
                confidence: 0.70,
            },
            retrievalResult: {
                hasRelevantKnowledge: false,
                results: [],
            },
        });

        assert.equal(response.hasRelevantKnowledge, false);
        // Must not invent RED Raptor or GoPro
        assert.equal(response.reply.includes("RED Raptor"), false);
        assert.equal(response.reply.includes("GoPro"), false);
    });

    // -----------------------------------------------------------------
    // Test 10: End-to-End Chat API Integration
    // -----------------------------------------------------------------
    test("10. Integration: chatService.processMessage returns natural, grounded response seamlessly", async () => {
        const conv = await chatService.initializeConversation();

        const chatRes = await chatService.processMessage({
            conversationId: conv.conversationId,
            message: "What camera gear does Anup use?",
            visitorToken: conv.visitorToken,
        });

        assert.equal(chatRes.conversationId, conv.conversationId);
        assert.ok(chatRes.reply.length > 15);
        // Reply must no longer be the hardcoded Step 3 placeholder!
        assert.equal(chatRes.reply.includes("In Step 3, the intelligent intent detection"), false);
        assert.ok(chatRes.intent);
        assert.equal(chatRes.intent.name, "camera_inquiry");
        assert.ok(Array.isArray(chatRes.suggestions));
        assert.ok(chatRes.suggestions.length > 0);
    });
});

