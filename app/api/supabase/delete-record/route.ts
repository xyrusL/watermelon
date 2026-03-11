import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, jsonError, requireAdminUser } from "@/app/api/_lib/security";

export async function POST(request: NextRequest) {
    try {
        const adminCheck = await requireAdminUser();
        if (!adminCheck.ok) return adminCheck.response;

        const { imageId } = await request.json();
        if (!imageId || typeof imageId !== "string") {
            return jsonError("Invalid imageId", 400);
        }

        const supabase = getSupabaseAdmin();
        const { error } = await supabase
            .from("images")
            .delete()
            .eq("id", imageId);

        if (error) {
            console.error("Database delete error:", error);
            return jsonError(error.message, 500);
        }

        return NextResponse.json({
            success: true,
            message: "Record deleted from database",
        });
    } catch (error) {
        console.error("Delete record error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to delete record",
            500
        );
    }
}
