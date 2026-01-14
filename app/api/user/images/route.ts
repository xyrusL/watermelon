import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// GET: Fetch user's own images
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized"
            }, { status: 401 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase not configured"
            }, { status: 500 });
        }

        // Get user's email from Clerk
        const { clerkClient } = await import("@clerk/nextjs/server");
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({
                success: false,
                error: "User email not found"
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch user's images (both public and private)
        const { data: images, error } = await supabase
            .from('images')
            .select('*')
            .eq('uploader_email', userEmail)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error("Fetch error:", error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            images: images || [],
            stats: {
                totalImages: images?.length || 0,
                publicImages: images?.filter(img => !img.is_private).length || 0,
                privateImages: images?.filter(img => img.is_private).length || 0
            }
        });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch images"
        }, { status: 500 });
    }
}
