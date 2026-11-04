-- Migration 015: Add Full-Text Search (FTS) index to portfolio_knowledge table
-- Step 5: Portfolio Knowledge Retrieval Engine for AI Assistant

-- Create GIN index on text representation for fast full-text search
CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_fts 
ON portfolio_knowledge 
USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(project_name, '')));

