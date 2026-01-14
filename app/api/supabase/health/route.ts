import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                status: "error",
                message: "Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local"
            });
        }

        return NextResponse.json({
            status: "ok",
            message: "Watermelon Storage is ready"
        });
    } catch (error) {
        return NextResponse.json({
            status: "error",
            message: "Failed to connect to storage service"
        });
    }
}
