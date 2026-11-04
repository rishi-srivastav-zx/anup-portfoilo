import { verifyAccessToken } from "../utils/tokens.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { ACCESS_COOKIE_NAME } from "../utils/cookies.js";

/**
 * Authenticates request using HttpOnly Cookie (or Authorization: Bearer fallback)
 * Verifies JWT signature and checks session & user status via a single SQL JOIN in Neon PostgreSQL
 */
export const authenticate = async (req, res, next) => {
    try {
        // Read access token primarily from the secure HttpOnly cookie
        let token = req.cookies?.[ACCESS_COOKIE_NAME];

        // Optional fallback: support Authorization header if provided
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Authentication cookie missing.",
            });
        }

        let payload;

        try {
            payload = verifyAccessToken(token);
        } catch (jwtErr) {
            return res.status(401).json({
                success: false,
                message:
                    jwtErr.name === "TokenExpiredError"
                        ? "Access token has expired."
                        : "Invalid access token.",
            });
        }

        // Single SQL JOIN query replaces sequential session and user lookups
        const authData = await sessionRepository.findSessionWithUser(payload.sid);

        // Verify session validity and revocation state
        if (!authData || !authData.session || authData.session.is_revoked) {
            return res.status(401).json({
                success: false,
                message: "Session is invalid or has been revoked.",
            });
        }

        if (new Date(authData.session.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                message: "Session has expired. Please refresh your session.",
            });
        }

        // Verify user account exists, is active in database, and matches JWT subject
        if (
            !authData.user ||
            !authData.user.is_active ||
            authData.session.user_id !== payload.sub
        ) {
            return res.status(401).json({
                success: false,
                message: "User account is disabled or no longer exists.",
            });
        }

        // Ensure authenticated responses are never cached by intermediate proxies or browser cache
        res.setHeader(
            "Cache-Control",
            "private, no-cache, no-store, must-revalidate"
        );

        req.user = authData.user;
        req.session = authData.session;
        next();
    } catch (err) {
        console.error("Authentication middleware error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Authentication verification failed.",
        });
    }
};
