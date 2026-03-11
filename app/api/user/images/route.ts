import { NextRequest, NextResponse } from "next/server";
import { DbImageRecord, serializeImageRecord } from "@/app/api/_lib/images";
import { getSupabaseAdmin, requireAuthenticatedUser } from "@/app/api/_lib/security";

export async function GET(_request: NextRequest) {
    try {
        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

        const supabase = getSupabaseAdmin();
        const { data: images, error } = await supabase
            .from("images")
            .select("*")
            .eq("uploader_email", authResult.user.email)
            .is("user_deleted_at", null)
            .order("uploaded_at", { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const serialized = (images as DbImageRecord[] | null)?.map(serializeImageRecord) || [];

        return NextResponse.json({
            success: true,
            images: serialized,
            stats: {
                totalImages: serialized.length,
                publicImages: serialized.filter((img) => img.is_private !== true).length,
                privateImages: serialized.filter((img) => img.is_private === true).length,
            },
        });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch images",
            },
            { status: 500 }
        );
    }
}
