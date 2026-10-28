import { verifyAccessToken } from "../utils/tokens.js";
import { sessionRepository } from "../repositories/session.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { ACCESS_COOKIE_NAME } from "../utils/cookies.js";

/**
 * Authenticates request using HttpOnly Cookie (or Authorization: Bearer fallback)
 * Verifies JWT signature and checks session & user status in PostgreSQL database
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

        // Verify session validity and revocation state in Neon PostgreSQL
        const session = await sessionRepository.findById(payload.sid);
        if (!session || session.is_revoked) {
            return res.status(401).json({
                success: false,
                message: "Session is invalid or has been revoked.",
            });
        }

        if (new Date(session.expires_at) < new Date()) {
            return res.status(401).json({
                success: false,
                message: "Session has expired. Please refresh your session.",
            });
        }

        // Verify user account exists and is active in database — never trust frontend claims
        const user = await userRepository.findById(payload.sub);
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: "User account is disabled or no longer exists.",
            });
        }

        req.user = user;
        req.session = session;
        next();
    } catch (err) {
        console.error("Authentication middleware error:", err.message);
        return res.status(500).json({
            success: false,
            message: "Authentication verification failed.",
        });
    }
};
