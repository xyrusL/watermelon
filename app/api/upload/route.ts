import { NextRequest, NextResponse } from "next/server";
import { buildWatermelonFilename } from "@/app/api/_lib/filename";

const ALLOWED_IMAGE_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
]);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;
        const apiKey = process.env.IMGBB_API_KEY;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: "imgbb fallback is not configured" },
                { status: 503 }
            );
        }

        if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
            return NextResponse.json(
                { error: "Only PNG, JPG, GIF, and WebP images are supported" },
                { status: 400 }
            );
        }

        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(new Uint8Array(bytes));
        const base64 = buffer.toString("base64");
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const normalizedFileName = buildWatermelonFilename(image.name, uniqueSuffix, "png");

        const imgbbFormData = new FormData();
        imgbbFormData.append("key", apiKey);
        imgbbFormData.append("image", base64);
        imgbbFormData.append("name", normalizedFileName.replace(/\.[^/.]+$/, ""));

        const response = await fetch("https://api.imgbb.com/1/upload", {
            method: "POST",
            body: imgbbFormData,
        });

        const data = await response.json();

        if (!data.success) {
            return NextResponse.json(
                { error: data.error?.message || "Upload failed" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            url: data.data.url,
            directUrl: data.data.image.url,
            deleteUrl: data.data.delete_url,
            thumbnail: data.data.thumb?.url,
            filename: normalizedFileName,
            host: "imgbb",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
