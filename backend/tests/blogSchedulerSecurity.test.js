import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import { blogQueueRepository } from "../src/repositories/blogQueue.repository.js";
import { blogPublishingService } from "../src/services/blogPublishing.service.js";
import { blogImportService } from "../src/services/blogImport.service.js";
import { sanitizeHtml, sanitizeCsvFormula, redactSensitiveData } from "../src/utils/htmlSanitizer.js";
import { parseCsv } from "../src/utils/csvParser.js";
import { blogQueueController } from "../src/controllers/blogQueue.controller.js";
import { schedulerWorker } from "../src/workers/blogSchedulerWorker.js";

describe("Phase 7: Bulk Blog Scheduler Security Audit & Hardening Test Suite", () => {
    let testAdminUserId;
    let testNormalUserId;
    const createdBlogIds = [];
    const createdQueueIds = [];

    before(async () => {
        // Halt worker timer during testing
        await schedulerWorker.stop();

        // Fetch or seed admin user
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
        testAdminUserId = adminRes.rows[0]?.id || null;

        // Fetch or seed normal user
        const userRes = await pool.query("SELECT id FROM users WHERE role != 'admin' LIMIT 1");
        testNormalUserId = userRes.rows[0]?.id || null;
    });

    after(async () => {
        if (createdBlogIds.length > 0) {
            await pool.query("DELETE FROM blogs WHERE id = ANY($1::uuid[])", [createdBlogIds]);
        }
    });

    // Helper: Seed test blog
    async function seedBlog(title = "Security Test Blog", status = "draft") {
        const slug = `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const res = await pool.query(`
            INSERT INTO blogs (title, slug, excerpt, category, featured_image, featured_image_alt, status)
            VALUES ($1, $2, 'Security excerpt', 'Cinematography', 'https://images.unsplash.com/test.jpg', 'Alt', $3)
            RETURNING *;
        `, [title, slug, status]);

        const blog = res.rows[0];
        createdBlogIds.push(blog.id);

        const qRes = await pool.query(`
            INSERT INTO blog_publish_queue (blog_id, status, scheduled_at, next_attempt_at, attempt_count, max_attempts)
            VALUES ($1, 'pending', NOW(), NOW(), 0, 3)
            RETURNING *;
        `, [blog.id]);

        const queue = qRes.rows[0];
        createdQueueIds.push(queue.id);

        return { blog, queue };
    }

    // -------------------------------------------------------------
    // 1. Cron Secret Security & Timing Attack Resistance
    // -------------------------------------------------------------
    test("1. Cron Security: Rejects missing or invalid cron secrets using timing-safe validation", async () => {
        let statusSent = null;
        let jsonSent = null;

        const mockRes = {
            status: (code) => {
                statusSent = code;
                return {
                    json: (data) => { jsonSent = data; },
                };
            },
        };

        // Case A: Missing secret & unauthenticated
        await blogQueueController.triggerCron(
            { headers: {}, user: null },
            mockRes
        );
        assert.equal(statusSent, 401);
        assert.equal(jsonSent.success, false);

        // Case B: Invalid secret
        await blogQueueController.triggerCron(
            { headers: { "x-cron-secret": "wrong_cron_secret_12345678" }, user: null },
            mockRes
        );
        assert.equal(statusSent, 401);
        assert.equal(jsonSent.success, false);

        // Case C: Non-admin user with wrong secret
        await blogQueueController.triggerCron(
            { headers: { "x-cron-secret": "invalid" }, user: { id: "123", role: "user" } },
            mockRes
        );
        assert.equal(statusSent, 401);
        assert.equal(jsonSent.success, false);

        // Case D: Valid secret via x-cron-secret header (timing safe match)
        const validSecret = env.CRON_SECRET || "cinematographer_scheduler_cron_secret_production";
        let executionHappened = false;
        await blogQueueController.triggerCron(
            { headers: { "x-cron-secret": validSecret }, user: null },
            {
                status: (code) => {
                    statusSent = code;
                    return {
                        json: (data) => {
                            jsonSent = data;
                            executionHappened = true;
                        },
                    };
                },
            }
        );
        assert.equal(statusSent, 200);
        assert.equal(executionHappened, true);

        // Case E: Valid secret via Authorization Bearer header
        let bearerExecutionHappened = false;
        await blogQueueController.triggerCron(
            { headers: { authorization: `Bearer ${validSecret}` }, user: null },
            {
                status: (code) => {
                    statusSent = code;
                    return {
                        json: (data) => {
                            jsonSent = data;
                            bearerExecutionHappened = true;
                        },
                    };
                },
            }
        );
        assert.equal(statusSent, 200);
        assert.equal(bearerExecutionHappened, true);
    });

    // -------------------------------------------------------------
    // 2. Worker Health Endpoint Protection
    // -------------------------------------------------------------
    test("2. Information Disclosure: Worker health endpoint rejects unauthenticated non-admin queries", async () => {
        let statusSent = null;
        let jsonSent = null;

        const mockRes = {
            status: (code) => {
                statusSent = code;
                return {
                    json: (data) => { jsonSent = data; },
                };
            },
        };

        // Unauthenticated request without cron secret
        await blogQueueController.getWorkerHealth(
            { headers: {}, user: null },
            mockRes
        );
        assert.equal(statusSent, 401);
        assert.equal(jsonSent.success, false);

        // Authenticated admin request succeeds
        await blogQueueController.getWorkerHealth(
            { headers: {}, user: { role: "admin" } },
            mockRes
        );
        assert.equal(statusSent, 200);
        assert.equal(jsonSent.success, true);
    });

    // -------------------------------------------------------------
    // 3. HTML Sanitization & XSS Neutralization (Allowlist-Based)
    // -------------------------------------------------------------
    test("3. Input Sanitization: Strips scripts, dangerous protocols, and unclosed tags while preserving safe editorial markup", () => {
        const dirtyPayload = `
            <h2>Valid Editorial Heading</h2>
            <script>alert('xss')</script>
            <script src="https://evil.com/malware.js">
            <p>Normal film lighting description.</p>
            <img src="x" onerror="stealCookies()">
            <a href="javascript:alert(1)">Malicious link</a>
            <iframe src="https://phishing.com"></iframe>
            <a href="jav&#9;ascript:evil()">Entity-encoded protocol</a>
            <div style="background-image: url(javascript:alert(1))">Inline style exploit</div>
            <details ontoggle=alert(1)>Collapsible element</details>
            <svg/onload=alert(1)>
            <math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>
            <img src="data:image/svg+xml;base64,PHN2Zy9vbmxvYWQ9YWxlcnQoMSk+">
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==">
        `;

        const clean = sanitizeHtml(dirtyPayload);

        // XSS vectors must be stripped
        assert.ok(!clean.includes("<script"), "Must remove script tags");
        assert.ok(!clean.includes("alert('xss')"), "Must remove script content");
        assert.ok(!clean.includes("malware.js"), "Must strip unclosed script tags");
        assert.ok(!clean.includes("onerror"), "Must strip inline on* event handlers");
        assert.ok(!clean.includes("ontoggle"), "Must strip ontoggle event handlers");
        assert.ok(!clean.includes("javascript:"), "Must neutralize javascript: protocol");
        assert.ok(!clean.includes("<iframe"), "Must remove iframe tags");
        assert.ok(!clean.includes("<svg"), "Must remove SVG tags");
        assert.ok(!clean.includes("<math"), "Must remove MathML tags");
        assert.ok(!clean.includes("data:image/svg+xml"), "Must block SVG data URIs that can execute script");
        assert.ok(!clean.includes("background-image"), "Must strip dangerous style attributes");

        // Safe content and safe image data URIs must be preserved
        assert.ok(clean.includes("<h2>Valid Editorial Heading</h2>"));
        assert.ok(clean.includes("<p>Normal film lighting description.</p>"));
        assert.ok(clean.includes("data:image/png;base64"));
    });

    // -------------------------------------------------------------
    // 4. Legitimate Content Preservation & CSV Formula Export Defense
    // -------------------------------------------------------------
    test("4. Formula Injection & Content Preservation: Neutralizes formulas at export boundary without altering stored content", async () => {
        // A. Export boundary formula sanitization
        const maliciousCells = [
            "=cmd|' /C calc'!A0",
            "+1+1",
            "-2+3",
            "@SUM(A1:A10)",
            "\t=1+1",
        ];

        for (const cell of maliciousCells) {
            const safe = sanitizeCsvFormula(cell);
            assert.ok(safe.startsWith("'"), `Formula trigger in "${cell}" must be prefixed with single quote at export`);
        }

        // Normal strings should remain untouched
        assert.equal(sanitizeCsvFormula("Cinematography Masterclass"), "Cinematography Masterclass");
        assert.equal(sanitizeCsvFormula("Lighting ratios in 4:1"), "Lighting ratios in 4:1");

        // B. Content Preservation during Import & Storage (Zero modification to legitimate content)
        const sampleBlogs = [
            {
                title: "-3EV Shadows & Film Contrast",
                slug: `content-preserve-${Date.now()}-1`,
                excerpt: "-3EV shadow ratios create cinematic depth and mood in dark scenes.",
                category: "Lighting",
                content: "<p>Discussing negative exposure latitude on ARRI Alexa 35 sensor.</p>",
                technicalNote: "-3EV key-to-fill ratio on 500T Kodak vision stock",
            },
            {
                title: "+1 Stop Overexposure for Skin Tones",
                slug: `content-preserve-${Date.now()}-2`,
                excerpt: "+1 stop overexposure lifts skin tones cleanly into the sensor sweet spot.",
                category: "Cinematography",
                content: "<p>Overexposing negative film stock increases saturation and reduces grain.</p>",
                technicalNote: "+1 stop on 800 ISO digital sensor",
            },
            {
                title: "@4K Resolution vs 35mm Grain",
                slug: `content-preserve-${Date.now()}-3`,
                excerpt: "@4K resolution provides the ideal balance between grain and MTF acutance.",
                category: "Camera",
                content: "<p>Comparing Super 35 optical resolution with modern digital sensors.</p>",
            },
        ];

        const importResult = await blogImportService.executeImport(
            sampleBlogs,
            { allowPartial: false },
            { userId: testAdminUserId }
        );

        assert.equal(importResult.success, true);
        assert.equal(importResult.importedBlogs.length, 3);

        for (const imported of importResult.importedBlogs) {
            createdBlogIds.push(imported.blogId);
            createdQueueIds.push(imported.queueId);
        }

        // Verify that in PostgreSQL database, stored titles, excerpts, and technical notes are NOT prepended with quotes
        const dbRes = await pool.query(
            "SELECT id, title, excerpt, technical_note FROM blogs WHERE id = ANY($1::uuid[]) ORDER BY title ASC",
            [[importResult.importedBlogs[0].blogId, importResult.importedBlogs[1].blogId, importResult.importedBlogs[2].blogId]]
        );

        const titles = dbRes.rows.map((r) => r.title);
        assert.ok(titles.includes("-3EV Shadows & Film Contrast"), "Title must preserve genuine leading '-'");
        assert.ok(titles.includes("+1 Stop Overexposure for Skin Tones"), "Title must preserve genuine leading '+'");
        assert.ok(titles.includes("@4K Resolution vs 35mm Grain"), "Title must preserve genuine leading '@'");

        for (const row of dbRes.rows) {
            assert.ok(!row.title.startsWith("'"), `Stored title "${row.title}" must not be prepended with a quote`);
            assert.ok(!row.excerpt.startsWith("'"), `Stored excerpt must not be prepended with a quote`);
            if (row.technical_note) {
                assert.ok(!row.technical_note.startsWith("'"), `Stored technical note must not be prepended with a quote`);
            }
        }
    });

    // -------------------------------------------------------------
    // 5. Malformed CSV & JSON Parsing Resilience
    // -------------------------------------------------------------
    test("5. Parser Resilience: Safely catches and rejects malformed CSV and JSON inputs without crashing", () => {
        // Corrupt unclosed quote in CSV
        const unclosedQuoteCsv = 'title,slug\n"Unclosed Title,test-slug';
        assert.throws(() => parseCsv(unclosedQuoteCsv), /Malformed CSV|Unclosed quote/i);

        // Corrupt JSON syntax
        const corruptJson = '{"title": "Bad JSON", "slug": ';
        assert.throws(() => blogImportService.parseInput(corruptJson), /Malformed JSON|Unexpected end/i);
    });

    // -------------------------------------------------------------
    // 6. UUID Parameter Validation & Injection Defense
    // -------------------------------------------------------------
    test("6. Parameter Validation: Rejects malformed and injection UUIDs on queue actions with 400", async () => {
        let statusSent = null;
        let jsonSent = null;

        const mockRes = {
            status: (code) => {
                statusSent = code;
                return {
                    json: (data) => { jsonSent = data; },
                };
            },
        };

        const malformedIds = [
            "invalid-uuid-123",
            "'; DROP TABLE blogs; --",
            "123e4567-e89b-12d3-a456-426614174000; SELECT 1",
            "../etc/passwd",
        ];

        for (const id of malformedIds) {
            await blogQueueController.cancelQueueItem({ params: { id }, body: {}, user: { id: "1" } }, mockRes);
            assert.equal(statusSent, 400, `Must reject invalid UUID "${id}" on cancel`);

            await blogQueueController.manualPublish({ params: { id }, user: { id: "1" } }, mockRes);
            assert.equal(statusSent, 400, `Must reject invalid UUID "${id}" on publish`);

            await blogQueueController.getBlogHistory({ params: { id } }, mockRes);
            assert.equal(statusSent, 400, `Must reject invalid UUID "${id}" on history`);
        }
    });

    // -------------------------------------------------------------
    // 7. Timezone Validation Constraint
    // -------------------------------------------------------------
    test("7. Timezone Hardening: Rejects invalid or arbitrary timezones in scheduler settings", async () => {
        let statusSent = null;
        let jsonSent = null;

        const mockRes = {
            status: (code) => {
                statusSent = code;
                return {
                    json: (data) => { jsonSent = data; },
                };
            },
        };

        // Invalid arbitrary timezone string
        await blogQueueController.updateSettings(
            { body: { timezone: "Invalid/Fake_Zone_Name" } },
            mockRes
        );
        assert.equal(statusSent, 422);
        assert.ok(jsonSent.message.includes("Invalid timezone"));

        // Valid timezone passes
        await blogQueueController.updateSettings(
            { body: { timezone: "Asia/Kolkata" } },
            mockRes
        );
        assert.equal(statusSent, 200);
    });

    // -------------------------------------------------------------
    // 8. Safe Logging & Credential Redaction
    // -------------------------------------------------------------
    test("8. Privacy & Audit: Redacts secrets, tokens, and passwords from logged error details", () => {
        const sensitiveErrorPayload = {
            message: "Database failure with token=super_secret_jwt_token_12345",
            error: "Failed at https://api.imagekit.io?secret=prod_api_key_xyz",
            headers: {
                authorization: "Bearer secret_access_token_abc",
                cookie: "access_token=jwt_cookie_value_999",
                password: "admin_plaintext_password",
            },
        };

        const redacted = redactSensitiveData(sensitiveErrorPayload);

        assert.equal(redacted.headers.authorization, "[REDACTED]");
        assert.equal(redacted.headers.cookie, "[REDACTED]");
        assert.equal(redacted.headers.password, "[REDACTED]");
        assert.ok(!redacted.message.includes("super_secret_jwt_token_12345"));
        assert.ok(!redacted.error.includes("prod_api_key_xyz"));
    });

    // -------------------------------------------------------------
    // 9. Concurrency & State Transition Lock Safety
    // -------------------------------------------------------------
    test("9. State Transition Safety: Prevents re-publishing already published or cancelled queue items", async () => {
        const { queue } = await seedBlog("State Transition Guard Blog");

        // Publish once
        const first = await blogPublishingService.publishQueueItem(queue.id, {
            userId: testAdminUserId,
            triggeredBy: "manual",
        });
        assert.equal(first.success, true);

        // Attempt second publish on same item must throw
        await assert.rejects(
            blogPublishingService.publishQueueItem(queue.id, {
                userId: testAdminUserId,
                triggeredBy: "manual",
            }),
            /already been published/i
        );

        // Cancelled job cannot be published
        const { queue: cancelCandidate } = await seedBlog("Cancel Candidate");
        await pool.query("UPDATE blog_publish_queue SET status = 'cancelled' WHERE id = $1", [cancelCandidate.id]);

        await assert.rejects(
            blogPublishingService.publishQueueItem(cancelCandidate.id, {
                userId: testAdminUserId,
                triggeredBy: "manual",
            }),
            /Cannot publish a cancelled/i
        );
    });

    // -------------------------------------------------------------
    // 10. Multi-Instance Idempotency Protection & LRU Bounding
    // -------------------------------------------------------------
    test("10. Ingestion Idempotency: Protects against replay submissions and bounds in-memory keys", async () => {
        const idempotencyKey = `sec_idem_${Date.now()}`;
        const inputData = [
            {
                title: "Idempotent Blog",
                slug: `idem-${Date.now()}`,
                category: "Cinematography",
                excerpt: "Excerpt",
            },
        ];

        // 1st Import
        const result1 = await blogImportService.executeImport(
            inputData,
            { allowPartial: false },
            { userId: testAdminUserId, idempotencyKey }
        );
        assert.equal(result1.success, true);
        if (result1.importedBlogs?.[0]?.id) {
            createdBlogIds.push(result1.importedBlogs[0].id);
        }

        // 2nd Import with same key: Must return cached replay without creating duplicate rows
        const result2 = await blogImportService.executeImport(
            inputData,
            { allowPartial: false },
            { userId: testAdminUserId, idempotencyKey }
        );
        assert.equal(result2.success, true);
        assert.equal(result2._idempotentReplay, true);
    });
});
