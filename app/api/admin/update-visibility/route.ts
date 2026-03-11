import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, jsonError, requireAdminUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const adminCheck = await requireAdminUser();
        if (!adminCheck.ok) return adminCheck.response;

        const { imageId, isPrivate } = await request.json();
        if (!imageId || typeof isPrivate !== "boolean") {
            return jsonError("Invalid parameters", 400);
        }

        const supabase = getSupabaseAdmin();
        const { error: updateError } = await supabase
            .from("images")
            .update({ is_private: isPrivate })
            .eq("id", imageId);

        if (updateError) {
            console.error("Admin visibility update error:", updateError);
            return jsonError(updateError.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: `Admin: Image is now ${isPrivate ? "private" : "public"}`,
        });
    } catch (error) {
        console.error("Admin Error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to update visibility",
            500
        );
    }
}
