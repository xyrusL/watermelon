import { NextResponse } from "next/server";

export async function GET() {
    try {
        if (!process.env.IMGBB_API_KEY) {
            return NextResponse.json(
                { status: "error", message: "imgbb API key not configured" },
                { status: 500 }
            );
        }

        const response = await fetch(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                method: "POST",
                body: new FormData(),
            }
        );

        if (response.status === 400 || response.status === 200) {
            return NextResponse.json({ status: "ok", message: "imgbb fallback is available" });
        }

        if (response.status === 401) {
            return NextResponse.json(
                { status: "error", message: "imgbb credentials are invalid" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { status: "error", message: "imgbb is currently unavailable" },
            { status: 500 }
        );
    } catch (error) {
        return NextResponse.json(
            { status: "error", message: "Failed to connect to imgbb" },
            { status: 500 }
        );
    }
}
