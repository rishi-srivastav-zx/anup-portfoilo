-- Migration 009: Alter enquiries table for simplified lead capture (only name and phone compulsory)
ALTER TABLE enquiries 
    ALTER COLUMN email DROP NOT NULL,
    ALTER COLUMN project_type DROP NOT NULL,
    ALTER COLUMN message DROP NOT NULL;

-- Ensure default for status and source
ALTER TABLE enquiries 
    ALTER COLUMN status SET DEFAULT 'New',
    ALTER COLUMN source SET DEFAULT 'Portfolio Contact Form';

