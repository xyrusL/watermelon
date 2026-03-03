import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

const COMMUNITY_ROLES = new Set(["admin", "member", "moderator"]);

export async function GET() {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = String(user.publicMetadata?.role || "user").toLowerCase();

        if (!COMMUNITY_ROLES.has(role)) {
            return NextResponse.json(
                { success: false, error: "Community membership required" },
                { status: 403 }
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
