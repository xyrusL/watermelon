import { NextRequest, NextResponse } from "next/server";
import { DbImageRecord, serializeImageRecord } from "@/app/api/_lib/images";
import { enforceRateLimit, getStorageBucketName, getSupabaseAdmin, jsonError, requireAdminUser } from "@/app/api/_lib/security";

export async function GET(request: NextRequest) {
    try {
        const adminCheck = await requireAdminUser();
        if (!adminCheck.ok) return adminCheck.response;

        const rateLimit = enforceRateLimit(request, {
            key: "admin-images",
            limit: 60,
            windowMs: 60 * 1000,
        });
        if (!rateLimit.ok) return rateLimit.response;

        const supabase = getSupabaseAdmin();
        const { data: images, error } = await supabase
            .from("images")
            .select("*")
            .order("uploaded_at", { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            return jsonError(error.message, 500);
        }

        const serialized = (images as DbImageRecord[] | null)?.map(serializeImageRecord) || [];

        return NextResponse.json({
            success: true,
            images: serialized,
            stats: {
                totalImages: serialized.length,
                softDeletedImages: serialized.filter((img) => !!img.user_deleted_at).length,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to fetch images",
            500
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const adminCheck = await requireAdminUser();
        if (!adminCheck.ok) return adminCheck.response;

        const rateLimit = enforceRateLimit(request, {
            key: "admin-delete-images",
            limit: 20,
            windowMs: 60 * 1000,
        });
        if (!rateLimit.ok) return rateLimit.response;

        const body = await request.json();
        const imageIds = Array.isArray(body.imageIds)
            ? body.imageIds.filter((id: unknown): id is string => typeof id === "string" && id.trim().length > 0)
            : [];

        if (imageIds.length === 0) {
            return jsonError("No image IDs provided", 400);
        }

        const supabase = getSupabaseAdmin();
        const bucket = getStorageBucketName();
        const { data: images, error: fetchError } = await supabase
            .from("images")
            .select("id, file_path")
            .in("id", imageIds);

        if (fetchError) {
            return jsonError(fetchError.message, 500);
        }

        const filePaths = (images || [])
            .map((image) => image.file_path)
            .filter((path): path is string => typeof path === "string" && path.length > 0);

        if (filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
                .from(bucket)
                .remove(filePaths);
            if (storageError) {
                console.warn("Storage delete error:", storageError);
            }
        }

        const { error: dbError } = await supabase
            .from("images")
            .delete()
            .in("id", imageIds);

        if (dbError) {
            console.error("Database delete error:", dbError);
            return jsonError(dbError.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: `Deleted ${imageIds.length} image(s)`,
        });
    } catch (error) {
        console.error("Delete error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to delete images",
            500
        );
    }
}
