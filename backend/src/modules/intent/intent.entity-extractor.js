/**
 * Entity Extractor for Intent Detection Engine
 * Step 3: Rule and Pattern Based Information Extraction
 */

// Supported Project Types (supporting plurals & Hindi/Devanagari)
const PROJECT_TYPE_PATTERNS = [
    { type: "commercial", regex: /\b(commercials?( ad)?|ad shoots?|tvc|advertisements?)\b/i },
    { type: "wedding", regex: /\b(weddings?|shaadi|marriages?|byah|शादी|विवाह)\b/i },
    { type: "pre-wedding", regex: /\b(pre-weddings?|pre weddings?)\b/i },
    { type: "documentary", regex: /\b(documentar(?:y|ies)|docu|non-fiction)\b/i },
    { type: "music video", regex: /\b(music videos?|songs? shoot|gaana shoot|gaane)\b/i },
    { type: "brand film", regex: /\b(brand (?:films?|stor(?:y|ies))|corporate (?:videos?|films?))\b/i },
    { type: "short film", regex: /\b(short films?|fiction shorts?)\b/i },
    { type: "feature film", regex: /\b(feature films?|movies?)\b/i },
    { type: "fashion shoot", regex: /\b(fashion (?:films?|shoots?)|lookbooks?)\b/i },
];

// Supported Service Types
const SERVICE_TYPE_PATTERNS = [
    { type: "cinematography", regex: /\b(cinematography|dop|director of photography|camera operation)\b/i },
    { type: "direction", regex: /\b(direction|directing)\b/i },
    { type: "color grading", regex: /\b(color grading|colorist|grading|di)\b/i },
    { type: "drone", regex: /\b(drones?( shoot| footage)?|aerial( cinematography)?)\b/i },
    { type: "editing", regex: /\b(editing|post production|video editing)\b/i },
    { type: "lighting", regex: /\b(lighting|gaffer|light setups?)\b/i },
];

// Supported Locations
const LOCATION_PATTERNS = [
    { name: "Delhi", regex: /\b(delhi( ncr)?|new delhi)\b/i },
    { name: "Mumbai", regex: /\b(mumbai|bombay)\b/i },
    { name: "Dehradun", regex: /\b(dehradun)\b/i },
    { name: "Uttarakhand", regex: /\b(uttarakhand|rishikesh|mussoorie)\b/i },
    { name: "Bangalore", regex: /\b(bangalore|bengaluru)\b/i },
    { name: "Goa", regex: /\b(goa)\b/i },
    { name: "Jaipur", regex: /\b(jaipur|rajasthan)\b/i },
    { name: "Noida", regex: /\b(noida|greater noida)\b/i },
    { name: "Gurugram", regex: /\b(gurugram|gurgaon)\b/i },
    { name: "Chandigarh", regex: /\b(chandigarh)\b/i },
    { name: "Kolkata", regex: /\b(kolkata|calcutta)\b/i },
    { name: "Hyderabad", regex: /\b(hyderabad)\b/i },
    { name: "Pune", regex: /\b(pune)\b/i },
    { name: "London", regex: /\b(london|uk)\b/i },
    { name: "Dubai", regex: /\b(dubai|uae)\b/i },
    { name: "India", regex: /\b(india|bharat)\b/i },
];

// Supported Equipment Types
const EQUIPMENT_PATTERNS = [
    { name: "Sony FX3", regex: /\b(sony fx3|fx3)\b/i },
    { name: "Sony FX6", regex: /\b(sony fx6|fx6)\b/i },
    { name: "Arri Alexa", regex: /\b(arri( alexa)?|alexa (mini|lf))\b/i },
    { name: "RED Komodo", regex: /\b(red( komodo| raptor)?)\b/i },
    { name: "Blackmagic BMPCC", regex: /\b(bmpcc( 4k| 6k)?|blackmagic)\b/i },
    { name: "Anamorphic Lenses", regex: /\b(anamorphic( lenses?)?)\b/i },
    { name: "Prime Lenses", regex: /\b(prime lenses?|primes)\b/i },
    { name: "Sony G Master", regex: /\b(g master|gm lens|g-master)\b/i },
    { name: "DJI Ronin", regex: /\b(dji ronin|ronin( rs3| rs4)?|gimbal)\b/i },
    { name: "Drone", regex: /\b(dji (mavic|inspire)|drones?)\b/i },
];

// Supported Navigation Targets
const NAVIGATION_TARGET_PATTERNS = [
    { target: "home", regex: /\b(home|homepage)\b/i },
    { target: "about", regex: /\b(about|bio|profile)\b/i },
    { target: "work", regex: /\b(work|portfolio|projects|films)\b/i },
    { target: "services", regex: /\b(services|offerings)\b/i },
    { target: "contact", regex: /\b(contact|reach out)\b/i },
    { target: "blog", regex: /\b(blog|sketchbook|articles|stories)\b/i },
];

// Budget Extraction Regex
const BUDGET_REGEX = /(?:₹|rs\.?|inr|\$|usd|eur|£)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakhs?|lacs?|crores?|cr|thousand|hundred|grand|million)?(?:\s*(?:inr|usd|rupees|bucks|per day|day rate))?/i;

// Date / Timing Extraction Regex
const DATE_PATTERNS = [
    /\b(tomorrow|kal)\b/i,
    /\b(this weekend|next week|next month|next year|in \d+ (?:days|weeks|months))\b/i,
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
    /\b(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)(?:\s+\d{4})?)\b/i,
    /\b(\d{4}-\d{2}-\d{2})\b/,
];

export const intentEntityExtractor = {
    /**
     * Extracts all explicitly mentioned entities from user message
     * @param {string} text - Raw or cleaned text
     * @param {string} [normalizedText] - Optional normalized text
     * @returns {object} Extracted entities dictionary (empty if none found)
     */
    extract(text, normalizedText = "") {
        if (!text || typeof text !== "string") return {};

        const combinedText = `${text} ${normalizedText}`.trim();
        const entities = {};

        // 1. Project Type
        for (const item of PROJECT_TYPE_PATTERNS) {
            if (item.regex.test(combinedText)) {
                entities.projectType = item.type;
                break;
            }
        }

        // 2. Service Type
        for (const item of SERVICE_TYPE_PATTERNS) {
            if (item.regex.test(combinedText)) {
                entities.serviceType = item.type;
                break;
            }
        }

        // 3. Location
        for (const item of LOCATION_PATTERNS) {
            if (item.regex.test(combinedText)) {
                entities.location = item.name;
                break;
            }
        }

        // 4. Equipment Type
        for (const item of EQUIPMENT_PATTERNS) {
            if (item.regex.test(combinedText)) {
                entities.equipmentType = item.name;
                break;
            }
        }

        // 5. Navigation Target
        for (const item of NAVIGATION_TARGET_PATTERNS) {
            if (item.regex.test(combinedText)) {
                entities.navigationTarget = item.target;
                break;
            }
        }

        // 6. Budget
        const budgetMatch = text.match(BUDGET_REGEX);
        if (budgetMatch && (budgetMatch[2] || /₹|\$|inr|usd|rupees/i.test(budgetMatch[0]))) {
            const rawBudget = budgetMatch[0].trim();
            if (rawBudget.length > 1) {
                entities.budget = rawBudget;
            }
        }

        // 7. Date
        for (const regex of DATE_PATTERNS) {
            const match = text.match(regex);
            if (match && match[0]) {
                entities.date = match[0].trim();
                break;
            }
        }

        return entities;
    },
};

export default intentEntityExtractor;
