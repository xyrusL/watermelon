import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Check if API key is configured
        if (!process.env.IMGBB_API_KEY) {
            return NextResponse.json(
                { status: "error", message: "API key not configured" },
                { status: 500 }
            );
        }

        // Ping imgbb API to verify it's working
        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                method: "POST",
                body: new FormData(), // Empty form to test API auth
            }
        );

        // imgbb returns 400 for empty upload but 401 for invalid key
        // So 400 means API key is valid but no image provided (expected)
        if (response.status === 400 || response.status === 200) {
            console.log("✅ API SUCCESS: imgbb API is working correctly");
            return NextResponse.json({ status: "ok" });
        }

        if (response.status === 401) {
            return NextResponse.json(
                { status: "error", message: "Invalid API key" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { status: "error", message: "API unavailable" },
            { status: 500 }
        );
    } catch (error) {
        return NextResponse.json(
            { status: "error", message: "Failed to connect to API" },
            { status: 500 }
        );
    }
}
