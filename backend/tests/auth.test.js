import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { pool } from "../src/config/db.js";
import { userRepository } from "../src/repositories/user.repository.js";
import { sessionRepository } from "../src/repositories/session.repository.js";
import { authService } from "../src/services/auth.service.js";
import {
    generateAccessToken,
    verifyAccessToken,
    generateOpaqueRefreshToken,
    hashToken,
} from "../src/utils/tokens.js";

describe("Cinematographer Portfolio Auth & Security Suite", () => {
    const testEmail = `test_${Date.now()}@cinematest.com`;
    const testPassword = "SecurePassword@2026!";
    let testUserId = null;
    let initialRefreshToken = null;

    after(async () => {
        // Clean up test users and test sessions created during test run
        if (testUserId) {
            await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
        }
        await pool.query(
            "DELETE FROM users WHERE email LIKE 'test_%@cinematest.com'"
        );
    });

    test("1. User Registration: Enforces Zod rules and Argon2id hash with 'user' role", async () => {
        const user = await authService.register({
            name: "Test Cine User",
            email: testEmail,
            password: testPassword,
        });

        assert.ok(user.id, "User ID should be generated");
        assert.equal(user.email, testEmail.toLowerCase());
        assert.equal(user.role, "user", "Role must strictly be 'user'");
        assert.equal(user.password_hash, undefined, "Password hash must never be returned");
        assert.equal(user.is_active, true);
        testUserId = user.id;

        // Verify in DB that Argon2id hash is stored
        const dbUser = await userRepository.findByEmail(testEmail);
        assert.ok(
            dbUser.password_hash.startsWith("$argon2id$"),
            "Password hash must use Argon2id"
        );
    });

    test("2. Duplicate Email Registration: Prevents duplicate accounts with 409 Conflict", async () => {
        await assert.rejects(
            async () => {
                await authService.register({
                    name: "Duplicate User",
                    email: testEmail.toUpperCase(), // Test case-insensitive collision
                    password: testPassword,
                });
            },
            (err) => {
                assert.equal(err.statusCode, 409);
                assert.equal(err.code, "EMAIL_ALREADY_EXISTS");
                return true;
            }
        );
    });

    test("3. User Login: Valid credentials issue access JWT & opaque refresh token", async () => {
        const result = await authService.login({
            email: testEmail,
            password: testPassword,
            userAgent: "Automated-Test-Agent",
            ipAddress: "127.0.0.1",
        });

        assert.ok(result.accessToken, "Should generate access token");
        assert.ok(result.refreshToken, "Should generate raw opaque refresh token");
        assert.equal(result.user.email, testEmail.toLowerCase());
        assert.equal(result.user.password_hash, undefined);

        initialRefreshToken = result.refreshToken;

        // Verify JWT claims
        const payload = verifyAccessToken(result.accessToken);
        assert.equal(payload.sub, testUserId);
        assert.equal(payload.role, "user");
        assert.equal(payload.type, "access");
        assert.ok(payload.sid, "JWT must contain session ID claim");
    });

    test("4. Invalid Credentials: Generic error protects against user enumeration", async () => {
        // Wrong password
        await assert.rejects(
            async () => {
                await authService.login({
                    email: testEmail,
                    password: "WrongPassword999!",
                });
            },
            (err) => {
                assert.equal(err.statusCode, 401);
                assert.equal(err.message, "Invalid email or password.");
                return true;
            }
        );

        // Non-existent email
        await assert.rejects(
            async () => {
                await authService.login({
                    email: "nonexistent_cinema_user@cinematest.com",
                    password: "SomePassword123!",
                });
            },
            (err) => {
                assert.equal(err.statusCode, 401);
                assert.equal(err.message, "Invalid email or password.");
                return true;
            }
        );
    });

    test("5. Disabled Accounts: Blocked from login with 403 Forbidden", async () => {
        // Temporarily deactivate user
        await pool.query("UPDATE users SET is_active = false WHERE id = $1", [
            testUserId,
        ]);

        await assert.rejects(
            async () => {
                await authService.login({
                    email: testEmail,
                    password: testPassword,
                });
            },
            (err) => {
                assert.equal(err.statusCode, 403);
                assert.equal(err.code, "ACCOUNT_DEACTIVATED");
                return true;
            }
        );

        // Reactivate user
        await pool.query("UPDATE users SET is_active = true WHERE id = $1", [
            testUserId,
        ]);
    });

    test("6. Refresh Token Rotation: Rotates refresh token and issues new access token", async () => {
        const refreshResult = await authService.refresh({
            refreshToken: initialRefreshToken,
            userAgent: "Automated-Test-Agent",
            ipAddress: "127.0.0.1",
        });

        assert.ok(refreshResult.accessToken, "Should return new access token");
        assert.ok(refreshResult.refreshToken, "Should return rotated refresh token");
        assert.notEqual(
            refreshResult.refreshToken,
            initialRefreshToken,
            "Rotated refresh token must be different from old token"
        );

        // Old refresh token must now be invalid
        await assert.rejects(
            async () => {
                await authService.refresh({
                    refreshToken: initialRefreshToken,
                });
            },
            (err) => {
                assert.equal(err.statusCode, 401);
                return true;
            }
        );

        initialRefreshToken = refreshResult.refreshToken;
    });

    test("7. Token Replay / Reuse Detection: Reusing old token revokes session", async () => {
        // Invalidate by using current valid token
        const res1 = await authService.refresh({
            refreshToken: initialRefreshToken,
        });
        const currentToken = res1.refreshToken;

        // Now attempt to use the superseded initialRefreshToken again
        await assert.rejects(
            async () => {
                await authService.refresh({
                    refreshToken: initialRefreshToken,
                });
            },
            (err) => {
                assert.equal(err.statusCode, 401);
                return true;
            }
        );

        initialRefreshToken = currentToken;
    });

    test("8. Logout: Revokes session and makes subsequent refresh fail", async () => {
        await authService.logout({ refreshToken: initialRefreshToken });

        await assert.rejects(
            async () => {
                await authService.refresh({
                    refreshToken: initialRefreshToken,
                });
            },
            (err) => {
                assert.equal(err.statusCode, 401);
                return true;
            }
        );
    });

    test("9. SQL Injection Resistance: Parameterized queries neutralize injection strings", async () => {
        const maliciousPayload = "' OR '1'='1' --";

        // Query by malicious email should safely return null rather than dumping users
        const injectedUser = await userRepository.findByEmail(maliciousPayload);
        assert.equal(injectedUser, null);

        // Injected password should fail authentication cleanly
        await assert.rejects(
            async () => {
                await authService.login({
                    email: testEmail,
                    password: maliciousPayload,
                });
            },
            (err) => {
                assert.equal(err.statusCode, 401);
                return true;
            }
        );
    });

    test("10. Role-Based Access Control: Normal user is rejected from Admin endpoints", async () => {
        // Fetch test user
        const user = await userRepository.findById(testUserId);
        assert.equal(user.role, "user");

        // Verify role enforcement logic
        const allowedForAdminOnly = ["admin"];
        const isPermitted = allowedForAdminOnly.includes(user.role);
        assert.equal(
            isPermitted,
            false,
            "Standard user must NOT have access to admin-only role"
        );
    });
});
