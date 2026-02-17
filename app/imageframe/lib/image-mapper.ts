// Centralized Image Mapper
// Single source of truth for converting DB records to UploadedImage type

import { UploadedImage, HostType } from "../types";

// Database image record structure (from Supabase)
export interface DbImage {
    id: string;
    url: string;
    file_path: string;
    filename: string;
    uploaded_at: string;
    file_size: number;
    host: string;
    uploader_name?: string;
    uploader_email?: string;
    is_private?: boolean;
    is_nsfw?: boolean;
    image_width?: number;
    image_height?: number;
    frame_width?: number;
    frame_height?: number;
    user_deleted_at?: string | null;
    user_deleted_by_email?: string | null;
}

/**
 * Maps a database image record to the frontend UploadedImage type.
 * This is the ONLY place where this conversion should happen.
 * Adding new fields? Add them here once, works everywhere.
 */
export function mapDbImageToUploadedImage(img: DbImage): UploadedImage & { id: string } {
    return {
        id: img.id,
        url: img.url,
        directUrl: img.url,
        deleteUrl: img.file_path,
        filename: img.filename,
        uploadedAt: new Date(img.uploaded_at).getTime(),
        fileSize: img.file_size,
        host: img.host as HostType,
        uploaderName: img.uploader_name,
        uploaderEmail: img.uploader_email,
        is_private: img.is_private ?? false,
        is_nsfw: img.is_nsfw ?? false,
        imageWidth: img.image_width,
        imageHeight: img.image_height,
        frameWidth: img.frame_width,
        frameHeight: img.frame_height,
        userDeletedAt: img.user_deleted_at ? new Date(img.user_deleted_at).getTime() : undefined,
        userDeletedByEmail: img.user_deleted_by_email ?? undefined,
    };
}

/**
 * Maps an array of database images to frontend format.
 */
export function mapDbImagesToUploadedImages(images: DbImage[]): (UploadedImage & { id: string })[] {
    return images.map(mapDbImageToUploadedImage);
}
