import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { deleteUrl } = body;
        const apiKey = process.env.IMGBB_API_KEY;

        if (!deleteUrl) {
            return NextResponse.json({ error: "No delete URL provided" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "imgbb API key not configured" },
                { status: 503 }
            );
        }

        let parsedUrl: URL;
        try {
            parsedUrl = new URL(deleteUrl);
        } catch {
            return NextResponse.json({ error: "Invalid delete URL" }, { status: 400 });
        }

        if (!["ibb.co", "www.ibb.co"].includes(parsedUrl.hostname)) {
            return NextResponse.json(
                { error: "Delete URL must be an imgbb link" },
                { status: 400 }
            );
        }

        const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
        if (pathParts.length < 2) {
            return NextResponse.json(
                { error: "Invalid imgbb delete URL format" },
                { status: 400 }
            );
        }

        const [imageId, deleteToken] = pathParts;
        const apiUrl = `https://api.imgbb.com/1/delete/${imageId}/${deleteToken}?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: "GET",
        });

        const data = await response.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        }

        return NextResponse.json(
            { error: data.error?.message || "Failed to delete image from imgbb" },
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
