-- Migration 014: Add status column and search indexes to portfolio_knowledge table
-- Step 5 Prep: Dynamic Portfolio Knowledge Management System for AI Chatbot

-- ============================================================================
-- 1. ADD status COLUMN TO portfolio_knowledge
-- ============================================================================

ALTER TABLE portfolio_knowledge 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'archived'));

-- Backfill status based on existing is_published column
UPDATE portfolio_knowledge
SET status = CASE 
    WHEN is_published = TRUE THEN 'published' 
    ELSE 'draft' 
END
WHERE status IS NULL;

-- Keep is_published in sync: if status is published, is_published is true, otherwise false
UPDATE portfolio_knowledge
SET is_published = (status = 'published');

-- ============================================================================
-- 2. CREATE SEARCH AND STATUS INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_status 
ON portfolio_knowledge(status);

CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_title 
ON portfolio_knowledge(title);

-- GIN index for fast keyword array search in PostgreSQL
CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_keywords_gin 
ON portfolio_knowledge USING GIN (keywords);

