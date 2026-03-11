import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, jsonError, requireAuthenticatedUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

        const { imageId, isNsfw } = await request.json();
        if (!imageId || typeof isNsfw !== "boolean") {
            return jsonError("Invalid request body", 400);
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
            return jsonError("Image not found or you don't have permission", 403);
        }

        const { error } = await supabase
            .from("images")
            .update({ is_nsfw: isNsfw })
            .eq("id", imageId);

        if (error) {
            console.error("Update NSFW error:", error);
            return jsonError("Failed to update NSFW status", 500);
        }

        return NextResponse.json({
            success: true,
            message: isNsfw ? "Image marked as NSFW" : "NSFW marking removed",
        });
    } catch (error) {
        console.error("Update NSFW error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to update NSFW status",
            500
        );
    }
}
