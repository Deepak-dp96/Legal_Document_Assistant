-- Migration: Add agent_type column to reports table
-- Date: 2026-01-02

-- Add the agent_type column
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS agent_type VARCHAR(50);

-- Update existing records to have 'combined' as agent_type (backward compatibility)
UPDATE reports 
SET agent_type = 'combined' 
WHERE agent_type IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_agent_type ON reports(agent_type);
