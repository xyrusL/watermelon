import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, jsonError, requireAdminUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const adminCheck = await requireAdminUser();
        if (!adminCheck.ok) return adminCheck.response;

        const { imageId, isNsfw } = await request.json();
        if (!imageId || typeof isNsfw !== "boolean") {
            return jsonError("Invalid parameters", 400);
        }

        const supabase = getSupabaseAdmin();
        const { error: updateError } = await supabase
            .from("images")
            .update({ is_nsfw: isNsfw })
            .eq("id", imageId);

        if (updateError) {
            console.error("Admin NSFW update error:", updateError);
            return jsonError(updateError.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: `Admin: Image marked as ${isNsfw ? "NSFW" : "Safe"}`,
        });
    } catch (error) {
        console.error("Admin Error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to update NSFW status",
            500
        );
    }
}
