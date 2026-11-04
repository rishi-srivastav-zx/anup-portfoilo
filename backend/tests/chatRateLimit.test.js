/**
 * Smart Chat Message Rate Limiting Test Suite
 * 
 * Verifies:
 * 1. Normal message sending succeeds within limits (HTTP 200).
 * 2. Rapid burst messaging triggers rate limit / slow-down (BURST_LIMIT_EXCEEDED).
 * 3. 429 responses contain retryAfter field and Retry-After HTTP header.
 * 4. Duplicate message prevention (idempotency) returns DUPLICATE_REQUEST.
 * 5. In-flight concurrency lock rejects parallel requests on the same conversation.
 * 6. Progressive cooldown increases penalty on repeated abuse (15s, 30s, 60s).
 * 7. Multiple visitors sharing one IP are tracked independently by verified token.
 * 8. Visitor token ownership / IDOR check rejects unauthorized token with 403 Forbidden.
 * 9. Non-existent conversation returns 404 CONVERSATION_NOT_FOUND.
 * 10. Conversation window limit (max 5 per 10s) and daily allowance (max 100 per day).
 * 11. Lead generation flow works seamlessly through rate limiting.
 */

import { test, describe, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import crypto from "crypto";
import app from "../src/server.js";
import { chatService } from "../src/services/chat.service.js";
import { chatRateLimitService } from "../src/services/rateLimit/chatRateLimit.service.js";
import { chatRepository } from "../src/repositories/chat.repository.js";
import { chatLeadRepository } from "../src/repositories/chatLead.repository.js";

describe("Smart Message Rate Limiting & Abuse Prevention Suite", () => {
    let server;
    let baseApiUrl;
    const testConversations = [];

    before(async () => {
        // Start test HTTP server
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseApiUrl = `http://127.0.0.1:${port}/api`;
                resolve();
            });
        });
    });

    after(async () => {
        // Clean up created test conversations and leads
        for (const conv of testConversations) {
            try {
                const leads = await chatLeadRepository.getLeadsByConversationId(conv.id);
                for (const l of leads) {
                    await chatLeadRepository.deleteLead(l.id).catch(() => {});
                }
                await chatRepository.deleteConversation(conv.id).catch(() => {});
            } catch {
                // ignore
            }
        }

        if (server) {
            await new Promise((resolve) => server.close(resolve));
        }
    });

    beforeEach(() => {
        // Reset in-memory rate limiter state between tests
        chatRateLimitService.reset();
    });

    /**
     * Helper to create a test conversation
     */
    async function createTestConversation(visitorId = "rate-test-visitor") {
        const init = await chatService.initializeConversation({
            visitorId,
            metadata: { source: "RateLimitTest" },
        });
        testConversations.push({ id: init.conversationId, token: init.visitorToken });
        return init;
    }

    test("1. Normal message sending succeeds within configured rate limits", async () => {
        const conv = await createTestConversation("visitor-normal");

        const res = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-visitor-token": conv.visitorToken,
            },
            body: JSON.stringify({
                conversationId: conv.conversationId,
                message: "Hello Anup!",
            }),
        });

        assert.strictEqual(res.status, 200);
        const data = await res.json();
        assert.strictEqual(data.success, true);
        assert.ok(data.data.reply);
    });

    test("2. Rapid burst messaging rejects 4th message in burst window with 429 BURST_LIMIT_EXCEEDED", () => {
        const testConvId = crypto.randomUUID();
        const testVisitor = "burst-visitor-1";

        // Record 3 messages in rapid succession (burstMax is 3)
        chatRateLimitService.recordSuccessfulMessage({ conversationId: testConvId, visitorKey: testVisitor, messageText: "msg 1" });
        chatRateLimitService.recordSuccessfulMessage({ conversationId: testConvId, visitorKey: testVisitor, messageText: "msg 2" });
        chatRateLimitService.recordSuccessfulMessage({ conversationId: testConvId, visitorKey: testVisitor, messageText: "msg 3" });

        // 4th message in burst window must be rejected with BURST_LIMIT_EXCEEDED
        const evalRes = chatRateLimitService.evaluateRateLimit({
            conversationId: testConvId,
            visitorKey: testVisitor,
            messageText: "msg 4",
        });

        assert.strictEqual(evalRes.allowed, false);
        assert.strictEqual(evalRes.statusCode, 429);
        assert.strictEqual(evalRes.code, "BURST_LIMIT_EXCEEDED");
        assert.strictEqual(evalRes.retryAfter, 15);
    });

    test("3. HTTP 429 response includes retryAfter in JSON body and Retry-After HTTP header", async () => {
        const conv = await createTestConversation("visitor-cooldown-http");
        // Trigger cooldown
        chatRateLimitService.triggerCooldown(`conv:${conv.conversationId}`);

        const res = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": conv.visitorToken },
            body: JSON.stringify({ conversationId: conv.conversationId, message: "Hello during cooldown" }),
        });

        assert.strictEqual(res.status, 429);
        const data = await res.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, "RATE_LIMIT_EXCEEDED");
        assert.ok(data.retryAfter >= 1);
        assert.ok(res.headers.get("Retry-After"));
    });

    test("4. Duplicate message detection (Idempotency) prevents duplicate execution without quota penalty", async () => {
        const conv = await createTestConversation("visitor-dup");

        // Send message once
        const res1 = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": conv.visitorToken },
            body: JSON.stringify({ conversationId: conv.conversationId, message: "What camera package do you use?" }),
        });
        assert.strictEqual(res1.status, 200);

        // Immediately send exact same message
        const res2 = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": conv.visitorToken },
            body: JSON.stringify({ conversationId: conv.conversationId, message: "What camera package do you use?" }),
        });

        assert.strictEqual(res2.status, 429);
        const data2 = await res2.json();
        assert.strictEqual(data2.code, "DUPLICATE_REQUEST");
        assert.ok(data2.message.toLowerCase().includes("duplicate"));
    });

    test("5. In-flight concurrency lock rejects parallel requests on the same conversation", async () => {
        const conv = await createTestConversation("visitor-concurrent");

        // Manually acquire lock to simulate a slow in-flight request
        chatRateLimitService.acquireLock(conv.conversationId, "127.0.0.1");

        const res = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": conv.visitorToken },
            body: JSON.stringify({ conversationId: conv.conversationId, message: "Parallel message" }),
        });

        assert.strictEqual(res.status, 429);
        const data = await res.json();
        assert.strictEqual(data.code, "CONCURRENT_REQUEST");
        assert.strictEqual(res.headers.get("Retry-After"), "2");

        // Release lock
        chatRateLimitService.releaseLock(conv.conversationId);
    });

    test("6. Progressive cooldown increases penalty on repeated abuse", () => {
        const testKey = "conv:test-progressive-cooldown";

        // 1st violation: 15s
        const cd1 = chatRateLimitService.triggerCooldown(testKey);
        assert.strictEqual(cd1, 15, "First cooldown should be 15s");

        // 2nd violation: 30s
        const cd2 = chatRateLimitService.triggerCooldown(testKey);
        assert.strictEqual(cd2, 30, "Second cooldown should double to 30s");

        // 3rd violation: 60s
        const cd3 = chatRateLimitService.triggerCooldown(testKey);
        assert.strictEqual(cd3, 60, "Third cooldown should double to 60s");
    });

    test("7. Multiple visitors sharing one IP are tracked independently by verified token", async () => {
        const convA = await createTestConversation("visitor-A");
        const convB = await createTestConversation("visitor-B");

        // Trigger cooldown on Visitor A only
        chatRateLimitService.triggerCooldown(`conv:${convA.conversationId}`);

        // Visitor A should be rate-limited
        const resA = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": convA.visitorToken },
            body: JSON.stringify({ conversationId: convA.conversationId, message: "Message from A" }),
        });
        assert.strictEqual(resA.status, 429, "Visitor A should be rate-limited");

        // Visitor B on same IP must NOT be blocked!
        const resB = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": convB.visitorToken },
            body: JSON.stringify({ conversationId: convB.conversationId, message: "Hello from Visitor B" }),
        });
        assert.strictEqual(resB.status, 200, "Visitor B must be allowed normally");
    });

    test("8. Visitor token ownership / IDOR check rejects unauthorized token with 403 Forbidden", async () => {
        const conv = await createTestConversation("visitor-idor");
        const forgedToken = crypto.randomBytes(32).toString("hex");

        const res = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-visitor-token": forgedToken, // Wrong/forged token
            },
            body: JSON.stringify({
                conversationId: conv.conversationId,
                message: "Trying to hijack conversation",
            }),
        });

        assert.strictEqual(res.status, 403);
        const data = await res.json();
        assert.strictEqual(data.success, false);
        assert.strictEqual(data.code, "UNAUTHORIZED_CONVERSATION_ACCESS");
    });

    test("9. Non-existent conversation returns 404 CONVERSATION_NOT_FOUND", async () => {
        const fakeConvId = crypto.randomUUID();

        const res = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: fakeConvId,
                message: "Hello in the void",
            }),
        });

        assert.strictEqual(res.status, 404);
        const data = await res.json();
        assert.strictEqual(data.code, "CONVERSATION_NOT_FOUND");
    });

    test("10. Conversation window limit (5 per 10s) and daily allowance (100 per day)", () => {
        const testConvId = crypto.randomUUID();
        const testVisitor = "limit-visitor-10";
        const now = Date.now();

        // 5 messages spaced across the 10s window (avoiding the 2.5s burst limit of 3)
        const spacedTimestamps = [now - 8000, now - 6000, now - 4000, now - 2000, now - 500];
        chatRateLimitService.conversationWindows.set(testConvId, [...spacedTimestamps]);
        chatRateLimitService.burstWindows.set(testConvId, [now - 2000, now - 500]); // only 2 in burst window (< 3)

        // 6th message exceeds window limit (5 per 10s)
        const windowRes = chatRateLimitService.evaluateRateLimit({
            conversationId: testConvId,
            visitorKey: testVisitor,
            messageText: "unique msg 6",
        });

        assert.strictEqual(windowRes.allowed, false);
        assert.strictEqual(windowRes.code, "RATE_LIMIT_EXCEEDED");
        assert.strictEqual(windowRes.retryAfter, 15);

        // Test daily limit
        const dailyVisitor = "daily-visitor";
        const dailyConvId = crypto.randomUUID();
        chatRateLimitService.reset();

        const dailyTimestamps = Array.from({ length: 100 }, (_, i) => now - (i * 1000 + 10000));
        chatRateLimitService.dailyWindows.set(dailyVisitor, dailyTimestamps);

        const dailyRes = chatRateLimitService.evaluateRateLimit({
            conversationId: dailyConvId,
            visitorKey: dailyVisitor,
            messageText: "daily 101",
        });

        assert.strictEqual(dailyRes.allowed, false);
        assert.strictEqual(dailyRes.code, "DAILY_LIMIT_EXCEEDED");
    });

    test("11. Lead generation flow works seamlessly through rate limiting", async () => {
        const conv = await createTestConversation("visitor-lead");

        // Turn 1: Hire inquiry
        const res1 = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": conv.visitorToken },
            body: JSON.stringify({ conversationId: conv.conversationId, message: "I want to hire Anup" }),
        });
        assert.strictEqual(res1.status, 200);
        const data1 = await res1.json();
        assert.ok(data1.data.reply.toLowerCase().includes("name"));

        // Turn 2: Name
        const res2 = await fetch(`${baseApiUrl}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-visitor-token": conv.visitorToken },
            body: JSON.stringify({ conversationId: conv.conversationId, message: "Karan Johar" }),
        });
        assert.strictEqual(res2.status, 200);
        const data2 = await res2.json();
        assert.ok(data2.data.reply.toLowerCase().includes("phone"));
    });
});
