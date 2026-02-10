import type { FrameDimensions } from "../types";
import { suggestFrameSizeFromPixels } from "./imageframe-command";

interface FaceBoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface FaceDetectionResult {
    dimensions: FrameDimensions;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const readImageDimensionsFromFile = (file: File): Promise<FrameDimensions> =>
    new Promise((resolve, reject) => {
        const src = URL.createObjectURL(file);
        const image = new window.Image();
        image.onload = () => {
            resolve({ width: image.naturalWidth, height: image.naturalHeight });
            URL.revokeObjectURL(src);
        };
        image.onerror = () => {
            reject(new Error("Failed to read image dimensions"));
            URL.revokeObjectURL(src);
        };
        image.src = src;
    });

const pickLargestFace = (faces: FaceBoundingBox[]): FaceBoundingBox | null => {
    if (!faces.length) return null;
    return [...faces].sort((a, b) => b.width * b.height - a.width * a.height)[0];
};

const computeFaceGuidedTargetRatio = (face: FaceBoundingBox, image: FrameDimensions): number => {
    const fullRatio = image.width / image.height;

    // Face context (head + upper body) ratio only as a guidance signal.
    const contextWidth = clamp(face.width * 2.8, 1, image.width);
    const contextHeight = clamp(face.height * 3.8, 1, image.height);
    const contextRatio = contextWidth / contextHeight;

    // Blend using geometric mean in log-space:
    // - full image ratio remains dominant (75%)
    // - face context gently nudges result (25%)
    const blend = Math.exp(Math.log(fullRatio) * 0.75 + Math.log(contextRatio) * 0.25);
    return clamp(blend, 0.2, 5);
};

export async function detectSingleFaceFrame(file: File): Promise<FaceDetectionResult | null> {
    if (typeof window === "undefined") return null;
    if (!("FaceDetector" in window) || typeof createImageBitmap === "undefined") return null;

    const imageSize = await readImageDimensionsFromFile(file);

    let bitmap: ImageBitmap | null = null;
    try {
        bitmap = await createImageBitmap(file);
        const FaceDetectorCtor = (window as { FaceDetector?: new (options: { fastMode: boolean; maxDetectedFaces: number }) => { detect: (source: ImageBitmap) => Promise<Array<{ boundingBox: FaceBoundingBox }>> } }).FaceDetector;
        if (!FaceDetectorCtor) return null;

        const detector = new FaceDetectorCtor({ fastMode: true, maxDetectedFaces: 1 });
        const detected = await detector.detect(bitmap);
        const bestFace = pickLargestFace(detected.map((item) => item.boundingBox));
        if (!bestFace) return null;

        const faceGuidedRatio = computeFaceGuidedTargetRatio(bestFace, imageSize);
        const suggested = suggestFrameSizeFromPixels(faceGuidedRatio * 1000, 1000);
        return {
            dimensions: suggested.dimensions,
        };
    } catch {
        return null;
    } finally {
        bitmap?.close();
    }
}
