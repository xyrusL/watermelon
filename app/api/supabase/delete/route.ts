import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
    try {
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
