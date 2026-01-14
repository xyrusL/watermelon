import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

        const { url, file_path } = await request.json();

        if (!url && !file_path) {
            return NextResponse.json({
                success: false,
                error: "No identifier provided"
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Delete from database using URL or file_path
        const { error } = await supabase
            .from('images')
            .delete()
            .or(`url.eq.${url},file_path.eq.${file_path}`);

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
