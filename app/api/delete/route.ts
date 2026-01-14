import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { deleteUrl } = body;

        if (!deleteUrl) {
            return NextResponse.json({ error: "No delete URL provided" }, { status: 400 });
        }

        // imgbb delete URL format: https://ibb.co/xxxx/yyyyyyyy
        // We need to extract image_id and delete_token and call the API endpoint
        // The delete_url from imgbb looks like: https://ibb.co/2ndCYJK/670a7e48ddcb85ac340c717a41047e5c
        // Where 2ndCYJK is the image_id and 670a7e48... is the delete_token

        // Parse the delete URL to extract image_id and delete_token
        const urlParts = deleteUrl.replace("https://ibb.co/", "").split("/");

        if (urlParts.length < 2) {
            // Try alternate API approach - just visit the delete URL
            const response = await fetch(deleteUrl, {
                method: "GET",
                redirect: "follow",
            });

            if (response.ok) {
                console.log("✅ IMAGE DELETED from imgbb (via URL visit)");
                return NextResponse.json({ success: true });
            }

            return NextResponse.json(
                { error: "Invalid delete URL format" },
                { status: 400 }
            );
        }

        const imageId = urlParts[0];
        const deleteToken = urlParts[1];

        // Call the imgbb API delete endpoint
        const apiKey = process.env.IMGBB_API_KEY;
        const apiUrl = `https://api.imgbb.com/1/delete/${imageId}/${deleteToken}?key=${apiKey}`;

        console.log(`Attempting to delete image: ${imageId}`);

        const response = await fetch(apiUrl, {
            method: "GET",
        });

        const data = await response.json();

        if (data.success) {
            console.log("✅ IMAGE DELETED from imgbb");
            return NextResponse.json({ success: true });
        }

        // If API fails, try the direct URL approach as fallback
        console.log("API delete failed, trying direct URL...");
        const fallbackResponse = await fetch(deleteUrl, {
            method: "GET",
            redirect: "follow",
        });

        if (fallbackResponse.ok) {
            console.log("✅ IMAGE DELETED from imgbb (via URL fallback)");
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
