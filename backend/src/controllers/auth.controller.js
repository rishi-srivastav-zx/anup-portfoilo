import { authService } from "../services/auth.service.js";
import {
    setAccessTokenCookie,
    setRefreshTokenCookie,
    clearAuthCookies,
    REFRESH_COOKIE_NAME,
} from "../utils/cookies.js";

/**
 * Sanitizes user record to return only safe public profile fields
 */
const sanitizeUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
});

export const authController = {
    /**
     * POST /api/auth/register
     */
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.register({ name, email, password });

            res.status(201).json({
                success: true,
                message: "Account created successfully.",
                user: sanitizeUser(user),
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/login
     */
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userAgent = req.headers["user-agent"];
            const ipAddress = req.ip || req.socket.remoteAddress;

            const { user, accessToken, refreshToken } = await authService.login({
                email,
                password,
                userAgent,
                ipAddress,
            });

            // Set secure HttpOnly cookies for both access token and refresh token
            setAccessTokenCookie(res, accessToken);
            setRefreshTokenCookie(res, refreshToken);

            // Return safe user information only — no tokens, secrets, or password hashes
            res.status(200).json({
                success: true,
                message: "Authentication successful.",
                user: sanitizeUser(user),
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * POST /api/auth/refresh
     */
    async refresh(req, res, next) {
        try {
            const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
            const userAgent = req.headers["user-agent"];
            const ipAddress = req.ip || req.socket.remoteAddress;

            const { user, accessToken, refreshToken: newRefreshToken } =
                await authService.refresh({
                    refreshToken,
                    userAgent,
                    ipAddress,
                });

            // Set rotated access token and refresh token HttpOnly cookies
            setAccessTokenCookie(res, accessToken);
            setRefreshTokenCookie(res, newRefreshToken);

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully.",
                user: sanitizeUser(user),
            });
        } catch (error) {
            // Only clear cookies if the failure is definitively an authentication error (401),
            // and NOT on temporary database disconnects, lock timeouts, or 5xx server errors
            if (error?.statusCode === 401) {
                clearAuthCookies(res);
            }
            next(error);
        }
    },

    /**
     * POST /api/auth/logout
     */
    async logout(req, res, next) {
        try {
            const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];
            const sessionId = req.session?.id;

            await authService.logout({ sessionId, refreshToken });
            clearAuthCookies(res);

            res.status(200).json({
                success: true,
                message: "Logged out successfully.",
            });
        } catch (error) {
            clearAuthCookies(res);
            next(error);
        }
    },

    /**
     * POST /api/auth/logout-all
     */
    async logoutAll(req, res, next) {
        try {
            await authService.logoutAll(req.user.id);
            clearAuthCookies(res);

            res.status(200).json({
                success: true,
                message: "All sessions have been revoked.",
            });
        } catch (error) {
            clearAuthCookies(res);
            next(error);
        }
    },

    /**
     * GET /api/auth/me
     */
    async me(req, res) {
        res.status(200).json({
            success: true,
            user: sanitizeUser(req.user),
        });
    },
};
