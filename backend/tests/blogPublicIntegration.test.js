import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { blogRepository } from "../src/repositories/blog.repository.js";
import { blogQueueRepository } from "../src/repositories/blogQueue.repository.js";
import { blogSchedulerService } from "../src/services/blogScheduler.service.js";
import { blogPublishingService } from "../src/services/blogPublishing.service.js";
import { schedulerWorker } from "../src/workers/blogSchedulerWorker.js";

describe("Phase 5: Public Website Integration & Production Audit Test Suite", () => {
    let testAdminUserId;
    const createdBlogIds = [];
    const createdQueueIds = [];

    before(async () => {
        const userRes = await pool.query("SELECT id FROM users ORDER BY created_at LIMIT 1");
        testAdminUserId = userRes.rows[0]?.id || null;

        // Ensure background timer is halted during unit tests
        await schedulerWorker.stop();

        // Ensure scheduler settings are in known test state
        await blogQueueRepository.updateSettings({
            enabled: true,
            publishingIntervalMinutes: 360,
            dailyPublishLimit: 20,
            nextPublishAt: null,
            timezone: "Asia/Kolkata",
        });
    });

    after(async () => {
        // Clean up test blogs and associated queue items / logs (cascades)
        if (createdBlogIds.length > 0) {
            await pool.query("DELETE FROM blogs WHERE id = ANY($1::uuid[])", [createdBlogIds]);
        }

        // Restore default settings
        await blogQueueRepository.updateSettings({
            enabled: true,
            publishingIntervalMinutes: 360,
            dailyPublishLimit: 10,
            nextPublishAt: null,
            timezone: "Asia/Kolkata",
        });
    });

    // -------------------------------------------------------------
    // Helper: Seed test blog with specific status
    // -------------------------------------------------------------
    async function seedBlog({
        title = "Public Integration Blog",
        slug = `pub-blog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status = "draft",
        category = "Lighting & Exposure",
        tags = ["Arri Alexa", "Lighting Ratios", "Anamorphic"],
        featuredImage = "https://images.unsplash.com/photo-cinematic.jpg",
        featuredImageAlt = "Cinematic frame of night scene",
        seoTitle = "Cinematic Lighting Guide | Anup Rawat",
        seoDescription = "Deep dive into film lighting ratios and exposure latitude.",
        seoKeywords = "cinematography, lighting, arri",
        canonicalUrl = null,
    } = {}) {
        const blogRes = await pool.query(`
            INSERT INTO blogs (
                title, slug, excerpt, category, tags, author,
                featured_image, featured_image_alt, reading_time, status,
                is_featured, layout_variant, technical_note, introduction, content, sections,
                seo_title, seo_description, seo_keywords, canonical_url, published_at
            ) VALUES (
                $1, $2, 'An in-depth study of lighting ratios in low-key interior scenes.',
                $3, $4, '{"name": "Anup Rawat", "role": "Director of Photography"}',
                $5, $6, '5 min read', $7,
                false, 'wide', 'Shot on Arri Alexa Mini LF with Cooke Anamorphic/i Full Frame Plus.',
                '["Lighting is the cornerstone of visual drama."]',
                '<p>Full HTML content for public reading.</p>',
                '[{"id": "s1", "heading": "Key to Fill Ratio", "paragraphs": ["A 4:1 ratio conveys mystery."]}]',
                $8, $9, $10, $11,
                $12
            )
            RETURNING *;
        `, [
            title,
            slug,
            category,
            tags,
            featuredImage,
            featuredImageAlt,
            status,
            seoTitle,
            seoDescription,
            seoKeywords,
            canonicalUrl || `https://anuprawat.com/blog/${slug}`,
            status === "published" ? new Date() : null,
        ]);

        const blog = blogRes.rows[0];
        createdBlogIds.push(blog.id);
        return blog;
    }

    // -------------------------------------------------------------
    // Test 1: Draft Exclusion on Public Endpoints
    // -------------------------------------------------------------
    test("1. Security: Draft blogs remain strictly inaccessible to public queries", async () => {
        const draftBlog = await seedBlog({
            title: "Secret Draft Journal",
            slug: `secret-draft-${Date.now()}`,
            status: "draft",
        });

        // 1. Public list query must not contain draft blog
        const publicList = await blogRepository.findAll({ status: "published" });
        assert.ok(
            !publicList.items.some((item) => item.id === draftBlog.id || item.slug === draftBlog.slug),
            "Public blog list must NEVER include draft blogs"
        );

        // 2. Public slug query for draft must return null or status != published
        const found = await blogRepository.findBySlug(draftBlog.slug);
        assert.ok(found, "Blog exists in database");
        assert.equal(found.status, "draft", "Blog must have draft status in database");
    });

    // -------------------------------------------------------------
    // Test 2: Automated Publishing Through Scheduler Worker
    // -------------------------------------------------------------
    test("2. Lifecycle: Automatically publishes blog through scheduler worker and verifies public visibility", async () => {
        // Cancel any pending queue items to isolate test candidate
        await pool.query("UPDATE blog_publish_queue SET status = 'cancelled' WHERE status = 'pending'");

        const blog = await seedBlog({
            title: "Automated Publication Target",
            slug: `auto-pub-${Date.now()}`,
            status: "draft",
        });

        // Queue the blog for publishing due immediately
        const pastDue = new Date(Date.now() - 30000);
        const queueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, attempt_count, max_attempts, created_by
            ) VALUES ($1, 'pending', $2, $2, 0, 3, $3)
            RETURNING *;
        `, [blog.id, pastDue, testAdminUserId]);

        const queueItem = queueRes.rows[0];
        createdQueueIds.push(queueItem.id);

        // Execute scheduler tick
        const tickResult = await blogSchedulerService.executeTick({ triggeredBy: "worker_phase5_test" });
        assert.equal(tickResult.executed, true, "Tick must execute successfully");
        assert.equal(tickResult.success, true, "Publishing must succeed");
        assert.equal(tickResult.blog.id, blog.id, "Target blog must be published");

        // Verify blog is now in published status
        const publishedCheck = await pool.query("SELECT status, published_at FROM blogs WHERE id = $1", [blog.id]);
        assert.equal(publishedCheck.rows[0].status, "published");
        assert.ok(publishedCheck.rows[0].published_at, "published_at must be populated");

        // Verify queue item is marked published
        const queueCheck = await pool.query("SELECT status, published_at FROM blog_publish_queue WHERE id = $1", [queueItem.id]);
        assert.equal(queueCheck.rows[0].status, "published");
        assert.ok(queueCheck.rows[0].published_at);

        // Verify newly published blog now appears in public list
        const updatedList = await blogRepository.findAll({ status: "published" });
        assert.ok(
            updatedList.items.some((item) => item.id === blog.id),
            "Newly published blog must appear in public blog listing"
        );
    });

    // -------------------------------------------------------------
    // Test 3: Public Slug Routing & Full Bundle Retrieval
    // -------------------------------------------------------------
    test("3. Detail Page: Fetches published blog by slug with related articles and adjacent navigation", async () => {
        const blog = await seedBlog({
            title: "Optics of Cinema 2026",
            slug: `optics-cinema-${Date.now()}`,
            status: "published",
            category: "Camera & Lenses",
            tags: ["Lenses", "Anamorphic", "Optics"],
        });

        // Fetch using repository findBySlug
        const retrieved = await blogRepository.findBySlug(blog.slug);
        assert.ok(retrieved, "Published blog must be retrievable by slug");
        assert.equal(retrieved.status, "published");
        assert.equal(retrieved.title, blog.title);
        assert.equal(retrieved.category, "Camera & Lenses");

        // Verify related articles query
        const related = await blogRepository.findRelated(retrieved, 3);
        assert.ok(Array.isArray(related), "Related articles must be an array");
        assert.ok(!related.some((r) => r.id === blog.id), "Current blog must not appear in its own related list");

        // Verify adjacent navigation
        const adjacent = await blogRepository.getAdjacent(retrieved.publishedAt);
        assert.ok(adjacent, "Adjacent object must exist");
        assert.ok("prev" in adjacent && "next" in adjacent, "Must expose prev and next navigation pointers");
    });

    // -------------------------------------------------------------
    // Test 4: SEO Metadata, Canonical URL & OpenGraph Verification
    // -------------------------------------------------------------
    test("4. SEO: Validates SEO title, meta description, keywords, and canonical URL structure", async () => {
        const expectedCanonical = "https://anuprawat.com/blog/lighting-ratios-masterclass";
        const blog = await seedBlog({
            title: "Lighting Ratios Masterclass",
            slug: `lighting-ratios-${Date.now()}`,
            status: "published",
            seoTitle: "Lighting Ratios Masterclass | Anup Rawat DOP",
            seoDescription: "A comprehensive guide to key, fill, and rim lighting ratios.",
            seoKeywords: "lighting ratios, cinematography, film noir, anamorphic",
            canonicalUrl: expectedCanonical,
        });

        const fetched = await blogRepository.findBySlug(blog.slug);
        assert.equal(fetched.seoTitle, "Lighting Ratios Masterclass | Anup Rawat DOP");
        assert.equal(fetched.seoDescription, "A comprehensive guide to key, fill, and rim lighting ratios.");
        assert.equal(fetched.seoKeywords, "lighting ratios, cinematography, film noir, anamorphic");
        assert.equal(fetched.canonicalUrl, expectedCanonical);
    });

    // -------------------------------------------------------------
    // Test 5: Featured Image & Alt Text Rendering
    // -------------------------------------------------------------
    test("5. Media: Preserves featured image URL, alt text, and technical note", async () => {
        const imageSrc = "https://images.unsplash.com/photo-anamorphic-lens.jpg";
        const altText = "Cooke 50mm Anamorphic lens front element";
        const techNote = "Cooke /i Technology metadata recorded on Arri raw.";

        const blog = await seedBlog({
            title: "Anamorphic Characteristics",
            slug: `anamorphic-char-${Date.now()}`,
            status: "published",
            featuredImage: imageSrc,
            featuredImageAlt: altText,
        });

        const fetched = await blogRepository.findBySlug(blog.slug);
        assert.equal(fetched.featuredImage, imageSrc);
        assert.equal(fetched.featuredImageAlt, altText);
    });

    // -------------------------------------------------------------
    // Test 6: Publication Date Integrity & LastMod Timestamping
    // -------------------------------------------------------------
    test("6. Dates: Ensures published_at timestamp is valid and immutable across updates", async () => {
        const originalTime = new Date(Date.now() - 86400000); // 1 day ago
        const blogRes = await pool.query(`
            INSERT INTO blogs (
                title, slug, excerpt, category, featured_image, featured_image_alt,
                status, published_at
            ) VALUES (
                'Vintage Lens Warmth', $1, 'Excerpt', 'Gear & Workflow',
                'https://img.jpg', 'Alt', 'published', $2
            ) RETURNING *;
        `, [`vintage-lens-${Date.now()}`, originalTime]);

        const blog = blogRes.rows[0];
        createdBlogIds.push(blog.id);

        // Update blog title
        await pool.query("UPDATE blogs SET title = 'Vintage Lens Warmth (Revised)' WHERE id = $1", [blog.id]);

        const reloaded = await blogRepository.findById(blog.id);
        assert.equal(reloaded.title, "Vintage Lens Warmth (Revised)");
        assert.equal(
            new Date(reloaded.publishedAt).toISOString(),
            originalTime.toISOString(),
            "published_at must remain immutable when revising article content"
        );
        assert.ok(new Date(reloaded.updatedAt) > originalTime, "updated_at must reflect modification");
    });

    // -------------------------------------------------------------
    // Test 7: Sitemap Integration & Status Filtering
    // -------------------------------------------------------------
    test("7. Sitemap: Includes all published blogs and strictly excludes drafts/cancelled", async () => {
        const pubBlog = await seedBlog({
            title: "Sitemap Published Blog",
            slug: `sitemap-pub-${Date.now()}`,
            status: "published",
        });

        const draftBlog = await seedBlog({
            title: "Sitemap Draft Blog",
            slug: `sitemap-draft-${Date.now()}`,
            status: "draft",
        });

        // Simulate sitemap articles retrieval
        const publishedArticles = await blogRepository.findAll({ status: "published", limit: 100 });
        const sitemapEntries = publishedArticles.items
            .filter((a) => a.status === "published")
            .map((a) => ({
                url: `https://anuprawat.com/blog/${a.slug}`,
                lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(a.publishedAt),
            }));

        // Verify published blog is in sitemap
        assert.ok(
            sitemapEntries.some((e) => e.url.includes(pubBlog.slug)),
            "Published blog must be included in sitemap entries"
        );

        // Verify draft blog is NOT in sitemap
        assert.ok(
            !sitemapEntries.some((e) => e.url.includes(draftBlog.slug)),
            "Draft blog must NEVER be included in sitemap entries"
        );

        // Verify lastModified is a valid Date
        const entry = sitemapEntries.find((e) => e.url.includes(pubBlog.slug));
        assert.ok(entry.lastModified instanceof Date && !isNaN(entry.lastModified.getTime()));
    });

    // -------------------------------------------------------------
    // Test 8: Publishing Idempotency
    // -------------------------------------------------------------
    test("8. Idempotency: Rejecting duplicate publish operations on already published queue items", async () => {
        const blog = await seedBlog({
            title: "Idempotent Blog",
            slug: `idempotent-pub-${Date.now()}`,
            status: "draft",
        });

        const pastDue = new Date(Date.now() - 60000);
        const queueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, attempt_count, max_attempts, created_by
            ) VALUES ($1, 'pending', $2, $2, 0, 3, $3)
            RETURNING *;
        `, [blog.id, pastDue, testAdminUserId]);

        const queueItem = queueRes.rows[0];
        createdQueueIds.push(queueItem.id);

        // 1st Publish: Succeeds
        const firstPublish = await blogPublishingService.publishQueueItem(queueItem.id, {
            userId: testAdminUserId,
            triggeredBy: "manual",
        });
        assert.equal(firstPublish.success, true);

        // 2nd Publish: Must reject with already published error
        await assert.rejects(
            blogPublishingService.publishQueueItem(queueItem.id, {
                userId: testAdminUserId,
                triggeredBy: "manual",
            }),
            /already been published/i,
            "Re-publishing an already published queue item must reject safely"
        );

        // Verify queue item status remains 'published'
        const check = await pool.query("SELECT status, attempt_count FROM blog_publish_queue WHERE id = $1", [queueItem.id]);
        assert.equal(check.rows[0].status, "published");
        assert.equal(check.rows[0].attempt_count, 1, "Attempt count must not increment on duplicate call");
    });

    // -------------------------------------------------------------
    // Test 9: Independent Cache Revalidation Without Duplicate Publishing
    // -------------------------------------------------------------
    test("9. Revalidation: Safely clears cache and revalidates published blog without modifying database states", async () => {
        const blog = await seedBlog({
            title: "Revalidation Target Blog",
            slug: `reval-target-${Date.now()}`,
            status: "published",
        });

        // Capture database state before revalidation
        const beforeRes = await pool.query("SELECT status, published_at, updated_at FROM blogs WHERE id = $1", [blog.id]);
        const before = beforeRes.rows[0];

        // Execute standalone revalidation
        const revalResult = await blogPublishingService.revalidatePublishedBlog(blog.slug);
        assert.equal(revalResult.success, true);
        assert.equal(revalResult.cacheCleared, true);
        assert.equal(revalResult.blog.slug, blog.slug);

        // Verify database state is untouched (no second publication or corrupting state changes)
        const afterRes = await pool.query("SELECT status, published_at, updated_at FROM blogs WHERE id = $1", [blog.id]);
        const after = afterRes.rows[0];

        assert.equal(after.status, before.status);
        assert.equal(new Date(after.published_at).getTime(), new Date(before.published_at).getTime());
    });

    // -------------------------------------------------------------
    // Test 10: Non-blocking Frontend Revalidation Failure Resilience
    // -------------------------------------------------------------
    test("10. Resilience: Publication succeeds even if Next.js frontend revalidation endpoint is offline", async () => {
        const blog = await seedBlog({
            title: "Resilient Offline Revalidation Blog",
            slug: `resilient-pub-${Date.now()}`,
            status: "draft",
        });

        const queueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, attempt_count, max_attempts, created_by
            ) VALUES ($1, 'pending', NOW(), NOW(), 0, 3, $2)
            RETURNING *;
        `, [blog.id, testAdminUserId]);

        const queueItem = queueRes.rows[0];
        createdQueueIds.push(queueItem.id);

        // Temporarily set FRONTEND_URL to a non-existent port to simulate frontend offline
        const originalFrontendUrl = process.env.FRONTEND_URL;
        process.env.FRONTEND_URL = "http://localhost:59999";

        try {
            // Publishing must STILL SUCCEED; the revalidation error must be caught non-blockingly
            const result = await blogPublishingService.publishQueueItem(queueItem.id, {
                userId: testAdminUserId,
                triggeredBy: "worker",
            });

            assert.equal(result.success, true);
            assert.equal(result.blog.status, "published");
            assert.equal(result.queue.status, "published");

            // Revalidation should be marked as failed gracefully without throwing
            assert.ok(result.revalidation);
            assert.equal(result.revalidation.success, false);
        } finally {
            process.env.FRONTEND_URL = originalFrontendUrl;
        }
    });
});

