-- Migration: Add user_id column to reports table
-- Date: 2026-01-02

-- Add the user_id column
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Add foreign key constraint
ALTER TABLE reports
ADD CONSTRAINT fk_reports_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Note: Existing reports will have user_id = NULL
-- New reports will be created with proper user_id values
