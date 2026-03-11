import { NextRequest, NextResponse } from "next/server";
import { DbImageRecord, serializeImageRecord } from "@/app/api/_lib/images";
import { getSupabaseAdmin, requireAuthenticatedUser } from "@/app/api/_lib/security";

export async function GET(_request: NextRequest) {
    try {
        const supabase = getSupabaseAdmin();

        let isAdmin = false;
        let userEmail = "";
        const authResult = await requireAuthenticatedUser();
        if (authResult.ok) {
            isAdmin = authResult.user.isAdmin;
            userEmail = authResult.user.email;
        }

        let query = supabase
            .from("images")
            .select("*")
            .is("user_deleted_at", null)
            .order("uploaded_at", { ascending: false })
            .limit(20);

        if (!isAdmin) {
            if (userEmail) {
                const safeEmail = userEmail.replace(/"/g, '\\"');
                query = query.or(`is_private.is.null,is_private.eq.false,uploader_email.eq."${safeEmail}"`);
            } else {
                query = query.or("is_private.is.null,is_private.eq.false");
            }
        }

        const { data: images, error } = await query;
        if (error) {
            console.error("Database error in /api/supabase/recent:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            images: (images as DbImageRecord[] | null)?.map(serializeImageRecord) || [],
        });
    } catch (error) {
        console.error("Fetch recent images error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to fetch images",
            },
            { status: 500 }
        );
    }
}
