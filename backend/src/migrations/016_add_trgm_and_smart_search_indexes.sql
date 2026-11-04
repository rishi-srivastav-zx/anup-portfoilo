-- Migration 016: Add pg_trgm extension and trigram indexes for Smart Search
-- Step 6: Smart Search Engine for Cinematographer Portfolio AI Assistant

-- 1. Enable pg_trgm extension for fuzzy similarity and typo-tolerant search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Create Trigram GIN index on title for fast fuzzy title matching
CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_title_trgm 
ON portfolio_knowledge USING gin (title gin_trgm_ops);

-- 3. Create Trigram GIN index on project_name for fast fuzzy project matching
CREATE INDEX IF NOT EXISTS idx_portfolio_knowledge_project_name_trgm 
ON portfolio_knowledge USING gin (project_name gin_trgm_ops);

