import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const username = process.env.MINECRAFT_SERVER_USERNAME;
        const password = process.env.MINECRAFT_SERVER_PASSWORD;

        if (!username || !password) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Server credentials are not configured. Set MINECRAFT_SERVER_USERNAME and MINECRAFT_SERVER_PASSWORD.",
                },
                { status: 503 }
            );
        }

        return NextResponse.json({
            success: true,
            username,
            password,
        });
    } catch (error) {
        console.error("Error fetching server credentials:", error);
        return NextResponse.json(
            { success: false, error: "Failed to load server credentials" },
            { status: 500 }
        );
    }
}
