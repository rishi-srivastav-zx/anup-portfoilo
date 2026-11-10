import crypto from "crypto";
import { blogQueueRepository } from "../repositories/blogQueue.repository.js";
import { blogPublishingService } from "../services/blogPublishing.service.js";
import { blogSchedulerService } from "../services/blogScheduler.service.js";
import { schedulerWorker } from "../workers/blogSchedulerWorker.js";
import { env } from "../config/env.js";
import { redactSensitiveData } from "../utils/htmlSanitizer.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Timing-safe string comparison to prevent side-channel timing attacks
 * on secret tokens (CRON_SECRET).
 */
function safeTimingCompare(provided, expected) {
    if (!provided || !expected) return false;
    if (typeof provided !== "string" || typeof expected !== "string") return false;
    const provBuf = Buffer.from(provided);
    const expBuf = Buffer.from(expected);
    if (provBuf.length !== expBuf.length) {
        // Run dummy timing comparison to avoid leaking length differential
        crypto.timingSafeEqual(expBuf, expBuf);
        return false;
    }
    return crypto.timingSafeEqual(provBuf, expBuf);
}

function isValidTimezone(tz) {
    if (!tz || typeof tz !== "string") return false;
    try {
        Intl.DateTimeFormat(undefined, { timeZone: tz });
        return true;
    } catch {
        return false;
    }
}

const safeErrorMessage = (err, defaultMsg = "An internal error occurred.") => {
    if (env.NODE_ENV === "production") {
        if (err.status === 400 || err.status === 422 || err.isUserFacing) {
            return err.message;
        }
        return defaultMsg;
    }
    return err.message;
};

const fail = (res, code, message, extra = {}) =>
    res.status(code).json({
        success: false,
        message,
        ...extra,
    });

export const blogQueueController = {
    /**
     * GET /api/blogs/scheduler/queue
     * Paginated list of queue records with filtering, searching, and sorting.
     */
    getQueue: async (req, res) => {
        try {
            const {
                status = "all",
                search = "",
                page = 1,
                limit = 50,
                sortBy = "scheduledAt",
                order = "ASC",
            } = req.query;

            // Bounded pagination: limit max 100, page min 1
            const boundedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
            const boundedPage = Math.max(parseInt(page, 10) || 1, 1);

            const result = await blogQueueRepository.listQueue({
                status,
                search: typeof search === "string" ? search.slice(0, 100) : "",
                page: boundedPage,
                limit: boundedLimit,
                sortBy,
                order,
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to retrieve queue records."));
        }
    },

    /**
     * GET /api/blogs/scheduler/stats
     * Aggregated queue metrics, next scheduled job, and scheduler status.
     */
    getQueueStats: async (req, res) => {
        try {
            const stats = await blogQueueRepository.getQueueStats();
            return res.status(200).json({
                success: true,
                data: stats,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to retrieve queue statistics."));
        }
    },

    /**
     * GET /api/blogs/scheduler/settings
     */
    getSettings: async (req, res) => {
        try {
            const settings = await blogQueueRepository.getSettings();
            return res.status(200).json({
                success: true,
                data: settings,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to retrieve scheduler settings."));
        }
    },

    /**
     * PATCH /api/blogs/scheduler/settings
     * Updates publishing interval, daily limit, timezone, and enable/pause state.
     */
    updateSettings: async (req, res) => {
        try {
            const {
                enabled,
                publishingIntervalMinutes,
                dailyPublishLimit,
                nextPublishAt,
                timezone,
            } = req.body;

            // Validate constraints
            if (
                publishingIntervalMinutes !== undefined &&
                (publishingIntervalMinutes < 5 || publishingIntervalMinutes > 1440)
            ) {
                return fail(res, 422, "publishingIntervalMinutes must be between 5 and 1440 minutes (24 hours).");
            }

            if (
                dailyPublishLimit !== undefined &&
                (dailyPublishLimit < 1 || dailyPublishLimit > 100)
            ) {
                return fail(res, 422, "dailyPublishLimit must be between 1 and 100.");
            }

            if (timezone !== undefined && !isValidTimezone(timezone)) {
                return fail(res, 422, "Invalid timezone string. Must be a valid IANA timezone name (e.g. Asia/Kolkata).");
            }

            const updated = await blogQueueRepository.updateSettings({
                enabled,
                publishingIntervalMinutes: publishingIntervalMinutes !== undefined ? Number(publishingIntervalMinutes) : undefined,
                dailyPublishLimit: dailyPublishLimit !== undefined ? Number(dailyPublishLimit) : undefined,
                nextPublishAt,
                timezone,
            });

            return res.status(200).json({
                success: true,
                message: "Scheduler settings updated successfully",
                data: updated,
            });
        } catch (err) {
            return fail(res, 400, safeErrorMessage(err, "Failed to update scheduler settings."));
        }
    },

    /**
     * POST /api/blogs/scheduler/queue/:id/cancel
     * Cancels a pending queue item.
     */
    cancelQueueItem: async (req, res) => {
        try {
            const { id } = req.params;
            if (!UUID_RE.test(id)) {
                return fail(res, 400, "Invalid queue item UUID format.");
            }

            const { reason } = req.body || {};

            const cancelled = await blogQueueRepository.cancelQueueItem(
                id,
                reason || "Cancelled by administrator",
                req.user?.id || null
            );

            return res.status(200).json({
                success: true,
                message: "Queue item successfully cancelled.",
                data: cancelled,
            });
        } catch (err) {
            return fail(res, 400, safeErrorMessage(err, "Failed to cancel queue item."));
        }
    },

    /**
     * POST /api/blogs/scheduler/queue/:id/retry
     * Retries a failed queue item.
     */
    retryQueueItem: async (req, res) => {
        try {
            const { id } = req.params;
            if (!UUID_RE.test(id)) {
                return fail(res, 400, "Invalid queue item UUID format.");
            }

            const { nextAttemptAt } = req.body || {};

            const retried = await blogQueueRepository.retryFailedItem(
                id,
                nextAttemptAt || null,
                req.user?.id || null
            );

            return res.status(200).json({
                success: true,
                message: "Failed queue item reset to pending for retry.",
                data: retried,
            });
        } catch (err) {
            return fail(res, 400, safeErrorMessage(err, "Failed to retry queue item."));
        }
    },

    /**
     * POST /api/blogs/scheduler/queue/reorder
     * Reorders pending queue records sequentially.
     */
    reorderQueue: async (req, res) => {
        try {
            const { orderedIds, startFromDate, intervalMinutes } = req.body || {};

            if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
                return fail(res, 422, "orderedIds must be a non-empty array of queue UUIDs.");
            }

            // Validate all IDs in array are valid UUIDs
            for (const qId of orderedIds) {
                if (!UUID_RE.test(qId)) {
                    return fail(res, 422, `Invalid queue item UUID format: "${qId}".`);
                }
            }

            const updated = await blogQueueRepository.reorderPendingQueue(
                orderedIds,
                startFromDate || null,
                intervalMinutes ? Number(intervalMinutes) : null
            );

            return res.status(200).json({
                success: true,
                message: `Successfully reordered ${updated.length} pending queue item(s).`,
                data: updated,
            });
        } catch (err) {
            return fail(res, 400, safeErrorMessage(err, "Failed to reorder queue items."));
        }
    },

    /**
     * POST /api/blogs/scheduler/queue/:id/publish
     * Manually triggers real immediate publication of a queued blog.
     */
    manualPublish: async (req, res) => {
        try {
            const { id } = req.params;
            if (!UUID_RE.test(id)) {
                return fail(res, 400, "Invalid queue item UUID format.");
            }

            const result = await blogPublishingService.publishQueueItem(id, {
                userId: req.user?.id || null,
                triggeredBy: "manual",
            });

            return res.status(200).json(result);
        } catch (err) {
            return fail(res, 400, safeErrorMessage(err, "Failed to publish queued blog."));
        }
    },

    /**
     * GET /api/blogs/:id/publishing-history
     * Retrieves all queue records and audit logs for a single blog.
     */
    getBlogHistory: async (req, res) => {
        try {
            const { id } = req.params;
            if (!UUID_RE.test(id)) {
                return fail(res, 400, "Invalid blog UUID format.");
            }

            const history = await blogQueueRepository.getBlogPublishingHistory(id);

            return res.status(200).json({
                success: true,
                blogId: id,
                ...history,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to retrieve blog publishing history."));
        }
    },

    /**
     * GET /api/blogs/scheduler/logs
     * Paginated audit logs of scheduler and publishing operations.
     */
    getPublishLogs: async (req, res) => {
        try {
            const { status, queueId, blogId, page = 1, limit = 50 } = req.query;

            if (queueId && !UUID_RE.test(queueId)) {
                return fail(res, 400, "Invalid queueId UUID filter.");
            }
            if (blogId && !UUID_RE.test(blogId)) {
                return fail(res, 400, "Invalid blogId UUID filter.");
            }

            const boundedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
            const boundedPage = Math.max(parseInt(page, 10) || 1, 1);

            const logs = await blogQueueRepository.listPublishLogs({
                status,
                queueId,
                blogId,
                page: boundedPage,
                limit: boundedLimit,
            });

            return res.status(200).json({
                success: true,
                ...logs,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to retrieve publishing audit logs."));
        }
    },

    /**
     * POST /api/blogs/scheduler/cron-trigger
     * External cron trigger endpoint for serverless environments (e.g. Vercel Cron, GitHub Actions).
     * Protected with timing-safe comparison of CRON_SECRET or Admin authentication.
     */
    triggerCron: async (req, res) => {
        try {
            const cronSecretHeader = req.headers["x-cron-secret"];
            const authHeader = req.headers.authorization;
            const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

            // Reject missing/short secrets
            const expectedSecret = env.CRON_SECRET;
            const isExpectedSecretConfigured = expectedSecret && expectedSecret.length >= 16;

            const isCronSecretValid = isExpectedSecretConfigured && (
                safeTimingCompare(cronSecretHeader, expectedSecret) ||
                safeTimingCompare(bearerToken, expectedSecret)
            );

            const isAdmin = req.user?.role === "admin";

            if (!isCronSecretValid && !isAdmin) {
                return fail(res, 401, "Unauthorized cron trigger. Invalid cron secret or authentication.");
            }

            const result = await blogSchedulerService.executeTick({
                triggeredBy: isCronSecretValid ? "external_cron" : "manual_cron_trigger",
            });

            return res.status(200).json({
                success: true,
                ...result,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to execute cron trigger tick."));
        }
    },

    /**
     * GET /api/blogs/scheduler/worker/health
     * Returns worker status, uptime, and last execution result.
     * Protected: requires admin authentication or valid CRON_SECRET header.
     */
    getWorkerHealth: async (req, res) => {
        try {
            const cronSecretHeader = req.headers["x-cron-secret"];
            const expectedSecret = env.CRON_SECRET;
            const isCronSecretValid = expectedSecret && expectedSecret.length >= 16 && safeTimingCompare(cronSecretHeader, expectedSecret);
            const isAdmin = req.user?.role === "admin";

            if (!isAdmin && !isCronSecretValid) {
                return fail(res, 401, "Unauthorized. Admin authentication or valid cron secret required.");
            }

            const workerStatus = schedulerWorker.getStatus();
            const queueStats = await blogQueueRepository.getQueueStats();

            return res.status(200).json({
                success: true,
                worker: workerStatus,
                queue: queueStats,
            });
        } catch (err) {
            return fail(res, 500, safeErrorMessage(err, "Failed to retrieve worker health status."));
        }
    },

    /**
     * POST /api/blogs/scheduler/revalidate
     * Revalidates in-memory and Next.js static caches for an already-published blog
     * without re-executing publishing transactions.
     */
    revalidateBlog: async (req, res) => {
        try {
            const { slug } = req.body;
            if (!slug || typeof slug !== "string" || !SLUG_RE.test(slug.trim())) {
                return fail(res, 400, "Valid slug is required for cache revalidation.");
            }

            const result = await blogPublishingService.revalidatePublishedBlog(slug.trim());
            return res.status(200).json(result);
        } catch (err) {
            return fail(res, 400, safeErrorMessage(err, "Cache revalidation failed."));
        }
    },
};

export default blogQueueController;

