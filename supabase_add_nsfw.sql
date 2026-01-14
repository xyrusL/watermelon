-- Add is_nsfw column to images table
-- This allows users to mark their uploads as NSFW (will be blurred in gallery)
-- Default is false (not NSFW)

ALTER TABLE images 
ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_images_is_nsfw ON images(is_nsfw);
