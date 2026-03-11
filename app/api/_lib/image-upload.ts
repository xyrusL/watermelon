import sharp from "sharp";

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
]);

export const ALLOWED_IMAGE_EXTENSIONS = new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
]);

export const MAX_UPLOAD_SIZE_BYTES = 12 * 1024 * 1024;
export const MAX_OUTPUT_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_GIF_FRAMES = 300;

const MIME_BY_EXTENSION: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
};

type GifOptimizationProfile = {
    maxSide: number;
    colors: number;
    effort: number;
    interFrameMaxError: number;
    interPaletteMaxError: number;
    dither: number;
};

const GIF_OPTIMIZATION_PROFILES: GifOptimizationProfile[] = [
    { maxSide: 1600, colors: 192, effort: 8, interFrameMaxError: 4, interPaletteMaxError: 6, dither: 0.9 },
    { maxSide: 1280, colors: 128, effort: 9, interFrameMaxError: 8, interPaletteMaxError: 12, dither: 0.8 },
    { maxSide: 960, colors: 96, effort: 10, interFrameMaxError: 12, interPaletteMaxError: 20, dither: 0.7 },
    { maxSide: 800, colors: 80, effort: 10, interFrameMaxError: 16, interPaletteMaxError: 28, dither: 0.55 },
    { maxSide: 640, colors: 64, effort: 10, interFrameMaxError: 20, interPaletteMaxError: 36, dither: 0.45 },
];

export type ValidatedUpload = {
    buffer: Buffer;
    contentType: string;
    extension: string;
    width: number | null;
    height: number | null;
    frameCount: number;
    isGif: boolean;
};

const getExtension = (fileName: string) =>
    fileName.split(".").pop()?.toLowerCase() || "";

const detectFileSignature = (buffer: Buffer): string | null => {
    if (buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff) {
        return "image/jpeg";
    }

    if (
        buffer.length >= 8 &&
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
    ) {
        return "image/png";
    }

    if (
        buffer.length >= 12 &&
        buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
        buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
        return "image/webp";
    }

    if (buffer.length >= 6) {
        const header = buffer.subarray(0, 6).toString("ascii");
        if (header === "GIF87a" || header === "GIF89a") {
            return "image/gif";
        }
    }

    return null;
};

const formatToExtension = (format?: string) => {
    switch (format) {
        case "jpeg":
            return "jpg";
        case "png":
        case "webp":
        case "gif":
            return format;
        default:
            return null;
    }
};

const optimizeAnimatedGif = async (
    inputBuffer: Buffer,
    maxOutputSizeBytes: number
): Promise<Buffer> => {
    const metadata = await sharp(inputBuffer, { animated: true }).metadata();
    const originalWidth = metadata.width || null;
    const originalHeight = metadata.height || null;
    const loop = metadata.loop;
    const delay = metadata.delay;

    let bestBuffer = inputBuffer;

    for (const profile of GIF_OPTIMIZATION_PROFILES) {
        const pipeline = sharp(inputBuffer, { animated: true });

        if (originalWidth && originalHeight) {
            const shouldResize = Math.max(originalWidth, originalHeight) > profile.maxSide;
            if (shouldResize) {
                pipeline.resize(profile.maxSide, profile.maxSide, {
                    fit: "inside",
                    withoutEnlargement: true,
                });
            }
        }

        const candidate = await pipeline
            .gif({
                reuse: true,
                progressive: false,
                effort: profile.effort,
                colors: profile.colors,
                dither: profile.dither,
                interFrameMaxError: profile.interFrameMaxError,
                interPaletteMaxError: profile.interPaletteMaxError,
                loop,
                delay,
            })
            .toBuffer();

        if (candidate.length <= maxOutputSizeBytes) {
            return candidate.length < inputBuffer.length ? candidate : inputBuffer;
        }

        if (candidate.length < bestBuffer.length) {
            bestBuffer = candidate;
        }
    }

    return bestBuffer;
};

export async function validateAndNormalizeImageUpload(
    file: File
): Promise<ValidatedUpload> {
    if (!file) {
        throw new Error("No image file provided");
    }

    if (file.size <= 0) {
        throw new Error("Empty files are not allowed");
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error(`File too large. Max allowed is ${(MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)).toFixed(0)}MB.`);
    }

    const extension = getExtension(file.name);
    if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
        throw new Error("Unsupported file extension");
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
        throw new Error("Unsupported content type");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const signatureMime = detectFileSignature(buffer);

    if (!signatureMime || !ALLOWED_IMAGE_MIME_TYPES.has(signatureMime)) {
        throw new Error("File signature is not a supported image");
    }

    const expectedMimeFromExt = MIME_BY_EXTENSION[extension];
    if (expectedMimeFromExt !== signatureMime || file.type !== signatureMime) {
        throw new Error("File type does not match its contents");
    }

    const isGif = signatureMime === "image/gif";
    const metadata = await sharp(buffer, { animated: isGif }).metadata();

    if (!metadata.format) {
        throw new Error("Could not determine image format");
    }

    const detectedExtension = formatToExtension(metadata.format);
    if (!detectedExtension) {
        throw new Error("Unsupported decoded image format");
    }

    if (MIME_BY_EXTENSION[detectedExtension] !== signatureMime) {
        throw new Error("Decoded image format mismatch");
    }

    if (
        (metadata.width && metadata.width > MAX_IMAGE_DIMENSION) ||
        (metadata.height && metadata.height > MAX_IMAGE_DIMENSION)
    ) {
        throw new Error(`Image dimensions exceed ${MAX_IMAGE_DIMENSION}px limit`);
    }

    const frameCount = metadata.pages || 1;
    if (isGif && frameCount > MAX_GIF_FRAMES) {
        throw new Error(`Animated GIF exceeds ${MAX_GIF_FRAMES} frames`);
    }

    let normalizedBuffer = buffer;

    if (isGif) {
        normalizedBuffer = await optimizeAnimatedGif(buffer, MAX_OUTPUT_SIZE_BYTES);
    } else {
        const pipeline = sharp(buffer).rotate().resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, {
            fit: "inside",
            withoutEnlargement: true,
        });

        if (signatureMime === "image/jpeg") {
            normalizedBuffer = await pipeline.jpeg({ quality: 85, progressive: true, mozjpeg: true }).toBuffer();
        } else if (signatureMime === "image/png") {
            normalizedBuffer = await pipeline.png({ compressionLevel: 9, progressive: true }).toBuffer();
        } else {
            normalizedBuffer = await pipeline.webp({ quality: 85 }).toBuffer();
        }
    }

    if (normalizedBuffer.length > MAX_OUTPUT_SIZE_BYTES) {
        throw new Error(`File is still too large after processing (${(normalizedBuffer.length / (1024 * 1024)).toFixed(2)}MB)`);
    }

    const finalMetadata = await sharp(normalizedBuffer, { animated: isGif }).metadata();

    return {
        buffer: normalizedBuffer,
        contentType: signatureMime,
        extension: detectedExtension,
        width: finalMetadata.width || null,
        height: finalMetadata.height || null,
        frameCount,
        isGif,
    };
}
