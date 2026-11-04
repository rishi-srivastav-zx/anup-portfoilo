/**
 * Normalizer for Intent Detection Engine
 * Step 3: Natural Language Pre-Processing & Hinglish Normalization
 */

// Common Devanagari to Romanized transliteration mappings for key Hindi terms
const DEVANAGARI_MAP = {
    "नमस्ते": "namaste",
    "नमस्कार": "namaskar",
    "हाय": "hi",
    "हेलो": "hello",
    "शादी": "wedding",
    "विवाह": "wedding",
    "काम": "work",
    "दिखाओ": "dikhao",
    "दिखाइए": "dikhao",
    "बताओ": "batao",
    "बताइए": "batao",
    "कैमरा": "camera",
    "लेंस": "lens",
    "किराया": "charge",
    "खर्चा": "charge",
    "पैसे": "charge",
    "कितना": "kitna",
    "हायर": "hire",
    "कांटेक्ट": "contact",
    "संपर्क": "contact",
    "फोन": "phone",
    "ईमेल": "email",
};

// Hinglish & informal slang phonetic variations mapped to standard forms
const HINGLISH_SLANG_MAP = {
    // Pronouns & Contractions
    "u": "you",
    "ur": "your",
    "r": "are",
    "plz": "please",
    "pls": "please",
    "wanna": "want to",
    "gimme": "give me",
    "lemme": "let me",
    "abt": "about",
    "b/w": "between",

    // Hindi/Hinglish question words & connectives
    "kia": "kya",
    "kaunsa": "konsa",
    "kounsa": "konsa",
    "kon sa": "konsa",
    "kaun sa": "konsa",
    "kaisa": "kaise",
    "kese": "kaise",
    "bare": "baare",
    "baareme": "baare",
    "me": "mein",
    "mai": "mein",
    "hoon": "hoon",
    "hu": "hoon",
    "hun": "hoon",
    "ho": "ho",
    "h": "hai",
    "hein": "hai",
    "he": "hai",
    "tha": "tha",
    "thi": "thi",
    "the": "the",

    // Hindi Verbs
    "btao": "batao",
    "batado": "batao",
    "bataiye": "batao",
    "batana": "batao",
    "bolo": "batao",
    "boliye": "batao",
    "dekhao": "dikhao",
    "dikhado": "dikhao",
    "dikhaye": "dikhao",
    "dikhana": "dikhao",
    "krna": "karna",
    "kregi": "karega",
    "krenge": "karenge",
    "kr": "kar",
    "skta": "sakta",
    "sakte": "sakte",

    // Domain Specific
    "shadi": "wedding",
    "shaadi": "wedding",
    "byah": "wedding",
    "vivah": "wedding",
    "gaana": "music video",
    "gaane": "music video",
    "geet": "music video",
    "cinematograper": "cinematographer",
    "cinematogrpher": "cinematographer",
    "videographer": "cinematographer",
    "cameraman": "cinematographer",
    "cameraperson": "cinematographer",
    "pic": "photo",
    "pics": "photo",
    "vid": "video",
    "vids": "video",

    // Pricing & Booking
    "kharcha": "charge",
    "paise": "charge",
    "paisa": "charge",
    "fees": "charge",
    "rates": "pricing",
    "rate": "pricing",
    "costing": "cost",
};

export const intentNormalizer = {
    /**
     * Cleans and normalizes incoming text for robust rule-based intent matching
     * @param {string} text - Raw input message
     * @returns {object} Normalization result containing cleaned and tokenized outputs
     */
    normalize(text) {
        if (!text || typeof text !== "string") {
            return {
                raw: "",
                cleaned: "",
                normalized: "",
                tokens: [],
                tokenSet: new Set(),
                hasDevanagari: false,
            };
        }

        const raw = text.trim();

        // 1. Check for Devanagari characters
        const devanagariRegex = /[\u0900-\u097F]/;
        const hasDevanagari = devanagariRegex.test(raw);

        // 2. Pre-process Devanagari words if found
        let processedText = raw;
        if (hasDevanagari) {
            for (const [devWord, romanWord] of Object.entries(DEVANAGARI_MAP)) {
                processedText = processedText.replace(new RegExp(devWord, "gi"), romanWord);
            }
        }

        // 3. Lowercase & strip accents / diacritics
        processedText = processedText
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        // 4. Standardize whitespace & trim basic punctuation
        processedText = processedText
            .replace(/[^\w\s\u0900-\u097F₹$€£-]/g, " ")
            .replace(/\s+/g, " ")
            .trim();

        // 5. Tokenize
        const rawTokens = processedText.split(" ").filter(Boolean);

        // 6. Map slang and phonetic variations to canonical tokens
        const normalizedTokens = [];
        for (let i = 0; i < rawTokens.length; i++) {
            const token = rawTokens[i];

            // Check multi-word phrase patterns (e.g. "kaun sa" -> "konsa", "kitna kharcha" -> "charge")
            if (i < rawTokens.length - 1) {
                const twoWord = `${token} ${rawTokens[i + 1]}`;
                if (HINGLISH_SLANG_MAP[twoWord]) {
                    normalizedTokens.push(HINGLISH_SLANG_MAP[twoWord]);
                    i++;
                    continue;
                }
            }

            if (HINGLISH_SLANG_MAP[token]) {
                normalizedTokens.push(HINGLISH_SLANG_MAP[token]);
            } else {
                normalizedTokens.push(token);
            }
        }

        const normalized = normalizedTokens.join(" ");

        return {
            raw,
            cleaned: processedText,
            normalized,
            tokens: normalizedTokens,
            tokenSet: new Set(normalizedTokens),
            hasDevanagari,
        };
    },
};

export default intentNormalizer;

