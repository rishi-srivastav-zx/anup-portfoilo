import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { pool } from "../src/config/db.js";

describe("Phase 1: Bulk Blog Scheduler Database Architecture Verification Suite", () => {
    let testBlogId;
    let testUserId;

    before(async () => {
        // Ensure we have a valid test blog
        const userRes = await pool.query(
            "SELECT id FROM users ORDER BY created_at LIMIT 1"
        );
        testUserId = userRes.rows[0]?.id || null;

        const blogRes = await pool.query(`
            INSERT INTO blogs (
                title, slug, excerpt, category, featured_image, featured_image_alt, status
            ) VALUES (
                'Scheduler Migration Test Blog',
                $1,
                'Testing bulk scheduler database tables and queue operations.',
                'Cinematography',
                'https://ik.imagekit.io/test/sample.jpg',
                'Sample Alt',
                'draft'
            )
            RETURNING id;
        `, [`test-scheduler-slug-${Date.now()}`]);

        testBlogId = blogRes.rows[0].id;
    });

    after(async () => {
        // Clean up test blog and cascading queue/logs
        if (testBlogId) {
            await pool.query("DELETE FROM blogs WHERE id = $1", [testBlogId]);
        }
    });

    test("1. Settings Table: Singleton row exists with required default values", async () => {
        const res = await pool.query("SELECT * FROM blog_scheduler_settings WHERE id = 1");
        assert.equal(res.rowCount, 1, "Singleton settings row with id=1 must exist");

        const settings = res.rows[0];
        assert.equal(typeof settings.enabled, "boolean", "enabled must be boolean");
        assert.ok(settings.publishing_interval_minutes >= 5, "publishing_interval_minutes must be >= 5");
        assert.ok(settings.daily_publish_limit >= 1, "daily_publish_limit must be >= 1");
        assert.ok(settings.timezone, "timezone must be populated");
        assert.ok(settings.created_at, "created_at must be populated");
        assert.ok(settings.updated_at, "updated_at must be populated");
    });

    test("2. Settings Table: Singleton constraint prevents inserting secondary row (id != 1)", async () => {
        await assert.rejects(
            async () => {
                await pool.query(`
                    INSERT INTO blog_scheduler_settings (id, enabled, publishing_interval_minutes, daily_publish_limit, timezone)
                    VALUES (2, true, 30, 5, 'UTC')
                `);
            },
            /check constraint.*id/i,
            "Inserting row with id != 1 must fail due to singleton CHECK constraint"
        );
    });

    test("3. Queue Table: Inserts pending queue item with valid scheduling fields", async () => {
        const scheduledTime = new Date(Date.now() + 3600000); // 1 hour in future

        const res = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, max_attempts, created_by
            ) VALUES (
                $1, 'pending', $2, $2, 3, $3
            )
            RETURNING *;
        `, [testBlogId, scheduledTime, testUserId]);

        assert.equal(res.rowCount, 1);
        const queueItem = res.rows[0];
        assert.equal(queueItem.blog_id, testBlogId);
        assert.equal(queueItem.status, "pending");
        assert.equal(queueItem.attempt_count, 0);
        assert.equal(queueItem.max_attempts, 3);
        assert.equal(queueItem.lock_token, null);
        assert.equal(queueItem.locked_at, null);
        assert.equal(queueItem.published_at, null);
    });

    test("4. Queue Table: Partial unique index prevents duplicate active jobs for the same blog", async () => {
        const scheduledTime = new Date(Date.now() + 7200000);

        await assert.rejects(
            async () => {
                await pool.query(`
                    INSERT INTO blog_publish_queue (
                        blog_id, status, scheduled_at, next_attempt_at
                    ) VALUES (
                        $1, 'pending', $2, $2
                    );
                `, [testBlogId, scheduledTime]);
            },
            /idx_blog_queue_unique_active_blog|duplicate key value/i,
            "Adding a second pending job for the same blog must violate unique active constraint"
        );
    });

    test("5. Queue Table: Status check constraint rejects invalid queue statuses", async () => {
        await assert.rejects(
            async () => {
                await pool.query(`
                    INSERT INTO blog_publish_queue (
                        blog_id, status, scheduled_at, next_attempt_at
                    ) VALUES (
                        $1, 'invalid_status_xyz', NOW(), NOW()
                    );
                `, [testBlogId]);
            },
            /check constraint.*status/i,
            "Invalid queue status must be rejected by check constraint"
        );
    });

    test("6. Queue Table: Lock acquisition and transition to processing status", async () => {
        const lockToken = crypto.randomUUID();
        const now = new Date();

        const res = await pool.query(`
            UPDATE blog_publish_queue
            SET status = 'processing',
                locked_at = $1,
                lock_token = $2,
                attempt_count = attempt_count + 1
            WHERE blog_id = $3 AND status = 'pending'
            RETURNING *;
        `, [now, lockToken, testBlogId]);

        assert.equal(res.rowCount, 1);
        const locked = res.rows[0];
        assert.equal(locked.status, "processing");
        assert.equal(locked.lock_token, lockToken);
        assert.equal(locked.attempt_count, 1);
        assert.ok(locked.locked_at);
    });

    test("7. Publish Logs Table: Inserts audit log linked to queue and blog", async () => {
        const queueRes = await pool.query(
            "SELECT id FROM blog_publish_queue WHERE blog_id = $1 LIMIT 1",
            [testBlogId]
        );
        const queueId = queueRes.rows[0].id;

        const res = await pool.query(`
            INSERT INTO blog_publish_logs (
                queue_id, blog_id, attempt_number, status, message, error_details, execution_duration_ms, triggered_by
            ) VALUES (
                $1, $2, 1, 'retrying', 'Simulated transient connection timeout; scheduling retry.',
                '{"error": "ETIMEDOUT", "code": 504}'::jsonb, 142, 'scheduler'
            )
            RETURNING *;
        `, [queueId, testBlogId]);

        assert.equal(res.rowCount, 1);
        const log = res.rows[0];
        assert.equal(log.queue_id, queueId);
        assert.equal(log.blog_id, testBlogId);
        assert.equal(log.status, "retrying");
        assert.equal(log.attempt_number, 1);
        assert.equal(log.execution_duration_ms, 142);
        assert.ok(log.created_at);
    });

    test("8. Queue Table: Cancel existing job allows new pending job to be queued", async () => {
        // Cancel the current processing job
        await pool.query(`
            UPDATE blog_publish_queue
            SET status = 'cancelled',
                last_error = 'Cancelled by administrator'
            WHERE blog_id = $1 AND status = 'processing';
        `, [testBlogId]);

        // Now queueing a new pending job for the same blog should succeed because old job is cancelled
        const nextTime = new Date(Date.now() + 1800000);
        const newQueueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at
            ) VALUES (
                $1, 'pending', $2, $2
            )
            RETURNING id, status;
        `, [testBlogId, nextTime]);

        assert.equal(newQueueRes.rowCount, 1);
        assert.equal(newQueueRes.rows[0].status, "pending");
    });

    test("9. Cascade Delete: Deleting blog removes all associated queue items and logs", async () => {
        // Create an ephemeral blog to test cascade
        const tempRes = await pool.query(`
            INSERT INTO blogs (
                title, slug, excerpt, category, featured_image, featured_image_alt, status
            ) VALUES (
                'Ephemeral Cascade Test Blog',
                $1,
                'Excerpt',
                'Cinematography',
                'https://ik.imagekit.io/test/ephemeral.jpg',
                'Alt',
                'draft'
            )
            RETURNING id;
        `, [`ephemeral-slug-${Date.now()}`]);
        const ephemeralBlogId = tempRes.rows[0].id;

        const queueRes = await pool.query(`
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at
            ) VALUES (
                $1, 'pending', NOW(), NOW()
            )
            RETURNING id;
        `, [ephemeralBlogId]);
        const tempQueueId = queueRes.rows[0].id;

        await pool.query(`
            INSERT INTO blog_publish_logs (
                queue_id, blog_id, attempt_number, status, message
            ) VALUES (
                $1, $2, 1, 'success', 'Published successfully'
            );
        `, [tempQueueId, ephemeralBlogId]);

        // Delete ephemeral blog
        await pool.query("DELETE FROM blogs WHERE id = $1", [ephemeralBlogId]);

        // Queue item and log entry must cascade delete
        const checkQueue = await pool.query(
            "SELECT 1 FROM blog_publish_queue WHERE blog_id = $1",
            [ephemeralBlogId]
        );
        assert.equal(checkQueue.rowCount, 0, "Queue row must cascade delete on blog deletion");

        const checkLogs = await pool.query(
            "SELECT 1 FROM blog_publish_logs WHERE blog_id = $1",
            [ephemeralBlogId]
        );
        assert.equal(checkLogs.rowCount, 0, "Log row must cascade delete on blog deletion");
    });

    test("10. Worker Polling Query: SELECT FOR UPDATE SKIP LOCKED works cleanly", async () => {
        const client = await pool.connect();
        try {
            await client.query("BEGIN");
            const res = await client.query(`
                SELECT id, blog_id, next_attempt_at
                FROM blog_publish_queue
                WHERE status = 'pending' AND next_attempt_at <= NOW() + INTERVAL '2 hours'
                ORDER BY next_attempt_at ASC, created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED;
            `);
            assert.ok(Array.isArray(res.rows));
            await client.query("ROLLBACK");
        } finally {
            client.release();
        }
    });
});

