import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { suggestFrameSizeFromPixels } from "@/app/imageframe/lib/imageframe-command";

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return NextResponse.json({
                success: false,
                error: "Supabase storage not configured"
            }, { status: 500 });
        }

        const formData = await request.formData();
        const file = formData.get("image") as File;

        if (!file) {
            return NextResponse.json({
                success: false,
                error: "No image file provided"
            }, { status: 400 });
        }

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        let buffer: Buffer = Buffer.from(arrayBuffer);

        // Determine extension and whether this is an animated GIF.
        // GIFs must not be processed by Sharp because it can flatten animations.
        const rawExt = file.name.split(".").pop() || "";
        const fileExt = rawExt.toLowerCase();
        const isGif = file.type === "image/gif" || fileExt === "gif";

        // Best-effort content type fallback when the browser provides an empty type.
        const extToMime: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
        };
        const inferredContentType = extToMime[fileExt];
        let contentType = file.type || inferredContentType || "application/octet-stream";

        // Optimize image using Sharp
        if (!isGif) {
            try {
                const image = sharp(buffer);
                const metadata = await image.metadata();

                // If Sharp can detect the format and the incoming type was empty,
                // prefer the detected type for storage metadata.
                if (!file.type && metadata.format) {
                    const detectedMime = extToMime[metadata.format];
                    if (detectedMime) {
                        contentType = detectedMime;
                    }
                }

                // Optimize based on format
                if (metadata.format === "jpeg" || metadata.format === "jpg") {
                    buffer = (await image
                        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
                        .jpeg({ quality: 85, progressive: true, mozjpeg: true })
                        .toBuffer()) as Buffer;
                } else if (metadata.format === "png") {
                    buffer = (await image
                        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
                        .png({ quality: 85, compressionLevel: 9, progressive: true })
                        .toBuffer()) as Buffer;
                } else if (metadata.format === "webp") {
                    buffer = (await image
                        .resize(2048, 2048, { fit: "inside", withoutEnlargement: true })
                        .webp({ quality: 85 })
                        .toBuffer()) as Buffer;
                }

                console.log(
                    `Image optimized: ${file.size} bytes -> ${buffer.length} bytes (${(
                        (1 - buffer.length / file.size) *
                        100
                    ).toFixed(1)}% reduction)`
                );
            } catch (optimizeError) {
                console.warn("Image optimization failed, using original:", optimizeError);
                // If optimization fails, use original buffer
            }
        } else {
            // Ensure GIF uploads always carry the correct content type.
            contentType = "image/gif";
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const safeExt = fileExt || "bin";
        const fileName = `${timestamp}-${randomString}.${safeExt}`;
        const filePath = `imageframe/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('watermelon-images') // Your bucket name
            .upload(filePath, buffer, {
                contentType,
                cacheControl: "3600",
                upsert: false
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({
                success: false,
                error: error.message || "Upload failed"
            }, { status: 500 });
        }

        // Get public URL directly from Supabase (no proxy needed)
        const { data: publicUrlData } = supabase.storage
            .from('watermelon-images')
            .getPublicUrl(filePath);

        const directPublicUrl = publicUrlData.publicUrl;

        // Get uploader info from request headers (sent by frontend)
        const uploaderName = request.headers.get('x-uploader-name') || 'Anonymous';
        const uploaderEmail = request.headers.get('x-uploader-email') || '';
        const isPrivate = request.headers.get('x-is-private') === 'true'; // Default false
        const isNsfw = request.headers.get('x-is-nsfw') === 'true'; // Default false

        const parsedFrameWidth = Number.parseInt(request.headers.get("x-frame-width") || "", 10);
        const parsedFrameHeight = Number.parseInt(request.headers.get("x-frame-height") || "", 10);
        const hasUserFrame = Number.isFinite(parsedFrameWidth) && Number.isFinite(parsedFrameHeight)
            && parsedFrameWidth >= 1 && parsedFrameWidth <= 100
            && parsedFrameHeight >= 1 && parsedFrameHeight <= 100;

        const metadataForSize = await sharp(buffer, { animated: isGif }).metadata();
        const imageWidth = metadataForSize.width || null;
        const imageHeight = metadataForSize.height || null;

        let frameWidth: number | null = null;
        let frameHeight: number | null = null;
        let frameSource: "user" | "algorithm" | "fallback" = "fallback";

        if (hasUserFrame) {
            frameWidth = parsedFrameWidth;
            frameHeight = parsedFrameHeight;
            frameSource = "user";
        } else if (imageWidth && imageHeight) {
            const suggested = suggestFrameSizeFromPixels(imageWidth, imageHeight);
            frameWidth = suggested.dimensions.width;
            frameHeight = suggested.dimensions.height;
            frameSource = "algorithm";
        }

        // Save image metadata to database for admin tracking
        try {
            const { error: dbError } = await supabase
                .from('images')
                .insert({
                    file_path: filePath,
                    filename: file.name,
                    url: directPublicUrl,
                    file_size: buffer.length,
                    uploader_name: uploaderName,
                    uploader_email: uploaderEmail,
                    host: 'supabase',
                    uploaded_at: new Date().toISOString(),
                    is_private: isPrivate,
                    is_nsfw: isNsfw,
                    image_width: imageWidth,
                    image_height: imageHeight,
                    frame_width: frameWidth,
                    frame_height: frameHeight,
                });

            if (dbError) {
                console.warn("Failed to save to database:", dbError);
                // Don't fail the upload, just log the error
            }
        } catch (dbErr) {
            console.warn("Database insert error:", dbErr);
        }

        return NextResponse.json({
            success: true,
            url: directPublicUrl,
            directUrl: directPublicUrl,
            deleteUrl: filePath, // Store the path for deletion
            thumbnail: directPublicUrl,
            filename: file.name,
            imageWidth,
            imageHeight,
            frameWidth,
            frameHeight,
            frameSource,
            message: "Image uploaded successfully to Watermelon Storage"
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Upload failed"
        }, { status: 500 });
    }
}
