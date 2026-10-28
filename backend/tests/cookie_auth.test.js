import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/auth.routes.js";
import adminRoutes from "../src/routes/admin.routes.js";
import { pool } from "../src/config/db.js";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "../src/utils/cookies.js";

describe("HttpOnly Cookie-based Authentication Test Suite", () => {
    let server;
    let baseUrl;
    const testEmail = "admin@anuprawat.com";
    const testPassword = "Admin@2026!";

    before(async () => {
        const app = express();
        app.use(express.json());
        app.use(cookieParser());
        app.use("/api/auth", authRoutes);
        app.use("/api/admin", adminRoutes);

        server = http.createServer(app);
        await new Promise((resolve) => server.listen(0, resolve));
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
    });

    after(async () => {
        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
        await pool.end().catch(() => {});
    });

    let authCookies = [];

    test("1. Login sets HttpOnly cookies and omits accessToken from JSON", async () => {
        const res = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Origin: "http://localhost:3000",
            },
            body: JSON.stringify({ email: testEmail, password: testPassword }),
        });

        assert.equal(res.status, 200);
        const data = await res.json();

        // Verify JSON omits access token and secrets
        assert.equal(data.accessToken, undefined, "accessToken must NOT be in JSON response");
        assert.equal(data.refreshToken, undefined, "refreshToken must NOT be in JSON response");
        assert.equal(data.user.password_hash, undefined, "password_hash must NOT be in JSON response");
        assert.equal(data.user.email, testEmail);
        assert.equal(data.user.role, "admin");

        // Verify HttpOnly cookies
        const setCookieHeaders = res.headers.getSetCookie();
        assert.ok(setCookieHeaders.length >= 2, "Must set both accessToken and refreshToken cookies");

        const accessCookie = setCookieHeaders.find((c) => c.startsWith(`${ACCESS_COOKIE_NAME}=`));
        const refreshCookie = setCookieHeaders.find((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`));

        assert.ok(accessCookie, "accessToken cookie must be present in Set-Cookie header");
        assert.ok(accessCookie.toLowerCase().includes("httponly"), "accessToken cookie must be HttpOnly");
        assert.ok(refreshCookie, "refreshToken cookie must be present in Set-Cookie header");
        assert.ok(refreshCookie.toLowerCase().includes("httponly"), "refreshToken cookie must be HttpOnly");

        authCookies = setCookieHeaders.map((c) => c.split(";")[0]);
    });

    test("2. GET /api/auth/me succeeds with HttpOnly cookie", async () => {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers: {
                Cookie: authCookies.join("; "),
                "X-Requested-With": "XMLHttpRequest",
            },
        });

        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
        assert.equal(data.user.email, testEmail);
        assert.equal(data.user.role, "admin");
    });

    test("3. Protected endpoint fails without cookie (401)", async () => {
        const res = await fetch(`${baseUrl}/api/auth/me`);
        assert.equal(res.status, 401);
        const data = await res.json();
        assert.equal(data.success, false);
    });

    test("4. Protected endpoint fails with tampered/invalid cookie (401)", async () => {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers: {
                Cookie: `${ACCESS_COOKIE_NAME}=invalid.jwt.token`,
            },
        });
        assert.equal(res.status, 401);
    });

    test("5. Role-based Admin route succeeds with admin cookie", async () => {
        const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
            headers: {
                Cookie: authCookies.join("; "),
            },
        });
        assert.equal(res.status, 200);
        const data = await res.json();
        assert.equal(data.success, true);
    });

    test("6. Logout clears cookies and terminates session", async () => {
        const res = await fetch(`${baseUrl}/api/auth/logout`, {
            method: "POST",
            headers: {
                Cookie: authCookies.join("; "),
                Origin: "http://localhost:3000",
            },
        });

        assert.equal(res.status, 200);
        const setCookieHeaders = res.headers.getSetCookie();

        // Verify cookies are expired/cleared
        const accessCookie = setCookieHeaders.find((c) => c.startsWith(`${ACCESS_COOKIE_NAME}=`));
        assert.ok(accessCookie, "Must clear accessToken cookie");
        assert.ok(
            accessCookie.includes("Expires=Thu, 01 Jan 1970") || accessCookie.includes("Max-Age=0"),
            "accessToken cookie must be cleared with past expiry"
        );
    });

    test("7. GET /api/auth/me fails after logout", async () => {
        const res = await fetch(`${baseUrl}/api/auth/me`, {
            headers: {
                Cookie: `${ACCESS_COOKIE_NAME}=; Max-Age=0`,
            },
        });
        assert.equal(res.status, 401);
    });
});
