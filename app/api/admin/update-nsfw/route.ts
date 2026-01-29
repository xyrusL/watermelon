import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth, clerkClient } from "@clerk/nextjs/server";

async function requireAdmin() {
    const { userId } = await auth();
    if (!userId) {
        return {
            ok: false,
            response: NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            ),
        };
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);

    if (currentUser.publicMetadata?.role !== "admin") {
        return {
            ok: false,
            response: NextResponse.json(
                { success: false, error: "Forbidden - Admin access required" },
                { status: 403 }
            ),
        };
    }

    return { ok: true as const };
}

// POST: Admin update NSFW status
export async function POST(request: NextRequest) {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return adminCheck.response;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase not configured"
            }, { status: 500 });
        }

        const body = await request.json();
        const { imageId, isNsfw } = body;

        if (!imageId || typeof isNsfw !== 'boolean') {
            return NextResponse.json({
                success: false,
                error: "Invalid parameters"
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update NSFW status directly without ownership check (Admin override)
        const { error: updateError } = await supabase
            .from('images')
            .update({ is_nsfw: isNsfw })
            .eq('id', imageId);

        if (updateError) {
            console.error("Admin NSFW update error:", updateError);
            return NextResponse.json({
                success: false,
                error: updateError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Admin: Image marked as ${isNsfw ? 'NSFW' : 'Safe'}`
        });

    } catch (error) {
        console.error("Admin Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update NSFW status"
        }, { status: 500 });
    }
}
