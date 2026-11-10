import { pool } from "../config/db.js";
import { invalidateBlogCache } from "../controllers/blog.controller.js";

/**
 * Production-Ready Publishing Service Interface
 * Implements real transactional publishing for scheduled and manual operations.
 */
export const blogPublishingService = {
    /**
     * Publishes a queued blog item immediately within a strict database transaction.
     * @param {string} queueId UUID of the queue item
     * @param {object} options
     * @param {string|null} options.userId User ID of the administrator
     * @param {string} options.triggeredBy 'manual' | 'scheduler'
     * @returns {Promise<object>} Published blog and queue details
     */
    async publishQueueItem(queueId, { userId = null, triggeredBy = "manual", lockToken = null } = {}) {
        const startTime = Date.now();
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            // 1. Lock queue row FOR UPDATE
            const queueRes = await client.query(
                `SELECT * FROM blog_publish_queue WHERE id = $1 FOR UPDATE`,
                [queueId]
            );

            if (queueRes.rowCount === 0) {
                throw new Error("Queue item not found.");
            }

            const queueItem = queueRes.rows[0];

            // 2. Validate state transitions
            if (queueItem.status === "published") {
                throw new Error("This queue item has already been published.");
            }
            if (queueItem.status === "cancelled") {
                throw new Error("Cannot publish a cancelled queue item.");
            }

            // Verify lock token if supplied by worker to prevent stolen or expired locks
            if (lockToken && queueItem.lock_token && queueItem.lock_token !== lockToken) {
                throw new Error("Lock token mismatch. Worker lock may have expired or been reassigned.");
            }

            const now = new Date();

            // 3. Update blog record: set status = 'published' and published_at = NOW()
            const blogRes = await client.query(
                `UPDATE blogs
                 SET status = 'published',
                     published_at = COALESCE(published_at, $2),
                     updated_at = $2
                 WHERE id = $1
                 RETURNING id, title, slug, category, status, published_at, updated_at`,
                [queueItem.blog_id, now]
            );

            if (blogRes.rowCount === 0) {
                throw new Error(`Target blog ${queueItem.blog_id} not found in database.`);
            }

            const publishedBlog = blogRes.rows[0];

            // 4. Update queue row: set status = 'published' and published_at = NOW()
            const updatedQueueRes = await client.query(
                `UPDATE blog_publish_queue
                 SET status = 'published',
                     published_at = $2,
                     locked_at = NULL,
                     lock_token = NULL,
                     attempt_count = attempt_count + 1,
                     last_error = NULL,
                     updated_at = $2
                 WHERE id = $1
                 RETURNING *`,
                [queueId, now]
            );

            const updatedQueue = updatedQueueRes.rows[0];
            const durationMs = Date.now() - startTime;

            // 5. Update next_publish_at in blog_scheduler_settings (respecting 360m interval)
            const settingsRes = await client.query(
                "SELECT publishing_interval_minutes FROM blog_scheduler_settings WHERE id = 1"
            );
            const intervalMinutes = settingsRes.rows[0]?.publishing_interval_minutes || 360;
            const nextSlot = new Date(now.getTime() + intervalMinutes * 60 * 1000);
            await client.query(
                "UPDATE blog_scheduler_settings SET next_publish_at = $1, updated_at = NOW() WHERE id = 1",
                [nextSlot]
            );

            // 6. Insert immutable audit log into blog_publish_logs
            const logRes = await client.query(
                `INSERT INTO blog_publish_logs (
                    queue_id, blog_id, attempt_number, status, message,
                    execution_duration_ms, triggered_by, user_id
                ) VALUES (
                    $1, $2, $3, 'success', $4, $5, $6, $7
                )
                RETURNING *`,
                [
                    queueId,
                    publishedBlog.id,
                    updatedQueue.attempt_count,
                    triggeredBy === "manual"
                        ? "Article published manually by administrator."
                        : "Article published automatically by scheduler worker.",
                    durationMs,
                    triggeredBy,
                    userId,
                ]
            );

            await client.query("COMMIT");

            // 6. Invalidate in-memory blog caches so public site updates instantly
            try {
                invalidateBlogCache();
            } catch (err) {
                console.error("[blogPublishingService] Cache invalidation warning:", err.message);
            }

            // 7. Trigger Next.js on-demand route cache revalidation
            let revalidationResult = null;
            try {
                revalidationResult = await this.triggerFrontendRevalidation(publishedBlog.slug);
            } catch (err) {
                console.warn("[blogPublishingService] Frontend revalidation warning:", err.message);
            }

            return {
                success: true,
                message: `Blog "${publishedBlog.title}" successfully published.`,
                blog: publishedBlog,
                queue: updatedQueue,
                log: logRes.rows[0],
                revalidation: revalidationResult,
            };
        } catch (err) {
            await client.query("ROLLBACK");
            throw err;
        } finally {
            client.release();
        }
    },

    /**
     * Triggers Next.js on-demand cache revalidation.
     * Best effort: non-blocking, logs warning on failure so publication is never compromised.
     */
    async triggerFrontendRevalidation(slug) {
        const frontendUrl =
            process.env.FRONTEND_URL ||
            process.env.NEXT_PUBLIC_SITE_URL ||
            "http://localhost:3000";
        const secret =
            process.env.REVALIDATE_SECRET ||
            process.env.CRON_SECRET ||
            "anup-portfolio-revalidate-secret";

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);
            const res = await fetch(`${frontendUrl}/api/revalidate`, {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    "x-revalidate-secret": secret,
                },
                body: JSON.stringify({ slug }),
            });
            clearTimeout(timeout);

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                console.warn(
                    `[blogPublishingService] Frontend revalidation returned status ${res.status}: ${text}`
                );
                return { success: false, status: res.status, error: text };
            }

            const data = await res.json().catch(() => ({}));
            return { success: true, ...data };
        } catch (err) {
            console.warn(
                `[blogPublishingService] Frontend revalidation non-blocking warning: ${err.message}`
            );
            return { success: false, error: err.message };
        }
    },

    /**
     * Recover from a failed cache revalidation or manually refresh frontend cache
     * for an already-published blog WITHOUT publishing or modifying database states again.
     */
    async revalidatePublishedBlog(slug) {
        const cleanSlug = String(slug || "").trim();
        if (!cleanSlug) {
            throw new Error("Slug is required for revalidation.");
        }

        // Verify blog exists and is actually published
        const blogRes = await pool.query(
            "SELECT id, title, slug, status FROM blogs WHERE slug = $1",
            [cleanSlug]
        );

        if (blogRes.rowCount === 0) {
            throw new Error(`Blog with slug "${cleanSlug}" was not found.`);
        }

        const blog = blogRes.rows[0];
        if (blog.status !== "published") {
            throw new Error(
                `Cannot revalidate blog "${cleanSlug}" because it is in '${blog.status}' status, not published.`
            );
        }

        // 1. Invalidate Express in-memory cache
        invalidateBlogCache();

        // 2. Trigger Next.js revalidation
        const revalResult = await this.triggerFrontendRevalidation(cleanSlug);

        return {
            success: true,
            blog: { id: blog.id, title: blog.title, slug: blog.slug },
            cacheCleared: true,
            frontendRevalidation: revalResult,
        };
    },
};

export default blogPublishingService;

