"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "../components/Header";

const commands = [
    {
        command: "/tpa <player>",
        description: "Request to teleport to another player",
        example: "/tpa Yuii",
        category: "teleport",
        icon: "🚀",
    },
    {
        command: "/tpaccept",
        description: "Accept a teleport request",
        example: "/tpaccept",
        category: "teleport",
        icon: "✅",
    },
    {
        command: "/tpdeny",
        description: "Deny a teleport request",
        example: "/tpdeny",
        category: "teleport",
        icon: "❌",
    },
    {
        command: "/tpacancel",
        description: "Cancel your outgoing teleport request",
        example: "/tpacancel",
        category: "teleport",
        icon: "🚫",
    },
    {
        command: "/tpahere <player>",
        description: "Request a player to teleport to you",
        example: "/tpahere Yuii",
        category: "teleport",
        icon: "📍",
    },
    {
        command: "/back",
        description: "Teleport back to your previous location",
        example: "/back",
        category: "teleport",
        icon: "⏪",
    },
    {
        command: "/spawn",
        description: "Teleport to the server spawn point",
        example: "/spawn",
        category: "teleport",
        icon: "🏠",
    },
    {
        command: "/nick <nickname>",
        description: "Change your display name",
        example: "/nick &cCool&fPlayer",
        category: "social",
        icon: "✏️",
    },
    {
        command: "/afk",
        description: "Toggle AFK status",
        example: "/afk",
        category: "social",
        icon: "💤",
    },
    {
        command: "/mail",
        description: "Send or read mail from other players",
        example: "/mail send Yuii Hello!",
        category: "social",
        icon: "📧",
    },
    {
        command: "/skin <url>",
        description: "Change your skin using a direct image URL",
        example: "/skin https://namemc.com/skin/123456789",
        category: "social",
        icon: "👤",
        extraInfo: {
            title: "How to get skin URL",
            steps: [
                "Go to namemc.com",
                "Search for any skin you like",
                "Click on the skin",
                "Copy the skin URL from your browser",
                "Use the URL in the command"
            ],
            link: "https://namemc.com/minecraft-skins"
        }
    },
    {
        command: "/imageframe create <url> <width> <height>",
        description: "Create an image frame with a direct image URL and custom size",
        example: "/imageframe create https://i.ibb.co/example.jpg 3 2",
        category: "creative",
        icon: "🖼️",
    },
];

export default function CommandsPage() {
    const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

    const copyCommand = async (cmd: string) => {
        try {
            await navigator.clipboard.writeText(cmd);
            setCopiedCommand(cmd);
            setTimeout(() => setCopiedCommand(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const teleportCommands = commands.filter(c => c.category === "teleport");
    const socialCommands = commands.filter(c => c.category === "social");
    const creativeCommands = commands.filter(c => c.category === "creative");

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
                <Header />

                {/* Main Content */}
                <main className="py-12 px-4">
                    <div className="max-w-4xl mx-auto">
                        {/* Title */}
                        <div className="text-center mb-12">
                            <h1 className="font-pixel text-2xl md:text-3xl text-[#ff4757] mb-4">
                                SERVER COMMANDS
                            </h1>
                            <p className="text-gray-400">
                                Essential commands to enhance your gameplay
                            </p>
                        </div>

                        {/* Teleport Commands */}
                        <section className="mb-12">
                            <h2 className="font-pixel text-lg text-[#2ed573] mb-6 flex items-center gap-2">
                                <span>🚀</span> TELEPORT COMMANDS
                            </h2>
                            <div className="grid gap-4">
                                {teleportCommands.map((cmd) => (
                                    <div
                                        key={cmd.command}
                                        className="glass rounded-xl p-5 hover:border-[#2ed573]/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">{cmd.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <code className="font-pixel text-sm text-[#ff4757]">
                                                        {cmd.command}
                                                    </code>
                                                    <button
                                                        onClick={() => copyCommand(cmd.command.split(' ')[0])}
                                                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded glass border border-white/10 hover:border-[#2ed573]/50 transition-all"
                                                    >
                                                        {copiedCommand === cmd.command.split(' ')[0] ? "✓ Copied" : "Copy"}
                                                    </button>
                                                </div>
                                                <p className="text-gray-300 mb-3">{cmd.description}</p>
                                                <div className="glass px-3 py-2 rounded-lg inline-block">
                                                    <p className="text-xs text-gray-500 mb-1">Example:</p>
                                                    <code className="text-sm text-[#2ed573]">{cmd.example}</code>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Social Commands */}
                        <section className="mb-12">
                            <h2 className="font-pixel text-lg text-[#ff6b81] mb-6 flex items-center gap-2">
                                <span>💬</span> SOCIAL COMMANDS
                            </h2>
                            <div className="grid gap-4">
                                {socialCommands.map((cmd: any) => (
                                    <div
                                        key={cmd.command}
                                        className="glass rounded-xl p-5 hover:border-[#ff6b81]/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">{cmd.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <code className="font-pixel text-sm text-[#ff4757]">
                                                        {cmd.command}
                                                    </code>
                                                    <button
                                                        onClick={() => copyCommand(cmd.command.split(' ')[0])}
                                                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded glass border border-white/10 hover:border-[#ff6b81]/50 transition-all"
                                                    >
                                                        {copiedCommand === cmd.command.split(' ')[0] ? "✓ Copied" : "Copy"}
                                                    </button>
                                                </div>
                                                <p className="text-gray-300 mb-3">{cmd.description}</p>
                                                <div className="glass px-3 py-2 rounded-lg inline-block">
                                                    <p className="text-xs text-gray-500 mb-1">Example:</p>
                                                    <code className="text-sm text-[#2ed573]">{cmd.example}</code>
                                                </div>
                                                {cmd.extraInfo && (
                                                    <div className="mt-3 glass p-3 rounded-lg border border-[#ff6b81]/30">
                                                        <p className="text-xs font-bold text-[#ff6b81] mb-2">{cmd.extraInfo.title}:</p>
                                                        <ol className="text-xs text-gray-300 space-y-1 mb-2">
                                                            {cmd.extraInfo.steps.map((step: string, idx: number) => (
                                                                <li key={idx} className="flex items-start gap-2">
                                                                    <span className="text-[#ff6b81]">{idx + 1}.</span>
                                                                    <span>{step}</span>
                                                                </li>
                                                            ))}
                                                        </ol>
                                                        <a
                                                            href={cmd.extraInfo.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs link-external"
                                                        >
                                                            Visit NameMC →
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Creative Commands */}
                        <section className="mb-12">
                            <h2 className="font-pixel text-lg text-[#ffa502] mb-6 flex items-center gap-2">
                                <span>🎨</span> CREATIVE COMMANDS
                            </h2>
                            <div className="grid gap-4">
                                {creativeCommands.map((cmd) => (
                                    <div
                                        key={cmd.command}
                                        className="glass rounded-xl p-5 hover:border-[#ffa502]/50 transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="text-3xl">{cmd.icon}</div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <code className="font-pixel text-sm text-[#ff4757]">
                                                        {cmd.command}
                                                    </code>
                                                    <button
                                                        onClick={() => copyCommand(cmd.command.split(' ')[0])}
                                                        className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded glass border border-white/10 hover:border-[#ffa502]/50 transition-all"
                                                    >
                                                        {copiedCommand === cmd.command.split(' ')[0] ? "✓ Copied" : "Copy"}
                                                    </button>
                                                </div>
                                                <p className="text-gray-300 mb-3">{cmd.description}</p>
                                                <div className="glass px-3 py-2 rounded-lg inline-block">
                                                    <p className="text-xs text-gray-500 mb-1">Example:</p>
                                                    <code className="text-sm text-[#2ed573]">{cmd.example}</code>
                                                </div>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <Link
                                                        href="/imageframe"
                                                        className="text-xs text-[#ffa502] hover:text-[#ff4757] transition-colors flex items-center gap-1"
                                                    >
                                                        <span>📤</span> Upload images here
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Voice Chat Section */}
                        <section className="mb-12">
                            <div className="glass rounded-2xl p-8 border-2 border-[#5f27cd]/30">
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-4">🎤</div>
                                    <h2 className="font-pixel text-xl text-[#5f27cd] mb-3">
                                        VOICE CHAT
                                    </h2>
                                    <p className="text-gray-300">
                                        Talk with your friends in real-time!
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="glass p-4 rounded-xl">
                                        <h3 className="font-pixel text-sm text-[#2ed573] mb-2">📦 Required Mod</h3>
                                        <p className="text-gray-300 mb-2">Simple Voice Chat</p>
                                        <a
                                            href="https://modrinth.com/plugin/simple-voice-chat"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-sm bg-[#ff4757] hover:bg-[#ff6b81] px-4 py-2 rounded-lg transition-all"
                                        >
                                            Download from Modrinth
                                        </a>
                                    </div>

                                    <div className="glass p-4 rounded-xl">
                                        <h3 className="font-pixel text-sm text-[#ffa502] mb-2">⚙️ Installation</h3>
                                        <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                                            <li>Download the mod for your Minecraft version</li>
                                            <li>Place the .jar file in your mods folder</li>
                                            <li>Install Fabric or Forge (mod loader required)</li>
                                            <li>Launch Minecraft and join the server</li>
                                            <li>Press V (default) to toggle voice chat</li>
                                        </ol>
                                    </div>

                                    <div className="glass p-4 rounded-xl">
                                        <h3 className="font-pixel text-sm text-[#ff6b81] mb-2">✨ Features</h3>
                                        <ul className="text-sm text-gray-300 space-y-1">
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span> Proximity voice (players nearby can hear you)
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span> Group channels for private conversations
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span> Adjustable volume and distance
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="text-[#2ed573]">✓</span> Push-to-talk or voice activation
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Back Button */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2ed573] hover:bg-[#26b85f] rounded-xl font-medium transition-all hover:scale-105"
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
