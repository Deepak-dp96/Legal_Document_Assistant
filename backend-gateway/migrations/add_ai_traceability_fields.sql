-- Migration: Add AI traceability fields to agent_analysis table
-- Date: 2026-01-02
-- Purpose: Track which AI model and provider was used for each analysis

-- Add model_used column
ALTER TABLE agent_analysis 
ADD COLUMN IF NOT EXISTS model_used VARCHAR(100);

-- Add retry_count column
ALTER TABLE agent_analysis 
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

-- Add ai_provider column
ALTER TABLE agent_analysis 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(50);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_analysis_model_used ON agent_analysis(model_used);
CREATE INDEX IF NOT EXISTS idx_agent_analysis_ai_provider ON agent_analysis(ai_provider);

-- Add comments for documentation
COMMENT ON COLUMN agent_analysis.model_used IS 'AI model name used for analysis (e.g., gemini-1.5-pro, llama-3.3-70b-versatile)';
COMMENT ON COLUMN agent_analysis.retry_count IS 'Number of retry attempts made for this analysis';
COMMENT ON COLUMN agent_analysis.ai_provider IS 'AI provider used (gemini or groq)';

-- Note: Existing records will have NULL values for these fields
-- New analyses will populate these fields automatically
