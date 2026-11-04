/**
 * Action Engine & Dispatcher Test Suite (Step 8)
 * Verifies backend action generation, project matching, allowlists, security,
 * and multiple project clarifications.
 */

import test, { describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { actionDispatcher, validateAction } from "../src/services/responseGeneration/actionDispatcher.js";
import { responseGenerationService } from "../src/services/responseGeneration.service.js";
import { ACTION_TYPES, ALLOWED_SECTIONS, ALLOWED_ROUTES } from "../src/constants/action.constants.js";
import { INTENTS, INTENT_CATEGORIES } from "../src/modules/intent/intent.constants.js";
import { pool } from "../src/config/db.js";

describe("Cinematographer Portfolio Action Engine Suite (Step 8)", () => {
    after(async () => {
        try {
            await pool.end();
        } catch {
            // Ignore if pool already closed
        }
    });

    // -------------------------------------------------------------
    // 1. Navigation to Each Existing Section
    // -------------------------------------------------------------
    test("1. Navigation to Work Section: Emits NAVIGATE_TO_SECTION targeting #work", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.NAVIGATE_WORK,
            userMessage: "Show me your work",
        });

        assert.ok(Array.isArray(actions));
        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.NAVIGATE_TO_SECTION);
        assert.equal(actions[0].target, "#work");
        assert.equal(actions[0].autoExecute, true);
        assert.ok(ALLOWED_SECTIONS.includes(actions[0].target));
    });

    test("2. Navigation to About Section: Emits NAVIGATE_TO_SECTION targeting #about", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.NAVIGATE_ABOUT,
            userMessage: "Tell me about Anup Rawat",
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.NAVIGATE_TO_SECTION);
        assert.equal(actions[0].target, "#about");
        assert.equal(actions[0].autoExecute, true);
        assert.ok(ALLOWED_SECTIONS.includes(actions[0].target));
    });

    test("3. Navigation to Contact Section: Emits NAVIGATE_TO_SECTION targeting #contact", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.NAVIGATE_CONTACT,
            userMessage: "I want to contact Anup",
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.NAVIGATE_TO_SECTION);
        assert.equal(actions[0].target, "#contact");
        assert.equal(actions[0].autoExecute, true);
        assert.ok(ALLOWED_SECTIONS.includes(actions[0].target));
    });

    test("4. Navigation to Services: Emits NAVIGATE_TO_SECTION targeting #work where services are showcased", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.NAVIGATE_SERVICES,
            userMessage: "Show your services",
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.NAVIGATE_TO_SECTION);
        assert.equal(actions[0].target, "#work");
        assert.equal(actions[0].payload?.filter, "services");
        assert.equal(actions[0].autoExecute, true);
    });

    test("5. Navigation to Home / Scroll to Top: Emits SCROLL_TO_TOP targeting #home", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.NAVIGATE_HOME,
            userMessage: "Go to homepage and scroll to top",
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.SCROLL_TO_TOP);
        assert.equal(actions[0].target, "#home");
        assert.equal(actions[0].autoExecute, true);
    });

    // -------------------------------------------------------------
    // 2. Navigation to Existing Routes
    // -------------------------------------------------------------
    test("6. Navigation to Blog Route: Emits NAVIGATE_TO_ROUTE targeting /blog", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.NAVIGATE_BLOG,
            userMessage: "Go to blog and articles",
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.NAVIGATE_TO_ROUTE);
        assert.equal(actions[0].target, "/blog");
        assert.equal(actions[0].autoExecute, true);
        assert.ok(ALLOWED_ROUTES.includes(actions[0].target));
    });

    // -------------------------------------------------------------
    // 3. Showreel Action
    // -------------------------------------------------------------
    test("7. Showreel Action: Emits PLAY_SHOWREEL targeting #work with station index 0", () => {
        const actions = actionDispatcher.dispatch({
            userMessage: "Show me your showreel",
            intent: INTENTS.FEATURED_WORK,
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.PLAY_SHOWREEL);
        assert.equal(actions[0].target, "#work");
        assert.equal(actions[0].payload?.stationIndex, 0);
        assert.equal(actions[0].autoExecute, true);
    });

    // -------------------------------------------------------------
    // 4. Contact Modal Opening
    // -------------------------------------------------------------
    test("8. Contact Modal: Emits OPEN_CONTACT_MODAL for hiring/booking inquiry without autoExecute", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.HIRE_INQUIRY,
            userMessage: "I want to hire Anup for a commercial in Mumbai",
            entities: {
                projectType: "commercial",
                location: "Mumbai",
            },
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.OPEN_CONTACT_MODAL);
        assert.equal(actions[0].target, "#contact");
        assert.equal(actions[0].payload?.projectType, "commercial");
        assert.equal(actions[0].payload?.location, "Mumbai");
        // General inquiry should not forcibly auto-navigate the visitor
        assert.equal(actions[0].autoExecute, false);
    });

    // -------------------------------------------------------------
    // 5. Specific Project Navigation
    // -------------------------------------------------------------
    test("9. Project Navigation: Emits OPEN_PROJECT for specific requested project", () => {
        const actions = actionDispatcher.dispatch({
            intent: INTENTS.PROJECT_DETAILS,
            userMessage: "Show me the Delhi Metro project",
            entities: { projectName: "Delhi Metro Transit Line" },
        });

        assert.equal(actions.length, 1);
        assert.equal(actions[0].type, ACTION_TYPES.OPEN_PROJECT);
        assert.equal(actions[0].target, "#work");
        assert.equal(actions[0].payload?.projectName, "Delhi Metro Transit Line");
        assert.equal(actions[0].payload?.stationIndex, 6);
    });

    // -------------------------------------------------------------
    // 6. Security & Invalid Action Rejection
    // -------------------------------------------------------------
    test("10. Security: validateAction strictly rejects malicious scripts, external protocols, and unknown targets", () => {
        // JavaScript protocol injection
        assert.equal(
            validateAction({
                type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
                target: "javascript:alert(1)",
                label: "Malicious Click",
            }),
            false
        );

        // Absolute external URL redirect
        assert.equal(
            validateAction({
                type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
                target: "https://evil-phishing-site.com",
                label: "External Redirect",
            }),
            false
        );

        // Path traversal
        assert.equal(
            validateAction({
                type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
                target: "../../../etc/passwd",
                label: "Traversal",
            }),
            false
        );

        // Unknown section ID
        assert.equal(
            validateAction({
                type: ACTION_TYPES.NAVIGATE_TO_SECTION,
                target: "#non-existent-secret-section",
                label: "Ghost Section",
            }),
            false
        );

        // Unsupported action type
        assert.equal(
            validateAction({
                type: "EXECUTE_ARBITRARY_CODE",
                target: "#work",
                label: "Bad Type",
            }),
            false
        );
    });

    // -------------------------------------------------------------
    // 7. Multiple Matching Projects Clarification
    // -------------------------------------------------------------
    test("11. Multiple Matching Projects: responseGenerationService asks clarification instead of picking randomly", () => {
        const response = responseGenerationService.generateResponse({
            userMessage: "Show me your commercial projects",
            intentResult: {
                intent: INTENTS.PROJECT_DETAILS,
                category: INTENT_CATEGORIES.PORTFOLIO,
                confidence: 0.88,
                entities: {}, // No specific project name given
            },
            retrievalResult: {
                hasRelevantKnowledge: true,
                results: [
                    {
                        id: "p1",
                        title: "Delhi Metro Transit Line Campaign",
                        category: "Portfolio Projects",
                        content: "Commercial metro campaign.",
                    },
                    {
                        id: "p2",
                        title: "Jio Hotstar Series Campaign",
                        category: "Portfolio Projects",
                        content: "Streaming platform commercial.",
                    },
                ],
            },
        });

        // Must clarify and ask which one visitor wants to explore
        assert.ok(
            response.reply.includes("Delhi Metro Transit Line Campaign") ||
            response.reply.includes("Jio Hotstar Series Campaign")
        );
        assert.ok(response.reply.includes("Which one would you like to explore?"));
        // Provides suggestion chips for both candidates
        assert.ok(response.suggestions.includes("Delhi Metro Transit Line Campaign"));
        assert.ok(response.suggestions.includes("Jio Hotstar Series Campaign"));
    });
});

