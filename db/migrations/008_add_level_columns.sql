-- Migration: Add topic_description and learning_materials columns to levels table
-- Date: 2026-01-22

-- Add topic_description column if it doesn't exist
ALTER TABLE levels 
ADD COLUMN IF NOT EXISTS topic_description TEXT AFTER description;

-- Add learning_materials column if it doesn't exist
ALTER TABLE levels 
ADD COLUMN IF NOT EXISTS learning_materials TEXT AFTER topic_description;

