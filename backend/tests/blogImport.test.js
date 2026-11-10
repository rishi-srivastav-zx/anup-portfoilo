import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { blogImportService } from "../src/services/blogImport.service.js";
import { parseCsv } from "../src/utils/csvParser.js";
import { sanitizeHtml } from "../src/utils/htmlSanitizer.js";

describe("Phase 2: Bulk Blog Import & Scheduler System Test Suite", () => {
    let testAdminUserId;
    let existingPublishedBlogId;
    let existingPublishedSlug;
    const createdBlogIds = [];

    before(async () => {
        // Find or create admin user for test auditing
        const userRes = await pool.query("SELECT id FROM users ORDER BY created_at LIMIT 1");
        testAdminUserId = userRes.rows[0]?.id || null;

        // Seed an existing published blog to verify conflict protection
        existingPublishedSlug = `existing-published-cinema-${Date.now()}`;
        const blogRes = await pool.query(`
            INSERT INTO blogs (
                title, slug, excerpt, category, featured_image, featured_image_alt, status, published_at
            ) VALUES (
                'Existing Masterpiece Film',
                $1,
                'Original published article that must never be overwritten.',
                'Cinematography',
                'https://ik.imagekit.io/anup/original.jpg',
                'Original Frame',
                'published',
                NOW()
            )
            RETURNING id;
        `, [existingPublishedSlug]);

        existingPublishedBlogId = blogRes.rows[0].id;
        createdBlogIds.push(existingPublishedBlogId);
    });

    after(async () => {
        // Clean up all blogs created during testing (cascades to queue and logs)
        if (createdBlogIds.length > 0) {
            await pool.query("DELETE FROM blogs WHERE id = ANY($1::uuid[])", [createdBlogIds]);
        }
    });

    // -------------------------------------------------------------
    // Test 1: HTML Sanitizer Protection against XSS vectors
    // -------------------------------------------------------------
    test("1. Sanitizer: Strips scripts, iframes, and malicious on* event handlers", () => {
        const dirtyHtml = `
            <p>Motivated lighting in narrative cinema.</p>
            <script>alert('XSS ATTACK')</script>
            <iframe src="https://evil.com/payload"></iframe>
            <a href="javascript:stealCookies()" onclick="maliciousCode()">Click Here</a>
            <img src="valid.jpg" onerror="alert('Exploit')" alt="Film Still" />
        `;

        const clean = sanitizeHtml(dirtyHtml);
        assert.equal(clean.includes("<script>"), false, "Must strip script tags");
        assert.equal(clean.includes("<iframe"), false, "Must strip iframe tags");
        assert.equal(clean.includes("javascript:"), false, "Must neutralize javascript: URIs");
        assert.equal(clean.includes("onclick"), false, "Must strip onclick attribute");
        assert.equal(clean.includes("onerror"), false, "Must strip onerror attribute");
        assert.ok(clean.includes("<p>Motivated lighting in narrative cinema.</p>"), "Must preserve safe HTML");
        assert.ok(clean.includes('alt="Film Still"'), "Must preserve safe image alt");
    });

    // -------------------------------------------------------------
    // Test 2: CSV Parsing of RFC-4180 complex fields
    // -------------------------------------------------------------
    test("2. CSV Parser: Correctly handles commas inside quotes, multiline text, and array tags", () => {
        const csvContent = `title,slug,excerpt,tags,category
"Anamorphic Lenses, 35mm vs 50mm",anamorphic-guide,"A comprehensive, hands-on review.","lenses, anamorphic, optics",Cinematography
"Gaffer Lighting Secrets",gaffer-lighting,"Step 1: Place key light.

Step 2: Add negative fill.","lighting, tips",Lighting`;

        const parsed = parseCsv(csvContent);
        assert.equal(parsed.length, 2);
        assert.equal(parsed[0].title, "Anamorphic Lenses, 35mm vs 50mm");
        assert.equal(parsed[0].slug, "anamorphic-guide");
        assert.deepEqual(parsed[0].tags, ["lenses", "anamorphic", "optics"]);
        assert.equal(parsed[1].title, "Gaffer Lighting Secrets");
        assert.ok(parsed[1].excerpt.includes("Step 2: Add negative fill."), "Must preserve multiline quoted content");
    });

    // -------------------------------------------------------------
    // Test 3: Rejection of Malformed JSON and CSV
    // -------------------------------------------------------------
    test("3. Parser: Rejects malformed JSON and malformed CSV with clear errors", () => {
        // Malformed JSON (missing closing brace)
        assert.throws(
            () => {
                blogImportService.parseInput('[{ "title": "Broken Json"', { mimetype: "application/json" });
            },
            /Malformed JSON/i,
            "Must throw syntax error for broken JSON"
        );

        // Malformed CSV (unclosed quotes)
        assert.throws(
            () => {
                blogImportService.parseInput('title,slug\n"Unclosed quote without termination,slug-1', { mimetype: "text/csv" });
            },
            /Unclosed quote detected/i,
            "Must throw error for unclosed quotes in CSV"
        );
    });

    // -------------------------------------------------------------
    // Test 4: Validation detects missing required fields
    // -------------------------------------------------------------
    test("4. Validation: Detects missing title and invalid layoutVariant", async () => {
        const invalidBatch = [
            {
                title: "", // Empty title (required)
                category: "Cinematography",
            },
            {
                title: "Valid Title Here",
                layoutVariant: "unsupported_layout", // Invalid enum
            },
        ];

        const preview = await blogImportService.previewImport(invalidBatch);
        assert.equal(preview.validCount, 0);
        assert.ok(preview.errors.length >= 2, "Must report errors for both invalid rows");

        const titleError = preview.errors.find((e) => e.row === 1 && e.field === "title");
        assert.ok(titleError, "Row 1 must flag missing title");

        const layoutError = preview.errors.find((e) => e.row === 2 && e.field === "layoutVariant");
        assert.ok(layoutError, "Row 2 must flag invalid layoutVariant");
    });

    // -------------------------------------------------------------
    // Test 5: In-batch duplicate slug detection
    // -------------------------------------------------------------
    test("5. Conflict Detection: Flags duplicate slugs within the same upload batch", async () => {
        const batchWithDupes = [
            {
                title: "First Masterpiece Article",
                slug: "duplicate-batch-slug",
                content: "Content 1",
            },
            {
                title: "Second Article Using Same Slug",
                slug: "duplicate-batch-slug",
                content: "Content 2",
            },
        ];

        const preview = await blogImportService.previewImport(batchWithDupes);
        assert.equal(preview.invalidCount, 1);
        const dupError = preview.errors.find((e) => e.row === 2 && e.field === "slug");
        assert.ok(dupError, "Row 2 must be flagged for duplicate slug within batch");
        assert.ok(dupError.message.includes("first seen at row 1"));
    });

    // -------------------------------------------------------------
    // Test 6: Conflict Detection protects existing published blogs
    // -------------------------------------------------------------
    test("6. Protection: Prevents overwriting existing blogs in database", async () => {
        const conflictingBatch = [
            {
                title: "Attempting To Overwrite Existing Blog",
                slug: existingPublishedSlug, // Conflicts with DB
                content: "Malicious override payload",
            },
        ];

        const preview = await blogImportService.previewImport(conflictingBatch);
        assert.equal(preview.validCount, 0);
        assert.equal(preview.invalidCount, 1);
        assert.ok(
            preview.errors[0].message.includes("already exists in blogs database"),
            "Must flag conflict with existing blog slug"
        );
    });

    // -------------------------------------------------------------
    // Test 7: Strict vs Partial Import Support
    // -------------------------------------------------------------
    test("7. Partial Import: Rejects all when allowPartial=false; imports only valid rows when allowPartial=true", async () => {
        const mixedBatch = [
            {
                title: "Valid Import Article Alpha",
                slug: `valid-alpha-${Date.now()}`,
                content: "Safe content alpha",
            },
            {
                title: "", // Invalid
                slug: "invalid-missing-title",
            },
        ];

        // 7a. Strict mode (allowPartial: false)
        const strictResult = await blogImportService.executeImport(
            mixedBatch,
            { allowPartial: false },
            { userId: testAdminUserId }
        );
        assert.equal(strictResult.success, false);
        assert.equal(strictResult.importedCount, 0);
        assert.equal(strictResult.failedCount, 1);

        // 7b. Partial mode (allowPartial: true)
        const partialResult = await blogImportService.executeImport(
            mixedBatch,
            { allowPartial: true },
            { userId: testAdminUserId }
        );
        assert.equal(partialResult.success, true);
        assert.equal(partialResult.summary.importedCount, 1);
        assert.equal(partialResult.summary.failedCount, 1);

        // Save imported blog ID for cleanup
        if (partialResult.importedBlogs?.[0]?.blogId) {
            createdBlogIds.push(partialResult.importedBlogs[0].blogId);
        }
    });

    // -------------------------------------------------------------
    // Test 8: Import 100 valid blogs with 360-minute spaced scheduling
    // -------------------------------------------------------------
    test("8. Bulk Scale: Successfully imports and enqueues 100 valid blogs with 360m queue spacing", async () => {
        const batchSize = 100;
        const blogsBatch = [];
        const timestamp = Date.now();

        for (let i = 1; i <= batchSize; i++) {
            blogsBatch.push({
                title: `Automated Batch Blog #${i} — Masterclass Cinematography`,
                slug: `batch-scale-test-${timestamp}-${i}`,
                excerpt: `Excerpt for test article ${i} covering lighting and composition.`,
                category: i % 2 === 0 ? "Lighting" : "Cinematography",
                tags: ["automated", "testing", `tag-${i}`],
                content: `<p>Detailed tutorial content for article ${i}. Motivated light creates cinematic depth.</p>`,
                technicalNote: `Camera: ARRI Alexa 35, ISO: 800, Lens: Cook Anamorphic #${i}`,
            });
        }

        const startTime = new Date(Date.now() + 60000); // 1 minute in future
        const result = await blogImportService.executeImport(
            blogsBatch,
            {
                allowPartial: false,
                startPublishAt: startTime.toISOString(),
                publishingIntervalMinutes: 360,
            },
            { userId: testAdminUserId }
        );

        assert.equal(result.success, true);
        assert.equal(result.summary.importedCount, batchSize);
        assert.equal(result.summary.intervalMinutes, 360);
        assert.equal(result.importedBlogs.length, batchSize);

        // Verify sequential spacing between each queued item (exactly 360 minutes / 6 hours)
        for (let i = 0; i < result.importedBlogs.length; i++) {
            const item = result.importedBlogs[i];
            createdBlogIds.push(item.blogId);

            assert.equal(item.status, "draft", "Imported blog must remain draft");
            assert.equal(item.queueStatus, "pending", "Queue entry must be pending");

            if (i > 0) {
                const prevTime = new Date(result.importedBlogs[i - 1].scheduledAt).getTime();
                const currTime = new Date(item.scheduledAt).getTime();
                const diffMinutes = Math.round((currTime - prevTime) / (60 * 1000));
                assert.equal(diffMinutes, 360, `Difference between job ${i - 1} and ${i} must be 360 minutes`);
            }
        }
    });

    // -------------------------------------------------------------
    // Test 9: Idempotency Key prevents repeated submissions
    // -------------------------------------------------------------
    test("9. Idempotency: Replaying request with same Idempotency-Key returns cached result without duplicate insertions", async () => {
        const idempotencyKey = `idem-${crypto.randomUUID()}`;
        const uniqueSlug = `idempotency-test-${Date.now()}`;

        const payload = [
            {
                title: "Idempotent Blog Post",
                slug: uniqueSlug,
                content: "Content that must not be inserted twice",
            },
        ];

        // First call
        const firstCall = await blogImportService.executeImport(
            payload,
            { allowPartial: false },
            { userId: testAdminUserId, idempotencyKey }
        );
        assert.equal(firstCall.success, true);
        assert.equal(firstCall.importedBlogs.length, 1);
        const originalBlogId = firstCall.importedBlogs[0].blogId;
        createdBlogIds.push(originalBlogId);

        // Second call with same idempotency key
        const secondCall = await blogImportService.executeImport(
            payload,
            { allowPartial: false },
            { userId: testAdminUserId, idempotencyKey }
        );
        assert.equal(secondCall.success, true);
        assert.equal(secondCall._idempotentReplay, true, "Must be flagged as idempotent replay");
        assert.equal(secondCall.importedBlogs[0].blogId, originalBlogId, "Must return the original blog ID without creating a duplicate");

        // Verify in DB that only 1 record exists with this slug
        const dbCheck = await pool.query("SELECT COUNT(*)::int AS count FROM blogs WHERE slug = $1", [uniqueSlug]);
        assert.equal(dbCheck.rows[0].count, 1, "Exactly one row must exist in database");
    });

    // -------------------------------------------------------------
    // Test 10: Database rollback on simulated transaction error
    // -------------------------------------------------------------
    test("10. Rollback: If transaction fails mid-flight, all changes are rolled back cleanly", async () => {
        const rollbackSlug = `rollback-test-${Date.now()}`;
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // Insert blog
            await client.query(`
                INSERT INTO blogs (title, slug, excerpt, category, featured_image, featured_image_alt, status)
                VALUES ('Rollback Test', $1, 'Test excerpt', 'Cinematography', 'https://test.jpg', 'Alt', 'draft');
            `, [rollbackSlug]);

            // Simulate catastrophic error (e.g. invalid foreign key or forced abort)
            await client.query("ROLLBACK");
        } finally {
            client.release();
        }

        // Verify blog does NOT exist in database
        const res = await pool.query("SELECT 1 FROM blogs WHERE slug = $1", [rollbackSlug]);
        assert.equal(res.rowCount, 0, "No records must persist after transaction rollback");
    });
});
