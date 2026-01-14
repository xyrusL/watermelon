import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

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

        // Optimize image using Sharp
        try {
            const image = sharp(buffer);
            const metadata = await image.metadata();

            // Optimize based on format
            if (metadata.format === 'jpeg' || metadata.format === 'jpg') {
                buffer = await image
                    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85, progressive: true, mozjpeg: true })
                    .toBuffer() as Buffer;
            } else if (metadata.format === 'png') {
                buffer = await image
                    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
                    .png({ quality: 85, compressionLevel: 9, progressive: true })
                    .toBuffer() as Buffer;
            } else if (metadata.format === 'webp') {
                buffer = await image
                    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 85 })
                    .toBuffer() as Buffer;
            } else if (metadata.format === 'gif') {
                // For GIF, don't optimize as it might break animations
                // Just resize if needed
                if (metadata.width && metadata.width > 2048) {
                    buffer = await image
                        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
                        .toBuffer() as Buffer;
                }
            }

            console.log(`Image optimized: ${file.size} bytes -> ${buffer.length} bytes (${((1 - buffer.length / file.size) * 100).toFixed(1)}% reduction)`);
        } catch (optimizeError) {
            console.warn("Image optimization failed, using original:", optimizeError);
            // If optimization fails, use original buffer
        }

        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${randomString}.${fileExt}`;
        const filePath = `imageframe/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('watermelon-images') // Your bucket name
            .upload(filePath, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({
                success: false,
                error: error.message || "Upload failed"
            }, { status: 500 });
        }

        // Create clean URL using rewrite path
        const cleanUrl = `/images/${filePath}`;

        // Get uploader info from request headers (sent by frontend)
        const uploaderName = request.headers.get('x-uploader-name') || 'Anonymous';
        const uploaderEmail = request.headers.get('x-uploader-email') || '';

        // Save image metadata to database for admin tracking
        try {
            const { error: dbError } = await supabase
                .from('images')
                .insert({
                    file_path: filePath,
                    filename: file.name,
                    url: cleanUrl,
                    file_size: buffer.length,
                    uploader_name: uploaderName,
                    uploader_email: uploaderEmail,
                    host: 'supabase',
                    uploaded_at: new Date().toISOString()
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
            url: cleanUrl,
            directUrl: cleanUrl,
            deleteUrl: filePath, // Store the path for deletion
            thumbnail: cleanUrl,
            filename: file.name,
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
