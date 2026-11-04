-- Migration 018: Enhance chat_leads table for Step 10 Lead Generation & Enquiry Management
-- Adds source column, updates status check constraint, and adds phone index.

-- 1. Add source column if it doesn't exist
ALTER TABLE chat_leads 
ADD COLUMN IF NOT EXISTS source VARCHAR(100) DEFAULT 'AI Chat Assistant';

-- 2. Update lead_status check constraint to support standard pipeline statuses
ALTER TABLE chat_leads 
DROP CONSTRAINT IF EXISTS chat_leads_lead_status_check;

ALTER TABLE chat_leads 
DROP CONSTRAINT IF EXISTS chk_chat_leads_status;

ALTER TABLE chat_leads 
ADD CONSTRAINT chk_chat_leads_status 
CHECK (LOWER(lead_status) IN (
    'new',
    'contacted',
    'in_discussion',
    'qualified',
    'converted',
    'closed',
    'rejected',
    'spam'
));

-- 3. Add index on phone for lead lookup and deduplication
CREATE INDEX IF NOT EXISTS idx_chat_leads_phone 
ON chat_leads(phone);

-- 4. Add index on source
CREATE INDEX IF NOT EXISTS idx_chat_leads_source 
ON chat_leads(source);

