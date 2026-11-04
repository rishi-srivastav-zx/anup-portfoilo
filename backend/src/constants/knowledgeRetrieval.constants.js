/**
 * Constants for Portfolio Knowledge Retrieval Engine
 * Step 5: Portfolio Knowledge Retrieval Engine
 */

import { INTENTS, INTENT_CATEGORIES } from "../modules/intent/intent.constants.js";
import { SUGGESTED_KNOWLEDGE_CATEGORIES } from "./portfolioKnowledge.constants.js";

/**
 * Mapping from detected intent to most relevant knowledge categories.
 * Guides the retrieval engine to prioritize category matches without being strictly limiting.
 */
export const INTENT_TO_CATEGORY_PREFERENCES = Object.freeze({
    // A. Personal Information
    [INTENTS.GREETING]: [
        "Personal Information",
        "Frequently Asked Questions",
    ],
    [INTENTS.ABOUT_PERSON]: [
        "Personal Information",
        "Experience",
        "Creative Style",
        "Frequently Asked Questions",
    ],
    [INTENTS.EXPERIENCE_INQUIRY]: [
        "Experience",
        "Personal Information",
        "Portfolio Projects",
        "Awards and Achievements",
    ],
    [INTENTS.LOCATION_INQUIRY]: [
        "Location",
        "Personal Information",
        "Availability",
    ],
    [INTENTS.LANGUAGE_INQUIRY]: [
        "Personal Information",
        "Frequently Asked Questions",
    ],

    // B. Portfolio
    [INTENTS.VIEW_PORTFOLIO]: [
        "Portfolio Projects",
        "Creative Style",
        "Behind the Scenes",
    ],
    [INTENTS.FEATURED_WORK]: [
        "Portfolio Projects",
        "Awards and Achievements",
        "Creative Style",
    ],
    [INTENTS.PROJECT_DETAILS]: [
        "Portfolio Projects",
        "Behind the Scenes",
        "Working Process",
    ],
    [INTENTS.FILMOGRAPHY_INQUIRY]: [
        "Portfolio Projects",
        "Experience",
        "Awards and Achievements",
    ],
    [INTENTS.AWARDS_INQUIRY]: [
        "Awards and Achievements",
        "Portfolio Projects",
    ],
    [INTENTS.BEHIND_THE_SCENES]: [
        "Behind the Scenes",
        "Working Process",
        "Portfolio Projects",
    ],

    // C. Services
    [INTENTS.SERVICES_INQUIRY]: [
        "Services",
        "Working Process",
        "Pricing Information",
    ],
    [INTENTS.WEDDING_INQUIRY]: [
        "Services",
        "Portfolio Projects",
        "Pricing Information",
    ],
    [INTENTS.COMMERCIAL_INQUIRY]: [
        "Portfolio Projects",
        "Services",
        "Working Process",
    ],
    [INTENTS.DOCUMENTARY_INQUIRY]: [
        "Portfolio Projects",
        "Services",
        "Working Process",
    ],
    [INTENTS.MUSIC_VIDEO_INQUIRY]: [
        "Portfolio Projects",
        "Services",
        "Working Process",
    ],
    [INTENTS.BRAND_FILM_INQUIRY]: [
        "Portfolio Projects",
        "Services",
        "Working Process",
    ],

    // D. Technical Information
    [INTENTS.EQUIPMENT_INQUIRY]: [
        "Camera Equipment",
        "Lenses and Gear",
        "Working Process",
    ],
    [INTENTS.CAMERA_INQUIRY]: [
        "Camera Equipment",
        "Lenses and Gear",
    ],
    [INTENTS.LENS_INQUIRY]: [
        "Lenses and Gear",
        "Camera Equipment",
    ],
    [INTENTS.PRODUCTION_PROCESS]: [
        "Working Process",
        "Creative Style",
        "Behind the Scenes",
    ],
    [INTENTS.CREATIVE_STYLE]: [
        "Creative Style",
        "Working Process",
        "Portfolio Projects",
    ],

    // E. Business and Hiring
    [INTENTS.HIRE_INQUIRY]: [
        "Services",
        "Pricing Information",
        "Availability",
        "Contact Information",
    ],
    [INTENTS.AVAILABILITY_INQUIRY]: [
        "Availability",
        "Services",
        "Contact Information",
    ],
    [INTENTS.PRICING_INQUIRY]: [
        "Pricing Information",
        "Services",
        "Contact Information",
    ],
    [INTENTS.COLLABORATION_INQUIRY]: [
        "Services",
        "Contact Information",
        "Personal Information",
    ],
    [INTENTS.BOOKING_INQUIRY]: [
        "Services",
        "Availability",
        "Contact Information",
        "Pricing Information",
    ],

    // F. Contact
    [INTENTS.CONTACT_INQUIRY]: [
        "Contact Information",
        "Personal Information",
    ],
    [INTENTS.EMAIL_INQUIRY]: [
        "Contact Information",
    ],
    [INTENTS.PHONE_INQUIRY]: [
        "Contact Information",
    ],
    [INTENTS.SOCIAL_MEDIA_INQUIRY]: [
        "Contact Information",
        "Personal Information",
    ],

    // G. Navigation
    [INTENTS.NAVIGATE_HOME]: ["Personal Information"],
    [INTENTS.NAVIGATE_ABOUT]: ["Personal Information", "Experience"],
    [INTENTS.NAVIGATE_WORK]: ["Portfolio Projects"],
    [INTENTS.NAVIGATE_SERVICES]: ["Services"],
    [INTENTS.NAVIGATE_CONTACT]: ["Contact Information"],
    [INTENTS.NAVIGATE_BLOG]: ["Behind the Scenes", "Creative Style"],

    // H. General
    [INTENTS.GENERAL_QUESTION]: [
        "Frequently Asked Questions",
        "Personal Information",
    ],
    [INTENTS.OUT_OF_SCOPE]: [],
    [INTENTS.UNCLEAR_INTENT]: [],
});

/**
 * Weights for relevance ranking conforming strictly to Step 7 requirement:
 * - Exact title match
 * - Project name match
 * - Keyword match
 * - Content match
 * - Category match
 * - Intent compatibility
 */
export const SCORING_WEIGHTS = Object.freeze({
    EXACT_TITLE_MATCH: 0.25,
    PROJECT_NAME_MATCH: 0.15,
    KEYWORD_MATCH: 0.20,
    CONTENT_MATCH: 0.10,
    CATEGORY_MATCH: 0.15,
    INTENT_COMPATIBILITY: 0.15,
    ENTITY_MATCH_BOOST: 0.15,
    PHRASE_MATCH_BOOST: 0.10,
});

/**
 * Minimum relevance threshold
 * Records below MINIMUM are excluded so unrelated records are never returned.
 */
export const RELEVANCE_THRESHOLDS = Object.freeze({
    MINIMUM: 0.25,
    MODERATE: 0.40,
    HIGH: 0.70,
});

export const DEFAULT_RETRIEVAL_LIMIT = 5;
