/**
 * Smart Search Configuration and Constants
 * Step 6: Smart Search Engine for Cinematographer Portfolio AI Assistant
 */

export const SMART_SEARCH_WEIGHTS = Object.freeze({
    EXACT_PHRASE: 0.20,
    FTS_RANK: 0.15,
    FUZZY_SIMILARITY: 0.15,
    KEYWORD_OVERLAP: 0.15,
    INTENT_COMPATIBILITY: 0.15,
    ENTITY_MATCH: 0.10,
    CATEGORY_RELEVANCE: 0.10,
});

export const SMART_SEARCH_THRESHOLDS = Object.freeze({
    MIN_RELEVANCE_SCORE: 0.25,
    FUZZY_SIMILARITY_MIN: 0.20,
    HIGH_RELEVANCE: 0.70,
    MODERATE_RELEVANCE: 0.40,
});

export const SMART_SEARCH_LIMITS = Object.freeze({
    DEFAULT: 5,
    MAX: 20,
    CANDIDATE_POOL: 30,
});

/**
 * Cinematography domain synonym clusters
 * Expanding query tokens with domain-specific equivalents ensures high recall across different phrasings.
 */
export const CINEMATOGRAPHY_SYNONYMS = Object.freeze({
    camera: ["gear", "equipment", "setup", "rig", "cinema camera", "tools", "package"],
    equipment: ["camera", "gear", "setup", "rig", "lens", "lenses", "package"],
    gear: ["camera", "equipment", "setup", "lenses", "rig", "package"],
    lens: ["lenses", "glass", "optics", "prime lenses", "anamorphic", "zoom"],
    lenses: ["lens", "glass", "optics", "prime lenses", "anamorphic"],
    project: ["work", "portfolio", "film", "commercial", "case study", "production"],
    projects: ["work", "portfolio", "films", "commercials", "case study"],
    work: ["project", "projects", "portfolio", "films", "filmography", "cinematography"],
    portfolio: ["work", "projects", "films", "showreel", "reel"],
    pricing: ["rates", "day rate", "cost", "charge", "fees", "budget", "quote"],
    rates: ["pricing", "cost", "charge", "day rate", "fees", "package"],
    commercial: ["tvc", "ad", "advertisement", "brand film", "corporate"],
    wedding: ["marriage", "pre-wedding", "shaadi", "event film"],
    documentary: ["docu", "non-fiction", "doc"],
    director: ["dop", "cinematographer", "director of photography"],
    cinematography: ["filming", "shooting", "visuals", "camera work", "dop"],
});

/**
 * Hindi / Hinglish colloquial stop words & interrogative particles that carry no search weight
 */
export const HINDI_HINGLISH_STOPWORDS = new Set([
    "kya", "hai", "hain", "ho", "tha", "thi", "the", "mein", "par", "se", "ko",
    "ka", "ki", "ke", "liye", "batao", "bataye", "batado", "dikhao", "dikhaye",
    "dikhado", "konsa", "kaunsa", "kaisa", "kaise", "karte", "karta", "karega",
    "karenge", "karna", "kar", "sakta", "sakte", "sakti", "hoon", "aap", "tum",
    "mujhe", "hum", "yeh", "woh", "kuch", "aur", "bhi", "toh", "ab", "kab",
    "kahan", "kyun", "kripya", "ji"
]);

