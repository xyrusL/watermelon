import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { deleteUrl } = body;

        if (!deleteUrl) {
            return NextResponse.json({ error: "No delete URL provided" }, { status: 400 });
        }

        // Freeimage.host delete URL format: https://freeimage.host/delete/xxxxx/yyyyy
        // We can call this URL to delete the image
        const response = await fetch(deleteUrl, {
            method: "GET",
            redirect: "follow",
        });

        if (response.ok) {
            console.log("✅ IMAGE DELETED from freeimage.host");
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: "Failed to delete image from freeimage.host" },
            { status: 500 }
        );
    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json(
            { error: "Failed to delete image" },
            { status: 500 }
        );
    }
}
