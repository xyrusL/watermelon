import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { jsonError, requireAuthenticatedUser } from "@/app/api/_lib/security";

const DISPLAY_NAME_REGEX = /^[a-zA-Z0-9 _-]{2,32}$/;

export async function POST(request: NextRequest) {
    try {
        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

        const { displayName } = await request.json();
        const normalizedName = typeof displayName === "string" ? displayName.trim() : "";

        if (!DISPLAY_NAME_REGEX.test(normalizedName)) {
            return jsonError("Display name must be 2-32 characters and use letters, numbers, spaces, underscores, or hyphens", 400);
        }

        const client = await clerkClient();
        await client.users.updateUserMetadata(authResult.user.userId, {
            unsafeMetadata: {
                displayName: normalizedName,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Display name updated",
        });
    } catch (error) {
        console.error("Update display name error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Failed to update display name",
            500
        );
    }
}
