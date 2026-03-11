import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json(
        {
            status: "disabled",
            message: "Third-party uploads are disabled.",
        },
        { status: 410 }
    );
}
