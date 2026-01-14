import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase not configured"
            }, { status: 500 });
        }

        // Get authenticated user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: "Authentication required"
            }, { status: 401 });
        }

        // Get user email
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const userEmail = user.emailAddresses[0]?.emailAddress || '';

        const body = await request.json();
        const { imageId, isNsfw } = body;

        if (!imageId || typeof isNsfw !== 'boolean') {
            return NextResponse.json({
                success: false,
                error: "Invalid request body"
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Update image - only if user owns it
        const { data, error } = await supabase
            .from('images')
            .update({ is_nsfw: isNsfw })
            .eq('id', imageId)
            .eq('uploader_email', userEmail)
            .select()
            .single();

        if (error) {
            console.error("Update NSFW error:", error);
            return NextResponse.json({
                success: false,
                error: "Failed to update NSFW status"
            }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({
                success: false,
                error: "Image not found or you don't have permission"
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: isNsfw ? "Image marked as NSFW" : "NSFW marking removed",
            image: data
        });

    } catch (error) {
        console.error("Update NSFW error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update NSFW status"
        }, { status: 500 });
    }
}
