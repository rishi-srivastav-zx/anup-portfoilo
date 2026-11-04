import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { intentService } from "../src/modules/intent/intent.service.js";
import { INTENTS, INTENT_CATEGORIES } from "../src/modules/intent/intent.constants.js";
import { intentNormalizer } from "../src/modules/intent/intent.normalizer.js";
import { intentEntityExtractor } from "../src/modules/intent/intent.entity-extractor.js";

describe("Cinematographer Portfolio Intent Detection Engine Suite", () => {
    // -------------------------------------------------------------
    // Test Category 1: English Messages
    // -------------------------------------------------------------
    test("1. English: Detects hire_inquiry with projectType entity", async () => {
        const input = "Hey, I want to hire you for a commercial shoot.";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.HIRE_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.BUSINESS);
        assert.ok(res.confidence >= 0.85);
        assert.equal(res.entities.projectType, "commercial");
        assert.equal(res.requiresClarification, false);
    });

    test("2. English: Detects view_portfolio accurately", async () => {
        const input = "Show me your work.";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.VIEW_PORTFOLIO);
        assert.equal(res.category, INTENT_CATEGORIES.PORTFOLIO);
        assert.ok(res.confidence >= 0.90);
        assert.equal(res.requiresClarification, false);
    });

    test("3. English: Detects lens_inquiry with technical category", async () => {
        const input = "What lenses do you recommend for low light shots?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.LENS_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.TECHNICAL);
        assert.ok(res.confidence >= 0.80);
    });

    test("4. English: Detects location_inquiry and experience_inquiry", async () => {
        const loc = await intentService.detectIntent({ message: "Where are you based?" });
        assert.equal(loc.intent, INTENTS.LOCATION_INQUIRY);
        assert.equal(loc.category, INTENT_CATEGORIES.PERSONAL);

        const exp = await intentService.detectIntent({ message: "How many years of experience do you have?" });
        assert.equal(exp.intent, INTENTS.EXPERIENCE_INQUIRY);
        assert.equal(exp.category, INTENT_CATEGORIES.PERSONAL);
    });

    test("5. English: Detects client navigation to blog", async () => {
        const input = "Take me to the blog section";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.NAVIGATE_BLOG);
        assert.equal(res.category, INTENT_CATEGORIES.NAVIGATION);
        assert.equal(res.entities.navigationTarget, "blog");
    });

    // -------------------------------------------------------------
    // Test Category 2: Hindi Messages (Devanagari)
    // -------------------------------------------------------------
    test("6. Hindi (Devanagari): Detects greeting", async () => {
        const input = "नमस्ते";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.GREETING);
        assert.equal(res.category, INTENT_CATEGORIES.PERSONAL);
        assert.ok(res.confidence >= 0.85);
    });

    test("7. Hindi (Devanagari): Detects wedding inquiry", async () => {
        const input = "शादी का वीडियो shoot karte ho kya?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.WEDDING_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.SERVICES);
        assert.equal(res.entities.projectType, "wedding");
    });

    // -------------------------------------------------------------
    // Test Category 3: Hinglish Natural Language Messages
    // -------------------------------------------------------------
    test("8. Hinglish: 'Anup ke baare mein batao' -> about_person", async () => {
        const input = "Anup ke baare mein batao";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.ABOUT_PERSON);
        assert.equal(res.category, INTENT_CATEGORIES.PERSONAL);
        assert.ok(res.confidence >= 0.90);
    });

    test("9. Hinglish: 'Apna best work dikhao' -> featured_work", async () => {
        const input = "Apna best work dikhao";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.FEATURED_WORK);
        assert.equal(res.category, INTENT_CATEGORIES.PORTFOLIO);
        assert.ok(res.confidence >= 0.90);
    });

    test("10. Hinglish: 'Wedding shoot karte ho kya?' -> wedding_inquiry", async () => {
        const input = "Wedding shoot karte ho kya?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.WEDDING_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.SERVICES);
        assert.equal(res.entities.projectType, "wedding");
        assert.ok(res.confidence >= 0.90);
    });

    test("11. Hinglish: 'Kitna charge karte ho?' -> pricing_inquiry", async () => {
        const input = "Kitna charge karte ho?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.PRICING_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.BUSINESS);
        assert.ok(res.confidence >= 0.90);
    });

    test("12. Hinglish: 'Mujhe hire karna hai' -> hire_inquiry", async () => {
        const input = "Mujhe hire karna hai";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.HIRE_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.BUSINESS);
        assert.ok(res.confidence >= 0.90);
    });

    test("13. Hinglish: 'Contact kaise kar sakta hoon?' -> contact_inquiry", async () => {
        const input = "Contact kaise kar sakta hoon?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.CONTACT_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.CONTACT);
        assert.ok(res.confidence >= 0.90);
    });

    test("14. Hinglish: 'Camera konsa use karte ho?' -> camera_inquiry", async () => {
        const input = "Camera konsa use karte ho?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.CAMERA_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.TECHNICAL);
        assert.ok(res.confidence >= 0.90);
    });

    // -------------------------------------------------------------
    // Test Category 4: Misspelled & Informal Messages
    // -------------------------------------------------------------
    test("15. Misspelled & Slang: 'wanna hire u for ad shoot plz'", async () => {
        const input = "wanna hire u for ad shoot plz";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.HIRE_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.BUSINESS);
        assert.equal(res.entities.projectType, "commercial");
    });

    test("16. Misspelled: 'cinematograper gear dikhao' normalizes to equipment_inquiry", async () => {
        const input = "cinematograper gear dikhao";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.EQUIPMENT_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.TECHNICAL);
    });

    // -------------------------------------------------------------
    // Test Category 5: Short Messages
    // -------------------------------------------------------------
    test("17. Short: 'hi' -> greeting", async () => {
        const res = await intentService.detectIntent({ message: "hi" });
        assert.equal(res.intent, INTENTS.GREETING);
    });

    test("18. Short: 'rates?' -> pricing_inquiry", async () => {
        const res = await intentService.detectIntent({ message: "rates?" });
        assert.equal(res.intent, INTENTS.PRICING_INQUIRY);
    });

    test("19. Short: 'bts' -> behind_the_scenes", async () => {
        const res = await intentService.detectIntent({ message: "bts" });
        assert.equal(res.intent, INTENTS.BEHIND_THE_SCENES);
    });

    // -------------------------------------------------------------
    // Test Category 6: Long Messages & Multi-Entity Extraction
    // -------------------------------------------------------------
    test("20. Long: Message with multiple extracted entities (projectType, location, budget, date)", async () => {
        const input = "I need a wedding cinematographer in Delhi next month with a budget of 50k.";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.WEDDING_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.SERVICES);
        assert.equal(res.entities.projectType, "wedding");
        assert.equal(res.entities.location, "Delhi");
        assert.equal(res.entities.date, "next month");
        assert.ok(res.entities.budget.includes("50k"));
    });

    // -------------------------------------------------------------
    // Test Category 7: Ambiguous Messages & Clarification Flag
    // -------------------------------------------------------------
    test("21. Ambiguous: Message with multiple competing intents flags requiresClarification", async () => {
        // Asks both to show work and what the prices are
        const input = "Can you show your portfolio work and also tell me what is your price rate?";
        const res = await intentService.detectIntent({ message: input });

        assert.ok([INTENTS.VIEW_PORTFOLIO, INTENTS.PRICING_INQUIRY].includes(res.intent));
        assert.equal(res.requiresClarification, true, "Should require clarification between portfolio and pricing");
    });

    // -------------------------------------------------------------
    // Test Category 8: Context-Aware Follow-Up Questions
    // -------------------------------------------------------------
    test("22. Context-Aware: Follow-up 'What about weddings?' after services_inquiry", async () => {
        const res = await intentService.detectIntent({
            message: "What about weddings?",
            previousIntent: INTENTS.SERVICES_INQUIRY,
        });

        assert.equal(res.intent, INTENTS.WEDDING_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.SERVICES);
        assert.equal(res.entities.projectType, "wedding");
    });

    test("23. Context-Aware: Follow-up 'How much?' after wedding_inquiry", async () => {
        const res = await intentService.detectIntent({
            message: "How much?",
            previousIntent: INTENTS.WEDDING_INQUIRY,
        });

        assert.equal(res.intent, INTENTS.PRICING_INQUIRY);
        assert.equal(res.category, INTENT_CATEGORIES.BUSINESS);
    });

    // -------------------------------------------------------------
    // Test Category 9: Out of Scope & Unclear Questions
    // -------------------------------------------------------------
    test("24. Out of Scope: 'What is the weather today?' -> out_of_scope", async () => {
        const input = "What is the weather today in Delhi?";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.OUT_OF_SCOPE);
        assert.equal(res.category, INTENT_CATEGORIES.GENERAL);
    });

    test("25. Unclear / Gibberish: Returns unclear_intent and requiresClarification = true", async () => {
        const input = "asdfghjk qwerty 998877";
        const res = await intentService.detectIntent({ message: input });

        assert.equal(res.intent, INTENTS.UNCLEAR_INTENT);
        assert.equal(res.category, INTENT_CATEGORIES.GENERAL);
        assert.equal(res.requiresClarification, true);
    });

    test("26. Empty or Whitespace: Returns unclear_intent safely without error", async () => {
        const res = await intentService.detectIntent({ message: "   " });

        assert.equal(res.intent, INTENTS.UNCLEAR_INTENT);
        assert.equal(res.category, INTENT_CATEGORIES.GENERAL);
        assert.equal(res.requiresClarification, true);
    });
});

