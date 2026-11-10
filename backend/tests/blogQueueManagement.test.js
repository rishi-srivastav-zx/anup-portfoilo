import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { blogQueueRepository } from "../src/repositories/blogQueue.repository.js";
import { blogPublishingService } from "../src/services/blogPublishing.service.js";

describe("Phase 3: Production-Ready Blog Queue Management APIs Test Suite", () => {
    let testAdminUserId;
    const createdBlogIds = [];
    const createdQueueIds = [];

    before(async () => {
        // Find or create admin user for test auditing
        const userRes = await pool.query("SELECT id FROM users ORDER BY created_at LIMIT 1");
        testAdminUserId = userRes.rows[0]?.id || null;
    });

    after(async () => {
        // Clean up test blogs (cascades to blog_publish_queue and blog_publish_logs)
        if (createdBlogIds.length > 0) {
            await pool.query("DELETE FROM blogs WHERE id = ANY($1::uuid[])", [createdBlogIds]);
        }
    });

    // Helper to seed a test blog + queue item
    async function seedTestBlogAndQueue({
        title = "Test Blog",
        slug = `test-queue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status = "pending",
        scheduledAt = new Date(),
        attemptCount = 0,
        lastError = null,
    } = {}) {
        const blogRes = await pool.query(`
            INSERT INTO blogs (title, slug, excerpt, category, featured_image, featured_image_alt, status)
            VALUES ($1, $2, 'Excerpt', 'Cinematography', 'https://test.jpg', 'Alt', 'draft')
            RETURNING id, title, slug;
        `, [title, slug]);

        const blog = blogRes.rows[0];
        createdBlogIds.push(blog.id);

        const queueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, attempt_count, last_error, created_by
            ) VALUES ($1, $2, $3, $3, $4, $5, $6)
            RETURNING id, blog_id, status, scheduled_at;
        `, [blog.id, status, scheduledAt, attemptCount, lastError, testAdminUserId]);

        const queue = queueRes.rows[0];
        createdQueueIds.push(queue.id);

        return { blog, queue };
    }

    // -------------------------------------------------------------
    // Test 1: Queue Pagination, Filtering & Search
    // -------------------------------------------------------------
    test("1. Pagination, Filtering & Search: Returns filtered and searched queue items", async () => {
        const uniqueSearchTerm = `anamorphic-${Date.now()}`;
        await seedTestBlogAndQueue({
            title: `Mastering ${uniqueSearchTerm} Lenses`,
            status: "pending",
        });
        await seedTestBlogAndQueue({
            title: `Standard Spherical Lenses`,
            status: "failed",
            lastError: "Connection timeout",
        });

        // 1a. Search by title
        const searchRes = await blogQueueRepository.listQueue({
            search: uniqueSearchTerm,
            page: 1,
            limit: 10,
        });
        assert.ok(searchRes.items.length >= 1, "Must find at least one match for unique search term");
        assert.ok(searchRes.items[0].title.includes(uniqueSearchTerm));

        // 1b. Filter by status 'failed'
        const filterRes = await blogQueueRepository.listQueue({
            status: "failed",
            page: 1,
            limit: 10,
        });
        assert.ok(filterRes.items.length >= 1, "Must list failed queue items");
        assert.ok(filterRes.items.every((item) => item.status === "failed"));

        // 1c. Pagination limits
        const pageRes = await blogQueueRepository.listQueue({
            page: 1,
            limit: 1,
        });
        assert.equal(pageRes.items.length, 1);
        assert.ok(pageRes.total >= 2);
        assert.ok(pageRes.totalPages >= 2);
    });

    // -------------------------------------------------------------
    // Test 2: Queue Statistics Aggregation
    // -------------------------------------------------------------
    test("2. Statistics: Aggregates counts by status, daily metrics, and next scheduled time", async () => {
        const stats = await blogQueueRepository.getQueueStats();

        assert.equal(typeof stats.total, "number");
        assert.equal(typeof stats.pending, "number");
        assert.equal(typeof stats.processing, "number");
        assert.equal(typeof stats.published, "number");
        assert.equal(typeof stats.failed, "number");
        assert.equal(typeof stats.cancelled, "number");
        assert.equal(typeof stats.dailyPublishedToday, "number");
        assert.equal(stats.publishingIntervalMinutes, 360);
        assert.equal(stats.timezone, "Asia/Kolkata");
        assert.equal(typeof stats.schedulerEnabled, "boolean");
    });

    // -------------------------------------------------------------
    // Test 3: Scheduler Settings Update (Interval, Daily Limit, Timezone)
    // -------------------------------------------------------------
    test("3. Settings: Updates publishing interval, daily limit, and timezone with constraint validation", async () => {
        const original = await blogQueueRepository.getSettings();

        // Update settings
        const updated = await blogQueueRepository.updateSettings({
            enabled: false, // Paused
            publishingIntervalMinutes: 180, // 3 hours
            dailyPublishLimit: 8,
            timezone: "Asia/Kolkata",
        });

        assert.equal(updated.enabled, false);
        assert.equal(updated.publishing_interval_minutes, 180);
        assert.equal(updated.daily_publish_limit, 8);

        // Restore interval to default 360m and enabled: true
        const restored = await blogQueueRepository.updateSettings({
            enabled: true,
            publishingIntervalMinutes: 360,
            dailyPublishLimit: original.daily_publish_limit || 10,
        });

        assert.equal(restored.enabled, true);
        assert.equal(restored.publishing_interval_minutes, 360);
    });

    // -------------------------------------------------------------
    // Test 4: Reordering Pending Queue Records
    // -------------------------------------------------------------
    test("4. Reorder: Sequentially adjusts scheduled_at timestamps for pending queue items", async () => {
        const itemA = await seedTestBlogAndQueue({ title: "Reorder Blog A", status: "pending" });
        const itemB = await seedTestBlogAndQueue({ title: "Reorder Blog B", status: "pending" });
        const itemC = await seedTestBlogAndQueue({ title: "Reorder Blog C", status: "pending" });

        const baseTime = new Date(Date.now() + 3600000); // 1 hour from now
        // Reorder in reverse: [C, B, A]
        const reverseOrderIds = [itemC.queue.id, itemB.queue.id, itemA.queue.id];

        const reordered = await blogQueueRepository.reorderPendingQueue(
            reverseOrderIds,
            baseTime.toISOString(),
            360
        );

        assert.equal(reordered.length, 3);
        assert.equal(reordered[0].id, itemC.queue.id);
        assert.equal(reordered[1].id, itemB.queue.id);
        assert.equal(reordered[2].id, itemA.queue.id);

        const timeC = new Date(reordered[0].scheduled_at).getTime();
        const timeB = new Date(reordered[1].scheduled_at).getTime();
        const timeA = new Date(reordered[2].scheduled_at).getTime();

        assert.equal(timeB - timeC, 360 * 60 * 1000, "Item B must be spaced 360 minutes after C");
        assert.equal(timeA - timeB, 360 * 60 * 1000, "Item A must be spaced 360 minutes after B");
    });

    // -------------------------------------------------------------
    // Test 5: Queue Cancellation with Audit Logging
    // -------------------------------------------------------------
    test("5. Cancellation: Cancels pending queue item and records audit log", async () => {
        const { queue, blog } = await seedTestBlogAndQueue({
            title: "Blog to Cancel",
            status: "pending",
        });

        const cancelled = await blogQueueRepository.cancelQueueItem(
            queue.id,
            "Topic rescheduled for next quarter",
            testAdminUserId
        );

        assert.equal(cancelled.status, "cancelled");
        assert.equal(cancelled.last_error, "Topic rescheduled for next quarter");

        // Verify audit log in blog_publish_logs
        const logRes = await pool.query(
            "SELECT * FROM blog_publish_logs WHERE queue_id = $1 AND status = 'cancelled'",
            [queue.id]
        );
        assert.equal(logRes.rowCount, 1);
        assert.equal(logRes.rows[0].message, "Topic rescheduled for next quarter");
    });

    // -------------------------------------------------------------
    // Test 6: Retry Failed Queue Records
    // -------------------------------------------------------------
    test("6. Retry: Resets failed queue item to pending with updated schedule and attempt count", async () => {
        const { queue, blog } = await seedTestBlogAndQueue({
            title: "Failed Blog to Retry",
            status: "failed",
            attemptCount: 3,
            lastError: "Database network disconnect",
        });

        const retryScheduleTime = new Date(Date.now() + 1800000); // 30 mins
        const retried = await blogQueueRepository.retryFailedItem(
            queue.id,
            retryScheduleTime,
            testAdminUserId
        );

        assert.equal(retried.status, "pending");
        assert.equal(retried.attempt_count, 0);
        assert.equal(retried.last_error, null);

        // Verify audit log in blog_publish_logs
        const logRes = await pool.query(
            "SELECT * FROM blog_publish_logs WHERE queue_id = $1 AND status = 'retrying'",
            [queue.id]
        );
        assert.ok(logRes.rowCount >= 1);
    });

    // -------------------------------------------------------------
    // Test 7: Real Transactional Manual Publishing
    // -------------------------------------------------------------
    test("7. Manual Publish: Publishes blog, updates queue status, and logs success", async () => {
        const { queue, blog } = await seedTestBlogAndQueue({
            title: "Real Manual Publish Test Blog",
            status: "pending",
        });

        const publishResult = await blogPublishingService.publishQueueItem(queue.id, {
            userId: testAdminUserId,
            triggeredBy: "manual",
        });

        assert.equal(publishResult.success, true);
        assert.equal(publishResult.blog.status, "published");
        assert.ok(publishResult.blog.published_at);
        assert.equal(publishResult.queue.status, "published");
        assert.ok(publishResult.queue.published_at);
        assert.equal(publishResult.log.status, "success");
        assert.equal(publishResult.log.triggered_by, "manual");

        // Verify directly in database
        const dbBlog = await pool.query("SELECT status, published_at FROM blogs WHERE id = $1", [blog.id]);
        assert.equal(dbBlog.rows[0].status, "published");
        assert.ok(dbBlog.rows[0].published_at);
    });

    // -------------------------------------------------------------
    // Test 8: Invalid State Transitions Rejected
    // -------------------------------------------------------------
    test("8. State Transitions: Rejects invalid transitions on published/cancelled items", async () => {
        // 8a. Cannot publish an already published item
        const { queue: pubQueue } = await seedTestBlogAndQueue({
            title: "Already Published",
            status: "published",
        });

        await assert.rejects(
            async () => {
                await blogPublishingService.publishQueueItem(pubQueue.id);
            },
            /already been published/i,
            "Must reject publishing an already published queue item"
        );

        // 8b. Cannot cancel an already published item
        await assert.rejects(
            async () => {
                await blogQueueRepository.cancelQueueItem(pubQueue.id);
            },
            /cannot cancel.*already published/i,
            "Must reject cancelling an already published queue item"
        );

        // 8c. Cannot retry a non-failed item
        const { queue: pendQueue } = await seedTestBlogAndQueue({
            title: "Pending Item",
            status: "pending",
        });

        await assert.rejects(
            async () => {
                await blogQueueRepository.retryFailedItem(pendQueue.id);
            },
            /only failed queue items can be retried/i,
            "Must reject retrying a non-failed queue item"
        );
    });

    // -------------------------------------------------------------
    // Test 9: Individual Blog Publishing History
    // -------------------------------------------------------------
    test("9. Blog History: Retrieves queue items and audit logs for a single blog", async () => {
        const { blog, queue } = await seedTestBlogAndQueue({
            title: "History Audit Blog",
            status: "pending",
        });

        // Add a dummy log
        await pool.query(`
            INSERT INTO blog_publish_logs (queue_id, blog_id, attempt_number, status, message)
            VALUES ($1, $2, 1, 'retrying', 'Initial enqueue test');
        `, [queue.id, blog.id]);

        const history = await blogQueueRepository.getBlogPublishingHistory(blog.id);

        assert.ok(history.queueItems.length >= 1);
        assert.equal(history.queueItems[0].blog_id, blog.id);
        assert.ok(history.publishLogs.length >= 1);
        assert.equal(history.publishLogs[0].blog_id, blog.id);
    });

    // -------------------------------------------------------------
    // Test 10: Complete Scheduler Execution Logs Listing
    // -------------------------------------------------------------
    test("10. Execution Logs: Lists paginated scheduler logs with filter support", async () => {
        const logsResult = await blogQueueRepository.listPublishLogs({
            page: 1,
            limit: 5,
        });

        assert.ok(Array.isArray(logsResult.items));
        assert.equal(typeof logsResult.total, "number");
        assert.equal(logsResult.page, 1);
        assert.equal(logsResult.limit, 5);

        if (logsResult.items.length > 0) {
            const first = logsResult.items[0];
            assert.ok(first.logId);
            assert.ok(first.status);
            assert.ok(first.message);
        }
    });
});

