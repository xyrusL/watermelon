import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json(
        {
            success: false,
            error: "Third-party delete endpoints are disabled.",
        },
        { status: 410 }
    );
}
