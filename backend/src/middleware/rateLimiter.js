import rateLimit from "express-rate-limit";

export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many login attempts. Please try again after 15 minutes.",
    },
});

export const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 registration requests per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message:
            "Too many accounts created from this IP. Please try again later.",
    },
});

export const authGeneralLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
});

export const enquiryRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 inquiry submissions per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many project inquiries submitted from this IP. Please wait a few minutes before trying again.",
    },
});

export const chatMessageLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 40, // Limit each IP to 40 chat messages per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many chat messages sent. Please wait a moment before sending more.",
    },
});

export const chatConversationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 conversation creations per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many conversations initiated from this IP. Please wait before creating a new one.",
    },
});
