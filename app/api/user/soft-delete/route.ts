import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth, clerkClient } from "@clerk/nextjs/server";

// POST: Soft-delete user's own image (hide from user/public; keep for admin)
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        const userEmail = currentUser.emailAddresses[0]?.emailAddress;

        if (!userEmail) {
            return NextResponse.json(
                { success: false, error: "User email not found" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json(
                { success: false, error: "Supabase not configured" },
                { status: 500 }
            );
        }

        const { imageId } = await request.json();
        if (!imageId || typeof imageId !== "string") {
            return NextResponse.json(
                { success: false, error: "Invalid imageId" },
                { status: 400 }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: imageRecord, error: fetchError } = await supabase
            .from("images")
            .select("id, uploader_email, user_deleted_at")
            .eq("id", imageId)
            .single();

        if (fetchError || !imageRecord) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        if (imageRecord.uploader_email !== userEmail) {
            return NextResponse.json(
                { success: false, error: "Forbidden - You can only delete your own images" },
                { status: 403 }
            );
        }

        if (imageRecord.user_deleted_at) {
            return NextResponse.json({
                success: true,
                message: "Image already removed from your uploads",
            });
        }

        const { error: updateError } = await supabase
            .from("images")
            .update({
                user_deleted_at: new Date().toISOString(),
                user_deleted_by_email: userEmail,
            })
            .eq("id", imageId);

        if (updateError) {
            console.error("Soft delete error:", updateError);
            return NextResponse.json(
                { success: false, error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Image removed from your uploads",
        });
    } catch (error) {
        console.error("Soft delete route error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Failed to remove image",
            },
            { status: 500 }
        );
    }
}
