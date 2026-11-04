/**
 * Search Query Expander & Multilingual Normalizer
 * Step 6: Smart Search Engine for Cinematographer Portfolio AI Assistant
 */

import { intentNormalizer } from "../../modules/intent/intent.normalizer.js";
import {
    CINEMATOGRAPHY_SYNONYMS,
    HINDI_HINGLISH_STOPWORDS,
} from "../../constants/smartSearch.constants.js";
import { stemWord, tokenizeText } from "../knowledgeRetrieval/knowledgeScorer.js";

// Additional domain specific transliterations & typos for Cinematography
const DOMAIN_TRANSLITERATION_MAP = {
    "उपकरण": "equipment",
    "काम": "work",
    "फिल्म": "film",
    "प्रोजेक्ट": "project",
    "दाम": "pricing",
    "खर्च": "pricing",
    "शूट": "shoot",
    "तस्वीर": "photo",
    "सेटअप": "setup",
};

export const searchQueryExpander = {
    /**
     * Expands and normalizes an incoming user query across English, Hindi, and Hinglish
     * @param {string} rawQuery
     * @returns {object}
     */
    expand(rawQuery) {
        if (!rawQuery || typeof rawQuery !== "string") {
            return {
                originalQuery: "",
                normalizedQuery: "",
                coreKeywords: [],
                expandedTerms: [],
                searchTokens: [],
            };
        }

        // 1. Step 3 Normalizer (Handles Devanagari transliteration, typo fixes, Hinglish slang)
        const normalizedResult = intentNormalizer.normalize(rawQuery);
        let normalized = typeof normalizedResult === "string" ? normalizedResult : (normalizedResult?.normalized || rawQuery);

        // 2. Extra domain-specific transliteration passes
        for (const [hindiTerm, englishTerm] of Object.entries(DOMAIN_TRANSLITERATION_MAP)) {
            if (rawQuery.includes(hindiTerm)) {
                normalized += ` ${englishTerm}`;
            }
        }

        // 3. Tokenize and filter out both English & Hindi/Hinglish stop words
        const allTokens = tokenizeText(normalized);
        const coreKeywords = allTokens.filter(
            (token) => !HINDI_HINGLISH_STOPWORDS.has(token.toLowerCase()) && token.length > 1
        );

        // 4. Synonym Expansion
        const expandedTermsSet = new Set();
        for (const word of coreKeywords) {
            const lower = word.toLowerCase();
            const stemmed = stemWord(lower);

            // Direct synonyms
            if (CINEMATOGRAPHY_SYNONYMS[lower]) {
                for (const syn of CINEMATOGRAPHY_SYNONYMS[lower]) {
                    expandedTermsSet.add(syn);
                }
            }
            if (CINEMATOGRAPHY_SYNONYMS[stemmed]) {
                for (const syn of CINEMATOGRAPHY_SYNONYMS[stemmed]) {
                    expandedTermsSet.add(syn);
                }
            }
        }

        // 5. Gather unique search tokens
        const searchTokens = Array.from(
            new Set([
                ...coreKeywords,
                ...Array.from(expandedTermsSet),
            ])
        );

        return {
            originalQuery: rawQuery.trim(),
            normalizedQuery: normalized.trim(),
            coreKeywords,
            expandedTerms: Array.from(expandedTermsSet),
            searchTokens,
        };
    },
};

export default searchQueryExpander;
