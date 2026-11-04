-- Migration 017: Add conversation_state column to chat_conversations
-- Step 9: Conversation State Management Engine for Cinematographer Portfolio AI Assistant

ALTER TABLE chat_conversations
ADD COLUMN IF NOT EXISTS conversation_state JSONB NOT NULL DEFAULT '{
    "currentTopic": null,
    "currentIntent": null,
    "entities": {},
    "mentionedProjects": [],
    "mentionedEquipment": [],
    "visitorInterests": [],
    "pendingQuestion": null,
    "lastRelevantKnowledgeIds": [],
    "lastUpdatedAt": null
}'::jsonb;

-- Index for searching and filtering conversation states
CREATE INDEX IF NOT EXISTS idx_chat_conversations_state_gin
ON chat_conversations USING gin (conversation_state);

