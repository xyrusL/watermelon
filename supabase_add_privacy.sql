-- Add is_private column to images table
-- This allows users to mark their uploads as private (only visible to them and admins)
-- Default is false (public)

ALTER TABLE images 
ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_images_is_private ON images(is_private);
CREATE INDEX IF NOT EXISTS idx_images_uploader_email ON images(uploader_email);
