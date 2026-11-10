import { pool } from "../config/db.js";
import { redactSensitiveData } from "../utils/htmlSanitizer.js";

const escapeLike = (s) => String(s).replace(/[\\%_]/g, "\\$&");

export const blogQueueRepository = {
    /**
     * Retrieve the singleton scheduler settings.
     */
    async getSettings(client = pool) {
        const res = await client.query(
            "SELECT * FROM blog_scheduler_settings WHERE id = 1"
        );
        return res.rows[0] || null;
    },

    /**
     * Update the singleton scheduler settings.
     */
    async updateSettings(data, client = pool) {
        const fields = [];
        const values = [];

        if (data.enabled !== undefined) {
            values.push(Boolean(data.enabled));
            fields.push(`enabled = $${values.length}`);
        }
        if (data.publishingIntervalMinutes !== undefined) {
            values.push(data.publishingIntervalMinutes);
            fields.push(`publishing_interval_minutes = $${values.length}`);
        }
        if (data.dailyPublishLimit !== undefined) {
            values.push(data.dailyPublishLimit);
            fields.push(`daily_publish_limit = $${values.length}`);
        }
        if (data.nextPublishAt !== undefined) {
            values.push(data.nextPublishAt);
            fields.push(`next_publish_at = $${values.length}`);
        }
        if (data.timezone !== undefined) {
            values.push(data.timezone);
            fields.push(`timezone = $${values.length}`);
        }

        if (fields.length === 0) return this.getSettings(client);

        fields.push("updated_at = NOW()");
        const res = await client.query(
            `UPDATE blog_scheduler_settings
             SET ${fields.join(", ")}
             WHERE id = 1
             RETURNING *`,
            values
        );
        return res.rows[0];
    },

    /**
     * Finds the latest scheduled_at among pending/processing queue items.
     */
    async getLatestScheduledTime(client = pool) {
        const res = await client.query(`
            SELECT MAX(scheduled_at) AS latest
            FROM blog_publish_queue
            WHERE status IN ('pending', 'processing')
        `);
        return res.rows[0]?.latest ? new Date(res.rows[0].latest) : null;
    },

    /**
     * Checks which slugs already exist in the database from an array of slugs.
     */
    async findExistingSlugs(slugs, client = pool) {
        if (!slugs || slugs.length === 0) return [];
        const res = await client.query(
            "SELECT slug FROM blogs WHERE slug = ANY($1::varchar[])",
            [slugs]
        );
        return res.rows.map((r) => r.slug);
    },

    /**
     * Finds queue record by ID with joined blog metadata.
     */
    async findQueueById(id, client = pool) {
        const res = await client.query(
            `SELECT 
                q.id AS "queueId",
                q.blog_id AS "blogId",
                b.title,
                b.slug,
                b.category,
                b.status AS "blogStatus",
                b.featured_image AS "featuredImage",
                q.status,
                q.scheduled_at AS "scheduledAt",
                q.next_attempt_at AS "nextAttemptAt",
                q.attempt_count AS "attemptCount",
                q.max_attempts AS "maxAttempts",
                q.locked_at AS "lockedAt",
                q.lock_token AS "lockToken",
                q.last_error AS "lastError",
                q.published_at AS "publishedAt",
                q.created_at AS "createdAt",
                q.updated_at AS "updatedAt"
            FROM blog_publish_queue q
            JOIN blogs b ON b.id = q.blog_id
            WHERE q.id = $1`,
            [id]
        );
        return res.rows[0] || null;
    },

    /**
     * Checks if a blog has an active (pending or processing) queue item.
     */
    async findActiveQueueForBlog(blogId, client = pool) {
        const res = await client.query(
            `SELECT id, blog_id, status, scheduled_at
             FROM blog_publish_queue
             WHERE blog_id = $1 AND status IN ('pending', 'processing')
             LIMIT 1`,
            [blogId]
        );
        return res.rows[0] || null;
    },

    /**
     * Inserts a single blog and its queue item within an active transaction client.
     */
    async insertBlogAndQueue({ blogData, queueData }, client) {
        const blogInsertSql = `
            INSERT INTO blogs (
                user_id, title, slug, excerpt, category, tags, author,
                featured_image, featured_image_alt, featured_image_file_id,
                gallery_images, reading_time, status, is_featured, layout_variant,
                technical_note, introduction, content, sections,
                seo_title, seo_description, seo_keywords, canonical_url, published_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, 'draft', $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NULL
            )
            RETURNING id, title, slug, category, status, created_at;
        `;

        const blogValues = [
            blogData.userId || null,
            blogData.title,
            blogData.slug,
            blogData.excerpt || "",
            blogData.category || "Cinematography",
            blogData.tags || [],
            JSON.stringify(blogData.author || {}),
            blogData.featuredImage || "",
            blogData.featuredImageAlt || "",
            blogData.featuredImageFileId || null,
            JSON.stringify(blogData.galleryImages || []),
            blogData.readingTime || "1 min read",
            blogData.isFeatured || false,
            blogData.layoutVariant || "wide",
            blogData.technicalNote || null,
            JSON.stringify(blogData.introduction || []),
            blogData.content || "",
            JSON.stringify(blogData.sections || []),
            blogData.seoTitle || null,
            blogData.seoDescription || null,
            blogData.seoKeywords || null,
            blogData.canonicalUrl || null,
        ];

        const blogRes = await client.query(blogInsertSql, blogValues);
        const createdBlog = blogRes.rows[0];

        const queueInsertSql = `
            INSERT INTO blog_publish_queue (
                blog_id, status, scheduled_at, next_attempt_at, attempt_count, max_attempts, created_by
            ) VALUES (
                $1, 'pending', $2, $2, 0, $3, $4
            )
            RETURNING id, blog_id, status, scheduled_at, next_attempt_at;
        `;

        const queueValues = [
            createdBlog.id,
            queueData.scheduledAt,
            queueData.maxAttempts || 3,
            queueData.createdBy || null,
        ];

        const queueRes = await client.query(queueInsertSql, queueValues);
        const createdQueue = queueRes.rows[0];

        await client.query(`
            INSERT INTO blog_publish_logs (
                queue_id, blog_id, attempt_number, status, message, user_id
            ) VALUES (
                $1, $2, 1, 'retrying', 'Blog queued for automated publication.', $3
            );
        `, [createdQueue.id, createdBlog.id, queueData.createdBy || null]);

        return {
            blog: createdBlog,
            queue: createdQueue,
        };
    },

    /**
     * Lists queue jobs with pagination, status filter, and title/slug search.
     */
    async listQueue({ status, search, page = 1, limit = 50, sortBy = "scheduledAt", order = "ASC" } = {}, client = pool) {
        const offset = Math.max(0, (page - 1) * limit);
        const params = [];
        const conditions = [];

        if (status && status !== "all") {
            params.push(status);
            conditions.push(`q.status = $${params.length}`);
        }

        if (search && search.trim()) {
            const like = `%${escapeLike(search.trim())}%`;
            params.push(like);
            conditions.push(`(b.title ILIKE $${params.length} OR b.slug ILIKE $${params.length} OR q.last_error ILIKE $${params.length})`);
        }

        const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const sortMap = {
            scheduledAt: "q.scheduled_at",
            createdAt: "q.created_at",
            nextAttemptAt: "q.next_attempt_at",
            status: "q.status",
            title: "b.title",
        };
        const sortCol = sortMap[sortBy] || "q.scheduled_at";
        const sortDir = String(order).toUpperCase() === "DESC" ? "DESC" : "ASC";

        const listQuery = `
            SELECT 
                q.id AS "queueId",
                q.blog_id AS "blogId",
                b.title,
                b.slug,
                b.category,
                b.status AS "blogStatus",
                b.featured_image AS "featuredImage",
                q.status,
                q.scheduled_at AS "scheduledAt",
                q.next_attempt_at AS "nextAttemptAt",
                q.attempt_count AS "attemptCount",
                q.max_attempts AS "maxAttempts",
                q.locked_at AS "lockedAt",
                q.last_error AS "lastError",
                q.published_at AS "publishedAt",
                q.created_at AS "createdAt"
            FROM blog_publish_queue q
            JOIN blogs b ON b.id = q.blog_id
            ${whereSql}
            ORDER BY ${sortCol} ${sortDir}, q.created_at ASC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM blog_publish_queue q
            JOIN blogs b ON b.id = q.blog_id
            ${whereSql}
        `;

        const [listRes, countRes] = await Promise.all([
            client.query(listQuery, [...params, limit, offset]),
            client.query(countQuery, params),
        ]);

        return {
            items: listRes.rows,
            total: countRes.rows[0].total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(countRes.rows[0].total / limit) || 1,
        };
    },

    /**
     * Aggregates queue statistics for administrative dashboard monitoring.
     */
    async getQueueStats(client = pool) {
        const statsQuery = `
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE q.status = 'pending')::int AS pending,
                COUNT(*) FILTER (WHERE q.status = 'processing')::int AS processing,
                COUNT(*) FILTER (WHERE q.status = 'published')::int AS published,
                COUNT(*) FILTER (WHERE q.status = 'failed')::int AS failed,
                COUNT(*) FILTER (WHERE q.status = 'cancelled')::int AS cancelled,
                MIN(q.scheduled_at) FILTER (WHERE q.status = 'pending') AS "nextScheduledAt",
                MAX(q.published_at) FILTER (WHERE q.status = 'published') AS "lastPublishedAt",
                COUNT(*) FILTER (WHERE q.status = 'published' AND q.published_at >= CURRENT_DATE)::int AS "dailyPublishedToday"
            FROM blog_publish_queue q;
        `;

        const [statsRes, settings] = await Promise.all([
            client.query(statsQuery),
            this.getSettings(client),
        ]);

        const raw = statsRes.rows[0];
        return {
            total: raw.total,
            pending: raw.pending,
            processing: raw.processing,
            published: raw.published,
            failed: raw.failed,
            cancelled: raw.cancelled,
            nextScheduledAt: raw.nextScheduledAt,
            lastPublishedAt: raw.lastPublishedAt,
            dailyPublishedToday: raw.dailyPublishedToday,
            dailyPublishLimit: settings?.daily_publish_limit || 10,
            publishingIntervalMinutes: settings?.publishing_interval_minutes || 360,
            schedulerEnabled: settings?.enabled ?? true,
            timezone: settings?.timezone || "Asia/Kolkata",
        };
    },

    /**
     * Cancels a pending queue item.
     */
    async cancelQueueItem(queueId, reason = "Cancelled by administrator", userId = null, client = pool) {
        const queueRes = await client.query(
            "SELECT * FROM blog_publish_queue WHERE id = $1 FOR UPDATE",
            [queueId]
        );

        if (queueRes.rowCount === 0) {
            throw new Error("Queue item not found.");
        }

        const queueItem = queueRes.rows[0];
        if (queueItem.status === "published") {
            throw new Error("Cannot cancel an already published queue item.");
        }
        if (queueItem.status === "cancelled") {
            throw new Error("Queue item is already cancelled.");
        }
        if (queueItem.status === "processing") {
            throw new Error("Cannot cancel a job that is currently processing.");
        }

        const updateRes = await client.query(
            `UPDATE blog_publish_queue
             SET status = 'cancelled',
                 last_error = $2,
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [queueId, reason]
        );

        await client.query(
            `INSERT INTO blog_publish_logs (
                queue_id, blog_id, attempt_number, status, message, user_id
            ) VALUES (
                $1, $2, $3, 'cancelled', $4, $5
            )`,
            [queueId, queueItem.blog_id, queueItem.attempt_count + 1, reason, userId]
        );

        return updateRes.rows[0];
    },

    /**
     * Retries a failed queue item by resetting its status to pending.
     */
    async retryFailedItem(queueId, nextAttemptAt = null, userId = null, client = pool) {
        const queueRes = await client.query(
            "SELECT * FROM blog_publish_queue WHERE id = $1 FOR UPDATE",
            [queueId]
        );

        if (queueRes.rowCount === 0) {
            throw new Error("Queue item not found.");
        }

        const queueItem = queueRes.rows[0];
        if (queueItem.status !== "failed") {
            throw new Error(`Only failed queue items can be retried (current status is "${queueItem.status}").`);
        }

        // Verify that the blog does not already have another active pending/processing queue item
        const activeCheck = await client.query(
            `SELECT id FROM blog_publish_queue
             WHERE blog_id = $1 AND id <> $2 AND status IN ('pending', 'processing')
             LIMIT 1`,
            [queueItem.blog_id, queueId]
        );

        if (activeCheck.rowCount > 0) {
            throw new Error(`Blog already has another active queued job (${activeCheck.rows[0].id}). Cannot retry.`);
        }

        const retryTime = nextAttemptAt ? new Date(nextAttemptAt) : new Date();

        const updateRes = await client.query(
            `UPDATE blog_publish_queue
             SET status = 'pending',
                 scheduled_at = $2,
                 next_attempt_at = $2,
                 attempt_count = 0,
                 last_error = NULL,
                 locked_at = NULL,
                 lock_token = NULL,
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [queueId, retryTime]
        );

        await client.query(
            `INSERT INTO blog_publish_logs (
                queue_id, blog_id, attempt_number, status, message, user_id
            ) VALUES (
                $1, $2, $3, 'retrying', 'Queue job manually reset and retried by administrator.', $4
            )`,
            [queueId, queueItem.blog_id, queueItem.attempt_count + 1, userId]
        );

        return updateRes.rows[0];
    },

    /**
     * Reorders pending queue items sequentially.
     */
    async reorderPendingQueue(orderedQueueIds, startFromDate = null, intervalMinutes = null, client = pool) {
        if (!Array.isArray(orderedQueueIds) || orderedQueueIds.length === 0) {
            throw new Error("Must provide an array of queue IDs to reorder.");
        }

        // 1. Fetch and verify all items are pending
        const fetchRes = await client.query(
            `SELECT id, status, scheduled_at
             FROM blog_publish_queue
             WHERE id = ANY($1::uuid[])
             FOR UPDATE`,
            [orderedQueueIds]
        );

        if (fetchRes.rowCount !== orderedQueueIds.length) {
            throw new Error("One or more queue items could not be found.");
        }

        for (const row of fetchRes.rows) {
            if (row.status !== "pending") {
                throw new Error(`Cannot reorder non-pending queue job ${row.id} (current status: "${row.status}").`);
            }
        }

        // 2. Determine base time and interval
        const settings = await this.getSettings(client);
        const interval = intervalMinutes || settings?.publishing_interval_minutes || 360;

        let baseTime;
        if (startFromDate) {
            baseTime = new Date(startFromDate);
        } else {
            // Use the earliest scheduled time among the items
            const earliestTime = Math.min(...fetchRes.rows.map((r) => new Date(r.scheduled_at).getTime()));
            baseTime = new Date(earliestTime);
        }

        // 3. Update each item sequentially in requested order
        const updatedItems = [];
        for (let i = 0; i < orderedQueueIds.length; i++) {
            const queueId = orderedQueueIds[i];
            const newScheduleTime = new Date(baseTime.getTime() + i * interval * 60 * 1000);

            const res = await client.query(
                `UPDATE blog_publish_queue
                 SET scheduled_at = $2,
                     next_attempt_at = $2,
                     updated_at = NOW()
                 WHERE id = $1
                 RETURNING id, blog_id, status, scheduled_at`,
                [queueId, newScheduleTime]
            );
            updatedItems.push(res.rows[0]);
        }

        return updatedItems;
    },

    /**
     * Retrieves complete publishing history and logs for a specific blog.
     */
    async getBlogPublishingHistory(blogId, client = pool) {
        const [queueRes, logsRes] = await Promise.all([
            client.query(
                `SELECT * FROM blog_publish_queue WHERE blog_id = $1 ORDER BY created_at DESC`,
                [blogId]
            ),
            client.query(
                `SELECT * FROM blog_publish_logs WHERE blog_id = $1 ORDER BY created_at DESC`,
                [blogId]
            ),
        ]);

        return {
            queueItems: queueRes.rows,
            publishLogs: logsRes.rows,
        };
    },

    /**
     * Lists scheduler audit logs with optional filters and pagination.
     */
    async listPublishLogs({ status, queueId, blogId, page = 1, limit = 50 } = {}, client = pool) {
        const offset = Math.max(0, (page - 1) * limit);
        const params = [];
        const conditions = [];

        if (status && status !== "all") {
            params.push(status);
            conditions.push(`l.status = $${params.length}`);
        }
        if (queueId) {
            params.push(queueId);
            conditions.push(`l.queue_id = $${params.length}`);
        }
        if (blogId) {
            params.push(blogId);
            conditions.push(`l.blog_id = $${params.length}`);
        }

        const whereSql = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

        const listQuery = `
            SELECT 
                l.id AS "logId",
                l.queue_id AS "queueId",
                l.blog_id AS "blogId",
                b.title,
                b.slug,
                l.attempt_number AS "attemptNumber",
                l.status,
                l.message,
                l.error_details AS "errorDetails",
                l.execution_duration_ms AS "executionDurationMs",
                l.triggered_by AS "triggeredBy",
                l.created_at AS "createdAt"
            FROM blog_publish_logs l
            JOIN blogs b ON b.id = l.blog_id
            ${whereSql}
            ORDER BY l.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;

        const countQuery = `
            SELECT COUNT(*)::int AS total
            FROM blog_publish_logs l
            ${whereSql}
        `;

        const [listRes, countRes] = await Promise.all([
            client.query(listQuery, [...params, limit, offset]),
            client.query(countQuery, params),
        ]);

        return {
            items: listRes.rows,
            total: countRes.rows[0].total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(countRes.rows[0].total / limit) || 1,
        };
    },

    /**
     * Atomically claims exactly one pending job that is due for publishing.
     * Uses PostgreSQL SELECT FOR UPDATE SKIP LOCKED to guarantee concurrency safety.
     */
    async claimNextEligibleJob(lockToken, client = pool) {
        const query = `
            WITH eligible AS (
                SELECT q.id
                FROM blog_publish_queue q
                WHERE q.status = 'pending'
                  AND q.scheduled_at <= NOW()
                  AND q.next_attempt_at <= NOW()
                ORDER BY q.scheduled_at ASC, q.created_at ASC
                LIMIT 1
                FOR UPDATE SKIP LOCKED
            )
            UPDATE blog_publish_queue
            SET status = 'processing',
                locked_at = NOW(),
                lock_token = $1,
                attempt_count = attempt_count + 1,
                updated_at = NOW()
            FROM eligible
            WHERE blog_publish_queue.id = eligible.id
            RETURNING blog_publish_queue.*;
        `;

        const res = await client.query(query, [lockToken]);
        return res.rows[0] || null;
    },

    /**
     * Identifies and recovers zombie locks (processing status older than timeoutMinutes).
     */
    async recoverStaleLocks(timeoutMinutes = 15, client = pool) {
        const fetchQuery = `
            SELECT id, blog_id, attempt_count, max_attempts, locked_at
            FROM blog_publish_queue
            WHERE status = 'processing'
              AND locked_at < NOW() - ($1 || ' minutes')::interval
            FOR UPDATE SKIP LOCKED
        `;

        const res = await client.query(fetchQuery, [timeoutMinutes]);
        const recovered = [];

        for (const job of res.rows) {
            const isExhausted = job.attempt_count >= job.max_attempts;
            const newStatus = isExhausted ? "failed" : "pending";
            const reason = isExhausted
                ? "Execution timed out and maximum retry attempts exhausted."
                : "Worker lock timed out; safely reset to pending for retry.";

            await client.query(
                `UPDATE blog_publish_queue
                 SET status = $2,
                     locked_at = NULL,
                     lock_token = NULL,
                     next_attempt_at = NOW() + INTERVAL '5 minutes',
                     last_error = $3,
                     updated_at = NOW()
                 WHERE id = $1`,
                [job.id, newStatus, reason]
            );

            await client.query(
                `INSERT INTO blog_publish_logs (
                    queue_id, blog_id, attempt_number, status, message
                ) VALUES (
                    $1, $2, $3, $4, $5
                )`,
                [job.id, job.blog_id, Math.max(1, job.attempt_count || 1), isExhausted ? "failed" : "retrying", reason]
            );

            recovered.push({ id: job.id, status: newStatus });
        }

        return recovered;
    },

    /**
     * Handles job execution failure with exponential backoff and retry scheduling.
     */
    async handleJobFailure(queueId, lockToken, error, maxAttempts = 3, client = pool) {
        const fetchRes = await client.query(
            "SELECT id, blog_id, attempt_count, max_attempts FROM blog_publish_queue WHERE id = $1 FOR UPDATE",
            [queueId]
        );

        if (fetchRes.rowCount === 0) return null;
        const job = fetchRes.rows[0];

        const attempts = Math.max(1, job.attempt_count || 1);
        const maxLimit = job.max_attempts || maxAttempts;
        const isExhausted = attempts >= maxLimit;
        const newStatus = isExhausted ? "failed" : "pending";

        // Exponential backoff: 5m, 10m, 20m, 40m, max 60m
        const backoffMinutes = Math.min(60, 5 * Math.pow(2, Math.max(0, attempts - 1)));
        const nextAttemptAt = newStatus === "pending"
            ? new Date(Date.now() + backoffMinutes * 60 * 1000)
            : null;
        const errMsg = error?.message || "Transient publishing failure";

        const updateRes = await client.query(
            `UPDATE blog_publish_queue
             SET status = $2,
                 locked_at = NULL,
                 lock_token = NULL,
                 next_attempt_at = COALESCE($3::timestamptz, next_attempt_at),
                 last_error = $4,
                 updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [queueId, newStatus, nextAttemptAt, errMsg]
        );

        await client.query(
            `INSERT INTO blog_publish_logs (
                queue_id, blog_id, attempt_number, status, message, error_details
            ) VALUES (
                $1, $2, $3, $4, $5, $6
            )`,
            [
                queueId,
                job.blog_id,
                attempts,
                isExhausted ? "failed" : "retrying",
                isExhausted
                    ? `Publishing failed permanently after ${attempts} attempts: ${errMsg}`
                    : `Publishing attempt #${attempts} failed. Retrying in ${backoffMinutes} minutes.`,
                JSON.stringify(redactSensitiveData({ error: errMsg, stack: error?.stack || null })),
            ]
        );

        return updateRes.rows[0];
    },

    /**
     * Checks if the daily publishing limit has already been met for today in the given timezone.
     */
    async checkDailyPublishLimit(timezone = "Asia/Kolkata", limit = 10, client = pool) {
        const res = await client.query(
            `SELECT COUNT(*)::int AS count
             FROM blog_publish_queue
             WHERE status = 'published'
               AND published_at >= (NOW() AT TIME ZONE $1)::date`,
            [timezone]
        );
        const count = res.rows[0]?.count || 0;
        return {
            publishedToday: count,
            limit,
            isReached: count >= limit,
        };
    },
};

export default blogQueueRepository;
