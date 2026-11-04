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
    const allowedOrigins = [
        env.FRONTEND_URL?.replace(/\/+$/, ""),
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ].filter(Boolean);

    if (origin) {
        if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
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
            if (
                allowedOrigins.some((allowed) =>
                    refererOrigin.startsWith(allowed)
                )
            ) {
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
