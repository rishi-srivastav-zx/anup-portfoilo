import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Signs a short-lived access JWT
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.role
 * @param {string} params.sessionId
 * @returns {string} Signed JWT
 */
export const generateAccessToken = ({ userId, role, sessionId }) => {
    return jwt.sign(
        {
            sub: userId,
            role,
            sid: sessionId,
            type: "access",
        },
        env.ACCESS_TOKEN_SECRET,
        {
            algorithm: "HS256",
            expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
            issuer: env.ACCESS_TOKEN_ISSUER,
            audience: env.ACCESS_TOKEN_AUDIENCE,
        }
    );
};

/**
 * Verifies access JWT signature, algorithm, issuer, audience and token type
 * @param {string} token
 * @returns {Object} decoded payload
 */
export const verifyAccessToken = (token) => {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET, {
        algorithms: ["HS256"],
        issuer: env.ACCESS_TOKEN_ISSUER,
        audience: env.ACCESS_TOKEN_AUDIENCE,
    });

    if (payload.type !== "access") {
        throw new Error("Invalid token type");
    }

    return payload;
};

/**
 * Generates a cryptographically secure opaque refresh token string
 * @returns {string} 80-char hex string
 */
export const generateOpaqueRefreshToken = () => {
    return crypto.randomBytes(40).toString("hex");
};

/**
 * Hashes a token using SHA-256 before database storage or lookup
 * @param {string} token
 * @returns {string} Hex SHA-256 hash
 */
export const hashToken = (token) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

/**
 * Calculates the expiration date for a refresh token
 * @returns {Date}
 */
export const calculateRefreshTokenExpiry = () => {
    return new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
};
