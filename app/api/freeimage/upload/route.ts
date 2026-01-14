import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Check file size (10MB max for freeimage.host)
        if (image.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: "File too large. Max 10MB for freeimage.host" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");

        // Upload to freeimage.host (same API format as imgbb)
        const freeimageFormData = new FormData();
        freeimageFormData.append("key", process.env.FREEIMAGE_API_KEY || "");
        freeimageFormData.append("source", base64);
        freeimageFormData.append("format", "json");

        const response = await fetch("https://freeimage.host/api/1/upload", {
            method: "POST",
            body: freeimageFormData,
        });

        const data = await response.json();

        if (!data.success && data.status_code !== 200) {
            console.error("Freeimage upload error:", data);
            return NextResponse.json(
                { error: data.error?.message || "Upload failed" },
                { status: 500 }
            );
        }

        console.log("✅ IMAGE UPLOADED to freeimage.host");

        // Return the direct image URL
        return NextResponse.json({
            success: true,
            url: data.image.url,
            directUrl: data.image.url,
            deleteUrl: data.image.delete_url,
            thumbnail: data.image.thumb?.url || data.image.url,
            filename: data.image.filename || image.name,
            host: "freeimage",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
