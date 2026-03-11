import { buildInternalImageUrl, getStorageBucketName, getSupabaseAdmin } from "./security";

export type DbImageRecord = {
    id: string;
    url: string | null;
    file_path: string;
    filename: string;
    uploaded_at: string;
    file_size: number;
    host: string;
    uploader_name?: string | null;
    uploader_email?: string | null;
    is_private?: boolean | null;
    is_nsfw?: boolean | null;
    image_width?: number | null;
    image_height?: number | null;
    frame_width?: number | null;
    frame_height?: number | null;
    user_deleted_at?: string | null;
    user_deleted_by_email?: string | null;
};

export const serializeImageRecord = (image: DbImageRecord) => ({
    ...image,
    url: buildInternalImageUrl(image.id),
    directUrl: buildInternalImageUrl(image.id),
    thumbnail: buildInternalImageUrl(image.id),
});

export async function resolveImageAccess(
    imageId: string,
    user?: { email: string; isAdmin: boolean }
) {
    const supabase = getSupabaseAdmin();
    const { data: image, error } = await supabase
        .from("images")
        .select("*")
        .eq("id", imageId)
        .single();

    if (error || !image) {
        return { ok: false as const, status: 404, error: "Image not found" };
    }

    if (image.user_deleted_at && !user?.isAdmin) {
        return { ok: false as const, status: 404, error: "Image not found" };
    }

    const isOwner = Boolean(user?.email && image.uploader_email === user.email);
    const isPublic = image.is_private !== true;

    if (!isPublic && !user?.isAdmin && !isOwner) {
        return { ok: false as const, status: 403, error: "Forbidden" };
    }

    if (image.host !== "supabase") {
        return {
            ok: true as const,
            image,
            redirectUrl: image.url || buildInternalImageUrl(image.id),
        };
    }

    const bucket = getStorageBucketName();
    const expiresIn = isPublic ? 60 * 10 : 60 * 2;
    const { data: signed, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(image.file_path, expiresIn);

    if (signedError || !signed?.signedUrl) {
        return { ok: false as const, status: 500, error: "Failed to access image" };
    }

    return {
        ok: true as const,
        image,
        redirectUrl: signed.signedUrl,
    };
}
