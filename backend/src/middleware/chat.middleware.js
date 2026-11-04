/**
 * Chat-specific middleware for security, token extraction, and payload protection
 */

/**
 * Extracts anonymous visitor token from headers or body
 * Supports 'x-visitor-token' and 'x-chat-token'
 */
export const extractVisitorToken = (req, res, next) => {
    const token =
        req.headers["x-visitor-token"] ||
        req.headers["x-chat-token"] ||
        req.body?.visitorToken ||
        null;

    req.visitorToken = typeof token === "string" ? token.trim() : null;
    next();
};

/**
 * Enforces maximum body size specifically for chat text payloads
 * Prevents memory exhaustion attacks
 */
export const enforceChatPayloadLimit = (maxBytes = 16 * 1024) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers["content-length"] || "0", 10);
        if (contentLength > maxBytes) {
            return res.status(413).json({
                success: false,
                message: `Chat payload too large. Maximum allowed size is ${maxBytes / 1024}KB.`,
                code: "PAYLOAD_TOO_LARGE",
            });
        }
        next();
    };
};

