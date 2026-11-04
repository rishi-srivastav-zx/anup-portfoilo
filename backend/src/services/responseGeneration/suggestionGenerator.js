/**
 * Dynamic Suggestion Generator
 * Step 7: Response Generation Engine for Anup Rawat Portfolio AI Assistant
 * 
 * Generates contextually relevant quick-reply suggestion chips based on the visitor's
 * current inquiry and resolved intent.
 */

import { INTENT_CATEGORIES, INTENTS } from "../../modules/intent/intent.constants.js";

const DEFAULT_SUGGESTIONS = [
    "What camera gear does Anup use?",
    "Show me the Delhi Metro Transit work",
    "Inquire about shooting dates and rates",
    "View cinematography showreel",
];

export const suggestionGenerator = {
    /**
     * Generates an array of 3 to 4 relevant suggestion prompts
     * @param {object} params
     * @param {string|null} params.intent
     * @param {string|null} params.category
     * @param {boolean} params.hasRelevantKnowledge
     * @returns {Array<string>}
     */
    generate({ intent = null, category = null, hasRelevantKnowledge = true } = {}) {
        if (!hasRelevantKnowledge) {
            return [
                "What camera gear does Anup use?",
                "Show me recent commercial projects",
                "Explore cinematography services",
                "Contact Anup directly",
            ];
        }

        switch (intent) {
            case INTENTS.GREETING:
                return [
                    "Tell me about Anup Rawat",
                    "What camera gear does Anup use?",
                    "Show me the Delhi Metro Transit work",
                    "Inquire about commercial day rates",
                ];

            case INTENTS.ABOUT_PERSON:
            case INTENTS.EXPERIENCE_INQUIRY:
            case INTENTS.LOCATION_INQUIRY:
                return [
                    "What camera gear does Anup shoot with?",
                    "Show featured cinematography projects",
                    "Explore available services",
                    "Inquire about upcoming availability",
                ];

            case INTENTS.CAMERA_INQUIRY:
            case INTENTS.EQUIPMENT_INQUIRY:
                return [
                    "Which lenses does Anup pair with his cameras?",
                    "Show me the Delhi Metro Transit case study",
                    "Inquire about commercial shooting rates",
                    "View cinematography showreel",
                ];

            case INTENTS.LENS_INQUIRY:
                return [
                    "What camera bodies does Anup use?",
                    "Show me the Delhi Metro anamorphic shoot",
                    "Explore lighting & stabilization setup",
                    "Inquire about project rates",
                ];

            case INTENTS.VIEW_PORTFOLIO:
            case INTENTS.FEATURED_WORK:
            case INTENTS.PROJECT_DETAILS:
            case INTENTS.COMMERCIAL_INQUIRY:
                return [
                    "What camera gear was used on this shoot?",
                    "Explore cinematography services",
                    "Check shooting dates & availability",
                    "Inquire for a commercial project",
                ];

            case INTENTS.SERVICES_INQUIRY:
            case INTENTS.WEDDING_INQUIRY:
            case INTENTS.DOCUMENTARY_INQUIRY:
            case INTENTS.MUSIC_VIDEO_INQUIRY:
                return [
                    "What are your commercial day rates?",
                    "What camera gear do you bring to sets?",
                    "Show wedding & event film case studies",
                    "Inquire about project booking",
                ];

            case INTENTS.PRICING_INQUIRY:
            case INTENTS.AVAILABILITY_INQUIRY:
            case INTENTS.HIRE_INQUIRY:
            case INTENTS.BOOKING_INQUIRY:
            case INTENTS.COLLABORATION_INQUIRY:
                return [
                    "Check shooting dates availability",
                    "What camera package is included in the rate?",
                    "Show Delhi Metro commercial work",
                    "Contact Anup for booking",
                ];

            case INTENTS.CONTACT_INQUIRY:
            case INTENTS.EMAIL_INQUIRY:
            case INTENTS.PHONE_INQUIRY:
            case INTENTS.SOCIAL_MEDIA_INQUIRY:
                return [
                    "View cinematography showreel",
                    "Explore commercial & brand films",
                    "What camera gear does Anup use?",
                    "Check shooting availability",
                ];

            default:
                if (category === INTENT_CATEGORIES.TECHNICAL) {
                    return [
                        "Which lenses does Anup use?",
                        "View commercial project case studies",
                        "Inquire for upcoming shoot dates",
                        "View cinematography showreel",
                    ];
                }
                if (category === INTENT_CATEGORIES.PORTFOLIO) {
                    return [
                        "What camera gear was used for this?",
                        "Inquire about cinematography rates",
                        "Explore services offered",
                        "Contact Anup Rawat",
                    ];
                }
                return DEFAULT_SUGGESTIONS;
        }
    },
};

export default suggestionGenerator;

