import { NextResponse } from "next/server";
import { getStorageBucketName, getSupabaseAdmin } from "@/app/api/_lib/security";

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                status: "error",
                message: "Supabase not configured. Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to the environment."
            });
        }

        const supabase = getSupabaseAdmin();
        const bucket = getStorageBucketName();

        const { error: storageError } = await supabase.storage.from(bucket).list("", { limit: 1 });
        if (storageError) {
            return NextResponse.json({
                status: "error",
                message: storageError.message || `Watermelon Storage bucket "${bucket}" is unavailable`
            }, { status: 500 });
        }

        const { error: dbError } = await supabase
            .from("images")
            .select("id", { head: true })
            .limit(1);

        if (dbError) {
            return NextResponse.json({
                status: "error",
                message: dbError.message || "Failed to connect to storage database"
            }, { status: 500 });
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
