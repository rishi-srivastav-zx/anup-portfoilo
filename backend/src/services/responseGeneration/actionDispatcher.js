/**
 * Action Dispatcher for Chat Client UI
 * Step 8: Section Navigation & Interactive Actions Engine
 * 
 * Generates structured, validated UI actions (Navigation, Project Case Studies,
 * Contact Drawer / Modal) strictly aligned with the actual portfolio website.
 */

import { INTENTS } from "../../modules/intent/intent.constants.js";
import {
    ACTION_TYPES,
    ALLOWED_SECTIONS,
    ALLOWED_ROUTES,
    KNOWN_PROJECT_STATIONS,
} from "../../constants/action.constants.js";

/**
 * Validates that an action conforms to the strict allowlist and security parameters.
 * @param {object} action
 * @returns {boolean}
 */
export function validateAction(action) {
    if (!action || typeof action !== "object") return false;
    const { type, target, label } = action;

    if (!type || !Object.values(ACTION_TYPES).includes(type)) return false;
    if (!label || typeof label !== "string" || label.trim().length === 0) return false;
    if (!target || typeof target !== "string") return false;

    // Reject dangerous protocol injection or path traversal
    if (
        /^(javascript:|data:|vbscript:|file:|https?:|\/\/|\.\.)/i.test(target.trim())
    ) {
        return false;
    }

    // Must be in allowed sections or allowed routes
    const isSection = ALLOWED_SECTIONS.includes(target);
    const isRoute = ALLOWED_ROUTES.includes(target);

    return isSection || isRoute;
}

export const actionDispatcher = {
    /**
     * Dispatches relevant client actions based on intent, entities, message, and retrieved knowledge.
     * @param {object} params
     * @param {string|null} params.intent
     * @param {object} params.entities
     * @param {string} [params.userMessage]
     * @param {Array<object>} [params.retrievalResults]
     * @returns {Array<object>}
     */
    dispatch({
        intent = null,
        entities = {},
        userMessage = "",
        retrievalResults = [],
    } = {}) {
        const rawMsg = (userMessage || "").toLowerCase();
        const actions = [];

        // Helper: Check if visitor explicitly requested navigation
        const hasExplicitNavWord =
            /\b(go to|take me to|navigate to|open|show me|scroll to|view|visit)\b/i.test(
                rawMsg
            );

        // 1. Showreel Request
        if (
            rawMsg.includes("showreel") ||
            rawMsg.includes("show reel") ||
            (entities.equipment === "showreel")
        ) {
            actions.push({
                type: ACTION_TYPES.PLAY_SHOWREEL,
                target: "#work",
                label: "Watch Cinematography Showreel",
                payload: { stationIndex: 0 },
                autoExecute: hasExplicitNavWord,
            });
            return actions.filter(validateAction);
        }

        // 2. Home / Scroll to Top
        if (
            intent === INTENTS.NAVIGATE_HOME ||
            /\b(home|homepage|top of page|scroll to top|back to top)\b/i.test(rawMsg)
        ) {
            actions.push({
                type: ACTION_TYPES.SCROLL_TO_TOP,
                target: "#home",
                label: "Back to Top",
                autoExecute: true,
            });
            return actions.filter(validateAction);
        }

        // 3. Specific Project Case Study Navigation
        // Check if an explicit project was requested (e.g. "show me the Delhi Metro project", "open Krishna Shukla")
        const requestedProjectName = entities.projectName || null;
        let matchedStation = null;
        let matchedTitle = null;

        if (requestedProjectName) {
            const lowKey = requestedProjectName.toLowerCase().trim();
            for (const [key, data] of Object.entries(KNOWN_PROJECT_STATIONS)) {
                if (lowKey.includes(key) || key.includes(lowKey)) {
                    matchedStation = data.stationIndex;
                    matchedTitle = data.title;
                    break;
                }
            }
        } else {
            // Check in message text against known project stations
            for (const [key, data] of Object.entries(KNOWN_PROJECT_STATIONS)) {
                if (key !== "showreel" && rawMsg.includes(key)) {
                    matchedStation = data.stationIndex;
                    matchedTitle = data.title;
                    break;
                }
            }
        }

        if (
            matchedStation !== null &&
            (hasExplicitNavWord || intent === INTENTS.PROJECT_DETAILS)
        ) {
            actions.push({
                type: ACTION_TYPES.OPEN_PROJECT,
                target: "#work",
                label: `Open Case Study: ${matchedTitle}`,
                payload: {
                    projectName: matchedTitle,
                    stationIndex: matchedStation,
                },
                autoExecute: hasExplicitNavWord,
            });
            return actions.filter(validateAction);
        }

        // 4. Commercial Projects List Navigation
        if (
            rawMsg.includes("commercial project") ||
            rawMsg.includes("commercial work") ||
            intent === INTENTS.COMMERCIAL_INQUIRY && hasExplicitNavWord
        ) {
            actions.push({
                type: ACTION_TYPES.NAVIGATE_TO_SECTION,
                target: "#work",
                label: "View Commercial Projects",
                payload: { filter: "commercial" },
                autoExecute: true,
            });
            return actions.filter(validateAction);
        }

        // 5. Work / Portfolio Section Navigation
        if (
            intent === INTENTS.NAVIGATE_WORK ||
            (/\b(show (me )?your work|show your projects|view portfolio|explore work)\b/i.test(rawMsg))
        ) {
            actions.push({
                type: ACTION_TYPES.NAVIGATE_TO_SECTION,
                target: "#work",
                label: "View Portfolio Work",
                autoExecute: true,
            });
        }

        // 6. Services Navigation (Showcased in Work and About sections)
        else if (
            intent === INTENTS.NAVIGATE_SERVICES ||
            (/\b(show (your )?services|view services|what services do you offer)\b/i.test(rawMsg) && hasExplicitNavWord)
        ) {
            actions.push({
                type: ACTION_TYPES.NAVIGATE_TO_SECTION,
                target: "#work",
                label: "Explore Services & Projects",
                payload: { filter: "services" },
                autoExecute: true,
            });
        }

        // 7. Contact Section Navigation
        else if (
            intent === INTENTS.NAVIGATE_CONTACT ||
            (/\b(contact anup|reach anup|go to contact|open contact form)\b/i.test(rawMsg))
        ) {
            actions.push({
                type: ACTION_TYPES.NAVIGATE_TO_SECTION,
                target: "#contact",
                label: "Go to Contact Page",
                autoExecute: true,
            });
        }

        // 8. About Section Navigation
        else if (
            intent === INTENTS.NAVIGATE_ABOUT ||
            (/\b(tell me about anup|who is anup rawat|about anup)\b/i.test(rawMsg) && hasExplicitNavWord)
        ) {
            actions.push({
                type: ACTION_TYPES.NAVIGATE_TO_SECTION,
                target: "#about",
                label: "Read Anup's Bio",
                autoExecute: true,
            });
        }

        // 9. Blog / Journal Route Navigation
        else if (
            intent === INTENTS.NAVIGATE_BLOG ||
            (/\b(go to blog|open blog|show journal|articles)\b/i.test(rawMsg) && hasExplicitNavWord)
        ) {
            actions.push({
                type: ACTION_TYPES.NAVIGATE_TO_ROUTE,
                target: "/blog",
                label: "Explore Articles & Stories",
                autoExecute: true,
            });
        }

        // 10. Business, Booking, and Hiring inquiries (Contact Modal Action)
        if (
            intent === INTENTS.HIRE_INQUIRY ||
            intent === INTENTS.BOOKING_INQUIRY ||
            intent === INTENTS.PRICING_INQUIRY ||
            intent === INTENTS.AVAILABILITY_INQUIRY ||
            intent === INTENTS.COLLABORATION_INQUIRY
        ) {
            actions.push({
                type: ACTION_TYPES.OPEN_CONTACT_MODAL,
                target: "#contact",
                label: "Submit Project Inquiry",
                payload: {
                    projectType: entities.projectType || null,
                    location: entities.location || null,
                },
                autoExecute: false,
            });
        }

        // Filter and return only strictly valid actions
        return actions.filter(validateAction);
    },
};

export default actionDispatcher;
