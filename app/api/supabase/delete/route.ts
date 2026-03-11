import { NextRequest, NextResponse } from "next/server";
import { getStorageBucketName, getSupabaseAdmin, jsonError, requireAdminUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const adminCheck = await requireAdminUser();
        if (!adminCheck.ok) return adminCheck.response;

        const { imageId } = await request.json();
        if (!imageId || typeof imageId !== "string") {
            return jsonError("Invalid imageId", 400);
        }

        const supabase = getSupabaseAdmin();
        const bucket = getStorageBucketName();

        const { data: imageRecord, error: fetchError } = await supabase
            .from("images")
            .select("id, file_path")
            .eq("id", imageId)
            .single();

        if (fetchError || !imageRecord) {
            return jsonError("Image not found", 404);
        }

        const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([imageRecord.file_path]);

        if (storageError) {
            console.error("Supabase delete error:", storageError);
            return jsonError(storageError.message || "Delete failed", 500);
        }

        const { error: dbError } = await supabase
            .from("images")
            .delete()
            .eq("id", imageId);

        if (dbError) {
            console.error("Database delete error:", dbError);
            return jsonError(dbError.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully from Watermelon Storage",
        });
    } catch (error) {
        console.error("Delete error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Delete failed",
            500
        );
    }
}
