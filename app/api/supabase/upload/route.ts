import { NextRequest, NextResponse } from "next/server";
import { buildWatermelonFilename } from "@/app/api/_lib/filename";
import { validateAndNormalizeImageUpload } from "@/app/api/_lib/image-upload";
import { buildInternalImageUrl, enforceRateLimit, getStorageBucketName, getSupabaseAdmin, jsonError, requireAuthenticatedUser } from "@/app/api/_lib/security";
import { suggestFrameSizeFromPixels } from "@/app/imageframe/lib/imageframe-command";

export async function POST(request: NextRequest) {
    try {
        const rateLimit = enforceRateLimit(request, {
            key: "upload",
            limit: 10,
            windowMs: 60 * 1000,
        });
        if (!rateLimit.ok) return rateLimit.response;

        const authResult = await requireAuthenticatedUser();
        if (!authResult.ok) return authResult.response;

        const formData = await request.formData();
        const file = formData.get("image");

        if (!(file instanceof File)) {
            return jsonError("No image file provided", 400);
        }

        const validated = await validateAndNormalizeImageUpload(file);
        const supabase = getSupabaseAdmin();
        const bucket = getStorageBucketName();

        const parsedFrameWidth = Number.parseInt(request.headers.get("x-frame-width") || "", 10);
        const parsedFrameHeight = Number.parseInt(request.headers.get("x-frame-height") || "", 10);
        const hasUserFrame = Number.isFinite(parsedFrameWidth) && Number.isFinite(parsedFrameHeight)
            && parsedFrameWidth >= 1 && parsedFrameWidth <= 100
            && parsedFrameHeight >= 1 && parsedFrameHeight <= 100;

        let frameWidth: number | null = null;
        let frameHeight: number | null = null;
        let frameSource: "user" | "face-auto" | "algorithm" | "fallback" = "fallback";

        if (hasUserFrame) {
            frameWidth = parsedFrameWidth;
            frameHeight = parsedFrameHeight;
            frameSource = request.headers.get("x-frame-source") === "face-auto" ? "face-auto" : "user";
        } else if (validated.width && validated.height) {
            const suggested = suggestFrameSizeFromPixels(validated.width, validated.height);
            frameWidth = suggested.dimensions.width;
            frameHeight = suggested.dimensions.height;
            frameSource = "algorithm";
        }

        const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
        const fileName = buildWatermelonFilename(file.name, uniqueSuffix, validated.extension);
        const filePath = `imageframe/${fileName}`;

        const isPrivate = request.headers.get("x-is-private") !== "false";
        const isNsfw = request.headers.get("x-is-nsfw") === "true";

        const { error: storageError } = await supabase.storage
            .from(bucket)
            .upload(filePath, validated.buffer, {
                contentType: validated.contentType,
                cacheControl: "3600",
                upsert: false,
            });

        if (storageError) {
            console.error("Supabase upload error:", storageError);
            return jsonError(storageError.message || "Upload failed", 500);
        }

        const imageId = crypto.randomUUID();
        const internalUrl = buildInternalImageUrl(imageId);

        const insertPayload = {
            id: imageId,
            file_path: filePath,
            filename: fileName,
            url: internalUrl,
            file_size: validated.buffer.length,
            uploader_name: authResult.user.displayName,
            uploader_email: authResult.user.email,
            host: "supabase",
            uploaded_at: new Date().toISOString(),
            is_private: isPrivate,
            is_nsfw: isNsfw,
            image_width: validated.width,
            image_height: validated.height,
            frame_width: frameWidth,
            frame_height: frameHeight,
        };

        const { data: insertedImage, error: dbError } = await supabase
            .from("images")
            .insert(insertPayload)
            .select("*")
            .single();

        if (dbError || !insertedImage) {
            console.error("Database insert error:", dbError);
            await supabase.storage.from(bucket).remove([filePath]);
            return jsonError(dbError?.message || "Failed to persist upload metadata", 500);
        }

        return NextResponse.json({
            success: true,
            id: insertedImage.id,
            url: internalUrl,
            directUrl: internalUrl,
            thumbnail: internalUrl,
            filename: fileName,
            fileSize: validated.buffer.length,
            imageWidth: validated.width,
            imageHeight: validated.height,
            frameWidth,
            frameHeight,
            frameSource,
            isPrivate,
            isNsfw,
            message: "Image uploaded successfully to Watermelon Storage",
        });
    } catch (error) {
        console.error("Upload error:", error);
        return jsonError(
            error instanceof Error ? error.message : "Upload failed",
            400
        );
    }
}
