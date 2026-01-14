import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const image = formData.get("image") as File;

        if (!image) {
            return NextResponse.json({ error: "No image provided" }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await image.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString("base64");

        // Upload to imgbb
        const imgbbFormData = new FormData();
        imgbbFormData.append("key", process.env.IMGBB_API_KEY || "");
        imgbbFormData.append("image", base64);
        imgbbFormData.append("name", image.name.replace(/\.[^/.]+$/, "")); // Remove extension

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

        // Return the direct image URL
        return NextResponse.json({
            success: true,
            url: data.data.url,
            directUrl: data.data.image.url, // Direct link to image file
            deleteUrl: data.data.delete_url,
            thumbnail: data.data.thumb?.url,
            filename: data.data.image.filename,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Failed to upload image" },
            { status: 500 }
        );
    }
}
