-- Migration: 007_alter_blogs_add_content_and_gallery.sql
-- Description: Add content, gallery_images, and featured_image_file_id columns to blogs table

ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS content TEXT,
ADD COLUMN IF NOT EXISTS gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS featured_image_file_id VARCHAR(255);

