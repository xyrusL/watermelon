"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const performanceMods = [
    {
        name: "Sodium",
        description: "Dramatically improves rendering performance and FPS",
        benefit: "Get 3-5x better FPS compared to vanilla Minecraft",
        icon: "⚡",
        url: "https://modrinth.com/mod/sodium",
    },
    {
        name: "Lithium",
        description: "Optimizes game physics and systems without changing gameplay",
        benefit: "Reduces lag spikes and improves server performance",
        icon: "🔋",
        url: "https://modrinth.com/mod/lithium",
    },
    {
        name: "FerriteCore",
        description: "Reduces memory usage significantly",
        benefit: "Use 50% less RAM - perfect for lower-end PCs",
        icon: "💾",
        url: "https://modrinth.com/mod/ferrite-core",
    },
    {
        name: "EntityCulling",
        description: "Stops rendering entities you can't see",
        benefit: "Big FPS boost in crowded areas",
        icon: "👁️",
        url: "https://modrinth.com/mod/entityculling",
    },
    {
        name: "ImmediatelyFast",
        description: "Optimizes immediate mode rendering",
        benefit: "Faster UI and HUD rendering",
        icon: "🚀",
        url: "https://modrinth.com/mod/immediatelyfast",
    },
    {
        name: "Dynamic FPS",
        description: "Reduces FPS when Minecraft is in background",
        benefit: "Saves power and reduces heat when alt-tabbed",
        icon: "⏸️",
        url: "https://modrinth.com/mod/dynamic-fps",
    },
];

const visualMods = [
    {
        name: "Iris Shaders",
        description: "Enables beautiful shaders with great performance",
        benefit: "Make Minecraft look stunning while keeping high FPS",
        icon: "🎨",
        url: "https://modrinth.com/mod/iris",
    },
    {
        name: "Bobby",
        description: "Increases render distance by caching chunks",
        benefit: "See farther without impacting performance",
        icon: "🔭",
        url: "https://modrinth.com/mod/bobby",
    },
    {
        name: "Sound Physics Remastered",
        description: "Adds realistic sound physics and reverb",
        benefit: "Immersive audio experience in caves and buildings",
        icon: "🔊",
        url: "https://modrinth.com/mod/sound-physics-remastered",
    },
];

const qolMods = [
    {
        name: "AppleSkin",
        description: "Shows food saturation and hunger restored",
        benefit: "Know exactly how much food heals",
        icon: "🍎",
        url: "https://modrinth.com/mod/appleskin",
    },
    {
        name: "Xaero's Minimap",
        description: "Clean minimap and world map",
        benefit: "Never get lost, mark waypoints easily",
        icon: "🗺️",
        url: "https://modrinth.com/mod/xaeros-minimap",
    },
    {
        name: "Fast IP Ping",
        description: "Speeds up server list pinging",
        benefit: "Faster multiplayer menu loading",
        icon: "📡",
        url: "https://modrinth.com/mod/fast-ip-ping",
    },
];

const shaders = [
    {
        name: "BSL Shaders",
        description: "Balanced performance and beauty",
        benefit: "Great for mid-range PCs, vibrant colors",
        icon: "🌅",
        url: "https://modrinth.com/shader/bsl-shaders",
    },
    {
        name: "Complementary Shaders",
        description: "Highly customizable with amazing features",
        benefit: "Best all-around shader pack, tons of settings",
        icon: "✨",
        url: "https://modrinth.com/shader/complementary-reimagined",
    },
    {
        name: "Photon Shaders",
        description: "Lightweight and smooth performance",
        benefit: "Beautiful visuals even on low-end PCs",
        icon: "💡",
        url: "https://modrinth.com/shader/photon-shader",
    },
];

const requiredMods = [
    {
        name: "Fabric API",
        description: "Required library for Fabric mods",
        url: "https://modrinth.com/mod/fabric-api",
    },
];

export default function ModsPage() {
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [minecraftVersion, setMinecraftVersion] = useState<string>("1.21.1");

    const copyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            setCopiedUrl(url);
            setTimeout(() => setCopiedUrl(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Fetch latest Minecraft version
    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const response = await fetch("/api/minecraft-version");
                const data = await response.json();
                if (data.success) {
                    setMinecraftVersion(data.version);
                }
            } catch (err) {
                console.error("Failed to fetch version:", err);
            }
        };
        fetchVersion();
    }, []);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-30"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/70 via-transparent to-[#0d0d0d]" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <header className="py-6 px-4 border-b border-white/5">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src="/watermelon.svg" alt="Watermelon" width={32} height={32} />
                            <span className="font-pixel text-xs text-[#ff4757]">WATERMELON</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/about"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#5f27cd]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">ℹ️ About</span>
                                <span className="sm:hidden">ℹ️</span>
                            </Link>
                            <Link
                                href="/commands"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#2ed573]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">📖 Commands</span>
                                <span className="sm:hidden">📖</span>
                            </Link>
                            <Link
                                href="/imageframe"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#ff4757]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">🖼️ ImageFrame</span>
                                <span className="sm:hidden">🖼️</span>
                            </Link>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-4 py-2.5 bg-[#2ed573] hover:bg-[#26de81] rounded-full text-sm font-medium transition-all hover:scale-105 cursor-pointer">
                                        <span className="hidden sm:inline">🔑 Sign In</span>
                                        <span className="sm:hidden">🔑</span>
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="py-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Title */}
                        <div className="text-center mb-12">
                            <h1 className="font-pixel text-2xl md:text-3xl text-[#ff4757] mb-4">
                                ENHANCE YOUR GAME
                            </h1>
                            <p className="text-gray-400 max-w-2xl mx-auto">
                                Launchers, mods, and shaders to make Minecraft better
                            </p>
                        </div>

                        {/* Launchers Section */}
                        <section className="mb-16">
                            <h2 className="font-pixel text-2xl text-[#ff4757] mb-8 text-center">
                                🎮 RECOMMENDED LAUNCHERS
                            </h2>

                            {/* Premium Launchers */}
                            <div className="mb-8">
                                <h3 className="font-pixel text-lg text-[#ffa502] mb-4 flex items-center gap-2">
                                    <span>👑</span> FOR PREMIUM PLAYERS
                                </h3>
                                <div className="glass rounded-2xl p-6 border-2 border-[#ffa502]/30">
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="text-4xl">🌙</div>
                                        <div className="flex-1">
                                            <h4 className="font-pixel text-lg text-white mb-2">Lunar Client</h4>
                                            <p className="text-gray-300 text-sm mb-3">
                                                Popular PvP-focused launcher with built-in mods and cosmetics
                                            </p>
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className="glass px-3 py-1 rounded-full text-xs text-[#2ed573]">✓ Built-in FPS boost</span>
                                                <span className="glass px-3 py-1 rounded-full text-xs text-[#2ed573]">✓ Free cosmetics</span>
                                                <span className="glass px-3 py-1 rounded-full text-xs text-[#2ed573]">✓ Simple setup</span>
                                            </div>
                                            <a
                                                href="https://www.lunarclient.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-6 py-2 bg-[#ffa502] hover:bg-[#ff8c00] rounded-lg text-sm font-medium transition-all"
                                            >
                                                Download Lunar Client
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Cracked Launchers */}
                            <div className="mb-8">
                                <h3 className="font-pixel text-lg text-[#5f27cd] mb-4 flex items-center gap-2">
                                    <span>🔓</span> FOR NON-PREMIUM PLAYERS
                                </h3>
                                
                                {/* SKLauncher */}
                                <div className="glass rounded-2xl p-6 border-2 border-[#5f27cd]/30 mb-4">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="text-4xl">🚀</div>
                                        <div className="flex-1">
                                            <h4 className="font-pixel text-lg text-white mb-2">SKLauncher (Recommended)</h4>
                                            <p className="text-gray-300 text-sm mb-4">
                                                Clean, safe, and easy to use. Best for beginners.
                                            </p>
                                            <a
                                                href="https://skmedix.pl/sklauncher"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-6 py-2 bg-[#5f27cd] hover:bg-[#341f97] rounded-lg text-sm font-medium transition-all mb-6"
                                            >
                                                Download SKLauncher
                                            </a>
                                        </div>
                                    </div>

                                    {/* Setup Guide */}
                                    <div className="glass p-5 rounded-xl mb-4">
                                        <h5 className="font-pixel text-sm text-[#2ed573] mb-3">📖 Setup Guide</h5>
                                        <ol className="text-sm text-gray-300 space-y-2">
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">1.</span>
                                                <span>Download and install SKLauncher from the link above</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">2.</span>
                                                <span>Open SKLauncher and create an account (any username/password - stored locally)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">3.</span>
                                                <span>Select version: <code className="text-[#ff4757] px-1 bg-black/30 rounded">{minecraftVersion}</code> (our server version)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">4.</span>
                                                <span>Click "Install Fabric" button on the version selection page</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">5.</span>
                                                <span>Wait for Fabric to install, then click "Play"</span>
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Mod Installation Guide */}
                                    <div className="glass p-5 rounded-xl">
                                        <h5 className="font-pixel text-sm text-[#ffa502] mb-3">📦 How to Install Mods</h5>
                                        <ol className="text-sm text-gray-300 space-y-2">
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">1.</span>
                                                <span>Download mods from the sections below (save .jar files)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">2.</span>
                                                <span>In SKLauncher, click "Folder" button (near Play button)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">3.</span>
                                                <span>Open the <code className="text-[#2ed573] px-1 bg-black/30 rounded">mods</code> folder</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">4.</span>
                                                <span>Copy all downloaded .jar files into this folder</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">5.</span>
                                                <span>Close the folder and click "Play" - mods will load automatically!</span>
                                            </li>
                                        </ol>
                                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                            <p className="text-xs text-blue-300">
                                                💡 <strong>Tip:</strong> You must install Fabric first before adding mods!
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* TLauncher */}
                                <div className="glass rounded-2xl p-6 border-2 border-[#5f27cd]/30">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="text-4xl">🎯</div>
                                        <div className="flex-1">
                                            <h4 className="font-pixel text-lg text-white mb-2">TLegacy Launcher</h4>
                                            <p className="text-gray-300 text-sm mb-4">
                                                Alternative option, similar features to SKLauncher
                                            </p>
                                            <a
                                                href="https://tlauncher.org/en/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-block px-6 py-2 bg-[#5f27cd] hover:bg-[#341f97] rounded-lg text-sm font-medium transition-all mb-6"
                                            >
                                                Download TLauncher
                                            </a>
                                        </div>
                                    </div>

                                    {/* Setup Guide */}
                                    <div className="glass p-5 rounded-xl mb-4">
                                        <h5 className="font-pixel text-sm text-[#2ed573] mb-3">📖 Setup Guide</h5>
                                        <ol className="text-sm text-gray-300 space-y-2">
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">1.</span>
                                                <span>Download and install TLauncher</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">2.</span>
                                                <span>Open TLauncher and enter any username (no account needed)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">3.</span>
                                                <span>Click version dropdown and select <code className="text-[#ff4757] px-1 bg-black/30 rounded">{minecraftVersion}</code></span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">4.</span>
                                                <span>In version list, find and select <code className="text-[#2ed573] px-1 bg-black/30 rounded">Fabric {minecraftVersion}</code></span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#5f27cd] font-bold min-w-[20px]">5.</span>
                                                <span>Click "Install" and wait, then click "Play"</span>
                                            </li>
                                        </ol>
                                    </div>

                                    {/* Mod Installation Guide */}
                                    <div className="glass p-5 rounded-xl">
                                        <h5 className="font-pixel text-sm text-[#ffa502] mb-3">📦 How to Install Mods</h5>
                                        <ol className="text-sm text-gray-300 space-y-2">
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">1.</span>
                                                <span>Download mods from sections below (get .jar files)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">2.</span>
                                                <span>In TLauncher, click the folder icon at the bottom</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">3.</span>
                                                <span>Navigate to <code className="text-[#2ed573] px-1 bg-black/30 rounded">mods</code> folder (create it if it doesn't exist)</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">4.</span>
                                                <span>Paste all .jar mod files here</span>
                                            </li>
                                            <li className="flex items-start gap-3">
                                                <span className="text-[#ffa502] font-bold min-w-[20px]">5.</span>
                                                <span>Restart Minecraft - mods will load!</span>
                                            </li>
                                        </ol>
                                        <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                            <p className="text-xs text-yellow-300">
                                                ⚠️ <strong>Important:</strong> Make sure you selected Fabric version, not vanilla!
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Server Info Box */}
                            <div className="glass p-6 rounded-xl border-2 border-[#2ed573]/30">
                                <h4 className="font-pixel text-sm text-[#2ed573] mb-2 flex items-center gap-2">
                                    <span>ℹ️</span> SERVER VERSION
                                </h4>
                                <p className="text-gray-300 text-sm">
                                    Our server runs <strong className="text-white">Minecraft {minecraftVersion}</strong> with <strong className="text-[#2ed573]">Fabric</strong>. 
                                    Make sure to select this exact version in your launcher!
                                </p>
                            </div>
                        </section>

                        {/* Required Mods Notice */}
                        <div className="mb-12 glass rounded-2xl p-6 border-2 border-[#ff4757]/30">
                            <h3 className="font-pixel text-lg text-[#ff4757] mb-4 flex items-center gap-2">
                                <span>⚠️</span> REQUIRED
                            </h3>
                            <p className="text-gray-300 mb-4">You need Fabric Loader and Fabric API to use these mods</p>
                            {requiredMods.map((mod) => (
                                <a
                                    key={mod.name}
                                    href={mod.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 bg-[#ff4757] hover:bg-[#ff6b81] rounded-lg font-medium transition-all mr-3"
                                >
                                    Download {mod.name}
                                </a>
                            ))}
                        </div>

                        {/* Performance Mods */}
                        <section className="mb-16">
                            <h2 className="font-pixel text-xl text-[#2ed573] mb-2 flex items-center gap-2">
                                <span>⚡</span> PERFORMANCE OPTIMIZATION
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Essential mods to boost FPS and reduce lag</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {performanceMods.map((mod) => (
                                    <div
                                        key={mod.name}
                                        className="glass rounded-xl p-5 hover:border-[#2ed573]/50 transition-all"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="text-3xl">{mod.icon}</div>
                                            <div className="flex-1">
                                                <h3 className="font-pixel text-sm text-white mb-2">{mod.name}</h3>
                                                <p className="text-gray-300 text-sm mb-2">{mod.description}</p>
                                                <div className="glass px-3 py-2 rounded-lg inline-block mb-3">
                                                    <p className="text-xs text-[#2ed573]">✓ {mod.benefit}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={mod.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-center py-2 bg-[#2ed573] hover:bg-[#26b85f] rounded-lg text-sm font-medium transition-all"
                                        >
                                            Download from Modrinth
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Visual Enhancement Mods */}
                        <section className="mb-16">
                            <h2 className="font-pixel text-xl text-[#ffa502] mb-2 flex items-center gap-2">
                                <span>🎨</span> VISUAL ENHANCEMENTS
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Make Minecraft look and sound amazing</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {visualMods.map((mod) => (
                                    <div
                                        key={mod.name}
                                        className="glass rounded-xl p-5 hover:border-[#ffa502]/50 transition-all"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="text-3xl">{mod.icon}</div>
                                            <div className="flex-1">
                                                <h3 className="font-pixel text-sm text-white mb-2">{mod.name}</h3>
                                                <p className="text-gray-300 text-sm mb-2">{mod.description}</p>
                                                <div className="glass px-3 py-2 rounded-lg inline-block mb-3">
                                                    <p className="text-xs text-[#ffa502]">✓ {mod.benefit}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={mod.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-center py-2 bg-[#ffa502] hover:bg-[#ff8c00] rounded-lg text-sm font-medium transition-all"
                                        >
                                            Download from Modrinth
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Quality of Life Mods */}
                        <section className="mb-16">
                            <h2 className="font-pixel text-xl text-[#5f27cd] mb-2 flex items-center gap-2">
                                <span>✨</span> QUALITY OF LIFE
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Helpful features that improve gameplay</p>
                            <div className="grid md:grid-cols-2 gap-4">
                                {qolMods.map((mod) => (
                                    <div
                                        key={mod.name}
                                        className="glass rounded-xl p-5 hover:border-[#5f27cd]/50 transition-all"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="text-3xl">{mod.icon}</div>
                                            <div className="flex-1">
                                                <h3 className="font-pixel text-sm text-white mb-2">{mod.name}</h3>
                                                <p className="text-gray-300 text-sm mb-2">{mod.description}</p>
                                                <div className="glass px-3 py-2 rounded-lg inline-block mb-3">
                                                    <p className="text-xs text-[#5f27cd]">✓ {mod.benefit}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <a
                                            href={mod.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-center py-2 bg-[#5f27cd] hover:bg-[#341f97] rounded-lg text-sm font-medium transition-all"
                                        >
                                            Download from Modrinth
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Shaders */}
                        <section className="mb-16">
                            <h2 className="font-pixel text-xl text-[#ff6b81] mb-2 flex items-center gap-2">
                                <span>🌟</span> SHADER PACKS
                            </h2>
                            <p className="text-gray-400 text-sm mb-6">Transform Minecraft with stunning lighting and effects (Requires Iris)</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                {shaders.map((shader) => (
                                    <div
                                        key={shader.name}
                                        className="glass rounded-xl p-5 hover:border-[#ff6b81]/50 transition-all"
                                    >
                                        <div className="text-center mb-4">
                                            <div className="text-4xl mb-3">{shader.icon}</div>
                                            <h3 className="font-pixel text-sm text-white mb-2">{shader.name}</h3>
                                            <p className="text-gray-300 text-xs mb-2">{shader.description}</p>
                                            <div className="glass px-3 py-2 rounded-lg inline-block mb-3">
                                                <p className="text-xs text-[#ff6b81]">{shader.benefit}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={shader.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-center py-2 bg-[#ff6b81] hover:bg-[#ff4757] rounded-lg text-sm font-medium transition-all"
                                        >
                                            Download
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Launcher Optimization */}
                        <section className="mb-12">
                            <div className="glass rounded-2xl p-8 border-2 border-[#2ed573]/30">
                                <h2 className="font-pixel text-xl text-[#2ed573] mb-6 flex items-center gap-2">
                                    <span>🚀</span> LAUNCHER OPTIMIZATION
                                </h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="glass p-5 rounded-xl">
                                        <h3 className="font-pixel text-sm text-white mb-3">💾 Allocate More RAM</h3>
                                        <ul className="text-sm text-gray-300 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#2ed573] mt-0.5">1.</span>
                                                <span>Open launcher settings / Edit profile</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#2ed573] mt-0.5">2.</span>
                                                <span>Find JVM Arguments</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-[#2ed573] mt-0.5">3.</span>
                                                <span>Change <code className="text-[#ff4757] px-1">-Xmx2G</code> to <code className="text-[#2ed573] px-1">-Xmx4G</code> (4GB RAM)</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-yellow-500 mt-0.5">⚠️</span>
                                                <span className="text-xs text-gray-400">Don't allocate more than 8GB or it can cause lag</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="glass p-5 rounded-xl">
                                        <h3 className="font-pixel text-sm text-white mb-3">⚙️ Recommended Settings</h3>
                                        <ul className="text-sm text-gray-300 space-y-2">
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span>
                                                <span>Use Java 21 for Minecraft 1.21+</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span>
                                                <span>Enable VSync to prevent screen tearing</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span>
                                                <span>Set render distance to 12-16 chunks</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span>
                                                <span>Close other apps while playing</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="glass p-5 rounded-xl md:col-span-2">
                                        <h3 className="font-pixel text-sm text-white mb-3">📦 Installation Guide</h3>
                                        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                                            <li>Install Fabric Loader from <a href="https://fabricmc.net/" target="_blank" className="link-primary">fabricmc.net</a></li>
                                            <li>Download all mods from links above (save to a folder)</li>
                                            <li>Find your <code className="text-[#ff4757] px-1">.minecraft/mods</code> folder</li>
                                            <li>Copy all downloaded .jar files into the mods folder</li>
                                            <li>Launch Minecraft with Fabric profile</li>
                                            <li>Install shaders: Options → Video Settings → Shader Packs → Open Shader Packs Folder</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Back Button */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff4757] hover:bg-[#ff6b81] rounded-xl font-medium transition-all hover:scale-105"
                            >
                                ← Back to Home
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
