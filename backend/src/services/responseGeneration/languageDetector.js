/**
 * Language Detector for Response Generation
 * Step 7: Response Generation Engine for Anup Rawat Portfolio AI Assistant
 * 
 * Detects whether the visitor is writing in English, Hindi (Devanagari), or Hinglish (Romanized Hindi).
 */

const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

const HINGLISH_MARKERS = [
    /\b(kya|kia)\b/i,
    /\b(konsa|kaunsa|kounsa|kon sa|kaun sa)\b/i,
    /\b(karta|karte|karega|karenge|karna|kar rahe|karte ho|karta hai)\b/i,
    /\b(hai|hain|ho|hoon|tha|thi|the)\b/i,
    /\b(batao|bataye|batado|bolo|boliye)\b/i,
    /\b(dikhao|dikhaye|dikhado|dekho)\b/i,
    /\b(shadi|shaadi|byah|vivah)\b/i,
    /\b(kaam|films banayi|shoot karte)\b/i,
    /\b(kaise|kaisa|kese)\b/i,
    /\b(apna|apne|apni)\b/i,
    /\b(baare mein|baare me|bare me)\b/i,
    /\b(mujhe|humko|humein|mera|meri)\b/i,
    /\b(chahiye|mangta|hoga|hogi)\b/i,
    /\b(kitna|kitne|kharcha|paisa|paise)\b/i,
    /\b(kripya|sampark|baat karni)\b/i,
];

export const SUPPORTED_LANGUAGES = Object.freeze({
    ENGLISH: "english",
    HINGLISH: "hinglish",
    HINDI: "hindi",
});

export const languageDetector = {
    /**
     * Determines language of visitor input text
     * @param {string} text
     * @returns {"english" | "hinglish" | "hindi"}
     */
    detect(text) {
        if (!text || typeof text !== "string") {
            return SUPPORTED_LANGUAGES.ENGLISH;
        }

        // 1. Devanagari script presence
        if (DEVANAGARI_REGEX.test(text)) {
            return SUPPORTED_LANGUAGES.HINDI;
        }

        // 2. Romanized Hindi (Hinglish) pattern matches
        for (const pattern of HINGLISH_MARKERS) {
            if (pattern.test(text)) {
                return SUPPORTED_LANGUAGES.HINGLISH;
            }
        }

        return SUPPORTED_LANGUAGES.ENGLISH;
    },
};

export default languageDetector;

