import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Fetch from Mojang's version manifest
        const response = await fetch("https://launchermeta.mojang.com/mc/game/version_manifest.json");
        const data = await response.json();

        // Get latest release version
        const latestRelease = data.latest.release;

        return NextResponse.json({
            version: latestRelease,
            success: true,
        });
    } catch (error) {
        console.error("Failed to fetch Minecraft version:", error);
        return NextResponse.json(
            {
                version: "1.21.1", // Fallback version
                success: false,
                error: "Failed to fetch version",
            },
            { status: 500 }
        );
    }
}
