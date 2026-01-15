"use client";

import Link from "next/link";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

interface HeaderProps {
    variant?: "fixed" | "static";
}

export default function Header({ variant = "static" }: HeaderProps) {
    const baseClasses = variant === "fixed"
        ? "fixed top-0 left-0 right-0 z-50 py-3 px-4"
        : "py-3 px-4";

    return (
        <header className={baseClasses}>
            <div className="max-w-6xl mx-auto">
                <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <img src="/watermelon.svg" alt="Watermelon" width={28} height={28} />
                        <span className="font-pixel text-xs text-[#ff4757] hidden sm:block">WATERMELON</span>
                    </Link>
                    <NavLinks />
                </div>
            </div>
        </header>
    );
}

function NavLinks() {
    return (
        <nav className="flex items-center gap-1 sm:gap-2 md:gap-3 flex-wrap justify-end">
            <Link
                href="/about"
                className="px-2 sm:px-3 md:px-4 py-2 md:py-2.5 glass border border-white/10 hover:border-[#5f27cd]/50 rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
            >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="2" fill="#5f27cd" />
                    <rect x="7" y="5" width="2" height="2" fill="white" />
                    <rect x="7" y="8" width="2" height="4" fill="white" />
                </svg>
                <span className="hidden md:inline">About</span>
            </Link>
            <Link
                href="/converter"
                className="px-2 sm:px-3 md:px-4 py-2 md:py-2.5 glass border border-white/10 hover:border-[#ff4757]/50 rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
            >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="3" width="14" height="10" rx="1" fill="#ff4757" />
                    <polygon points="6,5 6,11 11,8" fill="white" />
                </svg>
                <span className="hidden md:inline">Converter</span>
            </Link>
            <Link
                href="/mods"
                className="px-2 sm:px-3 md:px-4 py-2 md:py-2.5 glass border border-white/10 hover:border-[#ffa502]/50 rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
            >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <rect x="3" y="4" width="10" height="8" rx="1" fill="#ffa502" />
                    <rect x="1" y="6" width="2" height="4" fill="#ffa502" />
                    <rect x="13" y="6" width="2" height="4" fill="#ffa502" />
                    <rect x="5" y="6" width="2" height="2" fill="white" />
                    <rect x="9" y="6" width="2" height="2" fill="white" />
                </svg>
                <span className="hidden md:inline">Mods</span>
            </Link>
            <Link
                href="/commands"
                className="px-2 sm:px-3 md:px-4 py-2 md:py-2.5 glass border border-white/10 hover:border-[#2ed573]/50 rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
            >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="2" width="12" height="12" rx="1" fill="#2ed573" />
                    <rect x="4" y="4" width="8" height="2" fill="white" />
                    <rect x="4" y="7" width="6" height="2" fill="white" />
                    <rect x="4" y="10" width="7" height="2" fill="white" />
                </svg>
                <span className="hidden md:inline">Commands</span>
            </Link>
            <Link
                href="/imageframe"
                className="px-2 sm:px-3 md:px-4 py-2 md:py-2.5 glass border border-white/10 hover:border-[#ff4757]/50 rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 md:gap-2"
            >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="2" width="14" height="12" rx="1" fill="#2ed573" />
                    <rect x="2" y="3" width="12" height="10" fill="#1a1a1a" />
                    <circle cx="5" cy="6" r="2" fill="#ffa502" />
                    <polygon points="3,12 7,8 10,11 12,9 14,12" fill="#2ed573" />
                </svg>
                <span className="hidden lg:inline">ImageFrame</span>
            </Link>
            <SignedOut>
                <SignInButton mode="modal">
                    <button className="px-2 sm:px-3 md:px-4 py-2 md:py-2.5 bg-[#2ed573] hover:bg-[#26de81] rounded-full text-sm font-medium transition-all hover:scale-105 cursor-pointer flex items-center gap-1 md:gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
                            <rect x="4" y="2" width="8" height="6" rx="1" fill="#1a1a1a" />
                            <rect x="6" y="6" width="4" height="4" fill="#1a1a1a" />
                            <rect x="3" y="8" width="10" height="6" rx="1" fill="#ffa502" />
                            <rect x="7" y="10" width="2" height="3" fill="#1a1a1a" />
                        </svg>
                        <span className="hidden md:inline">Sign In</span>
                    </button>
                </SignInButton>
            </SignedOut>
            <SignedIn>
                <UserButton afterSignOutUrl="/" />
            </SignedIn>
        </nav>
    );
}

