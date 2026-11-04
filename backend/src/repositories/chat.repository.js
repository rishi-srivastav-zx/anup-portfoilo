import { pool } from "../config/db.js";

/**
 * Custom error class for database-specific failures
 */
export class ChatDatabaseError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = "ChatDatabaseError";
        this.statusCode = 503;
        this.code = "DATABASE_UNAVAILABLE";
        this.internalMessage = originalError?.message || null;
    }
}

/**
 * In-memory fallback store used exclusively if database is temporarily unreachable
 * Ensures API resilience and uninterrupted service during network outages
 */
const inMemoryStore = {
    conversations: new Map(),
    messages: new Map(), // conversationId -> Array of messages
};

export const chatRepository = {
    /**
     * Creates a new conversation record in PostgreSQL with resilient fallback
     */
    async createConversation({
        id,
        visitorId = null,
        sessionTokenHash = null,
        visitorToken = null,
        metadata = {},
        status = "active",
        startedAt = null,
        lastMessageAt = null,
        conversationState = {},
    }) {
        const query = `
            INSERT INTO chat_conversations (
                id, visitor_id, session_token_hash, visitor_token, metadata, status, started_at, last_message_at, conversation_state, created_at, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, NOW()), COALESCE($8, NOW()), $9, NOW(), NOW())
            RETURNING id, visitor_id, session_token_hash, visitor_token, metadata, status, started_at, last_message_at, conversation_state, created_at, updated_at;
        `;
        const values = [
            id,
            visitorId,
            sessionTokenHash,
            visitorToken,
            JSON.stringify(metadata),
            status,
            startedAt,
            lastMessageAt,
            JSON.stringify(conversationState || {}),
        ];

        try {
            const { rows } = await pool.query(query, values);
            return rows[0];
        } catch (error) {
            console.warn("[ChatRepository] DB write failed, using resilient fallback:", error.message);
            const now = new Date().toISOString();
            const fallbackRecord = {
                id,
                visitor_id: visitorId,
                session_token_hash: sessionTokenHash,
                visitor_token: visitorToken,
                metadata,
                status,
                started_at: startedAt || now,
                last_message_at: lastMessageAt || now,
                conversation_state: conversationState || {},
                created_at: now,
                updated_at: now,
            };
            inMemoryStore.conversations.set(id, fallbackRecord);
            inMemoryStore.messages.set(id, []);
            return fallbackRecord;
        }
    },

    /**
     * Retrieves conversation by UUID
     */
    async getConversationById(id) {
        const query = `
            SELECT id, visitor_id, session_token_hash, visitor_token, metadata, status, started_at, last_message_at, conversation_state, created_at, updated_at
            FROM chat_conversations
            WHERE id = $1;
        `;

        try {
            const { rows } = await pool.query(query, [id]);
            if (rows[0]) return rows[0];
            return inMemoryStore.conversations.get(id) || null;
        } catch (error) {
            console.warn("[ChatRepository] DB read failed, checking fallback:", error.message);
            return inMemoryStore.conversations.get(id) || null;
        }
    },

    /**
     * Updates conversation status ('active', 'completed', 'archived')
     */
    async updateConversationStatus(id, status) {
        const query = `
            UPDATE chat_conversations
            SET status = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, status, updated_at;
        `;

        try {
            const { rows } = await pool.query(query, [status, id]);
            return rows[0] || null;
        } catch (error) {
            console.warn("[ChatRepository] DB status update failed, updating fallback:", error.message);
            const existing = inMemoryStore.conversations.get(id);
            if (existing) {
                existing.status = status;
                existing.updated_at = new Date().toISOString();
                inMemoryStore.conversations.set(id, existing);
                return existing;
            }
            return null;
        }
    },

    /**
     * Persists updated conversation state into Neon PostgreSQL
     */
    async updateConversationState(id, conversationState) {
        const query = `
            UPDATE chat_conversations
            SET conversation_state = $1, updated_at = NOW(), last_message_at = NOW()
            WHERE id = $2
            RETURNING id, conversation_state, updated_at, last_message_at;
        `;

        try {
            const { rows } = await pool.query(query, [JSON.stringify(conversationState || {}), id]);
            return rows[0] || null;
        } catch (error) {
            console.warn("[ChatRepository] DB state update failed, updating fallback:", error.message);
            const existing = inMemoryStore.conversations.get(id);
            if (existing) {
                existing.conversation_state = conversationState || {};
                existing.updated_at = new Date().toISOString();
                existing.last_message_at = existing.updated_at;
                inMemoryStore.conversations.set(id, existing);
                return existing;
            }
            return null;
        }
    },

    /**
     * Retrieves the most recent messages for a conversation bounded by a context window
     */
    async getRecentMessages(conversationId, limit = 6) {
        const query = `
            SELECT id, conversation_id, sender, content, message_content, intent, detected_intent, intent_category, confidence_score, extracted_entities, metadata, created_at
            FROM (
                SELECT id, conversation_id, sender, content, message_content, intent, detected_intent, intent_category, confidence_score, extracted_entities, metadata, created_at
                FROM chat_messages
                WHERE conversation_id = $1
                ORDER BY created_at DESC
                LIMIT $2
            ) sub
            ORDER BY created_at ASC;
        `;

        try {
            const { rows } = await pool.query(query, [conversationId, limit]);
            if (rows.length > 0) return rows;
            const fallbackList = inMemoryStore.messages.get(conversationId) || [];
            return fallbackList.slice(-limit);
        } catch (error) {
            console.warn("[ChatRepository] DB getRecentMessages failed, checking fallback:", error.message);
            const fallbackList = inMemoryStore.messages.get(conversationId) || [];
            return fallbackList.slice(-limit);
        }
    },

    /**
     * Saves a user, assistant, or system message with full intent & entity classification
     */
    async saveMessage({
        id,
        conversationId,
        sender,
        content,
        messageContent = null,
        intent = null,
        detectedIntent = null,
        intentCategory = null,
        confidenceScore = null,
        extractedEntities = {},
        metadata = {},
    }) {
        const rawContent = messageContent || content || "";
        const rawIntent = detectedIntent || intent || null;

        const query = `
            INSERT INTO chat_messages (
                id, conversation_id, sender, content, message_content, intent, detected_intent, intent_category, confidence_score, extracted_entities, metadata, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
            RETURNING id, conversation_id, sender, content, message_content, intent, detected_intent, intent_category, confidence_score, extracted_entities, metadata, created_at;
        `;
        const values = [
            id,
            conversationId,
            sender,
            rawContent,
            rawContent,
            rawIntent,
            rawIntent,
            intentCategory,
            confidenceScore,
            JSON.stringify(extractedEntities),
            JSON.stringify(metadata),
        ];

        try {
            const { rows } = await pool.query(query, values);

            // Update conversation last_message_at and updated_at
            await pool
                .query(
                    "UPDATE chat_conversations SET updated_at = NOW(), last_message_at = NOW() WHERE id = $1",
                    [conversationId]
                )
                .catch(() => {});

            return rows[0];
        } catch (error) {
            console.warn("[ChatRepository] DB saveMessage failed, using resilient fallback:", error.message);
            const fallbackMsg = {
                id,
                conversation_id: conversationId,
                sender,
                content: rawContent,
                message_content: rawContent,
                intent: rawIntent,
                detected_intent: rawIntent,
                intent_category: intentCategory,
                confidence_score: confidenceScore,
                extracted_entities: extractedEntities,
                metadata,
                created_at: new Date().toISOString(),
            };
            const list = inMemoryStore.messages.get(conversationId) || [];
            list.push(fallbackMsg);
            inMemoryStore.messages.set(conversationId, list);

            const conv = inMemoryStore.conversations.get(conversationId);
            if (conv) {
                conv.last_message_at = fallbackMsg.created_at;
                conv.updated_at = fallbackMsg.created_at;
            }

            return fallbackMsg;
        }
    },

    /**
     * Retrieves all messages belonging to a conversation ordered chronologically
     */
    async getMessagesByConversationId(conversationId) {
        const query = `
            SELECT id, conversation_id, sender, content, message_content, intent, detected_intent, intent_category, confidence_score, extracted_entities, metadata, created_at
            FROM chat_messages
            WHERE conversation_id = $1
            ORDER BY created_at ASC;
        `;

        try {
            const { rows } = await pool.query(query, [conversationId]);
            if (rows.length > 0) return rows;
            return inMemoryStore.messages.get(conversationId) || [];
        } catch (error) {
            console.warn("[ChatRepository] DB getMessages failed, checking fallback:", error.message);
            return inMemoryStore.messages.get(conversationId) || [];
        }
    },

    /**
     * Deletes a conversation and its messages
     */
    async deleteConversation(id) {
        const query = `
            DELETE FROM chat_conversations
            WHERE id = $1
            RETURNING id;
        `;

        try {
            const { rows } = await pool.query(query, [id]);
            inMemoryStore.conversations.delete(id);
            inMemoryStore.messages.delete(id);
            return rows.length > 0;
        } catch (error) {
            console.warn("[ChatRepository] DB delete failed, checking fallback:", error.message);
            const existed = inMemoryStore.conversations.has(id);
            inMemoryStore.conversations.delete(id);
            inMemoryStore.messages.delete(id);
            return existed;
        }
    },
};

export default chatRepository;
