import { NextRequest, NextResponse } from "next/server";
import { resolveImageAccess } from "@/app/api/_lib/images";
import { requireAuthenticatedUser } from "@/app/api/_lib/security";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ imageId: string }> }
) {
    const { imageId } = await context.params;

    let authUser: { email: string; isAdmin: boolean } | undefined;
    const authResult = await requireAuthenticatedUser();
    if (authResult.ok) {
        authUser = {
            email: authResult.user.email,
            isAdmin: authResult.user.isAdmin,
        };
    }

    const result = await resolveImageAccess(imageId, authUser);
    if (!result.ok) {
        return NextResponse.json(
            { success: false, error: result.error },
            { status: result.status }
        );
    }

    return NextResponse.redirect(result.redirectUrl, 307);
}
