-- Migration 008: Create enquiries table for portfolio lead generation

CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    source VARCHAR(100) DEFAULT 'Contact Section',
    status VARCHAR(50) DEFAULT 'New',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);

