/**
 * Smart Chat Message Rate Limiting Middleware
 * Production-ready Express middleware enforcing:
 * - Verified visitor token ownership (IDOR prevention)
 * - In-flight concurrency lock (1 active request per conversation)
 * - Request deduplication (idempotency)
 * - Short burst & sliding window limits
 * - Visitor daily quotas & progressive cooldowns
 */

import { chatRepository } from "../repositories/chat.repository.js";
import { chatService } from "../services/chat.service.js";
import { chatRateLimitService } from "../services/rateLimit/chatRateLimit.service.js";

export const smartChatMessageLimiter = async (req, res, next) => {
    const { conversationId, message } = req.body || {};

    // If conversationId is not provided, let the validator middleware handle schema errors
    if (!conversationId) {
        return next();
    }

    try {
        // 1. Verify that the conversation exists
        const conversation = await chatRepository.getConversationById(conversationId);
        if (!conversation) {
            return res.status(404).json({
                success: false,
                code: "CONVERSATION_NOT_FOUND",
                message: `Conversation not found with ID '${conversationId}'. Please initialize a conversation first.`,
            });
        }

        // 2. Validate visitor access token (IDOR protection: never trust unverified visitor IDs)
        const visitorToken = req.visitorToken || null;
        try {
            chatService.validateVisitorAccess(conversation, visitorToken);
        } catch (authErr) {
            return res.status(authErr.statusCode || 403).json({
                success: false,
                code: authErr.code || "UNAUTHORIZED_CONVERSATION_ACCESS",
                message: authErr.message || "Access denied: unauthorized token for this conversation.",
            });
        }

        // 3. Resolve canonical visitor key for quota tracking
        const clientIp = req.ip || req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
        const visitorKey = conversation.session_token_hash
            ? `tokenHash:${conversation.session_token_hash}`
            : conversation.visitor_id
            ? `visitorId:${conversation.visitor_id}`
            : visitorToken
            ? `visitorToken:${visitorToken}`
            : `ip:${clientIp}`;

        // 4. Evaluate Rate Limiting, Burst, Cooldown, and Deduplication
        const evalResult = chatRateLimitService.evaluateRateLimit({
            conversationId,
            visitorKey,
            messageText: message || "",
            ip: clientIp,
        });

        if (!evalResult.allowed) {
            const retryAfterSec = evalResult.retryAfter || 15;
            res.setHeader("Retry-After", String(retryAfterSec));
            return res.status(evalResult.statusCode || 429).json({
                success: false,
                error: {
                    code: evalResult.code,
                    message: evalResult.message,
                    retryAfter: retryAfterSec,
                },
                code: evalResult.code,
                message: evalResult.message,
                retryAfter: retryAfterSec,
            });
        }

        // 5. Acquire In-Flight Concurrency Lock
        const lockAcquired = chatRateLimitService.acquireLock(conversationId, clientIp);
        if (!lockAcquired) {
            res.setHeader("Retry-After", "2");
            return res.status(429).json({
                success: false,
                error: {
                    code: "CONCURRENT_REQUEST",
                    message: "A message is already being processed for this conversation. Please wait a moment.",
                    retryAfter: 2,
                },
                code: "CONCURRENT_REQUEST",
                message: "A message is already being processed for this conversation. Please wait a moment.",
                retryAfter: 2,
            });
        }

        // 6. Ensure lock is released reliably on finish or premature close
        let isReleased = false;
        const release = () => {
            if (!isReleased) {
                isReleased = true;
                chatRateLimitService.releaseLock(conversationId);
            }
        };
        res.on("finish", release);
        res.on("close", release);

        // 7. Record successful message submission against rate limit windows
        chatRateLimitService.recordSuccessfulMessage({
            conversationId,
            visitorKey,
            messageText: message || "",
            ip: clientIp,
        });

        // Attach pre-fetched conversation to request object
        req.chatConversation = conversation;
        req.visitorKey = visitorKey;
        req.clientIp = clientIp;

        next();
    } catch (err) {
        next(err);
    }
};

export default smartChatMessageLimiter;

