import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// POST: Update image visibility (public/private)
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized"
            }, { status: 401 });
        }

        const body = await request.json();
        const { imageId, isPrivate } = body;

        if (!imageId || typeof isPrivate !== 'boolean') {
            return NextResponse.json({
                success: false,
                error: "Invalid parameters"
            }, { status: 400 });
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

        // Verify the image belongs to the user
        const { data: image, error: fetchError } = await supabase
            .from('images')
            .select('uploader_email')
            .eq('id', imageId)
            .single();

        if (fetchError || !image) {
            return NextResponse.json({
                success: false,
                error: "Image not found"
            }, { status: 404 });
        }

        if (image.uploader_email !== userEmail) {
            return NextResponse.json({
                success: false,
                error: "You can only modify your own images"
            }, { status: 403 });
        }

        // Update visibility
        const { error: updateError } = await supabase
            .from('images')
            .update({ is_private: isPrivate })
            .eq('id', imageId);

        if (updateError) {
            console.error("Update error:", updateError);
            return NextResponse.json({
                success: false,
                error: updateError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Image is now ${isPrivate ? 'private' : 'public'}`
        });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update visibility"
        }, { status: 500 });
    }
}
