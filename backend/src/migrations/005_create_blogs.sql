-- Migration: 005_create_blogs.sql
-- Description: Create blogs table matching all fields from the blog form and public articles

CREATE TABLE IF NOT EXISTS blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    author JSONB NOT NULL DEFAULT '{"name": "Anup Rawat", "role": "Cinematographer & Visual Storyteller"}'::jsonb,
    featured_image TEXT NOT NULL,
    featured_image_alt TEXT NOT NULL,
    featured_image_file_id VARCHAR(255),
    gallery_images JSONB NOT NULL DEFAULT '[]'::jsonb,
    reading_time VARCHAR(50) NOT NULL DEFAULT '1 min read',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    layout_variant VARCHAR(50) NOT NULL DEFAULT 'wide' CHECK (layout_variant IN ('wide', 'standard')),
    technical_note TEXT,
    introduction JSONB NOT NULL DEFAULT '[]'::jsonb,
    content TEXT,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    canonical_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookup by unique slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_blogs_slug ON blogs (slug);

-- Index for filtering by category
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs (category);

-- Index for filtering by publication status
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs (status);

-- Index for featured blogs query
CREATE INDEX IF NOT EXISTS idx_blogs_is_featured ON blogs (is_featured);

-- Index for sorting published articles chronologically
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs (published_at DESC);

-- Index for author user_id
CREATE INDEX IF NOT EXISTS idx_blogs_user_id ON blogs (user_id);

-- Trigger to maintain updated_at automatically
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trg_blogs_updated_at'
    ) THEN
        CREATE TRIGGER trg_blogs_updated_at
        BEFORE UPDATE ON blogs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

