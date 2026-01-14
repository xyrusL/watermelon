import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

// GET: Fetch all members (admin only)
export async function GET(request: NextRequest) {
    try {
        // Verify user is authenticated and is admin
        const { userId } = await auth();
        
        if (!userId) {
            return NextResponse.json({
                success: false,
                error: "Unauthorized"
            }, { status: 401 });
        }

        // Get the authenticated user to check admin role
        const client = await clerkClient();
        const currentUser = await client.users.getUser(userId);
        
        if (currentUser.publicMetadata?.role !== "admin") {
            return NextResponse.json({
                success: false,
                error: "Forbidden - Admin access required"
            }, { status: 403 });
        }

        // Fetch all users from Clerk
        const users = await client.users.getUserList({
            limit: 500, // Adjust as needed
            orderBy: '-created_at'
        });

        // Transform Clerk users to our Member format
        const members = users.data.map(user => ({
            id: user.id,
            name: user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.username || user.emailAddresses[0]?.emailAddress || "Anonymous",
            email: user.emailAddresses[0]?.emailAddress || "",
            createdAt: user.createdAt,
            role: user.publicMetadata?.role || "user",
            imageUrl: user.imageUrl,
        }));

        return NextResponse.json({
            success: true,
            members,
            stats: {
                totalMembers: members.length,
                totalPages: Math.ceil(users.totalCount / 500)
            }
        });

    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch members"
        }, { status: 500 });
    }
}
