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
    };
}

/**
 * Maps an array of database images to frontend format.
 */
export function mapDbImagesToUploadedImages(images: DbImage[]): (UploadedImage & { id: string })[] {
    return images.map(mapDbImageToUploadedImage);
}
