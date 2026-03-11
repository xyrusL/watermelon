import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, jsonError, requireAuthenticatedUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

        const { imageId, isPrivate } = await request.json();
        if (!imageId || typeof isPrivate !== "boolean") {
            return jsonError("Invalid parameters", 400);
        }

        const supabase = getSupabaseAdmin();
        const { data: image, error: fetchError } = await supabase
            .from("images")
            .select("uploader_email")
            .eq("id", imageId)
            .single();

        if (fetchError || !image) {
            return jsonError("Image not found", 404);
        }

        if (image.uploader_email !== authResult.user.email) {
            return jsonError("You can only modify your own images", 403);
        }

        const { error: updateError } = await supabase
            .from("images")
            .update({ is_private: isPrivate })
            .eq("id", imageId);

        if (updateError) {
            console.error("Update error:", updateError);
            return jsonError(updateError.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: `Image is now ${isPrivate ? "private" : "public"}`,
        });
    } catch (error) {
        console.error("Error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to update visibility",
            500
        );
    }
}
