"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import Header from "../components/Header";

// Force dynamic rendering - FFmpeg only works in browser
export const dynamic = 'force-dynamic';

export default function ConverterPage() {
    const { isSignedIn } = useUser();
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

    // Initialize FFmpeg only in browser
    useEffect(() => {
        if (typeof window !== 'undefined') {
            ffmpegRef.current = new FFmpeg();
        }
    }, []);

    // Load FFmpeg
    useEffect(() => {
        if (typeof window === 'undefined' || !ffmpegRef.current) return;

        const loadFFmpeg = async () => {
            const ffmpeg = ffmpegRef.current!;

            ffmpeg.on("log", ({ message }) => {
                console.log(message);
            });

            ffmpeg.on("progress", ({ progress: p }) => {
                setProgress(Math.round(p * 100));
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
    }, []);

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
        setVideoPreview(url);
        setGifUrl(null);

        // Get video duration when loaded
        const video = document.createElement("video");
        video.src = url;
        video.onloadedmetadata = () => {
            setMaxDuration(Math.floor(video.duration));
            setDuration(Math.min(5, Math.floor(video.duration))); // Default 5 seconds
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
            if (!blob.type.startsWith("video/")) {
                throw new Error("URL does not point to a valid video file");
            }

            const fileName = urlInput.split('/').pop()?.split('?')[0] || "video.mp4";
            const file = new File([blob], fileName, { type: blob.type });

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
            if (!blob.type.startsWith("image/")) {
                throw new Error("URL does not point to a valid image file");
            }

            const fileName = urlInput.split('/').pop()?.split('?')[0] || "image.png";
            const file = new File([blob], fileName, { type: blob.type });

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
        setLoadingMessage("Preparing video...");

        try {
            const ffmpeg = ffmpegRef.current;

            // Write video to FFmpeg virtual file system
            await ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));

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

            // Read the output GIF
            const data = await ffmpeg.readFile("output.gif");
            // Create a new Uint8Array to ensure proper typing for Blob
            const uint8 = new Uint8Array(data as Uint8Array);
            const blob = new Blob([uint8], { type: "image/gif" });
            const url = URL.createObjectURL(blob);

            setGifUrl(url);
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
        setVideoPreview(null);
        setGifUrl(null);
        setGifBlob(null);
        setProgress(0);
        setStartTime(0);
        setDuration(5);
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
        setImagePreview(url);
        setConvertedImageUrl(null);
    };

    const convertImage = async () => {
        if (!imageFile) return;

        setIsConvertingImage(true);
        setLoadingMessage("Converting image...");

        try {
            const img = new window.Image();
            img.src = URL.createObjectURL(imageFile);

            await new Promise((resolve) => {
                img.onload = resolve;
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
                    setConvertedImageUrl(url);
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
        setImagePreview(null);
        setConvertedImageUrl(null);
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
                    priority
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
                            <p className="text-sm sm:text-base text-gray-400 px-4">Transform your videos into GIFs instantly</p>

                            {/* Converter Type Selector */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 px-4">
                                <button
                                    onClick={() => {
                                        setConverterType("video");
                                        resetImage();
                                        reset();
                                    }}
                                    className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all text-sm sm:text-base w-full sm:w-auto ${converterType === "video"
                                        ? "bg-[#2ed573] text-white"
                                        : "glass border border-white/10 hover:border-[#2ed573]/50"
                                        }`}
                                >
                                    🎬 Video to GIF
                                </button>
                                <button
                                    onClick={() => {
                                        setConverterType("image");
                                        reset();
                                        resetImage();
                                    }}
                                    className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all text-sm sm:text-base w-full sm:w-auto ${converterType === "image"
                                        ? "bg-[#2ed573] text-white"
                                        : "glass border border-white/10 hover:border-[#2ed573]/50"
                                        }`}
                                >
                                    🖼️ Image Format
                                </button>
                            </div>

                            {!ffmpegLoaded && converterType === "video" && (
                                <p className="text-yellow-400 text-sm mt-2">⚡ Loading converter engine...</p>
                            )}
                        </div>

                        {!isSignedIn ? (
                            <div className="glass rounded-2xl p-8 border-2 border-[#ffa502]/30 text-center">
                                <div className="text-5xl mb-4">🔒</div>
                                <h2 className="font-pixel text-xl text-[#ffa502] mb-4">SIGN IN REQUIRED</h2>
                                <p className="text-gray-300 mb-6">Please sign in to use the converter</p>
                                <SignInButton mode="modal">
                                    <button className="px-6 py-3 bg-[#2ed573] hover:bg-[#26de81] rounded-full font-medium transition-all">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </div>
                        ) : converterType === "video" ? (
                            // VIDEO TO GIF CONVERTER
                            !videoFile ? (
                                <div className="space-y-4">
                                    {/* Input Mode Toggle - Segmented Control */}
                                    <div className="flex justify-center mb-6">
                                        <div className="inline-flex rounded-xl bg-white/5 p-1 border border-white/10">
                                            <button
                                                onClick={() => setIsUrlMode(false)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isUrlMode
                                                    ? "bg-white/15 text-white shadow-sm"
                                                    : "text-gray-400 hover:text-gray-300"
                                                    }`}
                                            >
                                                📁 Upload File
                                            </button>
                                            <button
                                                onClick={() => setIsUrlMode(true)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isUrlMode
                                                    ? "bg-white/15 text-white shadow-sm"
                                                    : "text-gray-400 hover:text-gray-300"
                                                    }`}
                                            >
                                                🔗 Import URL
                                            </button>
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
                                                <button
                                                    onClick={handleVideoUrlImport}
                                                    disabled={isLoadingUrl || !urlInput.trim()}
                                                    className="px-6 py-3 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoadingUrl ? "..." : "Fetch"}
                                                </button>
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
                                            <h3 className="font-pixel text-sm text-[#2ed573] mb-4">SETTINGS</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-2">Start Time (seconds)</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxDuration}
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(Number(e.target.value))}
                                                        className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-2">Duration (seconds): {duration}s</label>
                                                    <input
                                                        type="range"
                                                        min="1"
                                                        max={Math.min(10, maxDuration)}
                                                        value={duration}
                                                        onChange={(e) => setDuration(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-2">FPS: {fps}</label>
                                                    <input
                                                        type="range"
                                                        min="10"
                                                        max="30"
                                                        value={fps}
                                                        onChange={(e) => setFps(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-2">Width: {scale}px</label>
                                                    <input
                                                        type="range"
                                                        min="320"
                                                        max="720"
                                                        step="80"
                                                        value={scale}
                                                        onChange={(e) => setScale(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-gray-400 block mb-2">Quality: {quality <= 10 ? "High" : quality <= 20 ? "Medium" : "Low"}</label>
                                                    <input
                                                        type="range"
                                                        min="5"
                                                        max="25"
                                                        value={quality}
                                                        onChange={(e) => setQuality(Number(e.target.value))}
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        {!gifUrl ? (
                                            <>
                                                <button
                                                    onClick={convertToGif}
                                                    disabled={isLoading || !ffmpegLoaded}
                                                    className="flex-1 py-4 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? `Converting... ${progress}%` : "Convert to GIF"}
                                                </button>
                                                <button
                                                    onClick={reset}
                                                    className="px-6 py-4 rounded-xl glass border border-white/10 hover:border-red-500/50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={uploadToSupabase}
                                                    disabled={isUploading}
                                                    className="flex-1 py-4 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all disabled:opacity-50"
                                                >
                                                    {isUploading ? "Uploading..." : "📤 Upload to Storage"}
                                                </button>
                                                <button
                                                    onClick={downloadGif}
                                                    disabled={isUploading}
                                                    className="flex-1 py-4 rounded-xl bg-[#ff4757] hover:bg-[#ff6b81] font-medium transition-all disabled:opacity-50"
                                                >
                                                    📥 Download
                                                </button>
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
                                            <button
                                                onClick={() => setIsUrlMode(false)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!isUrlMode
                                                    ? "bg-white/15 text-white shadow-sm"
                                                    : "text-gray-400 hover:text-gray-300"
                                                    }`}
                                            >
                                                📁 Upload File
                                            </button>
                                            <button
                                                onClick={() => setIsUrlMode(true)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isUrlMode
                                                    ? "bg-white/15 text-white shadow-sm"
                                                    : "text-gray-400 hover:text-gray-300"
                                                    }`}
                                            >
                                                🔗 Import URL
                                            </button>
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
                                                <button
                                                    onClick={handleImageUrlImport}
                                                    disabled={isLoadingUrl || !urlInput.trim()}
                                                    className="px-6 py-3 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoadingUrl ? "..." : "Fetch"}
                                                </button>
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
                                                <button
                                                    onClick={() => setOutputFormat("png")}
                                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${outputFormat === "png"
                                                        ? "bg-[#2ed573] text-white"
                                                        : "glass border border-white/10"
                                                        }`}
                                                >
                                                    PNG
                                                </button>
                                                <button
                                                    onClick={() => setOutputFormat("jpeg")}
                                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${outputFormat === "jpeg"
                                                        ? "bg-[#2ed573] text-white"
                                                        : "glass border border-white/10"
                                                        }`}
                                                >
                                                    JPEG
                                                </button>
                                                <button
                                                    onClick={() => setOutputFormat("webp")}
                                                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${outputFormat === "webp"
                                                        ? "bg-[#2ed573] text-white"
                                                        : "glass border border-white/10"
                                                        }`}
                                                >
                                                    WebP
                                                </button>
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
                                                <button
                                                    onClick={convertImage}
                                                    disabled={isConvertingImage}
                                                    className="flex-1 py-4 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all disabled:opacity-50"
                                                >
                                                    {isConvertingImage ? "Converting..." : "Convert Image"}
                                                </button>
                                                <button
                                                    onClick={resetImage}
                                                    className="px-6 py-4 rounded-xl glass border border-white/10 hover:border-red-500/50 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={uploadImage}
                                                    disabled={isUploading}
                                                    className="flex-1 py-4 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all disabled:opacity-50"
                                                >
                                                    {isUploading ? "Uploading..." : "📤 Upload to Storage"}
                                                </button>
                                                <button
                                                    onClick={downloadImage}
                                                    disabled={isUploading}
                                                    className="flex-1 py-4 rounded-xl bg-[#ff4757] hover:bg-[#ff6b81] font-medium transition-all disabled:opacity-50"
                                                >
                                                    📥 Download
                                                </button>
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
                        <button
                            onClick={() => setErrorMessage(null)}
                            className="w-full py-3 bg-[#ff4757] hover:bg-[#ff6b81] rounded-xl font-medium transition-all"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
