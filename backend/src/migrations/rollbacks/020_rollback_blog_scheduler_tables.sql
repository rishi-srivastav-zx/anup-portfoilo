-- Rollback Migration for 020_create_blog_scheduler_tables.sql
-- Description: Safely drops blog scheduler tables, triggers, constraints, and migration record

DROP TRIGGER IF EXISTS trg_blog_publish_queue_updated_at ON blog_publish_queue;
DROP TRIGGER IF EXISTS trg_blog_scheduler_settings_updated_at ON blog_scheduler_settings;

DROP TABLE IF EXISTS blog_publish_logs CASCADE;
DROP TABLE IF EXISTS blog_publish_queue CASCADE;
DROP TABLE IF EXISTS blog_scheduler_settings CASCADE;

DELETE FROM schema_migrations WHERE migration_name = '020_create_blog_scheduler_tables.sql';

