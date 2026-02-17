-- Add user soft-delete columns to images table.
-- Soft-deleted images are hidden from user/public views but still visible to admins.

ALTER TABLE images
ADD COLUMN IF NOT EXISTS user_deleted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS user_deleted_by_email TEXT;

-- Speed up common active-image queries.
CREATE INDEX IF NOT EXISTS idx_images_active_not_user_deleted
ON images (uploaded_at DESC)
WHERE user_deleted_at IS NULL;

-- Optional helper index for admin auditing.
CREATE INDEX IF NOT EXISTS idx_images_user_deleted_at
ON images (user_deleted_at DESC);
