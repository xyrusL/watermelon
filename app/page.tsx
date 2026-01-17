"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const SERVER_IP = "watermelon.deze.me";

const teamMembers = [
  {
    name: "Yuii",
    role: "Minecraft Expert",
    description: "Master of builds and redstone",
    emoji: "⚡",
  },
  {
    name: "Peach",
    role: "Adventurer",
    description: "Curious explorer who loves to learn",
    emoji: "🌍",
  },
  {
    name: "Jepot",
    role: "Server Admin",
    description: "Keeper of the server",
    emoji: "🛡️",
  },
  {
    name: "unknown0607",
    role: "Gamer",
    description: "Casual player, rarely online",
    emoji: "🎮",
  },
];

const features = [
  {
    title: "SMP Experience",
    description: "Pure survival multiplayer gameplay with friends",
    icon: "⛏️",
  },
  {
    title: "Custom Plugins",
    description: "Unique features to enhance your experience",
    icon: "🔧",
  },
  {
    title: "Fun Community",
    description: "Friendly players ready to welcome you",
    icon: "🎮",
  },
];

export default function Home() {
  const [copied, setCopied] = useState(false);

  const copyIP = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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
        {/* Navigation Header */}
        <header className="fixed top-0 left-0 right-0 z-50 py-3 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="glass rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/watermelon.svg" alt="Watermelon" width={28} height={28} />
                <span className="font-pixel text-xs text-[#ff4757] hidden sm:block">WATERMELON</span>
              </div>
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
                  <div className="flex items-center gap-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-24">
          {/* Logo */}
          <div className="animate-float mb-8">
            <img
              src="/watermelon.svg"
              alt="Watermelon Logo"
              width={120}
              height={120}
              className="drop-shadow-2xl"
            />
          </div>

          {/* Title */}
          <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center mb-4 gradient-text px-4">
            WATERMELON
          </h1>
          <p className="font-pixel text-[10px] sm:text-xs md:text-sm text-[#2ed573] mb-8">
            SMP SERVER
          </p>

          {/* Tagline */}
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 text-center max-w-xs sm:max-w-md lg:max-w-2xl mb-8 px-4">
            A cozy Minecraft server with custom plugins and endless adventures
          </p>

          {/* Server IP */}
          <div className="flex flex-col items-center gap-4 mb-8 px-4">
            <button
              onClick={copyIP}
              className="glass px-8 sm:px-10 py-4 rounded-xl animate-pulse-glow hover:scale-105 transition-transform cursor-pointer group w-auto"
            >
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Server IP</p>
              <p className="font-pixel text-sm sm:text-base md:text-lg lg:text-xl text-[#ff4757] group-hover:text-[#ff6b81] transition-colors whitespace-nowrap">
                {SERVER_IP}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {copied ? "✓ Copied!" : "Click to copy"}
              </p>
            </button>

            {/* Java Badge */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-5 py-3 bg-[#1a1a1a] rounded-full border border-[#2ed573]/30">
                <span className="text-[#2ed573] text-lg">☕</span>
                <span className="text-sm font-medium text-white">Java Edition</span>
                <div className="w-px h-5 bg-white/20 mx-2"></div>
                <span className="text-[#2ed573] text-lg">✓</span>
                <span className="text-sm font-medium text-[#2ed573]">1.8+ Compatible</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 animate-bounce">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 relative overflow-hidden">
          {/* Spotlight effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff4757]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#2ed573]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="max-w-4xl 2xl:max-w-6xl mx-auto relative z-10 px-4">
            {/* Glowing animated title */}
            <div className="mb-4 text-center">
              <h2 className="font-pixel text-lg sm:text-xl md:text-2xl lg:text-3xl inline-block animate-[glow_2s_ease-in-out_infinite]" style={{
                color: '#ff4757',
                textShadow: '0 0 10px rgba(255, 71, 87, 0.8), 0 0 20px rgba(255, 71, 87, 0.6), 0 0 30px rgba(255, 71, 87, 0.4)',
              }}>
                THE CREW
              </h2>
            </div>
            <p className="text-gray-400 text-center mb-12 animate-[fadeIn_1s_ease-out]">
              Meet the amazing people behind Watermelon
            </p>

            <style jsx>{`
              @keyframes glow {
                0%, 100% {
                  filter: brightness(1) drop-shadow(0 0 20px rgba(255, 71, 87, 0.6));
                }
                50% {
                  filter: brightness(1.3) drop-shadow(0 0 40px rgba(255, 71, 87, 1));
                }
              }
              @keyframes fadeIn {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes floatCard {
                0%, 100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-10px);
                }
              }
              @keyframes cardGlow {
                0%, 100% {
                  box-shadow: 0 0 20px rgba(255, 71, 87, 0.2), 0 0 40px rgba(46, 213, 115, 0.2);
                }
                50% {
                  box-shadow: 0 0 30px rgba(255, 71, 87, 0.4), 0 0 60px rgba(46, 213, 115, 0.4);
                }
              }
            `}</style>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className="glass p-6 rounded-2xl text-center hover:scale-110 transition-all duration-300 cursor-pointer"
                  style={{
                    animation: `floatCard 3s ease-in-out infinite ${index * 0.3}s, cardGlow 2s ease-in-out infinite ${index * 0.5}s`,
                  }}
                >
                  <div className="text-5xl mb-4 animate-[spin_20s_linear_infinite]" style={{
                    filter: 'drop-shadow(0 0 10px rgba(255, 107, 129, 0.6))',
                  }}>
                    {member.emoji}
                  </div>
                  <h3 className="font-pixel text-sm text-[#2ed573] mb-2" style={{
                    textShadow: '0 0 10px rgba(46, 213, 115, 0.5)',
                  }}>
                    {member.name}
                  </h3>
                  <p className="text-[#ff4757] font-medium mb-2">
                    {member.role}
                  </p>
                  <p className="text-gray-400 text-sm">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Difficulty Warning Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-8 border-2 border-[#ff4757]/30 relative overflow-hidden">
              {/* Danger stripes background */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <svg className="w-32 h-32" viewBox="0 0 100 100" fill="none">
                  <path d="M50 10 L90 90 L10 90 Z" stroke="currentColor" strokeWidth="3" className="text-[#ff4757]" />
                  <text x="50" y="70" fontSize="30" textAnchor="middle" fill="currentColor" className="text-[#ff4757]">!</text>
                </svg>
              </div>

              <div className="relative z-10">
                {/* Animated Title */}
                <div className="flex items-center justify-center gap-3 mb-6">
                  <svg className="w-10 h-10 animate-[swing_1s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
                    <path d="M20 80 L50 10 L80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4757]" />
                    <path d="M30 70 L70 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-[#ff6b81]" />
                    <circle cx="50" cy="75" r="3" fill="currentColor" className="text-[#ffa502]" />
                  </svg>

                  <h2 className="font-pixel text-xl md:text-2xl text-center">
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-0" style={{ color: '#ff4757' }}>H</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-100" style={{ color: '#ff6b81' }}>A</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-200" style={{ color: '#ff4757' }}>R</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-300" style={{ color: '#e84118' }}>D</span>
                    <span className="inline-block mx-2"></span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-400" style={{ color: '#ff4757' }}>D</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-500" style={{ color: '#ff6b81' }}>I</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-600" style={{ color: '#ff4757' }}>F</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-700" style={{ color: '#e84118' }}>F</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-800" style={{ color: '#ff4757' }}>I</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-900" style={{ color: '#ff6b81' }}>C</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-1000" style={{ color: '#ff4757' }}>U</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-1100" style={{ color: '#e84118' }}>L</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-1200" style={{ color: '#ff4757' }}>T</span>
                    <span className="inline-block animate-[colorShift_3s_ease-in-out_infinite] animation-delay-1300" style={{ color: '#ff6b81' }}>Y</span>
                  </h2>

                  <svg className="w-10 h-10 animate-[swing_1s_ease-in-out_infinite] animation-delay-500" viewBox="0 0 100 100" fill="none">
                    <path d="M20 80 L50 10 L80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4757]" />
                    <path d="M30 70 L70 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-[#ff6b81]" />
                    <circle cx="50" cy="75" r="3" fill="currentColor" className="text-[#ffa502]" />
                  </svg>
                </div>

                <p className="text-center text-gray-300 mb-8 text-lg">
                  This server is set to <span className="text-[#ff4757] font-bold">HARD mode</span> - Are you ready for the challenge?
                </p>

                <style jsx>{`
                  @keyframes swing {
                    0%, 100% { transform: rotate(-15deg); }
                    50% { transform: rotate(15deg); }
                  }
                  @keyframes colorShift {
                    0%, 100% { 
                      filter: brightness(1) drop-shadow(0 0 8px currentColor);
                      transform: scale(1);
                    }
                    50% { 
                      filter: brightness(1.5) drop-shadow(0 0 12px currentColor);
                      transform: scale(1.1);
                    }
                  }
                  @keyframes shake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    10% { transform: translate(-2px, -2px) rotate(-2deg); }
                    20% { transform: translate(2px, 2px) rotate(2deg); }
                    30% { transform: translate(-2px, 2px) rotate(-1deg); }
                    40% { transform: translate(2px, -2px) rotate(1deg); }
                    50% { transform: translate(-2px, -2px) rotate(-2deg); }
                    60% { transform: translate(2px, 2px) rotate(2deg); }
                    70% { transform: translate(-2px, 2px) rotate(-1deg); }
                    80% { transform: translate(2px, -2px) rotate(1deg); }
                    90% { transform: translate(-2px, -2px) rotate(0deg); }
                  }
                  @keyframes burn {
                    0%, 100% { 
                      filter: drop-shadow(0 0 5px #ff4757) brightness(1);
                      transform: scale(1);
                    }
                    50% { 
                      filter: drop-shadow(0 0 15px #ff6b81) brightness(1.8);
                      transform: scale(1.2);
                    }
                  }
                  @keyframes zap {
                    0%, 100% { 
                      filter: drop-shadow(0 0 3px #ffa502);
                      transform: translateY(0);
                    }
                    25% { 
                      filter: drop-shadow(0 0 10px #ffa502) brightness(1.5);
                      transform: translateY(-3px);
                    }
                    75% { 
                      filter: drop-shadow(0 0 10px #ffa502) brightness(1.5);
                      transform: translateY(3px);
                    }
                  }
                  @keyframes pulse-glow {
                    0%, 100% { 
                      filter: drop-shadow(0 0 5px #2ed573);
                      opacity: 1;
                    }
                    50% { 
                      filter: drop-shadow(0 0 15px #26de81);
                      opacity: 0.8;
                    }
                  }
                  .animation-delay-0 { animation-delay: 0s; }
                  .animation-delay-100 { animation-delay: 0.1s; }
                  .animation-delay-200 { animation-delay: 0.2s; }
                  .animation-delay-300 { animation-delay: 0.3s; }
                  .animation-delay-400 { animation-delay: 0.4s; }
                  .animation-delay-500 { animation-delay: 0.5s; }
                  .animation-delay-600 { animation-delay: 0.6s; }
                  .animation-delay-700 { animation-delay: 0.7s; }
                  .animation-delay-800 { animation-delay: 0.8s; }
                  .animation-delay-900 { animation-delay: 0.9s; }
                  .animation-delay-1000 { animation-delay: 1.0s; }
                  .animation-delay-1100 { animation-delay: 1.1s; }
                  .animation-delay-1200 { animation-delay: 1.2s; }
                  .animation-delay-1300 { animation-delay: 1.3s; }
                `}</style>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 animate-[shake_2s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
                        <circle cx="50" cy="30" r="15" fill="currentColor" className="text-[#6ab04c]" />
                        <rect x="35" y="45" width="30" height="40" rx="5" fill="currentColor" className="text-[#4a7c59]" />
                        <rect x="25" y="50" width="15" height="30" rx="3" fill="currentColor" className="text-[#6ab04c]" />
                        <rect x="60" y="50" width="15" height="30" rx="3" fill="currentColor" className="text-[#6ab04c]" />
                        <circle cx="45" cy="25" r="3" fill="currentColor" className="text-[#ff4757]" />
                        <circle cx="55" cy="25" r="3" fill="currentColor" className="text-[#ff4757]" />
                      </svg>
                      <h3 className="font-medium text-white">Brutal Mobs</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Zombies break down doors, spiders spawn with effects, and mobs deal maximum damage. Every encounter is a real threat!
                    </p>
                  </div>

                  <div className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 animate-[pulse-glow_2s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
                        <ellipse cx="50" cy="35" rx="20" ry="25" fill="currentColor" className="text-gray-200" />
                        <circle cx="42" cy="30" r="4" fill="currentColor" className="text-[#2c3e50]" />
                        <circle cx="58" cy="30" r="4" fill="currentColor" className="text-[#2c3e50]" />
                        <path d="M40 45 Q50 38 60 45" stroke="currentColor" strokeWidth="2" fill="none" className="text-[#2c3e50]" />
                        <path d="M30 65 L35 50 L40 65 L45 50 L50 65 L55 50 L60 65 L65 50 L70 65" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-200" />
                      </svg>
                      <h3 className="font-medium text-white">Unforgiving Survival</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Starvation will kill you, food heals less, and hostile mobs spawn more frequently. Stock up or perish!
                    </p>
                  </div>

                  <div className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 animate-[burn_1.5s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
                        <path d="M50 10 Q60 30 50 40 Q40 30 50 10 Z" fill="currentColor" className="text-[#ffa502]" />
                        <path d="M50 20 Q58 35 50 45 Q42 35 50 20 Z" fill="currentColor" className="text-[#ff4757]" />
                        <path d="M50 30 Q55 40 50 50 Q45 40 50 30 Z" fill="currentColor" className="text-[#ff6b81]" />
                        <ellipse cx="50" cy="60" rx="25" ry="30" fill="currentColor" className="text-[#ff4757]" />
                        <ellipse cx="50" cy="65" rx="18" ry="22" fill="currentColor" className="text-[#ffa502]" />
                        <ellipse cx="50" cy="70" rx="10" ry="15" fill="currentColor" className="text-[#ff6b81]" />
                      </svg>
                      <h3 className="font-medium text-white">High Stakes Combat</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Creepers explode bigger, skeletons have perfect aim, and the Wither is a nightmare. Gear up or get wrecked!
                    </p>
                  </div>

                  <div className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 animate-[zap_1s_ease-in-out_infinite]" viewBox="0 0 100 100" fill="none">
                        <path d="M55 10 L30 50 L45 50 L40 90 L75 40 L58 40 L70 10 Z" fill="currentColor" className="text-[#ffa502]" />
                        <path d="M58 15 L38 48 L48 48 L44 80 L70 42 L60 42 L68 15 Z" fill="currentColor" className="text-[#ffdd59]" />
                      </svg>
                      <h3 className="font-medium text-white">Adrenaline Rush</h3>
                    </div>
                    <p className="text-sm text-gray-400">
                      Every night is intense, every cave is dangerous. The satisfaction when you survive? Absolutely worth it!
                    </p>
                  </div>
                </div>

                <div className="glass p-6 rounded-xl bg-[#ff4757]/10 border border-[#ff4757]/30">
                  <p className="text-center text-white font-medium mb-2">
                    💪 Hard mode means <span className="text-[#ff4757]">real challenges</span> and <span className="text-[#2ed573]">epic victories</span>
                  </p>
                  <p className="text-center text-sm text-gray-400">
                    Not for the faint of heart, but perfect for true survivors who love the thrill!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-transparent to-[#1a1a1a]/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-pixel text-xl md:text-2xl text-center mb-4 text-[#2ed573]">
              WHAT WE OFFER
            </h2>
            <p className="text-gray-400 text-center mb-12">
              Everything you need for an amazing Minecraft experience
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="glass p-6 rounded-2xl text-center hover:border-[#ff4757]/50 transition-all"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-pixel text-xs text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Minecraft Download Section */}
        <section className="py-10 px-4 bg-[#1a1a1a]/50">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-400 mb-4 text-sm">
              📱 Wanna play on mobile?
            </p>
            <Link
              href="/minecraft"
              className="glass rounded-xl p-4 sm:p-5 border border-[#2ed573]/20 hover:border-[#2ed573]/50 flex items-center justify-between gap-4 transition-all group cursor-pointer"
            >
              {/* Left: Icon + Text */}
              <div className="flex items-center gap-4">
                <span className="text-3xl">🍉</span>
                <div>
                  <p className="font-pixel text-sm sm:text-base text-white group-hover:text-[#2ed573] transition-colors">
                    Download Minecraft PE
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    v1.21.132 • Android
                  </p>
                </div>
              </div>
              {/* Right: Arrow */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#2ed573]/10 group-hover:bg-[#2ed573] flex items-center justify-center transition-all">
                <span className="text-[#2ed573] group-hover:text-white transition-colors">➔</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-white/5">
          <div className="max-w-4xl 2xl:max-w-6xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img
                src="/watermelon.svg"
                alt="Watermelon"
                width={32}
                height={32}
              />
              <span className="font-pixel text-sm text-[#ff4757]">
                WATERMELON
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Join us at{" "}
              <span className="text-[#2ed573] font-medium">{SERVER_IP}</span>
            </p>
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} Watermelon SMP. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
