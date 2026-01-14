"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

export default function ConverterPage() {
    const { isSignedIn } = useUser();
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [progress, setProgress] = useState(0);
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [gifSize, setGifSize] = useState<number>(0);
    const [quality, setQuality] = useState(10); // 1-31, lower is better
    const [fps, setFps] = useState(15);
    const [scale, setScale] = useState(480); // Width in pixels
    const [startTime, setStartTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [maxDuration, setMaxDuration] = useState(10);
    const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
    
    const ffmpegRef = useRef(new FFmpeg());
    const videoRef = useRef<HTMLVideoElement>(null);

    // Load FFmpeg
    useEffect(() => {
        const loadFFmpeg = async () => {
            const ffmpeg = ffmpegRef.current;
            
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
                setLoadingMessage("Failed to load converter. Please refresh the page.");
            }
        };

        loadFFmpeg();
    }, []);

    const handleVideoSelect = (file: File) => {
        if (!file.type.startsWith("video/")) {
            alert("Please select a valid video file");
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

    const convertToGif = async () => {
        if (!videoFile || !ffmpegLoaded) return;

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
            const blob = new Blob([data], { type: "image/gif" });
            const url = URL.createObjectURL(blob);
            
            setGifUrl(url);
            setGifSize(blob.size);
            setLoadingMessage("");
            setProgress(100);

            // Cleanup
            await ffmpeg.deleteFile("input.mp4");
            await ffmpeg.deleteFile("output.gif");

        } catch (error) {
            console.error("Conversion error:", error);
            alert("Failed to convert video. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const downloadGif = () => {
        if (!gifUrl) return;
        const a = document.createElement("a");
        a.href = gifUrl;
        a.download = `converted-${Date.now()}.gif`;
        a.click();
    };

    const reset = () => {
        setVideoFile(null);
        setVideoPreview(null);
        setGifUrl(null);
        setProgress(0);
        setStartTime(0);
        setDuration(5);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
                <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="/watermelon.svg" alt="Watermelon" width={28} height={28} />
                                <span className="font-pixel text-xs text-[#ff4757] hidden sm:block">WATERMELON</span>
                            </div>
                            <nav className="flex items-center gap-3">
                                <Link href="/" className="px-4 py-2.5 glass border border-white/10 hover:border-[#5f27cd]/50 rounded-full text-sm font-medium transition-all">
                                    <span className="hidden sm:inline">🏠 Home</span>
                                    <span className="sm:hidden">🏠</span>
                                </Link>
                                <Link href="/imageframe" className="px-4 py-2.5 glass border border-white/10 hover:border-[#ff4757]/50 rounded-full text-sm font-medium transition-all">
                                    <span className="hidden sm:inline">🖼️ ImageFrame</span>
                                    <span className="sm:hidden">🖼️</span>
                                </Link>
                                <Link href="/mods" className="px-4 py-2.5 glass border border-white/10 hover:border-[#ffa502]/50 rounded-full text-sm font-medium transition-all">
                                    <span className="hidden sm:inline">🎮 Mods</span>
                                    <span className="sm:hidden">🎮</span>
                                </Link>
                                <SignedOut>
                                    <SignInButton mode="modal">
                                        <button className="px-4 py-2.5 bg-[#2ed573] hover:bg-[#26de81] rounded-full text-sm font-medium transition-all">
                                            Sign In
                                        </button>
                                    </SignInButton>
                                </SignedOut>
                                <SignedIn>
                                    <UserButton afterSignOutUrl="/" />
                                </SignedIn>
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Main */}
                <main className="pt-24 pb-12 px-4 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="font-pixel text-3xl text-[#ff4757] mb-2">CONVERTER</h1>
                            <p className="text-gray-400">Convert videos to GIF - 100% client-side processing</p>
                            {!ffmpegLoaded && (
                                <p className="text-yellow-400 text-sm mt-2">⚡ Loading converter engine (~30MB, one-time)...</p>
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
                        ) : !videoFile ? (
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
                                                onClick={downloadGif}
                                                className="flex-1 py-4 rounded-xl bg-[#2ed573] hover:bg-[#26de81] font-medium transition-all"
                                            >
                                                📥 Download GIF
                                            </button>
                                            <button
                                                onClick={reset}
                                                className="px-6 py-4 rounded-xl glass border border-white/10 hover:border-[#ffa502]/50 transition-all"
                                            >
                                                Convert Another
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
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
