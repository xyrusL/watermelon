import type { FrameDimensions } from "../types";

export type FrameSizeSource = "editor" | "face-auto" | "exact-ratio" | "scaled-ratio" | "approximated" | "fallback";

export interface FrameSizeSuggestion {
    dimensions: FrameDimensions;
    source: FrameSizeSource;
    ratioError: number;
}

interface SuggestionLimits {
    maxSide: number;
    maxTotalFrames: number;
}

const DEFAULT_LIMITS: SuggestionLimits = {
    maxSide: 100,
    maxTotalFrames: 10000,
};

const MINECRAFT_FRAME_CANDIDATES: FrameDimensions[] = [
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

const ratioError = (target: number, current: number) => Math.abs(Math.log(target / current));

export function sanitizeImageFrameName(input: string): string {
    const trimmed = input.trim().toLowerCase();
    const withoutExt = trimmed.replace(/\.[a-z0-9]+$/i, "");
    const safe = withoutExt
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    return safe || "image-frame";
}

export function suggestFrameSizeFromPixels(
    pixelWidth: number,
    pixelHeight: number,
    limits: Partial<SuggestionLimits> = {}
): FrameSizeSuggestion {
    const { maxSide, maxTotalFrames } = { ...DEFAULT_LIMITS, ...limits };

    if (pixelWidth <= 0 || pixelHeight <= 0) {
        return {
            dimensions: { width: 1, height: 1 },
            source: "fallback",
            ratioError: 0,
        };
    }

    const targetRatio = pixelWidth / pixelHeight;
    const availableCandidates = MINECRAFT_FRAME_CANDIDATES.filter(
        (c) => c.width <= maxSide && c.height <= maxSide && c.width * c.height <= maxTotalFrames
    );

    const targetArea = 6;
    let best = {
        width: 1,
        height: 1,
        error: ratioError(targetRatio, 1),
        areaPenalty: Math.abs(1 - targetArea),
    };

    for (const candidate of availableCandidates) {
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

    return {
        dimensions: { width: best.width, height: best.height },
        source: best.error < 1e-9 ? "exact-ratio" : "approximated",
        ratioError: best.error,
    };
}

export function buildImageFrameCreateCommand(params: {
    name: string;
    url: string;
    width: number;
    height: number;
}): string {
    const safeName = sanitizeImageFrameName(params.name);
    return `/imageframe create ${safeName} ${params.url} ${params.width} ${params.height}`;
}
