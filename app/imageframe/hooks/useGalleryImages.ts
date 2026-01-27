// useGalleryImages Hook
// Manages public gallery images with automatic polling

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UploadedImage } from "../types";
import { fetchPublicImages } from "../lib/image-service";

interface UseGalleryImagesOptions {
    pollInterval?: number; // ms, default 1000
    enabled?: boolean;     // default true
}

interface UseGalleryImagesResult {
    images: (UploadedImage & { id: string })[];
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useGalleryImages(options: UseGalleryImagesOptions = {}): UseGalleryImagesResult {
    const { pollInterval = 1000, enabled = true } = options;

    const [images, setImages] = useState<(UploadedImage & { id: string })[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const latestRequestIdRef = useRef(0);
    const inFlightRef = useRef(false);

    const refresh = useCallback(async (silent = false) => {
        if (inFlightRef.current) return;
        inFlightRef.current = true;
        const requestId = ++latestRequestIdRef.current;

        if (!silent) setIsLoading(true);

        try {
            const result = await fetchPublicImages();

            // Ignore stale responses that completed out of order.
            if (requestId !== latestRequestIdRef.current) return;

            if (result.success) {
                setImages(result.images);
                setError(null);
            } else {
                setError(result.error || "Failed to fetch images");
            }
        } finally {
            if (!silent) setIsLoading(false);
            setIsFirstLoad(false);
            inFlightRef.current = false;
        }
    }, []);

    // Initial load
    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled, refresh]);

    // Polling
    useEffect(() => {
        if (!enabled || pollInterval <= 0) return;

        const interval = setInterval(() => {
            refresh(true); // Silent refresh
        }, pollInterval);

        return () => clearInterval(interval);
    }, [enabled, pollInterval, refresh]);

    return {
        images,
        isLoading: isLoading && isFirstLoad, // Only show loading on first load
        error,
        refresh: () => refresh(false),
    };
}
