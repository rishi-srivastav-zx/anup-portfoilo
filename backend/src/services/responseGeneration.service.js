/**
 * Response Generation Engine Service
 * Step 7: Response Generation Engine for Anup Rawat Portfolio AI Assistant
 * 
 * Modular, rule- and template-driven response engine that converts retrieved portfolio
 * knowledge into natural, friendly, professional, and grounded multilingual responses
 * representing cinematographer Anup Rawat.
 * 
 * STRICT KNOWLEDGE GROUNDING:
 * Factual assertions are drawn exclusively from verified database knowledge returned by
 * the Smart Search / Retrieval pipeline. No facts are invented or assumed.
 */

import { INTENT_CATEGORIES, INTENTS } from "../modules/intent/intent.constants.js";
import { languageDetector, SUPPORTED_LANGUAGES } from "./responseGeneration/languageDetector.js";
import { responseTemplates } from "./responseGeneration/responseTemplates.js";
import { suggestionGenerator } from "./responseGeneration/suggestionGenerator.js";
import { actionDispatcher } from "./responseGeneration/actionDispatcher.js";

export const responseGenerationService = {
    /**
     * Generates a grounded, natural conversational response
     * @param {object} params
     * @param {string} params.userMessage - Visitor raw message
     * @param {object} [params.intentResult] - Step 3 Intent Detection output
     * @param {object} [params.retrievalResult] - Step 5/6 Smart Search / Retrieval output
     * @param {Array<object>} [params.recentMessages] - Previous messages in conversation
     * @param {object} [params.context] - Session context
     * @returns {object}
     */
    generateResponse({
        userMessage = "",
        intentResult = {},
        retrievalResult = {},
        recentMessages = [],
        context = {},
    } = {}) {
        // 1. Detect visitor language style
        const language = languageDetector.detect(userMessage);

        const intentName = intentResult?.intent || null;
        const intentCategory = intentResult?.category || null;
        const confidence = intentResult?.confidence || 0;
        const entities = intentResult?.entities || {};
        const requiresClarification = Boolean(intentResult?.requiresClarification);

        const hasRelevantKnowledge = Boolean(retrievalResult?.hasRelevantKnowledge);
        const results = Array.isArray(retrievalResult?.results) ? retrievalResult.results : [];

        let reply = "";
        let fallbackStatus = null;

        // 2. Intent-Based Routing & Grounded Formatting
        // Multiple Matching Projects Clarification Check
        const projectCandidates = results.filter(
            (r) =>
                r.category?.toLowerCase().includes("portfolio") ||
                r.category?.toLowerCase().includes("project") ||
                r.category?.toLowerCase().includes("commercial")
        );

        const isGeneralProjectQuery =
            (intentName === INTENTS.PROJECT_DETAILS || intentName === INTENTS.VIEW_PORTFOLIO) &&
            !entities.projectName &&
            projectCandidates.length > 1;

        if (intentName === INTENTS.GREETING) {
            reply = responseTemplates.formatGreeting(language);
            fallbackStatus = null;
        } else if (isGeneralProjectQuery) {
            // Multiple projects matched; ask the visitor which one they want to explore
            const titles = [...new Set(projectCandidates.map((p) => p.title))].slice(0, 3);
            if (language === SUPPORTED_LANGUAGES.HINDI) {
                reply = `मुझे आपके अनुरोध से संबंधित कई प्रोजेक्ट्स मिले हैं: ${titles.join(", ")}। आप इनमें से किस प्रोजेक्ट का विवरण देखना चाहेंगे?`;
            } else if (language === SUPPORTED_LANGUAGES.HINGLISH) {
                reply = `Mujhe aapke request se related kayi projects mile hain: ${titles.join(", ")}. Aap inme se kaunsa project explore karna chahenge?`;
            } else {
                reply = `I found several relevant projects in Anup's portfolio: ${titles.join(", ")}. Which one would you like to explore?`;
            }
            fallbackStatus = null;
        } else if (requiresClarification && !hasRelevantKnowledge) {
            // Ambiguous query with insufficient confidence
            fallbackStatus = "REQUIRES_CLARIFICATION";
            if (language === SUPPORTED_LANGUAGES.HINDI) {
                reply = "मुझे आपका प्रश्न पूरी तरह स्पष्ट नहीं हुआ। क्या आप अनूप के प्रोजेक्ट्स, कैमरा सेटअप या सिनेमैटोग्राफी सेवाओं के बारे में और बता सकते हैं?";
            } else if (language === SUPPORTED_LANGUAGES.HINGLISH) {
                reply = "Mujhe aapka sawal poori tarah clear nahi hua. Kya aap project, camera gear, ya services ke baare mein thoda aur bata sakte hain?";
            } else {
                reply = "I'm not entirely certain I understood your request. Could you clarify whether you're inquiring about Anup's visual projects, camera equipment, or production services?";
            }
        } else if (!hasRelevantKnowledge || results.length === 0) {
            // Strictly grounded fallback: Information is unavailable in published records
            reply = responseTemplates.formatFallback(language);
            fallbackStatus = "NO_RELEVANT_KNOWLEDGE";
        } else {
            // Verified Knowledge Found: Format grounded response strictly using retrieved knowledge
            const topRecord = results[0];

            if (
                intentCategory === INTENT_CATEGORIES.TECHNICAL ||
                intentName === INTENTS.CAMERA_INQUIRY ||
                intentName === INTENTS.LENS_INQUIRY ||
                intentName === INTENTS.EQUIPMENT_INQUIRY
            ) {
                reply = responseTemplates.formatCameraEquipment(topRecord, language);
            } else if (
                intentCategory === INTENT_CATEGORIES.PORTFOLIO ||
                intentName === INTENTS.VIEW_PORTFOLIO ||
                intentName === INTENTS.FEATURED_WORK ||
                intentName === INTENTS.PROJECT_DETAILS ||
                intentName === INTENTS.FILMOGRAPHY_INQUIRY
            ) {
                reply = responseTemplates.formatPortfolioProject(topRecord, language);
            } else if (
                intentCategory === INTENT_CATEGORIES.PERSONAL ||
                intentName === INTENTS.ABOUT_PERSON ||
                intentName === INTENTS.EXPERIENCE_INQUIRY ||
                intentName === INTENTS.LOCATION_INQUIRY
            ) {
                reply = responseTemplates.formatAboutPerson(topRecord, language);
            } else if (
                intentCategory === INTENT_CATEGORIES.SERVICES ||
                intentName === INTENTS.SERVICES_INQUIRY ||
                intentName === INTENTS.WEDDING_INQUIRY ||
                intentName === INTENTS.COMMERCIAL_INQUIRY ||
                intentName === INTENTS.DOCUMENTARY_INQUIRY ||
                intentName === INTENTS.MUSIC_VIDEO_INQUIRY ||
                intentName === INTENTS.BRAND_FILM_INQUIRY
            ) {
                reply = responseTemplates.formatServices(topRecord, language);
            } else if (
                intentCategory === INTENT_CATEGORIES.BUSINESS ||
                intentName === INTENTS.PRICING_INQUIRY ||
                intentName === INTENTS.AVAILABILITY_INQUIRY ||
                intentName === INTENTS.HIRE_INQUIRY ||
                intentName === INTENTS.BOOKING_INQUIRY ||
                intentName === INTENTS.COLLABORATION_INQUIRY
            ) {
                reply = responseTemplates.formatPricingAndBooking(topRecord, language);
            } else if (
                intentCategory === INTENT_CATEGORIES.CONTACT ||
                intentName === INTENTS.CONTACT_INQUIRY ||
                intentName === INTENTS.EMAIL_INQUIRY ||
                intentName === INTENTS.PHONE_INQUIRY ||
                intentName === INTENTS.SOCIAL_MEDIA_INQUIRY
            ) {
                reply = responseTemplates.formatContact(topRecord, language);
            } else {
                reply = responseTemplates.formatGeneralKnowledge(topRecord, language);
            }
        }

        // 3. Dynamic Suggestion Chips
        let suggestions = suggestionGenerator.generate({
            intent: intentName,
            category: intentCategory,
            hasRelevantKnowledge,
        });

        if (isGeneralProjectQuery && projectCandidates.length > 1) {
            const projectSuggestions = [
                ...new Set(projectCandidates.map((p) => p.title)),
            ].slice(0, 3);
            suggestions = [...projectSuggestions, ...suggestions].slice(0, 4);
        }

        // 4. Client Action Dispatching (Navigation, Projects, or Lead Inquiry)
        const actions = actionDispatcher.dispatch({
            intent: intentName,
            entities,
            userMessage,
            retrievalResults: results,
        });

        const structuredIntent = intentName
            ? {
                  name: intentName,
                  category: intentCategory,
                  confidence,
              }
            : null;

        return {
            reply,
            intent: structuredIntent,
            entities,
            requiresClarification,
            suggestions,
            actions,
            retrievedKnowledge: results,
            hasRelevantKnowledge,
            language,
            fallbackStatus,
        };
    },
};

export default responseGenerationService;

