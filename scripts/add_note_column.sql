-- Add note column to check_ins table if it doesn't exist
-- Run this in Supabase SQL editor under your project

ALTER TABLE check_ins
ADD COLUMN IF NOT EXISTS note TEXT DEFAULT NULL;

-- Create index on note for faster filtering
CREATE INDEX IF NOT EXISTS idx_check_ins_note ON check_ins(user_id, note) 
WHERE note IS NOT NULL;

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'check_ins' AND column_name = 'note';
