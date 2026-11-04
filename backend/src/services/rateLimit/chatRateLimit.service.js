/**
 * Smart Chat Message Rate Limiter Service
 * Production-ready message throttling, abuse prevention, concurrency lock, and deduplication.
 * 
 * Rules:
 * - Max 5 messages per 10 seconds per conversation (configurable via CHAT_RATE_LIMIT_MAX_MESSAGES, CHAT_RATE_LIMIT_WINDOW_MS)
 * - Max 3-message short burst (configurable via CHAT_RATE_LIMIT_BURST_MAX, CHAT_RATE_LIMIT_BURST_WINDOW_MS)
 * - Only 1 active message-processing request per conversation (concurrency lock)
 * - Daily allowance: 100 messages per visitor (configurable via CHAT_RATE_LIMIT_DAILY_MAX)
 * - Progressive cooldown: starts at 15s (configurable via CHAT_RATE_LIMIT_COOLDOWN_SEC)
 * - Idempotency deduplication: rejects identical rapid submissions without penalizing quota
 */

export class ChatRateLimiter {
    constructor(options = {}) {
        this.options = options;
        // In-flight concurrency locks: Map<conversationId, { startedAt: number, ip: string }>
        this.activeLocks = new Map();
        // Recent message cache for deduplication: Map<conversationId, { message: string, timestamp: number }>
        this.recentMessages = new Map();
        // Active cooldowns: Map<key, { until: number, violations: number }>
        this.cooldowns = new Map();
        // Sliding window message timestamps for conversations: Map<conversationId, Array<number>>
        this.conversationWindows = new Map();
        // Sliding window message timestamps for short bursts: Map<conversationId, Array<number>>
        this.burstWindows = new Map();
        // Daily message timestamps for visitors: Map<visitorKey, Array<number>>
        this.dailyWindows = new Map();

        // Periodic cleanup timer (every 5 minutes)
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref(); // Prevent timer from keeping Node event loop alive during tests
        }
    }

    /**
     * Resolves active configuration values with environment variable precedence
     */
    getConfig() {
        return {
            windowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 10) || this.options.windowMs || 10000,
            maxPerWindow: parseInt(process.env.CHAT_RATE_LIMIT_MAX_MESSAGES, 10) || this.options.maxPerWindow || 5,
            burstWindowMs: parseInt(process.env.CHAT_RATE_LIMIT_BURST_WINDOW_MS, 10) || this.options.burstWindowMs || 2500,
            burstMax: parseInt(process.env.CHAT_RATE_LIMIT_BURST_MAX, 10) || this.options.burstMax || 3,
            dailyWindowMs: parseInt(process.env.CHAT_RATE_LIMIT_DAILY_WINDOW_MS, 10) || this.options.dailyWindowMs || 24 * 60 * 60 * 1000,
            dailyMax: parseInt(process.env.CHAT_RATE_LIMIT_DAILY_MAX, 10) || this.options.dailyMax || 100,
            baseCooldownSec: parseInt(process.env.CHAT_RATE_LIMIT_COOLDOWN_SEC, 10) || this.options.baseCooldownSec || 15,
            maxCooldownSec: parseInt(process.env.CHAT_RATE_LIMIT_MAX_COOLDOWN_SEC, 10) || this.options.maxCooldownSec || 300,
            duplicateWindowMs: parseInt(process.env.CHAT_RATE_LIMIT_DUP_WINDOW_MS, 10) || this.options.duplicateWindowMs || 10000,
            lockTimeoutMs: 30000, // 30s max lock safety timeout
        };
    }

    /**
     * Checks if identical message was sent recently within duplicateWindowMs
     */
    checkDuplicate(conversationId, messageText) {
        if (!conversationId || !messageText) return false;
        const config = this.getConfig();
        const prev = this.recentMessages.get(conversationId);
        if (!prev) return false;

        const isSame = prev.message.trim().toLowerCase() === messageText.trim().toLowerCase();
        const isRecent = Date.now() - prev.timestamp < config.duplicateWindowMs;
        return isSame && isRecent;
    }

    /**
     * Records recent message for deduplication
     */
    recordRecentMessage(conversationId, messageText) {
        if (!conversationId || !messageText) return;
        this.recentMessages.set(conversationId, {
            message: messageText.trim(),
            timestamp: Date.now(),
        });
    }

    /**
     * Checks if a conversation is actively processing another message
     */
    isLocked(conversationId) {
        if (!conversationId) return false;
        const lock = this.activeLocks.get(conversationId);
        if (!lock) return false;
        const config = this.getConfig();
        // Expire stale lock if older than lockTimeoutMs
        if (Date.now() - lock.startedAt > config.lockTimeoutMs) {
            this.activeLocks.delete(conversationId);
            return false;
        }
        return true;
    }

    /**
     * Attempts to acquire an in-flight concurrency lock for a conversation
     */
    acquireLock(conversationId, ip = "") {
        if (this.isLocked(conversationId)) {
            return false;
        }
        this.activeLocks.set(conversationId, {
            startedAt: Date.now(),
            ip,
        });
        return true;
    }

    /**
     * Releases the concurrency lock for a conversation
     */
    releaseLock(conversationId) {
        if (!conversationId) return;
        this.activeLocks.delete(conversationId);
    }

    /**
     * Retrieves active cooldown details if key is currently cooling down
     */
    getCooldown(key) {
        if (!key) return null;
        const cd = this.cooldowns.get(key);
        if (!cd) return null;
        const now = Date.now();
        if (now >= cd.until) {
            return null;
        }
        const remainingSec = Math.ceil((cd.until - now) / 1000);
        return {
            remainingSec: Math.max(1, remainingSec),
            violations: cd.violations,
        };
    }

    /**
     * Applies a progressive temporary cooldown to a key
     */
    triggerCooldown(key) {
        const config = this.getConfig();
        const prev = this.cooldowns.get(key);
        const violations = (prev?.violations || 0) + 1;

        // Exponential backoff: base * 2^(violations - 1), capped at maxCooldownSec
        const cooldownSec = Math.min(
            config.baseCooldownSec * Math.pow(2, violations - 1),
            config.maxCooldownSec
        );

        this.cooldowns.set(key, {
            until: Date.now() + cooldownSec * 1000,
            violations,
        });

        return cooldownSec;
    }

    /**
     * Evaluates all rate-limit criteria: cooldown, deduplication, concurrency, burst, window, daily
     */
    evaluateRateLimit({ conversationId, visitorKey, messageText, ip = "" }) {
        const config = this.getConfig();
        const now = Date.now();

        // 1. Check Active Cooldowns
        const convCd = this.getCooldown(`conv:${conversationId}`);
        const visitorCd = this.getCooldown(`visitor:${visitorKey}`);
        const activeCd = convCd || visitorCd;

        if (activeCd) {
            return {
                allowed: false,
                statusCode: 429,
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: activeCd.remainingSec,
                message: `You're messaging too quickly. Please wait ${activeCd.remainingSec} seconds before sending again.`,
            };
        }

        // 2. Check Idempotency / Duplicate Submission (does not charge quota)
        if (this.checkDuplicate(conversationId, messageText)) {
            return {
                allowed: false,
                statusCode: 429,
                code: "DUPLICATE_REQUEST",
                retryAfter: 1,
                message: "Duplicate message detected. Please wait for the reply before sending again.",
            };
        }

        // 3. Check In-Flight Concurrency Lock
        if (this.isLocked(conversationId)) {
            return {
                allowed: false,
                statusCode: 429,
                code: "CONCURRENT_REQUEST",
                retryAfter: 2,
                message: "A message is already being processed for this conversation. Please wait a moment.",
            };
        }

        // 4. Check Short Burst Limit (max 3 messages in 2.5s)
        const burstTimes = (this.burstWindows.get(conversationId) || []).filter(
            (t) => now - t < config.burstWindowMs
        );
        if (burstTimes.length >= config.burstMax) {
            const cooldownSec = this.triggerCooldown(`conv:${conversationId}`);
            this.triggerCooldown(`visitor:${visitorKey}`);
            return {
                allowed: false,
                statusCode: 429,
                code: "BURST_LIMIT_EXCEEDED",
                retryAfter: cooldownSec,
                message: `Slow down! You've sent messages too quickly in a burst. Please wait ${cooldownSec} seconds.`,
            };
        }

        // 5. Check Conversation Window Limit (max 5 messages in 10s)
        const convTimes = (this.conversationWindows.get(conversationId) || []).filter(
            (t) => now - t < config.windowMs
        );
        if (convTimes.length >= config.maxPerWindow) {
            const cooldownSec = this.triggerCooldown(`conv:${conversationId}`);
            this.triggerCooldown(`visitor:${visitorKey}`);
            return {
                allowed: false,
                statusCode: 429,
                code: "RATE_LIMIT_EXCEEDED",
                retryAfter: cooldownSec,
                message: `Message rate limit reached (max ${config.maxPerWindow} messages per 10s). Please wait ${cooldownSec} seconds.`,
            };
        }

        // 6. Check Daily Allowance per Visitor (max 100 messages per day)
        const dailyTimes = (this.dailyWindows.get(visitorKey) || []).filter(
            (t) => now - t < config.dailyWindowMs
        );
        if (dailyTimes.length >= config.dailyMax) {
            const oldest = Math.min(...dailyTimes);
            const resetInSec = Math.max(1, Math.ceil((oldest + config.dailyWindowMs - now) / 1000));
            return {
                allowed: false,
                statusCode: 429,
                code: "DAILY_LIMIT_EXCEEDED",
                retryAfter: resetInSec,
                message: `Daily message allowance reached (${config.dailyMax} messages). Please come back tomorrow!`,
            };
        }

        return {
            allowed: true,
        };
    }

    /**
     * Records a valid message submission into sliding window trackers
     */
    recordSuccessfulMessage({ conversationId, visitorKey, messageText, ip = "" }) {
        const now = Date.now();
        const config = this.getConfig();

        // 1. Record burst window
        const burstTimes = (this.burstWindows.get(conversationId) || []).filter(
            (t) => now - t < config.burstWindowMs
        );
        burstTimes.push(now);
        this.burstWindows.set(conversationId, burstTimes);

        // 2. Record conversation window
        const convTimes = (this.conversationWindows.get(conversationId) || []).filter(
            (t) => now - t < config.windowMs
        );
        convTimes.push(now);
        this.conversationWindows.set(conversationId, convTimes);

        // 3. Record daily window
        const dailyTimes = (this.dailyWindows.get(visitorKey) || []).filter(
            (t) => now - t < config.dailyWindowMs
        );
        dailyTimes.push(now);
        this.dailyWindows.set(visitorKey, dailyTimes);

        // 4. Update deduplication cache
        this.recordRecentMessage(conversationId, messageText);
    }

    /**
     * Resets all in-memory tracking structures (useful for testing)
     */
    reset() {
        this.activeLocks.clear();
        this.recentMessages.clear();
        this.cooldowns.clear();
        this.conversationWindows.clear();
        this.burstWindows.clear();
        this.dailyWindows.clear();
    }

    /**
     * Cleans up expired entries to prevent memory growth
     */
    cleanup() {
        const now = Date.now();
        const config = this.getConfig();

        for (const [id, lock] of this.activeLocks.entries()) {
            if (now - lock.startedAt > config.lockTimeoutMs) {
                this.activeLocks.delete(id);
            }
        }

        for (const [id, msg] of this.recentMessages.entries()) {
            if (now - msg.timestamp > config.duplicateWindowMs * 3) {
                this.recentMessages.delete(id);
            }
        }

        for (const [key, cd] of this.cooldowns.entries()) {
            if (now - cd.until > 3600 * 1000) {
                this.cooldowns.delete(key);
            }
        }

        for (const [id, times] of this.conversationWindows.entries()) {
            const filtered = times.filter((t) => now - t < config.windowMs);
            if (filtered.length === 0) this.conversationWindows.delete(id);
            else this.conversationWindows.set(id, filtered);
        }

        for (const [id, times] of this.burstWindows.entries()) {
            const filtered = times.filter((t) => now - t < config.burstWindowMs);
            if (filtered.length === 0) this.burstWindows.delete(id);
            else this.burstWindows.set(id, filtered);
        }

        for (const [key, times] of this.dailyWindows.entries()) {
            const filtered = times.filter((t) => now - t < config.dailyWindowMs);
            if (filtered.length === 0) this.dailyWindows.delete(key);
            else this.dailyWindows.set(key, filtered);
        }
    }
}

export const chatRateLimitService = new ChatRateLimiter();
export default chatRateLimitService;

