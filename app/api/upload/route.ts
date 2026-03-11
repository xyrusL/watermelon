import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            error: "Third-party uploads are disabled. Use Watermelon Storage instead.",
        },
        { status: 410 }
    );
}
