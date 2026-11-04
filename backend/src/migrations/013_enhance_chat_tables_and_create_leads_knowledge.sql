-- Migration 013: Enhance chat tables, create chat_leads and portfolio_knowledge tables
-- Step 4: Scalable Neon PostgreSQL Database for Cinematographer Portfolio AI Chatbot

-- ============================================================================
-- 1. ENHANCE chat_conversations TABLE
-- ============================================================================

-- Add visitor_id column
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(255) DEFAULT NULL;

-- Add session_token_hash column (stores SHA-256 hash of visitor token)
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS session_token_hash VARCHAR(255) DEFAULT NULL;

-- Add started_at column
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add last_message_at column
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill timestamps for existing conversations
UPDATE chat_conversations 
SET started_at = created_at 
WHERE started_at IS NULL;

UPDATE chat_conversations 
SET last_message_at = updated_at 
WHERE last_message_at IS NULL;

-- Ensure status constraint matches required lifecycle ('active', 'completed', 'archived')
ALTER TABLE chat_conversations 
DROP CONSTRAINT IF EXISTS chk_chat_conversations_status;

ALTER TABLE chat_conversations 
ADD CONSTRAINT chk_chat_conversations_status 
CHECK (status IN ('active', 'completed', 'archived'));

-- Indexes for chat_conversations
CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor_id 
ON chat_conversations(visitor_id);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_token_hash 
ON chat_conversations(session_token_hash);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_status 
ON chat_conversations(status);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message_at 
ON chat_conversations(last_message_at DESC);


-- ============================================================================
-- 2. ENHANCE chat_messages TABLE
-- ============================================================================

-- Add message_content column (aliased with existing content)
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS message_content TEXT;

-- Backfill message_content from existing content column
UPDATE chat_messages 
SET message_content = content 
WHERE message_content IS NULL;

-- Enforce NOT NULL on message_content after backfill
ALTER TABLE chat_messages 
ALTER COLUMN message_content SET NOT NULL;

-- Add detected_intent column
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS detected_intent VARCHAR(100) DEFAULT NULL;

-- Backfill detected_intent from intent
UPDATE chat_messages 
SET detected_intent = intent 
WHERE detected_intent IS NULL AND intent IS NOT NULL;

-- Add intent_category column
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS intent_category VARCHAR(50) DEFAULT NULL;

-- Add confidence_score column (range 0.00 to 1.00)
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5, 2) DEFAULT NULL;

-- Add extracted_entities JSONB column
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS extracted_entities JSONB DEFAULT '{}'::jsonb;

-- Indexes for chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_detected_intent 
ON chat_messages(detected_intent);

CREATE INDEX IF NOT EXISTS idx_chat_messages_intent_category 
ON chat_messages(intent_category);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
ON chat_messages(created_at DESC);


-- ============================================================================
-- 3. CREATE chat_leads TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS chat_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE SET NULL,
    visitor_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    project_type VARCHAR(100),
    project_description TEXT,
    budget VARCHAR(100),
    preferred_date VARCHAR(100),
    location VARCHAR(255),
    lead_status VARCHAR(50) NOT NULL DEFAULT 'new' 
        CHECK (lead_status IN ('new', 'contacted', 'qualified', 'converted', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for chat_leads
CREATE INDEX IF NOT EXISTS idx_chat_leads_conversation_id 
ON chat_leads(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_leads_lead_status 
ON chat_leads(lead_status);

CREATE INDEX IF NOT EXISTS idx_chat_leads_project_type 
ON chat_leads(project_type);

CREATE INDEX IF NOT EXISTS idx_chat_leads_created_at 
ON chat_leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_leads_email 
ON chat_leads(email);


-- ============================================================================
-- 4. CREATE portfolio_knowledge TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    project_name VARCHAR(255) DEFAULT NULL,
    keywords TEXT[] DEFAULT '{}'::TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for portfolio_knowledge
CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_category 
ON portfolio_knowledge(category);

CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_is_published 
ON portfolio_knowledge(is_published);

CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_project_name 
ON portfolio_knowledge(project_name);

CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_created_at 
ON portfolio_knowledge(created_at DESC);

