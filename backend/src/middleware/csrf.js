import { env } from "../config/env.js";

/**
 * Validates request Origin and Referer headers against trusted frontend origins
 * to prevent Cross-Site Request Forgery (CSRF) on state-changing requests.
 */
export const verifyCsrfOrigin = (req, res, next) => {
    // Only check mutating requests (POST, PUT, PATCH, DELETE)
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Allowed origins: configured frontend URL and local dev URLs
    const configuredOrigins = (env.FRONTEND_URL || "")
        .split(",")
        .map((url) => url.trim().replace(/\/+$/, ""))
        .filter(Boolean);

    const allowedOrigins = Array.from(
        new Set([
            ...configuredOrigins,
            "https://anuprawatstudio.vercel.app",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
        ])
    );

    const isPermittedOrigin = (candidate) => {
        if (!candidate) return false;
        const clean = candidate.trim().replace(/\/+$/, "");
        if (allowedOrigins.some((allowed) => clean.startsWith(allowed))) return true;
        if (clean === "https://anuprawatstudio.vercel.app" || clean.endsWith(".vercel.app")) return true;
        if (env.NODE_ENV !== "production" && (clean.includes("localhost") || clean.includes("127.0.0.1"))) return true;
        return false;
    };

    if (origin) {
        if (isPermittedOrigin(origin)) {
            return next();
        }
        return res.status(403).json({
            success: false,
            message: "CSRF verification failed: Origin not permitted.",
        });
    }

    if (referer) {
        try {
            const refererUrl = new URL(referer);
            const refererOrigin = refererUrl.origin;
            if (isPermittedOrigin(refererOrigin)) {
                return next();
            }
        } catch {
            // Malformed referer
        }
        return res.status(403).json({
            success: false,
            message: "CSRF verification failed: Referer not permitted.",
        });
    }

    // In production with authentication cookies present, reject requests without Origin or Referer
    if (
        req.cookies &&
        (req.cookies.accessToken || req.cookies.refreshToken) &&
        env.NODE_ENV === "production"
    ) {
        return res.status(403).json({
            success: false,
            message: "CSRF verification failed: Origin or Referer header required.",
        });
    }

    next();
};
