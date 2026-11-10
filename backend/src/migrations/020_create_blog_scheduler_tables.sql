-- Migration: 020_create_blog_scheduler_tables.sql
-- Description: Production-Ready Bulk Blog Scheduler and Automated Publishing Queue Tables
-- Author: Senior Backend Performance Engineer & PostgreSQL Architect

-- ============================================================================
-- 1. BLOG SCHEDULER SETTINGS TABLE (Singleton Configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_scheduler_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    enabled BOOLEAN NOT NULL DEFAULT true,
    publishing_interval_minutes INT NOT NULL DEFAULT 60 CHECK (publishing_interval_minutes >= 5 AND publishing_interval_minutes <= 1440),
    daily_publish_limit INT NOT NULL DEFAULT 10 CHECK (daily_publish_limit >= 1 AND daily_publish_limit <= 100),
    next_publish_at TIMESTAMPTZ,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default scheduler settings singleton if empty
INSERT INTO blog_scheduler_settings (id, enabled, publishing_interval_minutes, daily_publish_limit, timezone)
VALUES (1, true, 60, 10, 'Asia/Kolkata')
ON CONFLICT (id) DO NOTHING;

-- Trigger for blog_scheduler_settings updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blog_scheduler_settings_updated_at'
    ) THEN
        CREATE TRIGGER trg_blog_scheduler_settings_updated_at
        BEFORE UPDATE ON blog_scheduler_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 2. BLOG PUBLISH QUEUE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_publish_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'published', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    next_attempt_at TIMESTAMPTZ NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    max_attempts INT NOT NULL DEFAULT 3 CHECK (max_attempts >= 1),
    locked_at TIMESTAMPTZ,
    lock_token VARCHAR(255),
    published_at TIMESTAMPTZ,
    last_error TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for blog_publish_queue updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blog_publish_queue_updated_at'
    ) THEN
        CREATE TRIGGER trg_blog_publish_queue_updated_at
        BEFORE UPDATE ON blog_publish_queue
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ============================================================================
-- 3. BLOG PUBLISH LOGS TABLE (Immutable Audit Trail)
-- ============================================================================
CREATE TABLE IF NOT EXISTS blog_publish_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_id UUID REFERENCES blog_publish_queue(id) ON DELETE SET NULL,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL CHECK (attempt_number >= 1),
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'retrying', 'cancelled', 'skipped')),
    message TEXT NOT NULL,
    error_details JSONB,
    execution_duration_ms INT CHECK (execution_duration_ms >= 0),
    triggered_by VARCHAR(50) NOT NULL DEFAULT 'scheduler',
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. CONSTRAINTS & UNIQUE INDEXES
-- ============================================================================
-- Prevent the same blog from having more than ONE active queue entry ('pending' or 'processing')
CREATE UNIQUE INDEX IF NOT EXISTS idx_blog_queue_unique_active_blog
ON blog_publish_queue (blog_id)
WHERE status IN ('pending', 'processing');

-- ============================================================================
-- 5. PERFORMANCE INDEXES
-- ============================================================================

-- Fast worker polling: Picks up ready jobs sorted by next_attempt_at with zero table scan
CREATE INDEX IF NOT EXISTS idx_blog_queue_worker_poll
ON blog_publish_queue (next_attempt_at ASC, created_at ASC)
WHERE status = 'pending';

-- Stale/zombie lock detection index: Identifies crashed worker locks without sequential scan
CREATE INDEX IF NOT EXISTS idx_blog_queue_stale_locks
ON blog_publish_queue (locked_at)
WHERE status = 'processing';

-- Filter queue by status & scheduled date for Admin UI
CREATE INDEX IF NOT EXISTS idx_blog_queue_status_scheduled
ON blog_publish_queue (status, scheduled_at DESC);

-- Fast lookup of all queue history for a given blog
CREATE INDEX IF NOT EXISTS idx_blog_queue_blog_id
ON blog_publish_queue (blog_id);

-- Lookup publish logs for a specific queue job
CREATE INDEX IF NOT EXISTS idx_blog_publish_logs_queue_id
ON blog_publish_logs (queue_id);

-- Lookup publish logs for a specific blog (chronological)
CREATE INDEX IF NOT EXISTS idx_blog_publish_logs_blog_id
ON blog_publish_logs (blog_id, created_at DESC);

-- Admin monitoring / troubleshooting audit logs
CREATE INDEX IF NOT EXISTS idx_blog_publish_logs_created_at
ON blog_publish_logs (created_at DESC);

