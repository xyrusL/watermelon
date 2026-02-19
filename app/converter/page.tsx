"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import Header from "../components/Header";
import ActionButton from "../components/ActionButton";
import AuthRequiredCard from "../components/AuthRequiredCard";

// Force dynamic rendering - FFmpeg only works in browser
export const dynamic = 'force-dynamic';

type VideoGifSettings = {
    startTime: number;
    duration: number;
    fps: number;
    scale: number;
    quality: number;
};

type QualityPreset = "high" | "medium" | "low";

export default function ConverterPage() {
    const { isSignedIn, user } = useUser();
    const [converterType, setConverterType] = useState<"video" | "image">("video");

    // Video converter states
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [gifSize, setGifSize] = useState<number>(0);
    const [gifBlob, setGifBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [quality, setQuality] = useState(10); // 1-31, lower is better
    const [fps, setFps] = useState(15);
    const [scale, setScale] = useState(480); // Width in pixels
    const [startTime, setStartTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [maxDuration, setMaxDuration] = useState(10);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    const [suggestedSettings, setSuggestedSettings] = useState<VideoGifSettings | null>(null);
    const [useSuggestedSettings, setUseSuggestedSettings] = useState(true);

    // Image converter states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(null);
    const [convertedImageBlob, setConvertedImageBlob] = useState<Blob | null>(null);
    const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
    const [imageQuality, setImageQuality] = useState(0.9);
    const [isConvertingImage, setIsConvertingImage] = useState(false);

    // Error modal
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // URL import states (shared)
    const [isUrlMode, setIsUrlMode] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [isLoadingUrl, setIsLoadingUrl] = useState(false);

    const ffmpegRef = useRef<FFmpeg | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isConvertingRef = useRef(false);
    const conversionDurationRef = useRef(0);
    const lastProgressRef = useRef(0);

    const revokeObjectUrl = (url: string | null | undefined) => {
        if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
    };

    const extToImageMime: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
    };
    const extToVideoMime: Record<string, string> = {
        mp4: "video/mp4",
        webm: "video/webm",
        mov: "video/quicktime",
        m4v: "video/x-m4v",
    };
    const getExtFromName = (name: string) =>
        name.split(".").pop()?.toLowerCase() || "";

    const parseTimestampToSeconds = (value: string) => {
        const match = value.match(/(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/);
        if (!match) return null;

        const hours = Number(match[1]);
        const minutes = Number(match[2]);
        const seconds = Number(match[3]);

        if ([hours, minutes, seconds].some((part) => Number.isNaN(part))) {
            return null;
        }

        return hours * 3600 + minutes * 60 + seconds;
    };

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    const normalizeScale = (value: number) => {
        const snapped = Math.round(value / 80) * 80;
        return clamp(snapped, 320, 720);
    };
    const getSuggestedVideoSettings = (video: {
        width: number;
        height: number;
        duration: number;
        sizeBytes: number;
    }): VideoGifSettings => {
        const sourceWidth = Math.max(1, video.width);
        const sourceHeight = Math.max(1, video.height);
        const sourceDurationSeconds = Math.max(0.1, video.duration);
        const sourceDurationRounded = Math.max(1, Math.floor(video.duration));
        const durationCap = Math.max(1, Math.min(10, sourceDurationRounded));
        const sizeMB = video.sizeBytes / (1024 * 1024);
        const pixelsPerFrame = Math.max(1, sourceWidth * sourceHeight);
        const aspectRatio = sourceWidth / sourceHeight;
        const isPortrait = aspectRatio < 1;

        // Proxy for "how hard this video is to compress" without decoding every frame.
        const bitrateBps = (video.sizeBytes * 8) / sourceDurationSeconds;
        const bitsPerPixelPerSecond = bitrateBps / pixelsPerFrame;
        const detailScore = clamp((bitsPerPixelPerSecond - 0.04) / 0.24, 0, 1);
        const resolutionScore = clamp((pixelsPerFrame - 640 * 360) / (1920 * 1080 - 640 * 360), 0, 1);
        const lengthScore = clamp((sourceDurationSeconds - 4) / 24, 0, 1);
        const sizeScore = clamp((sizeMB - 4) / 40, 0, 1);
        const compressionPressure = clamp(
            0.42 * resolutionScore + 0.26 * lengthScore + 0.22 * sizeScore + 0.10 * detailScore,
            0,
            1
        );

        let suggestedDuration = sourceDurationSeconds <= 4
            ? sourceDurationSeconds
            : 6.5 - compressionPressure * 2 + detailScore * 0.8;
        suggestedDuration = clamp(Math.round(suggestedDuration), 1, durationCap);

        let suggestedFps = 18 + detailScore * 6 - compressionPressure * 6;
        if (sourceDurationSeconds >= 20) suggestedFps -= 1.5;
        if (sourceDurationSeconds <= 3) suggestedFps += 1.5;
        suggestedFps = clamp(Math.round(suggestedFps), 10, 24);

        let targetPixelsPerFrame = 360_000 - compressionPressure * 190_000 + detailScore * 35_000;
        if (isPortrait) targetPixelsPerFrame *= 0.9;

        const widthFromTargetPixels = Math.sqrt(Math.max(1, targetPixelsPerFrame * aspectRatio));
        const cappedWidth = Math.min(widthFromTargetPixels, sourceWidth, 720);
        const suggestedScale = normalizeScale(clamp(cappedWidth, 320, 720));

        let suggestedQuality = 11 + compressionPressure * 10 - detailScore * 3;
        if (sourceDurationSeconds >= 20) suggestedQuality += 1;
        if (sourceDurationSeconds <= 3 && compressionPressure < 0.35) suggestedQuality -= 1;
        suggestedQuality = clamp(Math.round(suggestedQuality), 6, 22);

        return {
            startTime: 0,
            duration: Math.max(1, Math.round(suggestedDuration)),
            fps: clamp(Math.round(suggestedFps), 10, 30),
            scale: suggestedScale,
            quality: clamp(Math.round(suggestedQuality), 5, 25),
        };
    };
    const applyVideoSettings = (settings: VideoGifSettings) => {
        setStartTime(clamp(settings.startTime, 0, Math.max(0, maxDuration)));
        setDuration(clamp(settings.duration, 1, Math.max(1, Math.min(10, maxDuration))));
        setFps(clamp(settings.fps, 10, 30));
        setScale(normalizeScale(settings.scale));
        setQuality(clamp(settings.quality, 5, 25));
    };
    const handleManualVideoSettingChange = (setter: Dispatch<SetStateAction<number>>, value: number) => {
        setUseSuggestedSettings(false);
        setter(value);
    };
    const handleSuggestedToggle = (enabled: boolean) => {
        setUseSuggestedSettings(enabled);
        if (enabled && suggestedSettings) {
            applyVideoSettings(suggestedSettings);
        }
    };
    const getQualityPreset = (value: number): QualityPreset => {
        if (value <= 10) return "high";
        if (value <= 17) return "medium";
        return "low";
    };
    const getQualityPresetValue = (preset: QualityPreset) => {
        if (preset === "high") return 8;
        if (preset === "medium") return 14;
        return 21;
    };

    const getUploaderHeaders = () => {
        const uploaderEmail = user?.primaryEmailAddress?.emailAddress || "";
        const displayName = user?.unsafeMetadata?.displayName as string | undefined;
        const fallbackName = uploaderEmail.split("@")[0] || "Anonymous";
        const uploaderName = (displayName && displayName.trim()) || fallbackName;

        return {
            "x-uploader-name": uploaderName,
            "x-uploader-email": uploaderEmail,
            "x-is-private": "false",
            "x-is-nsfw": "false",
        } as const;
    };

    // Initialize FFmpeg only in browser
    useEffect(() => {
        if (typeof window !== 'undefined') {
            ffmpegRef.current = new FFmpeg();
        }
    }, []);

    // Cleanup any remaining object URLs on unmount
    useEffect(() => {
        return () => {
            revokeObjectUrl(videoPreview);
            revokeObjectUrl(gifUrl);
            revokeObjectUrl(imagePreview);
            revokeObjectUrl(convertedImageUrl);
        };
    }, [videoPreview, gifUrl, imagePreview, convertedImageUrl]);

    // Load FFmpeg only when it can actually be used
    useEffect(() => {
        if (
            typeof window === 'undefined' ||
            !ffmpegRef.current ||
            !isSignedIn ||
            converterType !== "video" ||
            ffmpegLoaded
        ) return;

        const loadFFmpeg = async () => {
            const ffmpeg = ffmpegRef.current!;

            ffmpeg.on("log", ({ message }) => {
                console.log(message);

                if (!isConvertingRef.current) return;

                const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}(?:\.\d+)?)/);
                if (!timeMatch) return;

                const processedSeconds = parseTimestampToSeconds(timeMatch[1]);
                const totalSeconds = conversionDurationRef.current;

                if (processedSeconds === null || totalSeconds <= 0) return;

                const conversionRatio = Math.min(processedSeconds / totalSeconds, 1);
                const mappedProgress = Math.min(94, 10 + Math.round(conversionRatio * 84));

                if (mappedProgress > lastProgressRef.current) {
                    lastProgressRef.current = mappedProgress;
                    setProgress(mappedProgress);
                }
            });

            ffmpeg.on("progress", ({ progress: p }) => {
                if (!isConvertingRef.current) return;

                const safeProgress = Number.isFinite(p) ? Math.min(Math.max(p, 0), 1) : 0;
                const mappedProgress = Math.min(94, 10 + Math.round(safeProgress * 84));

                if (mappedProgress > lastProgressRef.current) {
                    lastProgressRef.current = mappedProgress;
                    setProgress(mappedProgress);
                }
            });

            try {
                setLoadingMessage("Loading converter engine...");
                const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
                await ffmpeg.load({
                    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
                    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
                });
                setFfmpegLoaded(true);
                setLoadingMessage("");
            } catch (error) {
                console.error("FFmpeg load error:", error);
                setErrorMessage("Failed to load converter engine. Please check your internet connection and refresh the page.");
                setLoadingMessage("");
            }
        };

        loadFFmpeg();
    }, [isSignedIn, converterType, ffmpegLoaded]);

    const handleVideoSelect = (file: File) => {
        if (!file.type.startsWith("video/")) {
            setErrorMessage("Please select a valid video file");
            return;
        }

        // Check file size (max 100MB for performance)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (file.size > maxSize) {
            setErrorMessage(`Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 100MB. Please use a smaller video.`);
            return;
        }

        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoPreview((prev) => {
            revokeObjectUrl(prev);
            return url;
        });
        setGifUrl((prev) => {
            revokeObjectUrl(prev);
            return null;
        });

        // Get video duration when loaded
        const video = document.createElement("video");
        video.src = url;
        video.onloadedmetadata = () => {
            const videoDuration = Math.max(1, Math.floor(video.duration));
            setMaxDuration(videoDuration);
            const recommendation = getSuggestedVideoSettings({
                width: video.videoWidth,
                height: video.videoHeight,
                duration: video.duration,
                sizeBytes: file.size,
            });
            setSuggestedSettings(recommendation);
            setUseSuggestedSettings(true);
            setStartTime(recommendation.startTime);
            setDuration(clamp(recommendation.duration, 1, Math.max(1, Math.min(10, videoDuration))));
            setFps(recommendation.fps);
            setScale(recommendation.scale);
            setQuality(recommendation.quality);
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleVideoSelect(file);
    };

    // Fetch video from URL
    const handleVideoUrlImport = async () => {
        if (!urlInput.trim()) {
            setErrorMessage("Please enter a valid URL");
            return;
        }

        setIsLoadingUrl(true);
        try {
            const response = await fetch(urlInput);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const blob = await response.blob();
            const fileName = urlInput.split('/').pop()?.split('?')[0] || "video.mp4";
            const ext = getExtFromName(fileName);
            const mimeType = blob.type.startsWith("video/")
                ? blob.type
                : extToVideoMime[ext];

            if (!mimeType) {
                throw new Error("URL does not point to a valid video file");
            }

            const file = new File([blob], fileName, { type: mimeType });

            handleVideoSelect(file);
            setUrlInput("");
            setIsUrlMode(false);
        } catch (error) {
            console.error("URL import error:", error);
            setErrorMessage("Could not fetch video from URL. Make sure it's a direct video link and publicly accessible (CORS may block some sources like Facebook/Instagram).");
        } finally {
            setIsLoadingUrl(false);
        }
    };

    // Fetch image from URL
    const handleImageUrlImport = async () => {
        if (!urlInput.trim()) {
            setErrorMessage("Please enter a valid URL");
            return;
        }

        setIsLoadingUrl(true);
        try {
            const response = await fetch(urlInput);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.status}`);
            }

            const blob = await response.blob();
            const fileName = urlInput.split('/').pop()?.split('?')[0] || "image.png";
            const ext = getExtFromName(fileName);
            const mimeType = blob.type.startsWith("image/")
                ? blob.type
                : extToImageMime[ext];

            if (!mimeType) {
                throw new Error("URL does not point to a valid image file");
            }

            const file = new File([blob], fileName, { type: mimeType });

            handleImageSelect(file);
            setUrlInput("");
            setIsUrlMode(false);
        } catch (error) {
            console.error("URL import error:", error);
            setErrorMessage("Could not fetch image from URL. Make sure it's a direct image link and publicly accessible (CORS may block some sources like Facebook/Instagram).");
        } finally {
            setIsLoadingUrl(false);
        }
    };

    const convertToGif = async () => {
        if (!videoFile || !ffmpegLoaded || !ffmpegRef.current) return;

        setIsLoading(true);
        setProgress(0);
        lastProgressRef.current = 0;
        conversionDurationRef.current = duration;
        isConvertingRef.current = true;
        setLoadingMessage("Preparing video...");

        try {
            const ffmpeg = ffmpegRef.current;
            setProgress(2);

            // Write video to FFmpeg virtual file system
            await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
            setProgress(10);
            lastProgressRef.current = 10;

            setLoadingMessage("Converting to GIF...");

            // Build FFmpeg command
            const args = [
                "-i", "input.mp4",
                "-ss", startTime.toString(),
                "-t", duration.toString(),
                "-vf", `fps=${fps},scale=${scale}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`,
                "-q:v", quality.toString(),
                "output.gif"
            ];

            await ffmpeg.exec(args);

            setLoadingMessage("Finalizing GIF...");
            setProgress((prev) => Math.max(prev, 95));
            lastProgressRef.current = 95;

            // Read the output GIF
            const data = await ffmpeg.readFile("output.gif");
            // Create a new Uint8Array to ensure proper typing for Blob
            const uint8 = new Uint8Array(data as Uint8Array);
            const blob = new Blob([uint8], { type: "image/gif" });
            const url = URL.createObjectURL(blob);

            setGifUrl((prev) => {
                revokeObjectUrl(prev);
                return url;
            });
            setGifSize(blob.size);
            setGifBlob(blob);
            setLoadingMessage("");
            setProgress(100);

            // Cleanup
            await ffmpeg.deleteFile("input.mp4");
            await ffmpeg.deleteFile("output.gif");

        } catch (error) {
            console.error("Conversion error:", error);
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            setErrorMessage(`Failed to convert video: ${errorMsg}. Please try with a smaller video or different format.`);
        } finally {
            isConvertingRef.current = false;
            conversionDurationRef.current = 0;
            lastProgressRef.current = 0;
            setIsLoading(false);
        }
    };

    const downloadGif = () => {
        if (!gifUrl) return;
        const a = document.createElement("a");
        a.href = gifUrl;
        a.download = `watermelon-gif-${Date.now()}.gif`;
        a.click();

        // Reset after download
        setTimeout(() => {
            reset();
        }, 500);
    };

    const uploadToSupabase = async () => {
        if (!gifBlob) return;

        setIsUploading(true);
        setLoadingMessage("Uploading to storage...");

        try {
            const formData = new FormData();
            const file = new File([gifBlob], `watermelon-gif-${Date.now()}.gif`, { type: "image/gif" });
            formData.append("image", file);

            const response = await fetch("/api/supabase/upload", {
                method: "POST",
                body: formData,
                headers: getUploaderHeaders(),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Upload failed");
            }

            // Show success and reset
            setLoadingMessage("Upload successful!");
            setTimeout(() => {
                reset();
            }, 1500);

        } catch (error) {
            console.error("Upload error:", error);
            setErrorMessage("Failed to upload. Please try downloading instead.");
        } finally {
            setIsUploading(false);
        }
    };

    const reset = () => {
        setVideoFile(null);
        setVideoPreview((prev) => {
            revokeObjectUrl(prev);
            return null;
        });
        setGifUrl((prev) => {
            revokeObjectUrl(prev);
            return null;
        });
        setGifBlob(null);
        setProgress(0);
        setStartTime(0);
        setDuration(5);
        setSuggestedSettings(null);
        setUseSuggestedSettings(true);
        setLoadingMessage("");
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    // Image conversion functions
    const handleImageSelect = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setErrorMessage("Please select a valid image file");
            return;
        }

        // Check file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            setErrorMessage(`Image file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum size is 50MB.`);
            return;
        }

        setImageFile(file);
        const url = URL.createObjectURL(file);
        setImagePreview((prev) => {
            revokeObjectUrl(prev);
            return url;
        });
        setConvertedImageUrl((prev) => {
            revokeObjectUrl(prev);
            return null;
        });
    };

    const convertImage = async () => {
        if (!imageFile) return;

        setIsConvertingImage(true);
        setLoadingMessage("Converting image...");

        try {
            const img = new window.Image();
            const sourceUrl = URL.createObjectURL(imageFile);
            img.src = sourceUrl;

            await new Promise<void>((resolve, reject) => {
                img.onload = () => {
                    revokeObjectUrl(sourceUrl);
                    resolve();
                };
                img.onerror = () => {
                    revokeObjectUrl(sourceUrl);
                    reject(new Error("Failed to load image"));
                };
            });

            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");

            if (!ctx) throw new Error("Failed to get canvas context");

            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        setErrorMessage("Conversion failed");
                        setIsConvertingImage(false);
                        setLoadingMessage("");
                        return;
                    }

                    const url = URL.createObjectURL(blob);
                    setConvertedImageUrl((prev) => {
                        revokeObjectUrl(prev);
                        return url;
                    });
                    setConvertedImageBlob(blob);
                    setGifSize(blob.size);
                    setLoadingMessage("");
                    setIsConvertingImage(false);
                },
                `image/${outputFormat}`,
                imageQuality
            );
        } catch (error) {
            console.error("Image conversion error:", error);
            const errorMsg = error instanceof Error ? error.message : "Unknown error";
            setErrorMessage(`Failed to convert image: ${errorMsg}. Please try again with a different image.`);
            setIsConvertingImage(false);
            setLoadingMessage("");
        }
    };

    const downloadImage = () => {
        if (!convertedImageUrl) return;
        const a = document.createElement("a");
        a.href = convertedImageUrl;
        a.download = `watermelon-image-${Date.now()}.${outputFormat}`;
        a.click();

        setTimeout(() => {
            resetImage();
        }, 500);
    };

    const uploadImage = async () => {
        if (!convertedImageBlob) return;

        setIsUploading(true);
        setLoadingMessage("Uploading to storage...");

        try {
            const formData = new FormData();
            const file = new File([convertedImageBlob], `watermelon-image-${Date.now()}.${outputFormat}`, {
                type: `image/${outputFormat}`
            });
            formData.append("image", file);

            const response = await fetch("/api/supabase/upload", {
                method: "POST",
                body: formData,
                headers: getUploaderHeaders(),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Upload failed");
            }

            setLoadingMessage("Upload successful!");
            setTimeout(() => {
                resetImage();
            }, 1500);

        } catch (error) {
            console.error("Upload error:", error);
            setErrorMessage("Failed to upload. Please try downloading instead.");
        } finally {
            setIsUploading(false);
        }
    };

    const resetImage = () => {
        setImageFile(null);
        setImagePreview((prev) => {
            revokeObjectUrl(prev);
            return null;
        });
        setConvertedImageUrl((prev) => {
            revokeObjectUrl(prev);
            return null;
        });
        setConvertedImageBlob(null);
        setLoadingMessage("");
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0d0d]/50 to-[#0d0d0d]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <Header variant="fixed" />

                {/* Main */}
                <main className="pt-24 pb-12 px-4 min-h-screen">
                    <div className="max-w-4xl 2xl:max-w-5xl mx-auto">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="font-pixel text-2xl sm:text-3xl lg:text-4xl text-[#ff4757] mb-2 px-4">CONVERTER</h1>
                            <p className="text-sm sm:text-base text-gray-400 px-4">
                                {converterType === "video"
                                    ? "Transform your videos into GIFs instantly"
                                    : "Convert your images to different formats"}
                            </p>

                            {/* Converter Type Selector */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 px-4">
                                <ActionButton
                                    onClick={() => {
                                        setConverterType("video");
                                        resetImage();
                                        reset();
                                    }}
                                    variant={converterType === "video" ? "primary" : "secondary"}
                                    className="px-4 sm:px-6 py-3 text-sm sm:text-base w-full sm:w-auto"
                                >
                                    🎬 Video to GIF
                                </ActionButton>
                                <ActionButton
                                    onClick={() => {
                                        setConverterType("image");
                                        reset();
                                        resetImage();
                                    }}
                                    variant={converterType === "image" ? "primary" : "secondary"}
                                    className="px-4 sm:px-6 py-3 text-sm sm:text-base w-full sm:w-auto"
                                >
                                    🖼️ Image Format
                                </ActionButton>
                            </div>

                            {!ffmpegLoaded && converterType === "video" && isSignedIn && (
                                <p className="text-yellow-400 text-sm mt-2">⚡ Loading converter engine...</p>
                            )}
                        </div>

                        {!isSignedIn ? (
                            <AuthRequiredCard
                                description="To use the converter, you need to authenticate first"
                                postAuthAction="continue converting files"
                                className="mb-8"
                            />
                        ) : converterType === "video" ? (
                            // VIDEO TO GIF CONVERTER
                            !videoFile ? (
                                <div className="space-y-4">
                                    {/* Input Mode Toggle - Segmented Control */}
                                    <div className="flex justify-center mb-6">
                                        <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
                                            <ActionButton
                                                onClick={() => setIsUrlMode(false)}
                                                variant={!isUrlMode ? "primary" : "secondary"}
                                                size="sm"
                                                className={`px-4 py-2 rounded-lg text-sm ${!isUrlMode ? "shadow-sm" : "text-gray-400 hover:text-gray-300"}`}
                                            >
                                                📁 Upload File
                                            </ActionButton>
                                            <ActionButton
                                                onClick={() => setIsUrlMode(true)}
                                                variant={isUrlMode ? "primary" : "secondary"}
                                                size="sm"
                                                className={`px-4 py-2 rounded-lg text-sm ${isUrlMode ? "shadow-sm" : "text-gray-400 hover:text-gray-300"}`}
                                            >
                                                🔗 Import URL
                                            </ActionButton>
                                        </div>
                                    </div>

                                    {!isUrlMode ? (
                                        /* File Upload Mode */
                                        <div
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="glass rounded-2xl p-12 border-2 border-dashed border-white/20 hover:border-[#2ed573]/50 transition-all text-center cursor-pointer"
                                            onClick={() => document.getElementById("video-input")?.click()}
                                        >
                                            <div className="text-6xl mb-4">🎬</div>
                                            <h3 className="font-pixel text-lg text-[#2ed573] mb-2">UPLOAD VIDEO</h3>
                                            <p className="text-gray-400 mb-4">Drag & drop or click to select</p>
                                            <p className="text-xs text-gray-500">Supports MP4, WEBM, MOV and more</p>
                                            <input
                                                id="video-input"
                                                type="file"
                                                accept="video/*"
                                                onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        /* URL Import Mode */
                                        <div className="glass rounded-2xl p-8 border border-white/10">
                                            <div className="text-5xl mb-4 text-center">🔗</div>
                                            <h3 className="font-pixel text-lg text-[#2ed573] mb-4 text-center">IMPORT FROM URL</h3>
                                            <p className="text-gray-400 text-sm mb-6 text-center">
                                                Paste a direct link to a video file
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={urlInput}
                                                    onChange={(e) => setUrlInput(e.target.value)}
                                                    placeholder="https://example.com/video.mp4"
                                                    className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:border-[#2ed573]/50 focus:outline-none"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleVideoUrlImport()}
                                                />
                                                <ActionButton
                                                    onClick={handleVideoUrlImport}
                                                    disabled={isLoadingUrl || !urlInput.trim()}
                                                    variant="primary"
                                                    className="px-6 py-3"
                                                >
                                                    {isLoadingUrl ? "..." : "Fetch"}
                                                </ActionButton>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-4 text-center">
                                                ⚠️ Only direct video links work. Facebook/Instagram may block due to CORS.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Preview */}
                                    <div className="glass rounded-2xl p-6">
                                        <h3 className="font-pixel text-sm text-[#2ed573] mb-4">PREVIEW</h3>
                                        {videoPreview && !gifUrl && (
                                            <video
                                                ref={videoRef}
                                                src={videoPreview}
                                                controls
                                                className="w-full rounded-xl max-h-96 bg-black"
                                            />
                                        )}
                                        {gifUrl && (
                                            <div className="text-center">
                                                <img src={gifUrl} alt="Generated GIF" className="mx-auto rounded-xl max-h-96" />
                                                <p className="text-sm text-gray-400 mt-4">Size: {formatFileSize(gifSize)}</p>
                                            </div>
                                        )}
                                    </div>

                                    {!gifUrl && (
                                        <div className="glass rounded-2xl p-6">
                                            <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center sm:justify-between">
                                                <h3 className="font-pixel text-sm text-[#2ed573]">SETTINGS</h3>
                                                <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-300 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={useSuggestedSettings}
                                                        onChange={(e) => handleSuggestedToggle(e.target.checked)}
                                                        className="h-4 w-4 accent-[#2ed573]"
                                                        disabled={!suggestedSettings}
                                                    />
                                                    Suggested settings
                                                </label>
                                            </div>
                                            {suggestedSettings && (
                                                <p className="text-xs text-gray-500 mb-4">
                                                    Balanced preset: {suggestedSettings.duration}s, {suggestedSettings.fps} FPS, {suggestedSettings.scale}px, quality {suggestedSettings.quality}
                                                </p>
                                            )}
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 block">Start Time (s)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxDuration}
                                                        value={startTime}
                                                        onChange={(e) =>
                                                            handleManualVideoSettingChange(
                                                                setStartTime,
                                                                clamp(Number(e.target.value), 0, maxDuration)
                                                            )
                                                        }
                                                        className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#2ed573]/50"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-gray-400">Duration (s)</label>
                                                        <span className="px-3 py-1 text-sm rounded-lg bg-black/40 border border-white/10 text-white min-w-[68px] text-center">
                                                            {duration}s
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max={Math.min(10, maxDuration)}
                                                        value={duration}
                                                        onChange={(e) =>
                                                            handleManualVideoSettingChange(
                                                                setDuration,
                                                                clamp(Number(e.target.value), 1, Math.max(1, Math.min(10, maxDuration)))
                                                            )
                                                        }
                                                        className="w-full accent-[#2ed573]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-gray-400">FPS</label>
                                                        <span className="px-3 py-1 text-sm rounded-lg bg-black/40 border border-white/10 text-white min-w-[68px] text-center">
                                                            {fps} FPS
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="30"
                                                        value={fps}
                                                        onChange={(e) =>
                                                            handleManualVideoSettingChange(
                                                                setFps,
                                                                clamp(Number(e.target.value), 10, 30)
                                                            )
                                                        }
                                                        className="w-full accent-[#2ed573]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-sm text-gray-400">Width (px)</label>
                                                        <span className="px-3 py-1 text-sm rounded-lg bg-black/40 border border-white/10 text-white min-w-[68px] text-center">
                                                            {scale}px
                                                        </span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="320"
                                                        max="720"
                                                        step="80"
                                                        value={scale}
                                                        onChange={(e) =>
                                                            handleManualVideoSettingChange(
                                                                setScale,
                                                                normalizeScale(Number(e.target.value))
                                                            )
                                                        }
                                                        className="w-full accent-[#2ed573]"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-gray-400 block">Quality</label>
                                                    <div className="grid grid-cols-3 gap-2 rounded-xl bg-black/30 border border-white/10 p-1.5">
                                                        {(["high", "medium", "low"] as QualityPreset[]).map((preset) => {
                                                            const active = getQualityPreset(quality) === preset;
                                                            return (
                                                                <ActionButton
                                                                    key={preset}
                                                                    onClick={() =>
                                                                        handleManualVideoSettingChange(
                                                                            setQuality,
                                                                            getQualityPresetValue(preset)
                                                                        )
                                                                    }
                                                                    variant={active ? "primary" : "secondary"}
                                                                    size="sm"
                                                                    className={`py-2 rounded-lg text-sm capitalize ${active ? "text-[#2ed573] bg-[#2ed573]/20 border-[#2ed573]/40 hover:bg-[#2ed573]/20" : "text-gray-400 border-transparent hover:text-white hover:bg-white/5"}`}
                                                                >
                                                                    {preset}
                                                                </ActionButton>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {!gifUrl ? (
                                            <>
                                                <ActionButton
                                                    onClick={convertToGif}
                                                    disabled={isLoading || !ffmpegLoaded}
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                    className="flex-1"
                                                >
                                                    {isLoading ? `Converting... ${progress}%` : "Convert to GIF"}
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={reset}
                                                    variant="secondary"
                                                    size="lg"
                                                    className="px-6"
                                                >
                                                    Cancel
                                                </ActionButton>
                                            </>
                                        ) : (
                                            <>
                                                <ActionButton
                                                    onClick={uploadToSupabase}
                                                    disabled={isUploading}
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                    className="flex-1"
                                                >
                                                    {isUploading ? "Uploading..." : "📤 Upload to Storage"}
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={downloadGif}
                                                    disabled={isUploading}
                                                    variant="danger"
                                                    size="lg"
                                                    fullWidth
                                                    className="flex-1"
                                                >
                                                    📥 Download
                                                </ActionButton>
                                            </>
                                        )}
                                    </div>

                                    {loadingMessage && (
                                        <div className="text-center text-gray-400 text-sm">
                                            {loadingMessage}
                                        </div>
                                    )}
                                </div>
                            )) : (
                            // IMAGE FORMAT CONVERTER
                            !imageFile ? (
                                <div className="space-y-4">
                                    {/* Input Mode Toggle - Segmented Control */}
                                    <div className="flex justify-center mb-6">
                                        <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
                                            <ActionButton
                                                onClick={() => setIsUrlMode(false)}
                                                variant={!isUrlMode ? "primary" : "secondary"}
                                                size="sm"
                                                className={`px-4 py-2 rounded-lg text-sm ${!isUrlMode ? "shadow-sm" : "text-gray-400 hover:text-gray-300"}`}
                                            >
                                                📁 Upload File
                                            </ActionButton>
                                            <ActionButton
                                                onClick={() => setIsUrlMode(true)}
                                                variant={isUrlMode ? "primary" : "secondary"}
                                                size="sm"
                                                className={`px-4 py-2 rounded-lg text-sm ${isUrlMode ? "shadow-sm" : "text-gray-400 hover:text-gray-300"}`}
                                            >
                                                🔗 Import URL
                                            </ActionButton>
                                        </div>
                                    </div>

                                    {!isUrlMode ? (
                                        /* File Upload Mode */
                                        <div
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const file = e.dataTransfer.files[0];
                                                if (file) handleImageSelect(file);
                                            }}
                                            onDragOver={(e) => e.preventDefault()}
                                            className="glass rounded-2xl p-12 border-2 border-dashed border-white/20 hover:border-[#2ed573]/50 transition-all text-center cursor-pointer"
                                            onClick={() => document.getElementById("image-input")?.click()}
                                        >
                                            <div className="text-6xl mb-4">🖼️</div>
                                            <h3 className="font-pixel text-lg text-[#2ed573] mb-2">UPLOAD IMAGE</h3>
                                            <p className="text-gray-400 mb-4">Drag & drop or click to select</p>
                                            <p className="text-xs text-gray-500">Supports PNG, JPG, JPEG, WebP</p>
                                            <input
                                                id="image-input"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        /* URL Import Mode */
                                        <div className="glass rounded-2xl p-8 border border-white/10">
                                            <div className="text-5xl mb-4 text-center">🔗</div>
                                            <h3 className="font-pixel text-lg text-[#2ed573] mb-4 text-center">IMPORT FROM URL</h3>
                                            <p className="text-gray-400 text-sm mb-6 text-center">
                                                Paste a direct link to an image file
                                            </p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="url"
                                                    value={urlInput}
                                                    onChange={(e) => setUrlInput(e.target.value)}
                                                    placeholder="https://example.com/image.png"
                                                    className="flex-1 px-4 py-3 rounded-xl bg-black/40 border border-white/20 text-white placeholder-gray-500 focus:border-[#2ed573]/50 focus:outline-none"
                                                    onKeyDown={(e) => e.key === 'Enter' && handleImageUrlImport()}
                                                />
                                                <ActionButton
                                                    onClick={handleImageUrlImport}
                                                    disabled={isLoadingUrl || !urlInput.trim()}
                                                    variant="primary"
                                                    className="px-6 py-3"
                                                >
                                                    {isLoadingUrl ? "..." : "Fetch"}
                                                </ActionButton>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-4 text-center">
                                                ⚠️ Only direct image links work. Facebook/Instagram may block due to CORS.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Preview */}
                                    <div className="glass rounded-2xl p-6">
                                        <h3 className="font-pixel text-sm text-[#2ed573] mb-4">
                                            {convertedImageUrl ? "CONVERTED IMAGE" : "ORIGINAL IMAGE"}
                                        </h3>
                                        <img
                                            src={convertedImageUrl || imagePreview || ""}
                                            alt="Preview"
                                            className="mx-auto rounded-xl max-h-96"
                                        />
                                        {convertedImageUrl && (
                                            <p className="text-sm text-gray-400 mt-4 text-center">
                                                Size: {formatFileSize(gifSize)}
                                            </p>
                                        )}
                                    </div>

                                    {!convertedImageUrl && (
                                        <div className="glass rounded-2xl p-6">
                                            <h3 className="font-pixel text-sm text-[#2ed573] mb-4">CONVERT TO</h3>
                                            <div className="flex gap-3 mb-4">
                                                <ActionButton
                                                    onClick={() => setOutputFormat("png")}
                                                    variant={outputFormat === "png" ? "primary" : "secondary"}
                                                    className="flex-1 py-3"
                                                >
                                                    PNG
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={() => setOutputFormat("jpeg")}
                                                    variant={outputFormat === "jpeg" ? "primary" : "secondary"}
                                                    className="flex-1 py-3"
                                                >
                                                    JPEG
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={() => setOutputFormat("webp")}
                                                    variant={outputFormat === "webp" ? "primary" : "secondary"}
                                                    className="flex-1 py-3"
                                                >
                                                    WebP
                                                </ActionButton>
                                            </div>
                                            {outputFormat !== "png" && (
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-2">
                                                        Quality: {Math.round(imageQuality * 100)}%
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0.1"
                                                        max="1"
                                                        step="0.1"
                                                        value={imageQuality}
                                                        onChange={(e) => setImageQuality(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {!convertedImageUrl ? (
                                            <>
                                                <ActionButton
                                                    onClick={convertImage}
                                                    disabled={isConvertingImage}
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                    className="flex-1"
                                                >
                                                    {isConvertingImage ? "Converting..." : "Convert Image"}
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={resetImage}
                                                    variant="secondary"
                                                    size="lg"
                                                    className="px-6"
                                                >
                                                    Cancel
                                                </ActionButton>
                                            </>
                                        ) : (
                                            <>
                                                <ActionButton
                                                    onClick={uploadImage}
                                                    disabled={isUploading}
                                                    variant="primary"
                                                    size="lg"
                                                    fullWidth
                                                    className="flex-1"
                                                >
                                                    {isUploading ? "Uploading..." : "📤 Upload to Storage"}
                                                </ActionButton>
                                                <ActionButton
                                                    onClick={downloadImage}
                                                    disabled={isUploading}
                                                    variant="danger"
                                                    size="lg"
                                                    fullWidth
                                                    className="flex-1"
                                                >
                                                    📥 Download
                                                </ActionButton>
                                            </>
                                        )}
                                    </div>

                                    {loadingMessage && (
                                        <div className="text-center text-gray-400 text-sm">
                                            {loadingMessage}
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                </main>
            </div>

            {/* Error Modal */}
            {errorMessage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="glass rounded-2xl p-8 border-2 border-red-500/50 max-w-md mx-4">
                        <div className="text-5xl mb-4 text-center">⚠️</div>
                        <h3 className="font-pixel text-lg text-red-400 mb-4 text-center">ERROR</h3>
                        <p className="text-gray-300 text-center mb-6">{errorMessage}</p>
                        <ActionButton
                            onClick={() => setErrorMessage(null)}
                            variant="danger"
                            fullWidth
                        >
                            Close
                        </ActionButton>
                    </div>
                </div>
            )}
        </div>
    );
}
