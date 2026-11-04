import { env } from "../config/env.js";

export const ACCESS_COOKIE_NAME = "accessToken";
export const REFRESH_COOKIE_NAME = "refreshToken";

/**
 * Parses time strings like "15m", "1h", "24h", "7d", "900s" to milliseconds
 * @param {string|number} expiresIn
 * @returns {number} milliseconds
 */
const parseExpiresInMs = (expiresIn) => {
    if (typeof expiresIn === "number") return expiresIn * 1000;
    if (typeof expiresIn !== "string") return 24 * 60 * 60 * 1000;
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 24 * 60 * 60 * 1000;
    const val = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case "s":
            return val * 1000;
        case "m":
            return val * 60 * 1000;
        case "h":
            return val * 60 * 60 * 1000;
        case "d":
            return val * 24 * 60 * 60 * 1000;
        default:
            return 24 * 60 * 60 * 1000;
    }
};

/**
 * Returns options for the HttpOnly access token cookie
 * @returns {import('express').CookieOptions}
 */
export const getAccessCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: parseExpiresInMs(env.ACCESS_TOKEN_EXPIRES_IN),
});

/**
 * Returns options for the HttpOnly refresh token cookie
 * @returns {import('express').CookieOptions}
 */
export const getRefreshCookieOptions = () => ({
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
});

/**
 * Attaches the access token cookie to the response
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setAccessTokenCookie = (res, token) => {
    res.cookie(ACCESS_COOKIE_NAME, token, getAccessCookieOptions());
};

/**
 * Attaches the refresh token cookie to the response
 * @param {import('express').Response} res
 * @param {string} token
 */
export const setRefreshTokenCookie = (res, token) => {
    res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
};

/**
 * Clears the access token cookie with matching attributes
 * @param {import('express').Response} res
 */
export const clearAccessTokenCookie = (res) => {
    res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });
};

/**
 * Clears the refresh token cookie with matching attributes
 * @param {import('express').Response} res
 */
export const clearRefreshTokenCookie = (res) => {
    res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
    });
};

/**
 * Clears both authentication cookies
 * @param {import('express').Response} res
 */
export const clearAuthCookies = (res) => {
    clearAccessTokenCookie(res);
    clearRefreshTokenCookie(res);
};
