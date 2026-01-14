import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: "Not authenticated"
            }, { status: 401 });
        }

        const { displayName } = await request.json();

        if (!displayName || typeof displayName !== 'string') {
            return NextResponse.json({
                success: false,
                error: "Invalid display name"
            }, { status: 400 });
        }

        // Update user metadata in Clerk
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            unsafeMetadata: {
                displayName: displayName.trim()
            }
        });

        return NextResponse.json({
            success: true,
            message: "Display name updated"
        });

    } catch (error) {
        console.error("Update display name error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to update display name"
        }, { status: 500 });
    }
}
