import crypto from "crypto";

/**
 * Strips dangerous HTML tags and control characters to sanitize visitor inputs
 * @param {string} text - Raw input string
 * @returns {string} - Clean, sanitized string
 */
export const sanitizeChatMessage = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
        .replace(/<[^>]*>?/gm, "") // strip HTML tags
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "") // strip control characters
        .trim();
};

/**
 * Generates a cryptographically secure random token for anonymous visitor conversation ownership
 * @returns {string} - 64-character hex token
 */
export const generateVisitorToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

/**
 * Computes a SHA-256 hash of a session token for secure database storage
 * @param {string} token
 * @returns {string|null}
 */
export const hashSessionToken = (token) => {
    if (!token || typeof token !== "string") return null;
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Validates a plaintext session token against a stored SHA-256 hash in constant time
 * @param {string} providedToken
 * @param {string} storedHash
 * @returns {boolean}
 */
export const verifySessionToken = (providedToken, storedHash) => {
    if (!providedToken || !storedHash) return false;
    const providedHash = hashSessionToken(providedToken);
    try {
        const bufA = Buffer.from(providedHash, "hex");
        const bufB = Buffer.from(storedHash, "hex");
        if (bufA.length !== bufB.length) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    } catch {
        return false;
    }
};

/**
 * Formats a standardized chat message response conforming to API contract
 * @param {object} params
 * @param {string} params.conversationId
 * @param {string} [params.userMessage]
 * @param {string} [params.reply]
 * @param {object|null} [params.intent]
 * @param {object} [params.entities]
 * @param {boolean} [params.requiresClarification]
 * @param {Array} [params.retrievedKnowledge]
 * @param {boolean} [params.hasRelevantKnowledge]
 * @param {Array} [params.actions]
 * @param {Array} [params.suggestions]
 * @returns {object}
 */
export const buildMessageResponse = ({
    conversationId,
    userMessage = "",
    reply = "Thank you for reaching out! I'm Anup Rawat's AI portfolio assistant.",
    intent = null,
    entities = {},
    requiresClarification = false,
    retrievedKnowledge = [],
    hasRelevantKnowledge = false,
    actions = [],
    suggestions = [
        "View Cinematography Showreel",
        "Explore Delhi Metro Transit Line",
        "Read Stories Behind the Frame",
        "Inquire for Narrative Feature / Commercial",
    ],
    fallbackStatus = null,
    conversationState = null,
}) => {
    return {
        conversationId,
        userMessage,
        intent,
        entities,
        requiresClarification,
        retrievedKnowledge,
        hasRelevantKnowledge,
        reply,
        actions,
        suggestions,
        ...(fallbackStatus ? { fallbackStatus } : {}),
        ...(conversationState ? { conversationState } : {}),
    };
};
