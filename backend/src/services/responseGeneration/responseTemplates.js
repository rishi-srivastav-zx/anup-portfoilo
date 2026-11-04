/**
 * Response Templates & Natural Language Formatter
 * Step 7: Response Generation Engine for Anup Rawat Portfolio AI Assistant
 * 
 * Generates grounded, friendly, professional responses representing cinematographer Anup Rawat.
 * 
 * STRICT GROUNDING RULE:
 * Every factual statement about projects, camera gear, services, or biography MUST be drawn
 * strictly from the verified knowledge record passed to the formatter. Templates never invent facts.
 */

import { INTENTS } from "../../modules/intent/intent.constants.js";
import { SUPPORTED_LANGUAGES } from "./languageDetector.js";

/**
 * Cleanly truncates or extracts the most pertinent sentence from a knowledge content body
 */
export const extractCoreSnippet = (content, maxSentences = 3) => {
    if (!content || typeof content !== "string") return "";
    const cleaned = content.replace(/\s+/g, " ").trim();
    const sentences = cleaned.split(/(?<=[.!?])\s+/);
    return sentences.slice(0, maxSentences).join(" ");
};

export const responseTemplates = {
    /**
     * Formats greeting responses
     */
    formatGreeting(language = SUPPORTED_LANGUAGES.ENGLISH) {
        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return "नमस्ते! अनूप रावत के सिनेमैटोग्राफी पोर्टफोलियो में आपका स्वागत है। मैं अनूप की फिल्मों, कैमरा गियर या प्रोजेक्ट पूछताछ में आपकी क्या मदद कर सकता हूँ?";
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return "Namaste! Anup Rawat ke cinematography portfolio par aapka swagat hai. Main Anup ke films, camera packages, ya project inquiries mein aapki kaise madad kar sakta hoon?";
        }
        return "Hello! Welcome to Anup Rawat's cinematography portfolio. I can assist you with details regarding Anup's visual projects, camera gear packages, cinematography services, or booking inquiries.";
    },

    /**
     * Formats responses when no relevant knowledge was found in published database
     */
    formatFallback(language = SUPPORTED_LANGUAGES.ENGLISH) {
        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return "मुझे वर्तमान में अनूप के प्रकाशित पोर्टफोलियो में इसके बारे में विशिष्ट जानकारी नहीं मिली। क्या आप सीधे अनूप से संपर्क करना चाहते हैं या किसी अन्य प्रोजेक्ट के बारे में पूछना चाहते हैं?";
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return "Mujhe Anup ke published portfolio mein iske baare mein abhi verified jaankari nahi mili. Aap Anup se direct contact kar sakte hain ya kisi dusre project ya camera setup ke baare mein pooch sakte hain.";
        }
        return "I don't have verified details about that in Anup's published portfolio at the moment. Would you like to get in touch with Anup directly or inquire about his available cinematography work and camera setups?";
    },

    /**
     * Formats camera and gear inquiry responses strictly grounded in the retrieved record
     */
    formatCameraEquipment(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const snippet = extractCoreSnippet(record.content);
        const title = record.title || "Camera Package";

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return `अनूप के कैमरा सेटअप के बारे में जानकारी:\n\n${snippet}`;
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return `Anup ke camera setup aur gear ke baare mein verified jaankari yeh hai:\n\n${snippet}`;
        }
        return `Here are the details regarding Anup Rawat's camera and production setup:\n\n${snippet}`;
    },

    /**
     * Formats project and portfolio inquiry responses strictly grounded in the retrieved record
     */
    formatPortfolioProject(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const title = record.project_name || record.title;
        const snippet = extractCoreSnippet(record.content);

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return `प्रोजेक्ट "${title}" के बारे में:\n\n${snippet}`;
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return `"${title}" project ke baare mein verified details yeh hain:\n\n${snippet}`;
        }
        return `Here is the case study for "${title}":\n\n${snippet}`;
    },

    /**
     * Formats biographical and personal information responses
     */
    formatAboutPerson(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const snippet = extractCoreSnippet(record.content);

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return `अनूप रावत के बारे में:\n\n${snippet}`;
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return `Anup Rawat ke baare mein profile jaankari:\n\n${snippet}`;
        }
        return `Here is Anup Rawat's professional profile:\n\n${snippet}`;
    },

    /**
     * Formats cinematography services inquiry responses
     */
    formatServices(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const snippet = extractCoreSnippet(record.content);

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return `अनूप रावत द्वारा प्रदान की जाने वाली सिनेमैटोग्राफी सेवाएं:\n\n${snippet}`;
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return `Anup Rawat ki cinematography services ke baare mein jaankari:\n\n${snippet}`;
        }
        return `Here is information regarding Anup Rawat's cinematography services:\n\n${snippet}`;
    },

    /**
     * Formats pricing, rates, and booking inquiries
     */
    formatPricingAndBooking(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const snippet = extractCoreSnippet(record.content);

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return `सिनेमैटोग्राफी दरों और पैकेजों के बारे में जानकारी:\n\n${snippet}\n\nविशिष्ट प्रोजेक्ट दरों और शूटिंग उपलब्धता के लिए आप अपनी आवश्यकताएं साझा कर सकते हैं।`;
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return `Pricing aur packages ke baare mein verified jaankari:\n\n${snippet}\n\nSpecific production timelines aur shooting availability ke liye aap apne project details share kar sakte hain.`;
        }
        return `Here is information on cinematography pricing and day rate structures:\n\n${snippet}\n\nFor customized project quotes, shooting schedules, or commercial proposals, feel free to reach out directly with your project requirements.`;
    },

    /**
     * Formats contact information responses
     */
    formatContact(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const snippet = record?.content ? extractCoreSnippet(record.content) : "";

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return snippet
                ? `संपर्क विवरण:\n\n${snippet}`
                : "आप अनूप रावत से प्रोजेक्ट चर्चा, सहयोग या बुकिंग के लिए सीधे संपर्क कर सकते हैं।";
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return snippet
                ? `Contact information:\n\n${snippet}`
                : "Aap Anup Rawat se commercial films, TVCs, ya collaborations ke liye directly sampark kar sakte hain.";
        }
        return snippet
            ? `Contact details:\n\n${snippet}`
            : "You can reach out directly to Anup Rawat for narrative features, commercial shoots, or collaboration inquiries.";
    },

    /**
     * Formats general question with verified knowledge
     */
    formatGeneralKnowledge(record, language = SUPPORTED_LANGUAGES.ENGLISH) {
        const snippet = extractCoreSnippet(record.content);
        const title = record.title || "Portfolio Information";

        if (language === SUPPORTED_LANGUAGES.HINDI) {
            return `${title}:\n\n${snippet}`;
        }
        if (language === SUPPORTED_LANGUAGES.HINGLISH) {
            return `${title} ke baare mein:\n\n${snippet}`;
        }
        return `${title}:\n\n${snippet}`;
    },
};

export default responseTemplates;

