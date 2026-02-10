#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

const parseEnvFile = (filePath) => {
    if (!fs.existsSync(filePath)) return {};
    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    const env = {};
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIndex = trimmed.indexOf("=");
        if (eqIndex <= 0) continue;
        const key = trimmed.slice(0, eqIndex).trim();
        let value = trimmed.slice(eqIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        env[key] = value;
    }
    return env;
};

const ratioError = (target, current) => Math.abs(Math.log(target / current));
const FRAME_CANDIDATES = [
    { width: 1, height: 1 },
    { width: 2, height: 2 },
    { width: 3, height: 2 },
    { width: 2, height: 3 },
    { width: 4, height: 2 },
    { width: 2, height: 4 },
    { width: 3, height: 3 },
    { width: 4, height: 3 },
    { width: 3, height: 4 },
];

const suggestFrameSize = (pixelWidth, pixelHeight) => {
    if (!pixelWidth || !pixelHeight || pixelWidth <= 0 || pixelHeight <= 0) {
        return { width: 1, height: 1, source: "fallback" };
    }
    const targetRatio = pixelWidth / pixelHeight;
    const targetArea = 6;
    let best = {
        width: 1,
        height: 1,
        error: ratioError(targetRatio, 1),
        areaPenalty: Math.abs(1 - targetArea),
    };
    for (const candidate of FRAME_CANDIDATES) {
        const currentRatio = candidate.width / candidate.height;
        const error = ratioError(targetRatio, currentRatio);
        const areaPenalty = Math.abs(candidate.width * candidate.height - targetArea);
        const isBetter =
            error < best.error ||
            (Math.abs(error - best.error) < 1e-9 && areaPenalty < best.areaPenalty) ||
            (Math.abs(error - best.error) < 1e-9 && areaPenalty === best.areaPenalty && candidate.width * candidate.height > best.width * best.height);
        if (isBetter) {
            best = {
                width: candidate.width,
                height: candidate.height,
                error,
                areaPenalty,
            };
        }
    }
    return { width: best.width, height: best.height, source: best.error < 1e-9 ? "exact-ratio" : "approximated" };
};

const getImageDimensions = (buffer) => {
    const bytes = buffer;

    // PNG
    if (
        bytes.length >= 24 &&
        bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
        bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
    ) {
        return {
            width: bytes.readUInt32BE(16),
            height: bytes.readUInt32BE(20),
        };
    }

    // GIF
    if (bytes.length >= 10 && bytes.toString("ascii", 0, 3) === "GIF") {
        return {
            width: bytes.readUInt16LE(6),
            height: bytes.readUInt16LE(8),
        };
    }

    // JPEG
    if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
        let offset = 2;
        while (offset < bytes.length - 1) {
            if (bytes[offset] !== 0xff) {
                offset += 1;
                continue;
            }
            const marker = bytes[offset + 1];
            offset += 2;
            if (marker === 0xd8 || marker === 0xd9) continue;
            if (offset + 2 > bytes.length) break;
            const segmentLength = bytes.readUInt16BE(offset);
            if (segmentLength < 2) break;
            const isSof =
                marker === 0xc0 || marker === 0xc1 || marker === 0xc2 || marker === 0xc3 ||
                marker === 0xc5 || marker === 0xc6 || marker === 0xc7 ||
                marker === 0xc9 || marker === 0xca || marker === 0xcb ||
                marker === 0xcd || marker === 0xce || marker === 0xcf;
            if (isSof && offset + 7 < bytes.length) {
                return {
                    height: bytes.readUInt16BE(offset + 3),
                    width: bytes.readUInt16BE(offset + 5),
                };
            }
            offset += segmentLength;
        }
    }

    // WEBP
    if (
        bytes.length >= 30 &&
        bytes.toString("ascii", 0, 4) === "RIFF" &&
        bytes.toString("ascii", 8, 12) === "WEBP"
    ) {
        const chunk = bytes.toString("ascii", 12, 16);
        if (chunk === "VP8X" && bytes.length >= 30) {
            const widthMinusOne = bytes.readUIntLE(24, 3);
            const heightMinusOne = bytes.readUIntLE(27, 3);
            return { width: widthMinusOne + 1, height: heightMinusOne + 1 };
        }
    }

    return null;
};

const root = process.cwd();
const envFromFile = parseEnvFile(path.join(root, ".env.local"));
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || envFromFile.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || envFromFile.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const batchSize = Number.parseInt(process.env.BACKFILL_BATCH_SIZE || "100", 10);

let offset = 0;
let updated = 0;
let skipped = 0;
let failed = 0;

console.log("Starting backfill of image/frame dimensions...");

while (true) {
    const { data: rows, error } = await supabase
        .from("images")
        .select("id,url,frame_width,frame_height,image_width,image_height")
        .or("frame_width.is.null,frame_height.is.null,image_width.is.null,image_height.is.null")
        .order("uploaded_at", { ascending: false })
        .range(offset, offset + batchSize - 1);

    if (error) {
        console.error("Fetch error:", error.message);
        process.exit(1);
    }

    if (!rows || rows.length === 0) break;
    console.log(`Processing rows ${offset + 1}-${offset + rows.length}...`);

    for (const row of rows) {
        try {
            const res = await fetch(row.url);
            if (!res.ok) {
                failed += 1;
                console.warn(`Skip ${row.id}: fetch failed (${res.status})`);
                continue;
            }

            const ab = await res.arrayBuffer();
            const dimensions = getImageDimensions(Buffer.from(ab));
            const imageWidth = dimensions?.width || null;
            const imageHeight = dimensions?.height || null;

            if (!imageWidth || !imageHeight) {
                failed += 1;
                console.warn(`Skip ${row.id}: no dimensions`);
                continue;
            }

            const suggested = suggestFrameSize(imageWidth, imageHeight);
            const nextFrameWidth = row.frame_width || suggested.width;
            const nextFrameHeight = row.frame_height || suggested.height;

            const noChange =
                row.image_width === imageWidth &&
                row.image_height === imageHeight &&
                row.frame_width === nextFrameWidth &&
                row.frame_height === nextFrameHeight;

            if (noChange) {
                skipped += 1;
                continue;
            }

            const { error: updateError } = await supabase
                .from("images")
                .update({
                    image_width: imageWidth,
                    image_height: imageHeight,
                    frame_width: nextFrameWidth,
                    frame_height: nextFrameHeight,
                })
                .eq("id", row.id);

            if (updateError) {
                failed += 1;
                console.warn(`Update failed for ${row.id}: ${updateError.message}`);
                continue;
            }

            updated += 1;
        } catch (err) {
            failed += 1;
            console.warn(`Error on ${row.id}:`, err instanceof Error ? err.message : String(err));
        }
    }

    if (rows.length < batchSize) break;
    offset += batchSize;
}

console.log("Backfill complete.");
console.log(`Updated: ${updated}`);
console.log(`Skipped: ${skipped}`);
console.log(`Failed: ${failed}`);
