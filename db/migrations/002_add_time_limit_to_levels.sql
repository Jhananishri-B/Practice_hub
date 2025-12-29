-- Add time_limit column to levels table
ALTER TABLE levels ADD COLUMN IF NOT EXISTS time_limit INTEGER;


