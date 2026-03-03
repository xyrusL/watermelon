"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import Header from "../components/Header";
import ActionButton from "../components/ActionButton";
import ActionLink from "../components/ActionLink";
import AuthRequiredCard from "../components/AuthRequiredCard";

type ServerCredentials = {
    username: string;
    password: string;
};

const COMMUNITY_ROLES = new Set(["admin", "member", "moderator"]);

export default function AboutPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [copiedUsername, setCopiedUsername] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [credentials, setCredentials] = useState<ServerCredentials | null>(null);
    const [credentialsLoading, setCredentialsLoading] = useState(false);
    const [credentialsError, setCredentialsError] = useState<string | null>(null);
    const [showHearts, setShowHearts] = useState(false);
    const [hearts, setHearts] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
    const messageRef = useRef<HTMLDivElement>(null);
    const hasTriggered = useRef(false);
    const userRole = typeof user?.publicMetadata?.role === "string"
        ? user.publicMetadata.role.toLowerCase()
        : "";
    const hasCommunityAccess = Boolean(isSignedIn && COMMUNITY_ROLES.has(userRole));

    const copyToClipboard = async (text: string, type: 'username' | 'password') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'username') {
                setCopiedUsername(true);
                setTimeout(() => setCopiedUsername(false), 2000);
            } else {
                setCopiedPassword(true);
                setTimeout(() => setCopiedPassword(false), 2000);
            }
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasTriggered.current) {
                        hasTriggered.current = true;

                        // Delay the heart shower slightly for dramatic effect
                        setTimeout(() => {
                            setShowHearts(true);

                            // Create 50 hearts across the screen
                            const newHearts = Array.from({ length: 50 }, (_, i) => ({
                                id: Date.now() + i,
                                x: Math.random() * 100,
                                y: Math.random() * 100,
                                delay: Math.random() * 0.5,
                            }));
                            setHearts(newHearts);

                            // Hide hearts after animation
                            setTimeout(() => {
                                setShowHearts(false);
                            }, 5000);
                        }, 500);
                    }
                });
            },
            { threshold: 0.5 } // Trigger when 50% of the section is visible
        );

        if (messageRef.current) {
            observer.observe(messageRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isLoaded || !isSignedIn || !hasCommunityAccess) {
            setCredentials(null);
            setCredentialsLoading(false);
            setCredentialsError(null);
            return;
        }

        const controller = new AbortController();

        const loadCredentials = async () => {
            setCredentialsLoading(true);
            setCredentialsError(null);

            try {
                const response = await fetch("/api/minecraft/server-access", {
                    method: "GET",
                    signal: controller.signal,
                });
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Unable to load server credentials");
                }

                setCredentials({
                    username: data.username,
                    password: data.password,
                });
            } catch (error) {
                if ((error as Error).name === "AbortError") {
                    return;
                }

                setCredentials(null);
                setCredentialsError(
                    error instanceof Error ? error.message : "Unable to load server credentials"
                );
            } finally {
                setCredentialsLoading(false);
            }
        };

        loadCredentials();

        return () => controller.abort();
    }, [isLoaded, isSignedIn, hasCommunityAccess]);

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-30"
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
                            <div className="text-5xl mb-4">🍉</div>
                            <h1 className="font-pixel text-2xl md:text-3xl text-[#ff4757] mb-4">
                                ABOUT WATERMELON SMP
                            </h1>
                            <p className="text-gray-400">
                                Our story and how to keep the server running
                            </p>
                        </div>

                        {/* Our Story */}
                        <section className="mb-12">
                            <div className="glass rounded-2xl p-8 border-2 border-[#2ed573]/30">
                                <h2 className="font-pixel text-xl text-[#2ed573] mb-6 flex items-center gap-2">
                                    <span>📖</span> OUR STORY
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p className="leading-relaxed">
                                        Watermelon SMP started as a group of friends who met in college 🎓. What began as casual
                                        gaming sessions between classes has turned into something special - a community built on
                                        friendship, creativity, and countless Minecraft adventures ⛏️.
                                    </p>
                                    <p className="leading-relaxed">
                                        From our first survival base 🏠 to elaborate builds and community projects, we&apos;ve been
                                        through it all together. Late-night mining sessions 🌙, epic PvP battles ⚔️, ambitious
                                        redstone contraptions 🔴, and everything in between.
                                    </p>
                                    <p className="leading-relaxed">
                                        Even though we&apos;ve graduated and moved on to different paths 🛤️, Minecraft keeps us
                                        connected. This server is our digital home 🏡 where we continue to create memories,
                                        share laughs 😄, and build together.
                                    </p>
                                    <div className="glass p-4 rounded-xl mt-6 border border-[#ff4757]/30">
                                        <p className="text-center text-white font-medium">
                                            We&apos;re more than just a server - we&apos;re a family! 💚
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Server Info */}
                        <section className="mb-12">
                            <div className="glass rounded-2xl p-8 border-2 border-[#ffa502]/30">
                                <h2 className="font-pixel text-xl text-[#ffa502] mb-6 flex items-center gap-2">
                                    <span>🖥️</span> SERVER HOSTING
                                </h2>
                                <div className="space-y-6">
                                    <p className="text-gray-300">
                                        Our server runs on <strong className="text-white">Aternos</strong> - a free Minecraft ⚡
                                        server hosting service. This means the server may be offline 😴 when no one is playing
                                        to save resources.
                                    </p>

                                    <SignedOut>
                                        <AuthRequiredCard
                                            description="Sign in first to view private server-start access details."
                                            postAuthAction="check the server hosting credentials"
                                        />
                                    </SignedOut>

                                    <SignedIn>
                                        {!isLoaded ? (
                                            <div className="glass p-6 rounded-xl border border-[#ffa502]/40">
                                                <p className="text-sm text-gray-300">Checking your community access...</p>
                                            </div>
                                        ) : hasCommunityAccess ? (
                                            <div className="glass p-6 rounded-xl border border-[#ff4757]/30">
                                                <h3 className="font-pixel text-sm text-[#ff4757] mb-4 flex items-center gap-2">
                                                    <span>⚠️</span> SERVER OFFLINE?
                                                </h3>
                                                <p className="text-sm text-gray-300 mb-4">
                                                    If you try to join and the server is offline 🔌, you can start it manually!
                                                    Here&apos;s how:
                                                </p>
                                                <ol className="text-sm text-gray-300 space-y-2 mb-6">
                                                    <li className="flex items-start gap-3">
                                                        <span className="text-[#ffa502] font-bold min-w-[20px]">1.</span>
                                                        <span>Go to <a href="https://aternos.org/" target="_blank" rel="noopener noreferrer" className="link-primary">aternos.org</a></span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <span className="text-[#ffa502] font-bold min-w-[20px]">2.</span>
                                                        <span>Log in using the credentials below</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <span className="text-[#ffa502] font-bold min-w-[20px]">3.</span>
                                                        <span>Click the green &quot;Start&quot; button</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <span className="text-[#ffa502] font-bold min-w-[20px]">4.</span>
                                                        <span>Wait 2-5 minutes for the server to start</span>
                                                    </li>
                                                    <li className="flex items-start gap-3">
                                                        <span className="text-[#ffa502] font-bold min-w-[20px]">5.</span>
                                                        <span>Join and have fun!</span>
                                                    </li>
                                                </ol>

                                                {credentialsLoading && (
                                                    <div className="glass p-4 rounded-lg border border-[#ffa502]/40 mb-4">
                                                        <p className="text-sm text-gray-300">Loading server credentials...</p>
                                                    </div>
                                                )}

                                                {credentialsError && (
                                                    <div className="glass p-4 rounded-lg border border-[#ff4757]/40 mb-4">
                                                        <p className="text-sm text-[#ff6b81]">{credentialsError}</p>
                                                    </div>
                                                )}

                                                {credentials && (
                                                    <>
                                                        <div className="glass p-4 rounded-lg mb-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-xs text-gray-400">Username:</span>
                                                                <ActionButton
                                                                    onClick={() => copyToClipboard(credentials.username, "username")}
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="hover:border-[#2ed573]/50"
                                                                >
                                                                    {copiedUsername ? "✓ Copied" : "Copy"}
                                                                </ActionButton>
                                                            </div>
                                                            <code className="text-sm text-[#2ed573] break-all">{credentials.username}</code>
                                                        </div>

                                                        <div className="glass p-4 rounded-lg">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-xs text-gray-400">Password:</span>
                                                                <ActionButton
                                                                    onClick={() => copyToClipboard(credentials.password, "password")}
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="hover:border-[#2ed573]/50"
                                                                >
                                                                    {copiedPassword ? "✓ Copied" : "Copy"}
                                                                </ActionButton>
                                                            </div>
                                                            <code className="text-sm text-[#2ed573] break-all">{credentials.password}</code>
                                                        </div>

                                                        <p className="text-xs text-gray-500 mt-4">
                                                            🔒 Credentials are only visible to approved community members.
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="glass p-6 rounded-xl border border-[#ff4757]/30">
                                                <h3 className="font-pixel text-sm text-[#ff4757] mb-4 flex items-center gap-2">
                                                    <span>🔒</span> COMMUNITY ACCESS ONLY
                                                </h3>
                                                <p className="text-sm text-gray-300">
                                                    You&apos;re signed in, but this section is restricted to approved Watermelon SMP
                                                    community members. Ask an admin to set your role to member.
                                                </p>
                                            </div>
                                        )}
                                    </SignedIn>
                                </div>
                            </div>
                        </section>

                        {/* Thank You Message */}
                        <section className="mb-12" ref={messageRef}>
                            <div className="glass rounded-2xl p-8 border-2 border-[#ff6b81]/30 relative">
                                <h2 className="font-pixel text-xl text-[#ff6b81] mb-6 flex items-center gap-2">
                                    <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
                                        <path d="M50 85 L20 55 Q15 50 15 40 Q15 25 25 20 Q35 15 45 25 L50 30 L55 25 Q65 15 75 20 Q85 25 85 40 Q85 50 80 55 Z" fill="currentColor" className="text-[#ff6b81]" />
                                        <path d="M50 78 L28 56 Q24 52 24 44 Q24 32 32 28 Q40 24 46 32 L50 36 L54 32 Q60 24 68 28 Q76 32 76 44 Q76 52 72 56 Z" fill="currentColor" className="text-[#ff4757]" />
                                    </svg>
                                    A MESSAGE FROM JEPOT
                                </h2>
                                <div className="space-y-4 text-gray-300">
                                    <p className="leading-relaxed italic">
                                        &quot;To my amazing friends Yuii, Peach, and unknown0607 👥,
                                    </p>
                                    <p className="leading-relaxed italic">
                                        Thank you for making this journey unforgettable ✨. From our late-night study sessions 📚
                                        that turned into Minecraft marathons, to the builds we&apos;ve created 🏗️ and the memories
                                        we&apos;ve made - you guys are the best.
                                    </p>
                                    <p className="leading-relaxed italic">
                                        This server wouldn&apos;t be the same without your creativity 🎨, humor 😂, and friendship 🤝.
                                        Here&apos;s to many more adventures together in our blocky world!
                                    </p>
                                    <div className="flex items-center justify-end gap-3 mt-8">
                                        <span className="text-gray-400 italic">-</span>
                                        <span className="font-pixel text-lg text-[#2ed573] tracking-wider">
                                            JEPOT
                                        </span>
                                        <span className="text-2xl">🛡️</span>
                                    </div>
                                </div>

                                {/* Heart Shower Animation */}
                                {showHearts && (
                                    <div className="fixed inset-0 pointer-events-none z-50">
                                        {hearts.map((heart) => (
                                            <div
                                                key={heart.id}
                                                className="absolute animate-[float-hearts_5s_ease-out_forwards] animation-will-change"
                                                style={{
                                                    left: `${heart.x}%`,
                                                    top: `${heart.y}%`,
                                                    animationDelay: `${heart.delay}s`,
                                                }}
                                            >
                                                <svg className="w-8 h-8 md:w-12 md:h-12" viewBox="0 0 100 100" fill="none">
                                                    <path
                                                        d="M50 85 L20 55 Q15 50 15 40 Q15 25 25 20 Q35 15 45 25 L50 30 L55 25 Q65 15 75 20 Q85 25 85 40 Q85 50 80 55 Z"
                                                        fill="currentColor"
                                                        className="text-[#ff6b81]"
                                                        style={{
                                                            filter: 'drop-shadow(0 0 10px rgba(255, 107, 129, 0.8))',
                                                        }}
                                                    />
                                                </svg>
                                            </div>
                                        ))}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center animate-[scale-bounce_1s_ease-out] animation-will-change">
                                                <p className="text-4xl md:text-6xl font-pixel text-[#ff6b81] mb-4" style={{
                                                    textShadow: '0 0 20px rgba(255, 107, 129, 0.8), 0 0 40px rgba(255, 107, 129, 0.6)',
                                                }}>
                                                    💖 FOR YUII & PEACH 💖
                                                </p>
                                                <p className="text-xl md:text-2xl text-white" style={{
                                                    textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                                                }}>
                                                    Thanks for being awesome! ✨
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </section>

                        {/* Join Us */}
                        <section className="mb-12">
                            <div className="glass rounded-2xl p-8 text-center border-2 border-[#5f27cd]/30">
                                <div className="text-5xl mb-4">🎉</div>
                                <h2 className="font-pixel text-xl text-[#5f27cd] mb-4">
                                    JOIN OUR COMMUNITY!
                                </h2>
                                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                                    We&apos;re always happy to welcome new friends to Watermelon SMP 🍉! Whether you&apos;re
                                    a builder 👷, explorer 🗺️, redstone enthusiast 🔴, or just looking for a fun community
                                    to play with 🎮 - there&apos;s a place for you here.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <ActionLink href="/" variant="primary" size="lg" className="px-8 py-4 hover:scale-105">
                                        <span>🏠</span> Back to Home
                                    </ActionLink>
                                    <Link
                                        href="/commands"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#5f27cd] hover:bg-[#341f97] rounded-xl font-medium transition-all hover:scale-105"
                                    >
                                        <span>📖</span> View Commands
                                    </Link>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
