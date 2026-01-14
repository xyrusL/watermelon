import { NextResponse } from "next/server";

export async function GET() {
    try {
        const apiKey = process.env.FREEIMAGE_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                status: "error",
                message: "Freeimage API key not configured"
            }, { status: 500 });
        }

        // Test the API by making a simple request
        const formData = new FormData();
        formData.append("key", apiKey);
        formData.append("format", "json");

        const response = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: formData,
        });

        // 400 means API key is valid but no image (expected)
        // 200 would mean success
        if (response.status === 400 || response.status === 200) {
            console.log("✅ API SUCCESS: freeimage.host API is working correctly");
            return NextResponse.json({ status: "ok" });
        }

        return NextResponse.json({
            status: "error",
            message: "Freeimage API returned unexpected status"
        }, { status: 500 });

    } catch (error) {
        console.error("Freeimage health check error:", error);
        return NextResponse.json({
            status: "error",
            message: "Failed to connect to freeimage.host"
        }, { status: 500 });
    }
}
