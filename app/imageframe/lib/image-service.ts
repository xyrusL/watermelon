// Centralized Image Service
// All API calls for image operations go through here

import { UploadedImage } from "../types";
import { DbImage, mapDbImagesToUploadedImages } from "./image-mapper";

interface FetchImagesResult {
    success: boolean;
    images: (UploadedImage & { id: string })[];
    stats?: {
        totalImages: number;
        publicImages?: number;
        privateImages?: number;
    };
    error?: string;
}

/**
 * Fetches public gallery images (recent uploads visible to current user)
 */
export async function fetchPublicImages(): Promise<FetchImagesResult> {
    try {
        const response = await fetch('/api/supabase/recent');
        const data = await response.json();

        if (data.success && data.images) {
            return {
                success: true,
                images: mapDbImagesToUploadedImages(data.images),
            };
        }

        return { success: false, images: [], error: data.error };
    } catch (err) {
        console.error('fetchPublicImages error:', err);
        return { success: false, images: [], error: 'Failed to fetch images' };
    }
}

/**
 * Fetches all images for admin panel
 */
export async function fetchAdminImages(): Promise<FetchImagesResult> {
    try {
        const response = await fetch('/api/admin/images');
        const data = await response.json();

        if (data.success && data.images) {
            return {
                success: true,
                images: mapDbImagesToUploadedImages(data.images),
                stats: data.stats,
            };
        }

        return { success: false, images: [], error: data.error };
    } catch (err) {
        console.error('fetchAdminImages error:', err);
        return { success: false, images: [], error: 'Failed to fetch admin images' };
    }
}

/**
 * Fetches user's own images
 */
export async function fetchUserImages(): Promise<FetchImagesResult> {
    try {
        const response = await fetch('/api/user/images');
        const data = await response.json();

        if (data.success && data.images) {
            return {
                success: true,
                images: mapDbImagesToUploadedImages(data.images),
                stats: data.stats,
            };
        }

        return { success: false, images: [], error: data.error };
    } catch (err) {
        console.error('fetchUserImages error:', err);
        return { success: false, images: [], error: 'Failed to fetch user images' };
    }
}

interface UpdateResult {
    success: boolean;
    message?: string;
    error?: string;
}

/**
 * Updates image visibility (private/public)
 * @param isAdmin - If true, uses admin endpoint (bypasses ownership check)
 */
export async function updateImageVisibility(
    imageId: string,
    isPrivate: boolean,
    isAdmin: boolean = false
): Promise<UpdateResult> {
    try {
        const endpoint = isAdmin ? '/api/admin/update-visibility' : '/api/user/update-visibility';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId, isPrivate }),
        });
        return await response.json();
    } catch (err) {
        console.error('updateImageVisibility error:', err);
        return { success: false, error: 'Failed to update visibility' };
    }
}

/**
 * Updates image NSFW status
 * @param isAdmin - If true, uses admin endpoint (bypasses ownership check)
 */
export async function updateImageNsfw(
    imageId: string,
    isNsfw: boolean,
    isAdmin: boolean = false
): Promise<UpdateResult> {
    try {
        const endpoint = isAdmin ? '/api/admin/update-nsfw' : '/api/user/update-nsfw';
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId, isNsfw }),
        });
        return await response.json();
    } catch (err) {
        console.error('updateImageNsfw error:', err);
        return { success: false, error: 'Failed to update NSFW status' };
    }
}

/**
 * Deletes images (admin only for now)
 */
export async function deleteImages(
    imageIds: string[],
    filePaths: (string | undefined)[]
): Promise<UpdateResult> {
    try {
        const response = await fetch('/api/admin/images', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageIds,
                filePaths: filePaths.filter(Boolean)
            }),
        });
        return await response.json();
    } catch (err) {
        console.error('deleteImages error:', err);
        return { success: false, error: 'Failed to delete images' };
    }
}
