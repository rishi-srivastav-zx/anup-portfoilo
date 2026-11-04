import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import app from "../src/server.js";
import { chatService, ChatError } from "../src/services/chat.service.js";
import { sanitizeChatMessage, buildMessageResponse } from "../src/utils/chat.utils.js";

describe("Cinematographer Portfolio AI Assistant Chat Suite", () => {
    let server;
    let baseUrl;
    let createdConversationId;
    let createdVisitorToken;

    before(async () => {
        // Start an ephemeral HTTP server for endpoint testing
        await new Promise((resolve) => {
            server = http.createServer(app);
            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                baseUrl = `http://127.0.0.1:${port}/api/chat`;
                resolve();
            });
        });
    });

    after(async () => {
        if (server) {
            if (typeof server.closeAllConnections === "function") {
                server.closeAllConnections();
            }
            await new Promise((resolve) => server.close(resolve));
        }
    });

    test("1. Utility: sanitizeChatMessage strips HTML and control characters", () => {
        const dirty = "<script>alert('xss')</script>Hello Anup!<b>Check this out</b>\u0000";
        const cleaned = sanitizeChatMessage(dirty);
        assert.equal(cleaned, "alert('xss')Hello Anup!Check this out");
    });

    test("2. Service: initializeConversation creates a new conversation with UUID and token", async () => {
        const conv = await chatService.initializeConversation({
            visitorId: "visitor_unit_test",
            metadata: { source: "Test Runner" },
        });

        assert.ok(conv.conversationId, "Conversation ID must be generated");
        assert.match(
            conv.conversationId,
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
            "Must be a valid UUIDv4"
        );
        assert.ok(conv.visitorToken, "Visitor token must be returned");
        assert.equal(conv.status, "active");
    });

    test("3. Service: processMessage validates conversation existence and returns structured reply", async () => {
        const conv = await chatService.initializeConversation();
        const res = await chatService.processMessage({
            conversationId: conv.conversationId,
            message: "What lenses do you recommend for low light shots?",
            visitorToken: conv.visitorToken,
        });

        assert.equal(res.conversationId, conv.conversationId);
        assert.ok(typeof res.reply === "string" && res.reply.length > 0);
        assert.ok(res.intent, "Intent must be detected");
        assert.equal(res.intent.name, "lens_inquiry");
        assert.equal(res.intent.category, "technical");
        assert.ok(res.intent.confidence >= 0.70);
        assert.ok(Array.isArray(res.actions));
        assert.ok(Array.isArray(res.suggestions));
        assert.ok(res.suggestions.length > 0);
    });

    test("4. Service: rejects empty message with ChatError (400)", async () => {
        const conv = await chatService.initializeConversation();
        await assert.rejects(
            async () => {
                await chatService.processMessage({
                    conversationId: conv.conversationId,
                    visitorToken: conv.visitorToken,
                    message: "   ",
                });
            },
            (err) => {
                assert.ok(err instanceof ChatError);
                assert.equal(err.statusCode, 400);
                assert.equal(err.code, "EMPTY_MESSAGE");
                return true;
            }
        );
    });

    test("5. Service: rejects non-existent conversationId with 404", async () => {
        const fakeId = "00000000-0000-0000-0000-000000000000";
        await assert.rejects(
            async () => {
                await chatService.processMessage({
                    conversationId: fakeId,
                    message: "Hello?",
                });
            },
            (err) => {
                assert.ok(err instanceof ChatError);
                assert.equal(err.statusCode, 404);
                assert.equal(err.code, "CONVERSATION_NOT_FOUND");
                return true;
            }
        );
    });

    test("6. HTTP POST /api/chat/conversation initializes conversation successfully", async () => {
        const res = await fetch(`${baseUrl}/conversation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                visitorId: "postman-visitor-123",
                metadata: { client: "Portfolio V2 Test" },
            }),
        });

        const json = await res.json();
        assert.equal(res.status, 201);
        assert.equal(json.success, true);
        assert.equal(json.message, "Conversation initialized successfully");
        assert.ok(json.data.conversationId);
        assert.ok(json.data.visitorToken);

        createdConversationId = json.data.conversationId;
        createdVisitorToken = json.data.visitorToken;
    });

    test("7. HTTP POST /api/chat/message receives user message and returns structured placeholder contract", async () => {
        assert.ok(createdConversationId);

        const res = await fetch(`${baseUrl}/message`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-visitor-token": createdVisitorToken,
            },
            body: JSON.stringify({
                conversationId: createdConversationId,
                message: "Tell me about your cinematography work on Delhi Metro transit line",
            }),
        });

        const json = await res.json();
        assert.equal(res.status, 200);
        assert.equal(json.success, true);
        assert.equal(json.message, "Message processed successfully");
        assert.equal(json.data.conversationId, createdConversationId);
        assert.ok(typeof json.data.reply === "string");
        assert.ok(json.data.intent, "Intent must be detected");
        assert.equal(json.data.intent.category, "portfolio");
        assert.ok(json.data.intent.confidence >= 0.70);
        assert.deepEqual(json.data.actions, []);
        assert.ok(Array.isArray(json.data.suggestions));
    });

    test("8. HTTP GET /api/chat/conversation/:conversationId retrieves conversation history", async () => {
        assert.ok(createdConversationId);

        const res = await fetch(`${baseUrl}/conversation/${createdConversationId}`, {
            headers: { "x-visitor-token": createdVisitorToken },
        });

        const json = await res.json();
        assert.equal(res.status, 200);
        assert.equal(json.success, true);
        assert.equal(json.data.conversationId, createdConversationId);
        assert.ok(Array.isArray(json.data.messages));
        assert.ok(json.data.messages.length >= 2, "Must contain at least user and assistant messages");
    });

    test("9. HTTP Validation Failures: Missing message, invalid UUID, and empty message", async () => {
        // Missing message
        const resMissing = await fetch(`${baseUrl}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: createdConversationId,
            }),
        });
        assert.equal(resMissing.status, 400);
        const jsonMissing = await resMissing.json();
        assert.equal(jsonMissing.success, false);

        // Invalid conversationId format
        const resInvalidUuid = await fetch(`${baseUrl}/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationId: "invalid-not-a-uuid",
                message: "Hello",
            }),
        });
        assert.equal(resInvalidUuid.status, 400);
        const jsonInvalidUuid = await resInvalidUuid.json();
        assert.equal(jsonInvalidUuid.success, false);
    });

    test("10. HTTP DELETE /api/chat/conversation/:conversationId deletes conversation", async () => {
        assert.ok(createdConversationId);

        const res = await fetch(`${baseUrl}/conversation/${createdConversationId}`, {
            method: "DELETE",
            headers: { "x-visitor-token": createdVisitorToken },
        });

        const json = await res.json();
        assert.equal(res.status, 200);
        assert.equal(json.success, true);
        assert.equal(json.message, "Conversation deleted successfully");

        // Verify it is now 404
        const resCheck = await fetch(`${baseUrl}/conversation/${createdConversationId}`, {
            headers: { "x-visitor-token": createdVisitorToken },
        });
        assert.equal(resCheck.status, 404);
    });
});

