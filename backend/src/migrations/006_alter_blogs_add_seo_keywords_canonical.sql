-- Migration: 006_alter_blogs_add_seo_keywords_canonical.sql
-- Description: Add seo_keywords and canonical_url columns to blogs table

ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS seo_keywords TEXT,
ADD COLUMN IF NOT EXISTS canonical_url TEXT;

