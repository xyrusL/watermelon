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
                error: "Supabase not configured"
            }, { status: 500 });
        }

        const { url, file_path } = await request.json();
        const normalizedUrl = typeof url === "string" ? url : "";
        const normalizedFilePath = typeof file_path === "string" ? file_path : "";

        if (!normalizedUrl && !normalizedFilePath) {
            return NextResponse.json({
                success: false,
                error: "No identifier provided"
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch the record to verify ownership (or admin)
        const lookupQuery = supabase
            .from('images')
            .select('id, uploader_email')
            .limit(1);

        const { data: imageRecord, error: fetchError } = normalizedFilePath
            ? await lookupQuery.eq('file_path', normalizedFilePath).single()
            : await lookupQuery.eq('url', normalizedUrl).single();

        if (fetchError || !imageRecord) {
            return NextResponse.json(
                { success: false, error: "Record not found" },
                { status: 404 }
            );
        }

        if (!isAdmin && imageRecord.uploader_email !== userEmail) {
            return NextResponse.json(
                { success: false, error: "Forbidden - You can only delete your own images" },
                { status: 403 }
            );
        }

        const { error } = await supabase
            .from('images')
            .delete()
            .eq('id', imageRecord.id);

        if (error) {
            console.error("Database delete error:", error);
            return NextResponse.json({
                success: false,
                error: error.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: "Record deleted from database"
        });

    } catch (error) {
        console.error("Delete record error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete record"
        }, { status: 500 });
    }
}
