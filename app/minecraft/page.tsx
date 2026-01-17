"use client";

import Image from "next/image";
import Header from "../components/Header";
import { useState, useEffect } from "react";

export default function MinecraftPage() {
    const downloadUrl = "https://mcpedl.org/uploads_files/08-01-2026/minecraft-1-21-132.apk";
    const version = "1.21.132";

    // Download state
    const [isCooldown, setIsCooldown] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isCooldown && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsCooldown(false);
            setTimeLeft(5);
        }
        return () => clearInterval(timer);
    }, [isCooldown, timeLeft]);

    const handleDownload = () => {
        if (isCooldown) return;

        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `minecraft-pe-${version}.apk`;
        a.click();

        setIsCooldown(true);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/watermelon-bg.png"
                    alt="Watermelon Minecraft Background"
                    fill
                    className="object-cover opacity-50"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/30 via-[#0d0d0d]/60 to-[#0d0d0d]" />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <Header variant="fixed" />

                {/* Main */}
                <main className="pt-32 pb-12 px-4 min-h-screen">
                    <div className="max-w-3xl mx-auto text-center">
                        {/* Title */}
                        <div className="mb-8">
                            <div className="text-7xl sm:text-8xl mb-4">🍉</div>
                            <h1 className="font-pixel text-3xl sm:text-4xl lg:text-5xl text-[#ff4757] mb-4 px-4">
                                MINECRAFT PE
                            </h1>
                            <p className="text-xl sm:text-2xl text-[#2ed573] font-medium px-4">
                                Pocket Edition for Android
                            </p>
                        </div>

                        {/* Description Card */}
                        <div className="glass rounded-2xl p-6 sm:p-8 border border-white/10 mb-8 text-left">
                            <h2 className="font-pixel text-lg text-[#ff4757] mb-4">🎮 ABOUT</h2>
                            <p className="text-gray-300 leading-relaxed mb-4">
                                Experience the beloved block-building adventure on your mobile device!
                                Minecraft Pocket Edition lets you craft, build, and explore infinite worlds
                                wherever you go. Now with extra melon goodness!
                            </p>
                            <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2">
                                    <span className="text-[#2ed573]">✓</span> Create and survive in procedurally generated worlds
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#2ed573]">✓</span> Build anything you can imagine block by block
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#2ed573]">✓</span> Play with friends via multiplayer
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-[#2ed573]">✓</span> Explore caves, fight mobs, and collect resources
                                </li>
                            </ul>
                        </div>

                        {/* Download Section */}
                        <div className="space-y-4">
                            <p className="font-pixel text-sm text-gray-400 mb-2">DOWNLOAD OPTIONS</p>

                            {/* Play Store Option */}
                            <a
                                href="https://play.google.com/store/apps/details?id=com.mojang.minecraftpe"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="glass rounded-xl p-4 sm:p-5 border border-[#2ed573]/20 hover:border-[#2ed573]/50 flex items-center justify-between gap-4 transition-all group cursor-pointer block"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="text-3xl">🏪</span>
                                    <div className="text-left">
                                        <p className="font-medium text-white group-hover:text-[#2ed573] transition-colors">
                                            Official Play Store
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Buy the official version
                                        </p>
                                    </div>
                                </div>
                                <div className="flex-shrink-0 px-4 py-2 rounded-lg bg-[#2ed573]/10 group-hover:bg-[#2ed573] text-[#2ed573] group-hover:text-white text-sm font-medium transition-all">
                                    Open
                                </div>
                            </a>

                            {/* APK Download Option */}
                            <div className="glass rounded-xl p-4 sm:p-5 border-2 border-[#ff4757]/30 bg-[#ff4757]/5">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">📥</span>
                                        <div className="text-left">
                                            <p className="font-medium text-white">
                                                Direct APK Download
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                v{version} • Free
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        disabled={isCooldown}
                                        className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all transform flex items-center justify-center gap-2 ${isCooldown
                                            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                                            : "bg-[#ff4757] hover:bg-[#ff6b81] hover:scale-105 shadow-lg shadow-[#ff4757]/30"
                                            }`}
                                    >
                                        {isCooldown ? (
                                            <>
                                                <span>⏳</span>
                                                Wait {timeLeft}s...
                                            </>
                                        ) : (
                                            <>
                                                <span>📥</span>
                                                Download APK
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <p className="text-xs text-gray-500 mt-6 px-4">
                            ⚠️ Make sure to enable "Install from Unknown Sources" in your Android settings before installing the APK.
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
