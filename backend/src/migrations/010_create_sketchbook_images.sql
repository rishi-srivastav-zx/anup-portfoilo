-- Migration 010: Create sketchbook_images table for Infinite Pages / Curated Works gallery (max 10 images)
CREATE TABLE IF NOT EXISTS sketchbook_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL DEFAULT 'Untitled Plate',
    place VARCHAR(255) DEFAULT '',
    description TEXT DEFAULT '',
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_id VARCHAR(255),
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sketchbook_sort_order ON sketchbook_images(sort_order ASC, created_at ASC);

