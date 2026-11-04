-- Migration 019: Ensure one lead per conversation with unique index and idempotency
-- Step: Natural Conversational Lead Collection Refactoring

DELETE FROM chat_leads a USING chat_leads b
WHERE a.conversation_id = b.conversation_id
  AND a.conversation_id IS NOT NULL
  AND a.created_at < b.created_at;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_leads_conversation_unique 
ON chat_leads(conversation_id) 
WHERE conversation_id IS NOT NULL;

