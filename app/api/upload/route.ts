import { NextRequest, NextResponse } from "next/server";
import { buildWatermelonFilename } from "@/app/api/_lib/filename";
import { enforceRateLimit, getSupabaseAdmin, jsonError, requireAuthenticatedUser } from "@/app/api/_lib/security";

const ALLOWED_IMAGE_TYPES = new Set([
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/webp",
]);

export async function POST(request: NextRequest) {
    try {
        const rateLimit = enforceRateLimit(request, {
            key: "imgbb-upload",
            limit: 10,
            windowMs: 60 * 1000,
        });
        if (!rateLimit.ok) return rateLimit.response;

        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

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

        const parsedFrameWidth = Number.parseInt(request.headers.get("x-frame-width") || "", 10);
        const parsedFrameHeight = Number.parseInt(request.headers.get("x-frame-height") || "", 10);
        const hasFrame = Number.isFinite(parsedFrameWidth) && Number.isFinite(parsedFrameHeight)
            && parsedFrameWidth >= 1 && parsedFrameWidth <= 100
            && parsedFrameHeight >= 1 && parsedFrameHeight <= 100;
        const isPrivate = request.headers.get("x-is-private") === "true";
        const isNsfw = request.headers.get("x-is-nsfw") === "true";

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

        const directUrl = data.data.image?.url || data.data.url;
        if (!directUrl) {
            return jsonError("imgbb upload did not return an image URL", 502);
        }

        const imageId = crypto.randomUUID();
        const supabase = getSupabaseAdmin();
        const { error: dbError } = await supabase
            .from("images")
            .insert({
                id: imageId,
                file_path: `imgbb/${normalizedFileName}`,
                filename: normalizedFileName,
                url: directUrl,
                file_size: buffer.length,
                uploader_name: authResult.user.displayName,
                uploader_email: authResult.user.email,
                host: "imgbb",
                uploaded_at: new Date().toISOString(),
                is_private: isPrivate,
                is_nsfw: isNsfw,
                frame_width: hasFrame ? parsedFrameWidth : null,
                frame_height: hasFrame ? parsedFrameHeight : null,
            });

        if (dbError) {
            console.error("ImgBB metadata insert error:", dbError);
            return jsonError(dbError.message || "Failed to save image metadata", 500);
        }

        return NextResponse.json({
            success: true,
            id: imageId,
            url: data.data.url,
            directUrl,
            deleteUrl: data.data.delete_url,
            thumbnail: data.data.thumb?.url,
            filename: normalizedFileName,
            fileSize: buffer.length,
            frameWidth: hasFrame ? parsedFrameWidth : null,
            frameHeight: hasFrame ? parsedFrameHeight : null,
            isPrivate,
            isNsfw,
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
