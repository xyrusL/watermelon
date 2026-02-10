-- Add image and frame dimension metadata for ImageFrame command generation
ALTER TABLE images
ADD COLUMN IF NOT EXISTS image_width INTEGER,
ADD COLUMN IF NOT EXISTS image_height INTEGER,
ADD COLUMN IF NOT EXISTS frame_width INTEGER,
ADD COLUMN IF NOT EXISTS frame_height INTEGER;

-- Guardrails for valid Minecraft frame sizes (1..100)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'images_frame_width_range_check'
    ) THEN
        ALTER TABLE images
        ADD CONSTRAINT images_frame_width_range_check CHECK (
            frame_width IS NULL OR (frame_width >= 1 AND frame_width <= 100)
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'images_frame_height_range_check'
    ) THEN
        ALTER TABLE images
        ADD CONSTRAINT images_frame_height_range_check CHECK (
            frame_height IS NULL OR (frame_height >= 1 AND frame_height <= 100)
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_images_frame_dimensions ON images(frame_width, frame_height);
