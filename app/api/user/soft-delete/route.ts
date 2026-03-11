import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, jsonError, requireAuthenticatedUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

        const { imageId } = await request.json();
        if (!imageId || typeof imageId !== "string") {
            return jsonError("Invalid imageId", 400);
        }

        const supabase = getSupabaseAdmin();
        const { data: imageRecord, error: fetchError } = await supabase
            .from("images")
            .select("id, uploader_email, user_deleted_at")
            .eq("id", imageId)
            .single();

        if (fetchError || !imageRecord) {
            return jsonError("Image not found", 404);
        }

        if (imageRecord.uploader_email !== authResult.user.email) {
            return jsonError("Forbidden - You can only delete your own images", 403);
        }

        if (imageRecord.user_deleted_at) {
            return NextResponse.json({
                success: true,
                message: "Image already removed from your uploads",
            });
        }

        const { error: updateError } = await supabase
            .from("images")
            .update({
                user_deleted_at: new Date().toISOString(),
                user_deleted_by_email: authResult.user.email,
            })
            .eq("id", imageId);

        if (updateError) {
            console.error("Soft delete error:", updateError);
            return jsonError(updateError.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: "Image removed from your uploads",
        });
    } catch (error) {
        console.error("Soft delete route error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to remove image",
            500
        );
    }
}
