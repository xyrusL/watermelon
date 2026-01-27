// useUserImages Hook
// Manages user's own images with polling

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UploadedImage } from "../types";
import { fetchUserImages as fetchUserImagesService } from "../lib/image-service";

interface UserStats {
    totalImages: number;
    publicImages: number;
    privateImages: number;
    nsfwImages?: number;
}

interface UseUserImagesOptions {
    pollInterval?: number; // ms, default 3000
    enabled?: boolean;     // default false (only when user panel is open)
}

interface UseUserImagesResult {
    images: (UploadedImage & { id: string })[];
    stats: UserStats | null;
    isLoading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
}

export function useUserImages(options: UseUserImagesOptions = {}): UseUserImagesResult {
    const { pollInterval = 3000, enabled = false } = options;

    const [images, setImages] = useState<(UploadedImage & { id: string })[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
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
            const result = await fetchUserImagesService();

            // Ignore stale responses that completed out of order.
            if (requestId !== latestRequestIdRef.current) return;

            if (result.success) {
                setImages(result.images);
                setStats((result.stats as UserStats) || null);
                setError(null);
            } else {
                setError(result.error || "Failed to fetch user images");
            }
        } finally {
            if (!silent) setIsLoading(false);
            setIsFirstLoad(false);
            inFlightRef.current = false;
        }
    }, []);

    // Fetch when enabled
    useEffect(() => {
        if (enabled) {
            refresh();
        }
    }, [enabled, refresh]);

    // Silent polling when enabled
    useEffect(() => {
        if (!enabled || pollInterval <= 0) return;

        const interval = setInterval(() => {
            refresh(true);
        }, pollInterval);

        return () => clearInterval(interval);
    }, [enabled, pollInterval, refresh]);

    return {
        images,
        stats,
        isLoading: isLoading && isFirstLoad,
        error,
        refresh: () => refresh(false),
    };
}
