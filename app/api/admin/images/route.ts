import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

// GET: Fetch all images (admin only)
export async function GET(request: NextRequest) {
    try {
        // Note: In production, verify admin role from Clerk
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase not configured"
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch all images from the images table
        const { data: images, error } = await supabase
            .from('images')
            .select('*')
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
                totalImages: images?.length || 0
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

// DELETE: Bulk delete images (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase not configured"
            }, { status: 500 });
        }

        const body = await request.json();
        const { imageIds, filePaths } = body;

        if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
            return NextResponse.json({
                success: false,
                error: "No image IDs provided"
            }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Delete from storage
        if (filePaths && filePaths.length > 0) {
            const { error: storageError } = await supabase.storage
                .from('watermelon-images')
                .remove(filePaths);

            if (storageError) {
                console.warn("Storage delete error:", storageError);
            }
        }

        // Delete from database
        const { error: dbError } = await supabase
            .from('images')
            .delete()
            .in('id', imageIds);

        if (dbError) {
            console.error("Database delete error:", dbError);
            return NextResponse.json({
                success: false,
                error: dbError.message
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Deleted ${imageIds.length} image(s)`
        });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete images"
        }, { status: 500 });
    }
}
