import crypto from "crypto";
import { pool } from "../config/db.js";
import { blogQueueRepository } from "../repositories/blogQueue.repository.js";
import { blogPublishingService } from "./blogPublishing.service.js";

/**
 * Production-Ready Blog Scheduler Service
 * Coordinates eligibility checks, lock recovery, atomic queue claiming, and publishing execution.
 */
export const blogSchedulerService = {
    /**
     * Executes a single scheduler tick.
     * Evaluates settings, checks limits, recovers stale locks, claims at most one job, and publishes it.
     * @param {object} options
     * @param {string} options.triggeredBy 'cron' | 'worker' | 'external_cron'
     * @returns {Promise<object>} Execution outcome
     */
    async executeTick({ triggeredBy = "cron" } = {}) {
        const tickStart = Date.now();

        // 1. Fetch current scheduler configuration
        const settings = await blogQueueRepository.getSettings();
        if (!settings) {
            return {
                executed: false,
                reason: "settings_not_found",
                message: "Scheduler settings singleton row does not exist.",
            };
        }

        // 2. Eligibility Check: Master enable/disable
        if (!settings.enabled) {
            return {
                executed: false,
                reason: "scheduler_disabled",
                message: "Scheduler is currently disabled/paused in database settings.",
            };
        }

        // 3. Eligibility Check: Next publish interval due
        const now = new Date();
        if (settings.next_publish_at && new Date(settings.next_publish_at) > now) {
            return {
                executed: false,
                reason: "not_due",
                message: `Scheduler interval not yet due. Next execution window: ${settings.next_publish_at.toISOString()}`,
                nextPublishAt: settings.next_publish_at,
            };
        }

        // 4. Eligibility Check: Daily publishing limit in configured timezone
        const dailyCheck = await blogQueueRepository.checkDailyPublishLimit(
            settings.timezone || "Asia/Kolkata",
            settings.daily_publish_limit || 10
        );

        if (dailyCheck.isReached) {
            return {
                executed: false,
                reason: "daily_limit_reached",
                message: `Daily publishing limit of ${dailyCheck.limit} articles reached for today (${dailyCheck.publishedToday} published).`,
                publishedToday: dailyCheck.publishedToday,
                limit: dailyCheck.limit,
            };
        }

        // 5. Recover any abandoned/stale locks (> 15 minutes) before claiming new jobs
        try {
            await blogQueueRepository.recoverStaleLocks(15);
        } catch (recoverErr) {
            console.error("[blogSchedulerService] Lock recovery warning:", recoverErr.message);
        }

        // 6. Atomically claim at most ONE eligible queue job using SELECT FOR UPDATE SKIP LOCKED
        const lockToken = crypto.randomUUID();
        const client = await pool.connect();
        let claimedJob = null;

        try {
            await client.query("BEGIN");
            claimedJob = await blogQueueRepository.claimNextEligibleJob(lockToken, client);
            await client.query("COMMIT");
        } catch (claimErr) {
            await client.query("ROLLBACK");
            throw claimErr;
        } finally {
            client.release();
        }

        if (!claimedJob) {
            return {
                executed: false,
                reason: "queue_empty",
                message: "No pending queue items are due for publishing at this time.",
            };
        }

        // 7. Publish the claimed job through the official publishing service interface
        try {
            const publishResult = await blogPublishingService.publishQueueItem(claimedJob.id, {
                userId: null,
                triggeredBy,
                lockToken,
            });

            const durationMs = Date.now() - tickStart;

            return {
                executed: true,
                success: true,
                message: `Successfully claimed and published blog "${publishResult.blog.title}".`,
                blog: publishResult.blog,
                queueId: claimedJob.id,
                durationMs,
            };
        } catch (publishErr) {
            // 8. Handle transient failure with exponential backoff retry scheduling
            console.error(`[blogSchedulerService] Publishing failed for queue item ${claimedJob.id}:`, publishErr.message);
            
            const failedJob = await blogQueueRepository.handleJobFailure(
                claimedJob.id,
                lockToken,
                publishErr,
                claimedJob.max_attempts || 3
            );

            return {
                executed: true,
                success: false,
                reason: "publish_failed",
                message: publishErr.message,
                queueId: claimedJob.id,
                status: failedJob?.status || "failed",
                nextAttemptAt: failedJob?.next_attempt_at || null,
            };
        }
    },
};

export default blogSchedulerService;

