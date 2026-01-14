import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase not configured"
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check if user is admin
        let isAdmin = false;
        let userEmail = '';
        try {
            const { userId } = await auth();
            if (userId) {
                const { clerkClient } = await import("@clerk/nextjs/server");
                const client = await clerkClient();
                const user = await client.users.getUser(userId);
                isAdmin = user.publicMetadata?.role === "admin";
                userEmail = user.emailAddresses[0]?.emailAddress || '';
            }
        } catch (authErr) {
            // Not authenticated, continue as public user
        }

        // Fetch recent images
        let query = supabase
            .from('images')
            .select('*')
            .order('uploaded_at', { ascending: false })
            .limit(20);

        // If not admin, only show public images OR user's own images
        if (!isAdmin) {
            if (userEmail) {
                // Show public images (NULL or false) OR user's own private images
                query = query.or(`is_private.is.null,is_private.eq.false,uploader_email.eq.${userEmail}`);
            } else {
                // Only show public images (NULL or false)
                query = query.or('is_private.is.null,is_private.eq.false');
            }
        }
        // Admins see everything

        const { data: images, error } = await query;

        if (error) {
            console.error("Database error:", error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            images: images || []
        });

    } catch (error) {
        console.error("Fetch recent images error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch images"
        }, { status: 500 });
    }
}
