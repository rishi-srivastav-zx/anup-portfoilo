-- Migration: 004_alter_auth_sessions_add_missing_columns.sql
-- Description: Safely add user_agent, ip_address, is_revoked, and updated_at to existing auth_sessions table

ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS is_revoked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Synchronize is_revoked from legacy revoked_at column if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'auth_sessions' AND column_name = 'revoked_at'
    ) THEN
        UPDATE auth_sessions SET is_revoked = true WHERE revoked_at IS NOT NULL;
    END IF;
END $$;

-- Trigger to maintain updated_at automatically
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_auth_sessions_updated_at'
    ) THEN
        CREATE TRIGGER trg_auth_sessions_updated_at
        BEFORE UPDATE ON auth_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
