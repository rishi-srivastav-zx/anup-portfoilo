-- Migration 011: Create work_projects table for dynamic Work Metro Transit Section
CREATE TABLE IF NOT EXISTS work_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    station_name VARCHAR(255) DEFAULT '',
    floating_tag VARCHAR(100) DEFAULT 'FEATURED',
    client VARCHAR(255) DEFAULT '',
    summary TEXT DEFAULT '',
    seo_title VARCHAR(255) DEFAULT '',
    seo_description TEXT DEFAULT '',
    video_url TEXT NOT NULL,
    video_mov_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '',
    file_id VARCHAR(255),
    keyword VARCHAR(100) DEFAULT 'Cinematography',
    camera VARCHAR(100) DEFAULT 'ARRI LF',
    lens VARCHAR(100) DEFAULT 'ANAMORPHIC',
    format_ratio VARCHAR(100) DEFAULT '2.39:1',
    sort_order INT NOT NULL DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_projects_sort_order ON work_projects(sort_order ASC, created_at ASC);

