import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth, clerkClient } from "@clerk/nextjs/server";

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
        const isAdmin = currentUser.publicMetadata?.role === "admin";

        if (!userEmail && !isAdmin) {
            return NextResponse.json(
                { success: false, error: "User email not found" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase storage not configured"
            }, { status: 500 });
        }

        const { deleteUrl } = await request.json();

        if (!deleteUrl) {
            return NextResponse.json({
                success: false,
                error: "No file path provided"
            }, { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Verify ownership (or admin) before deleting
        const { data: imageRecord, error: fetchError } = await supabase
            .from('images')
            .select('uploader_email, file_path')
            .eq('file_path', deleteUrl)
            .single();

        if (fetchError || !imageRecord) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        if (!isAdmin && imageRecord.uploader_email !== userEmail) {
            return NextResponse.json(
                { success: false, error: "Forbidden - You can only delete your own images" },
                { status: 403 }
            );
        }

        // Delete from Supabase Storage
        const { error } = await supabase.storage
            .from('watermelon-images')
            .remove([deleteUrl]);

        if (error) {
            console.error("Supabase delete error:", error);
            return NextResponse.json({
                success: false,
                error: error.message || "Delete failed"
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully from Watermelon Storage"
        });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Delete failed"
        }, { status: 500 });
    }
}
