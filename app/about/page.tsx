"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function AboutPage() {
    const [copiedUsername, setCopiedUsername] = useState(false);
    const [copiedPassword, setCopiedPassword] = useState(false);
    const [showHearts, setShowHearts] = useState(false);
    const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
    const messageRef = useRef<HTMLDivElement>(null);
    const hasTriggered = useRef(false);

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
                                href="/mods"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#ffa502]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">🎮 Mods</span>
                                <span className="sm:hidden">🎮</span>
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
                                        From our first survival base 🏠 to elaborate builds and community projects, we've been 
                                        through it all together. Late-night mining sessions 🌙, epic PvP battles ⚔️, ambitious 
                                        redstone contraptions 🔴, and everything in between.
                                    </p>
                                    <p className="leading-relaxed">
                                        Even though we've graduated and moved on to different paths 🛤️, Minecraft keeps us 
                                        connected. This server is our digital home 🏡 where we continue to create memories, 
                                        share laughs 😄, and build together.
                                    </p>
                                    <div className="glass p-4 rounded-xl mt-6 border border-[#ff4757]/30">
                                        <p className="text-center text-white font-medium">
                                            We're more than just a server - we're a family! 💚
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

                                    <div className="glass p-6 rounded-xl border border-[#ff4757]/30">
                                        <h3 className="font-pixel text-sm text-[#ff4757] mb-4 flex items-center gap-2">
                                            <span>⚠️</span> SERVER OFFLINE?
                                        </h3>
                                        <p className="text-sm text-gray-300 mb-4">
                                            If you try to join and the server is offline 🔌, you can start it manually! 
                                            Here's how:
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
                                                <span>Click the green "Start" button</span>
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

                                        <div className="glass p-4 rounded-lg mb-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-400">Username:</span>
                                                <button
                                                    onClick={() => copyToClipboard('chocolateCreamLang', 'username')}
                                                    className="text-xs px-3 py-1 rounded glass border border-white/10 hover:border-[#2ed573]/50 transition-all"
                                                >
                                                    {copiedUsername ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>
                                            <code className="text-sm text-[#2ed573] break-all">chocolateCreamLang</code>
                                        </div>

                                        <div className="glass p-4 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-xs text-gray-400">Password:</span>
                                                <button
                                                    onClick={() => copyToClipboard('chochoco1234', 'password')}
                                                    className="text-xs px-3 py-1 rounded glass border border-white/10 hover:border-[#2ed573]/50 transition-all"
                                                >
                                                    {copiedPassword ? '✓ Copied' : 'Copy'}
                                                </button>
                                            </div>
                                            <code className="text-sm text-[#2ed573] break-all">chochoco1234</code>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-4">
                                            💡 Feel free to use these credentials to start the server anytime!
                                        </p>
                                    </div>
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
                                        "To my amazing friends Yuii, Peach, and unknown0607 👥,
                                    </p>
                                    <p className="leading-relaxed italic">
                                        Thank you for making this journey unforgettable ✨. From our late-night study sessions 📚 
                                        that turned into Minecraft marathons, to the builds we've created 🏗️ and the memories 
                                        we've made - you guys are the best.
                                    </p>
                                    <p className="leading-relaxed italic">
                                        This server wouldn't be the same without your creativity 🎨, humor 😂, and friendship 🤝. 
                                        Here's to many more adventures together in our blocky world!
                                    </p>
                                    <p className="leading-relaxed italic text-gray-400 text-sm mt-4">
                                        Special thanks to unknown0607 for the brilliant ideas 💡 and for being there when we need you, 
                                        even if you're not always online. Your contributions matter!
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
                                                className="absolute animate-[float-hearts_5s_ease-out_forwards]"
                                                style={{
                                                    left: `${heart.x}%`,
                                                    top: `${heart.y}%`,
                                                    animationDelay: `${Math.random() * 0.5}s`,
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
                                            <div className="text-center animate-[scale-bounce_1s_ease-out]">
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

                                <style jsx>{`
                                    @keyframes float-hearts {
                                        0% {
                                            transform: translateY(0) scale(0) rotate(0deg);
                                            opacity: 0;
                                        }
                                        10% {
                                            opacity: 1;
                                            transform: translateY(-20px) scale(1) rotate(10deg);
                                        }
                                        50% {
                                            transform: translateY(-100px) scale(1.2) rotate(-10deg);
                                            opacity: 1;
                                        }
                                        100% {
                                            transform: translateY(-200px) scale(0.5) rotate(20deg);
                                            opacity: 0;
                                        }
                                    }
                                    @keyframes scale-bounce {
                                        0% {
                                            transform: scale(0);
                                            opacity: 0;
                                        }
                                        50% {
                                            transform: scale(1.2);
                                        }
                                        100% {
                                            transform: scale(1);
                                            opacity: 1;
                                        }
                                    }
                                `}</style>
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
                                    We're always happy to welcome new friends to Watermelon SMP 🍉! Whether you're 
                                    a builder 👷, explorer 🗺️, redstone enthusiast 🔴, or just looking for a fun community 
                                    to play with 🎮 - there's a place for you here.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/"
                                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#2ed573] hover:bg-[#26b85f] rounded-xl font-medium transition-all hover:scale-105"
                                    >
                                        <span>🏠</span> Back to Home
                                    </Link>
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
