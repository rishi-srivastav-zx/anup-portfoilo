import argon2 from "argon2";
import { pool } from "../config/db.js";
import { userRepository } from "../repositories/user.repository.js";
import { sessionRepository } from "../repositories/session.repository.js";
import {
    generateAccessToken,
    generateOpaqueRefreshToken,
    hashToken,
    calculateRefreshTokenExpiry,
} from "../utils/tokens.js";

// Dummy hash for constant-time comparison when email is not found
const DUMMY_HASH =
    "$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHQxMjM0NTY3OA$9vF+Kz8/wZ5wBwO7q3p2L8V/Q2f7P0m4r1y9Z6x4c2A";

export class AuthError extends Error {
    constructor(message, statusCode = 400, code = "AUTH_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

export const authService = {
    /**
     * Registers a new user with Argon2id password hash and 'user' role
     */
    async register({ name, email, password }) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) {
            throw new AuthError(
                "An account with this email address already exists.",
                409,
                "EMAIL_ALREADY_EXISTS"
            );
        }

        const passwordHash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 65536, // 64 MB
            timeCost: 3,
            parallelism: 4,
        });

        const user = await userRepository.create({
            name,
            email,
            passwordHash,
            role: "user", // Enforced server-side: no client can register as admin
        });

        return user;
    },

    /**
     * Authenticates user, creates session, and returns access token + refresh token
     */
    async login({ email, password, userAgent, ipAddress }) {
        const user = await userRepository.findByEmail(email);

        // Mitigate user enumeration timing attacks
        if (!user) {
            await argon2.verify(DUMMY_HASH, password).catch(() => {});
            throw new AuthError(
                "Invalid email or password.",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        const isPasswordValid = await argon2.verify(user.password_hash, password);
        if (!isPasswordValid) {
            throw new AuthError(
                "Invalid email or password.",
                401,
                "INVALID_CREDENTIALS"
            );
        }

        if (!user.is_active) {
            throw new AuthError(
                "Your account is inactive or disabled. Please contact an administrator.",
                403,
                "ACCOUNT_DEACTIVATED"
            );
        }

        // Update last login timestamp asynchronously
        userRepository.updateLastLogin(user.id).catch((err) => {
            console.error("Failed to update last login timestamp:", err.message);
        });

        // Generate opaque refresh token and store only its cryptographic hash
        const rawRefreshToken = generateOpaqueRefreshToken();
        const refreshTokenHash = hashToken(rawRefreshToken);
        const expiresAt = calculateRefreshTokenExpiry();

        const session = await sessionRepository.create({
            userId: user.id,
            refreshTokenHash,
            expiresAt,
            userAgent,
            ipAddress,
        });

        // Issue access token
        const accessToken = generateAccessToken({
            userId: user.id,
            role: user.role,
            sessionId: session.id,
        });

        const { password_hash, ...sanitizedUser } = user;

        return {
            user: sanitizedUser,
            accessToken,
            refreshToken: rawRefreshToken,
        };
    },

    /**
     * Rotates refresh token within a row-locking transaction to safely handle concurrent requests
     */
    async refresh({ refreshToken, userAgent, ipAddress }) {
        if (!refreshToken) {
            throw new AuthError(
                "Refresh token is required.",
                401,
                "REFRESH_TOKEN_REQUIRED"
            );
        }

        const tokenHash = hashToken(refreshToken);
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Row-level lock to prevent concurrent token rotation race conditions
            const session = await sessionRepository.findByTokenHashWithLock(
                client,
                tokenHash
            );

            if (!session) {
                await client.query("ROLLBACK");
                throw new AuthError(
                    "Invalid or expired session.",
                    401,
                    "SESSION_NOT_FOUND"
                );
            }

            // Detect token reuse or revoked session
            if (session.is_revoked) {
                // Potential token theft: invalidate all sessions for safety
                await sessionRepository.revokeAllForUser(session.user_id, client);
                await client.query("COMMIT");
                throw new AuthError(
                    "Token reuse detected. All active sessions have been invalidated for security.",
                    401,
                    "TOKEN_REUSE_DETECTED"
                );
            }

            // Check expiration
            if (new Date(session.expires_at) < new Date()) {
                await sessionRepository.revoke(session.id, client);
                await client.query("COMMIT");
                throw new AuthError(
                    "Session has expired. Please log in again.",
                    401,
                    "SESSION_EXPIRED"
                );
            }

            // Verify associated user is still valid and active
            const user = await userRepository.findById(session.user_id, client);
            if (!user || !user.is_active) {
                await sessionRepository.revoke(session.id, client);
                await client.query("COMMIT");
                throw new AuthError(
                    "User account is not accessible.",
                    401,
                    "USER_INACCESSIBLE"
                );
            }

            // Secure Rotation: Generate new token, replace hash, extend expiry
            const newRawRefreshToken = generateOpaqueRefreshToken();
            const newRefreshTokenHash = hashToken(newRawRefreshToken);
            const newExpiresAt = calculateRefreshTokenExpiry();

            await sessionRepository.rotateSessionToken(
                client,
                session.id,
                newRefreshTokenHash,
                newExpiresAt
            );

            await client.query("COMMIT");

            // Issue new access token
            const accessToken = generateAccessToken({
                userId: user.id,
                role: user.role,
                sessionId: session.id,
            });

            return {
                user,
                accessToken,
                refreshToken: newRawRefreshToken,
            };
        } catch (error) {
            await client.query("ROLLBACK").catch(() => {});
            throw error;
        } finally {
            client.release();
        }
    },

    /**
     * Idempotently revokes the current session
     */
    async logout({ sessionId, refreshToken }) {
        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);
            const client = await pool.connect();
            try {
                const session = await sessionRepository.findByTokenHashWithLock(
                    client,
                    tokenHash
                );
                if (session) {
                    await sessionRepository.revoke(session.id, client);
                }
            } catch (err) {
                // Idempotent: log and continue
                console.error("Logout session revocation error:", err.message);
            } finally {
                client.release();
            }
        } else if (sessionId) {
            await sessionRepository.revoke(sessionId).catch(() => {});
        }
    },

    /**
     * Revokes all sessions belonging to the user
     */
    async logoutAll(userId) {
        await sessionRepository.revokeAllForUser(userId);
    },

    /**
     * Retrieves sanitized current user by ID
     */
    async getCurrentUser(userId) {
        const user = await userRepository.findById(userId);
        if (!user || !user.is_active) {
            throw new AuthError("User not found or inactive", 404, "USER_NOT_FOUND");
        }
        return user;
    },
};
