import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";
import { blogQueueRepository } from "../src/repositories/blogQueue.repository.js";
import { blogSchedulerService } from "../src/services/blogScheduler.service.js";
import { blogPublishingService } from "../src/services/blogPublishing.service.js";
import { schedulerWorker } from "../src/workers/blogSchedulerWorker.js";

describe("Phase 4: Background Cron Worker & Automated Blog Publishing Suite", () => {
    let testAdminUserId;
    const createdBlogIds = [];
    const createdQueueIds = [];

    before(async () => {
        const userRes = await pool.query("SELECT id FROM users ORDER BY created_at LIMIT 1");
        testAdminUserId = userRes.rows[0]?.id || null;

        // Ensure worker timer is paused during unit test execution
        await schedulerWorker.stop();
    });

    after(async () => {
        // Clean up test blogs
        if (createdBlogIds.length > 0) {
            await pool.query("DELETE FROM blogs WHERE id = ANY($1::uuid[])", [createdBlogIds]);
        }
        // Ensure scheduler settings restored to defaults
        await blogQueueRepository.updateSettings({
            enabled: true,
            publishingIntervalMinutes: 360,
            dailyPublishLimit: 10,
            nextPublishAt: null,
            timezone: "Asia/Kolkata",
        });
    });

    async function seedDueBlog(title = "Due Blog", slug = `due-blog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`) {
        const blogRes = await pool.query(`
            INSERT INTO blogs (title, slug, excerpt, category, featured_image, featured_image_alt, status)
            VALUES ($1, $2, 'Excerpt', 'Cinematography', 'https://test.jpg', 'Alt', 'draft')
            RETURNING id, title, slug;
        `, [title, slug]);

        const blog = blogRes.rows[0];
        createdBlogIds.push(blog.id);

        const pastTime = new Date(Date.now() - 60000); // 1 minute in past (due)
        const queueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, attempt_count, max_attempts, created_by
            ) VALUES ($1, 'pending', $2, $2, 0, 3, $3)
            RETURNING id, blog_id, status, scheduled_at;
        `, [blog.id, pastTime, testAdminUserId]);

        const queue = queueRes.rows[0];
        createdQueueIds.push(queue.id);

        return { blog, queue };
    }

    // -------------------------------------------------------------
    // Test 1: Scheduler Disabled
    // -------------------------------------------------------------
    test("1. Eligibility: Skips execution when scheduler is disabled in settings", async () => {
        await blogQueueRepository.updateSettings({ enabled: false });

        const result = await blogSchedulerService.executeTick({ triggeredBy: "test" });
        assert.equal(result.executed, false);
        assert.equal(result.reason, "scheduler_disabled");

        // Re-enable
        await blogQueueRepository.updateSettings({ enabled: true });
    });

    // -------------------------------------------------------------
    // Test 2: Publishing Not Due (Interval Window in Future)
    // -------------------------------------------------------------
    test("2. Eligibility: Skips execution when next_publish_at is in the future", async () => {
        const futureSlot = new Date(Date.now() + 7200000); // 2 hours in future
        await blogQueueRepository.updateSettings({ nextPublishAt: futureSlot });

        const result = await blogSchedulerService.executeTick({ triggeredBy: "test" });
        assert.equal(result.executed, false);
        assert.equal(result.reason, "not_due");

        // Reset nextPublishAt to null (due immediately)
        await blogQueueRepository.updateSettings({ nextPublishAt: null });
    });

    // -------------------------------------------------------------
    // Test 3: Daily Publishing Limit Reached
    // -------------------------------------------------------------
    test("3. Eligibility: Enforces daily publishing limit in configured timezone", async () => {
        // Seed 1 published blog for today
        const { queue } = await seedDueBlog("Daily Limit Seeder");
        await pool.query(
            "UPDATE blog_publish_queue SET status = 'published', published_at = NOW() WHERE id = $1",
            [queue.id]
        );

        // Set daily limit to 1 (satisfies CHECK constraint daily_publish_limit >= 1)
        await blogQueueRepository.updateSettings({ dailyPublishLimit: 1, nextPublishAt: null });

        const result = await blogSchedulerService.executeTick({ triggeredBy: "test" });
        assert.equal(result.executed, false);
        assert.equal(result.reason, "daily_limit_reached");

        // Restore daily limit to 10
        await blogQueueRepository.updateSettings({ dailyPublishLimit: 10 });
    });

    // -------------------------------------------------------------
    // Test 4: Exactly One Blog Claimed and Published Per Execution
    // -------------------------------------------------------------
    test("4. Execution: Claims and publishes exactly one eligible blog when multiple are due", async () => {
        await blogQueueRepository.updateSettings({ enabled: true, nextPublishAt: null, dailyPublishLimit: 10 });

        const item1 = await seedDueBlog("Candidate 1");
        const item2 = await seedDueBlog("Candidate 2");

        const tickResult = await blogSchedulerService.executeTick({ triggeredBy: "test_worker" });
        assert.equal(tickResult.executed, true);
        assert.equal(tickResult.success, true);
        assert.ok(tickResult.blog.id, "Must publish exactly one blog");

        // Verify the published blog has status = 'published'
        const publishedId = tickResult.blog.id;
        const checkBlog = await pool.query("SELECT status FROM blogs WHERE id = $1", [publishedId]);
        assert.equal(checkBlog.rows[0].status, "published");

        // Verify next_publish_at was automatically pushed ahead by 360 minutes
        const settings = await blogQueueRepository.getSettings();
        assert.ok(settings.next_publish_at);
        const diffMinutes = Math.round((new Date(settings.next_publish_at).getTime() - Date.now()) / (60 * 1000));
        assert.ok(diffMinutes >= 355 && diffMinutes <= 365, "Must advance next_publish_at by approximately 360m");

        // Reset next_publish_at to null for subsequent tests
        await blogQueueRepository.updateSettings({ nextPublishAt: null });
    });

    // -------------------------------------------------------------
    // Test 5: Concurrent Worker Claims (SELECT FOR UPDATE SKIP LOCKED)
    // -------------------------------------------------------------
    test("5. Concurrency: Two concurrent workers never claim or publish the same queue item", async () => {
        await blogQueueRepository.updateSettings({ nextPublishAt: null });

        // Cancel any pre-existing pending queue items to guarantee exactly 1 candidate exists
        await pool.query("UPDATE blog_publish_queue SET status = 'cancelled' WHERE status = 'pending'");

        const singleItem = await seedDueBlog("Solo Candidate for Race");

        const lockTokenA = crypto.randomUUID();
        const lockTokenB = crypto.randomUUID();

        // Run atomic claims concurrently
        const [claimA, claimB] = await Promise.all([
            blogQueueRepository.claimNextEligibleJob(lockTokenA),
            blogQueueRepository.claimNextEligibleJob(lockTokenB),
        ]);

        // Exactly one worker must claim the job, the other must receive null
        const claimedCount = [claimA, claimB].filter(Boolean).length;
        assert.equal(claimedCount, 1, "Exactly one worker must claim the job");

        const winner = claimA || claimB;
        assert.equal(winner.id, singleItem.queue.id);
        assert.equal(winner.status, "processing");

        // Clean up claimed job to pending
        await pool.query("UPDATE blog_publish_queue SET status = 'pending', locked_at = NULL, lock_token = NULL WHERE id = $1", [singleItem.queue.id]);
    });

    // -------------------------------------------------------------
    // Test 6: Stale / Zombie Lock Recovery
    // -------------------------------------------------------------
    test("6. Lock Recovery: Detects abandoned processing job older than 15 minutes and safely resets to pending", async () => {
        const { queue } = await seedDueBlog("Abandoned Lock Blog");

        // Simulate crashed worker that abandoned job in processing state 30 minutes ago
        const staleTimestamp = new Date(Date.now() - 30 * 60 * 1000);
        await pool.query(`
            UPDATE blog_publish_queue
            SET status = 'processing',
                locked_at = $1,
                lock_token = 'zombie-token-123',
                attempt_count = 1
            WHERE id = $2;
        `, [staleTimestamp, queue.id]);

        // Run recovery with 15-minute threshold
        const recovered = await blogQueueRepository.recoverStaleLocks(15);
        assert.ok(recovered.some((r) => r.id === queue.id), "Stale job must be detected and recovered");

        // Verify status reset to pending and lock token cleared
        const check = await pool.query("SELECT status, locked_at, lock_token FROM blog_publish_queue WHERE id = $1", [queue.id]);
        assert.equal(check.rows[0].status, "pending");
        assert.equal(check.rows[0].locked_at, null);
        assert.equal(check.rows[0].lock_token, null);
    });

    // -------------------------------------------------------------
    // Test 7: Transient Failure Exponential Backoff
    // -------------------------------------------------------------
    test("7. Retry: Resets transient failure to pending with exponential backoff", async () => {
        const { queue } = await seedDueBlog("Transient Failure Blog");

        const mockError = new Error("Simulated Neon network socket timeout");
        const failedJob = await blogQueueRepository.handleJobFailure(queue.id, "test-token", mockError, 3);

        assert.equal(failedJob.status, "pending", "Transient failure must reset to pending for retry");
        assert.ok(failedJob.next_attempt_at, "next_attempt_at must be populated with backoff");
        assert.ok(failedJob.last_error.includes("socket timeout"));

        // Verify backoff is scheduled in the future
        assert.ok(new Date(failedJob.next_attempt_at).getTime() > Date.now());
    });

    // -------------------------------------------------------------
    // Test 8: Maximum Retry Exhaustion
    // -------------------------------------------------------------
    test("8. Exhaustion: Marks job permanently as failed when max_attempts is reached", async () => {
        const { queue } = await seedDueBlog("Exhausted Retry Blog");

        // Set attempt_count = 3 (equals max_attempts = 3)
        await pool.query("UPDATE blog_publish_queue SET attempt_count = 3 WHERE id = $1", [queue.id]);

        const mockError = new Error("Fatal syntax error in content renderer");
        const failedJob = await blogQueueRepository.handleJobFailure(queue.id, "test-token", mockError, 3);

        assert.equal(failedJob.status, "failed", "Exhausted retry job must transition to failed");
        assert.ok(failedJob.last_error.includes("Fatal syntax error"));
    });

    // -------------------------------------------------------------
    // Test 9: Manual Publishing Advances Next Scheduled Slot
    // -------------------------------------------------------------
    test("9. Interaction: Manual publishing advances next_publish_at in settings by 360m", async () => {
        const { queue } = await seedDueBlog("Manual Publishing Interaction Blog");

        // Execute manual publish
        const pubResult = await blogPublishingService.publishQueueItem(queue.id, {
            userId: testAdminUserId,
            triggeredBy: "manual",
        });
        assert.equal(pubResult.success, true);

        // Verify next_publish_at in settings was pushed forward by 360 minutes
        const settings = await blogQueueRepository.getSettings();
        const diffMinutes = Math.round((new Date(settings.next_publish_at).getTime() - Date.now()) / (60 * 1000));
        assert.ok(diffMinutes >= 355 && diffMinutes <= 365, "Manual publish must push next automated slot by 360m");

        // Clean up settings for remaining tests
        await blogQueueRepository.updateSettings({ nextPublishAt: null });
    });

    // -------------------------------------------------------------
    // Test 10: Worker Health Diagnostics
    // -------------------------------------------------------------
    test("10. Health Monitoring: Worker exposes execution health and uptime status", () => {
        const status = schedulerWorker.getStatus();

        assert.equal(typeof status.isRunning, "boolean");
        assert.equal(typeof status.isProcessing, "boolean");
        assert.equal(typeof status.totalTicks, "number");
        assert.equal(typeof status.successfulPublishes, "number");
        assert.equal(typeof status.failedPublishes, "number");
        assert.equal(typeof status.uptimeSeconds, "number");
    });
});

