import { blogSchedulerService } from "../services/blogScheduler.service.js";

class BlogSchedulerWorker {
    constructor() {
        this.timer = null;
        this.isProcessing = false;
        this.isRunning = false;
        this.startedAt = null;
        this.lastTickAt = null;
        this.lastResult = null;
        this.totalTicks = 0;
        this.successfulPublishes = 0;
        this.failedPublishes = 0;
    }

    /**
     * Initializes and starts the background worker.
     * Guarded against duplicate initializations.
     * @param {object} options
     * @param {number} options.intervalMs Interval between scheduler polling ticks (default: 60s)
     */
    start({ intervalMs = 60000 } = {}) {
        if (this.isRunning) {
            console.log("[BLOG-SCHEDULER-WORKER] Worker is already active; skipping duplicate initialization.");
            return;
        }

        this.isRunning = true;
        this.startedAt = new Date();
        console.log(`[BLOG-SCHEDULER-WORKER] Starting background scheduler worker (interval: ${intervalMs / 1000}s)...`);

        // Run immediately on startup
        this.tick();

        // Setup recurring poll interval
        this.timer = setInterval(() => {
            this.tick();
        }, intervalMs);

        // Ensure timer doesn't prevent Node process from terminating during tests/scripts
        if (this.timer.unref) {
            this.timer.unref();
        }

        // Register graceful shutdown hooks
        this.setupProcessHandlers();
    }

    /**
     * Single worker polling tick.
     */
    async tick() {
        if (this.isProcessing) {
            console.log("[BLOG-SCHEDULER-WORKER] Previous tick still processing; skipping overlapping execution.");
            return;
        }

        this.isProcessing = true;
        this.lastTickAt = new Date();
        this.totalTicks++;

        try {
            const result = await blogSchedulerService.executeTick({ triggeredBy: "worker" });
            this.lastResult = result;

            if (result.executed) {
                if (result.success) {
                    this.successfulPublishes++;
                    console.log(`[BLOG-SCHEDULER-WORKER] ✅ Published: ${result.message} (${result.durationMs}ms)`);
                } else {
                    this.failedPublishes++;
                    console.warn(`[BLOG-SCHEDULER-WORKER] ⚠️ Publish Attempt Failed: ${result.message}`);
                }
            }
        } catch (err) {
            console.error("[BLOG-SCHEDULER-WORKER] ❌ Error in worker execution tick:", err.message);
            this.lastResult = {
                executed: false,
                reason: "unexpected_error",
                message: err.message,
            };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Gracefully stops the worker process.
     */
    async stop() {
        if (!this.isRunning) return;
        console.log("[BLOG-SCHEDULER-WORKER] Stopping scheduler worker gracefully...");

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        // Wait for current in-flight tick to complete
        while (this.isProcessing) {
            await new Promise((res) => setTimeout(res, 100));
        }

        this.isRunning = false;
        console.log("[BLOG-SCHEDULER-WORKER] Scheduler worker stopped cleanly.");
    }

    /**
     * Returns worker health and execution diagnostics.
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isProcessing: this.isProcessing,
            startedAt: this.startedAt,
            lastTickAt: this.lastTickAt,
            totalTicks: this.totalTicks,
            successfulPublishes: this.successfulPublishes,
            failedPublishes: this.failedPublishes,
            lastResult: this.lastResult,
            uptimeSeconds: this.startedAt ? Math.floor((Date.now() - this.startedAt.getTime()) / 1000) : 0,
        };
    }

    setupProcessHandlers() {
        const shutdown = async (signal) => {
            console.log(`[BLOG-SCHEDULER-WORKER] Received ${signal}. Initiating graceful worker shutdown.`);
            await this.stop();
        };

        process.once("SIGTERM", () => shutdown("SIGTERM"));
        process.once("SIGINT", () => shutdown("SIGINT"));
    }
}

export const schedulerWorker = new BlogSchedulerWorker();
export default schedulerWorker;

