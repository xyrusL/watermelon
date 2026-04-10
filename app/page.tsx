"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import ActionButton from "./components/ActionButton";
import Header from "./components/Header";

const SERVER_IP = "watermelon.deze.me";
const FOOTER_NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/commands", label: "Commands" },
  { href: "/tools", label: "Tools" },
  { href: "/mods", label: "Mods" },
];

const FOOTER_COMMUNITY_LINKS = [
  { href: "/imageframe", label: "ImageFrame" },
  { href: "/converter", label: "Converter" },
  { href: "/minecraft", label: "Minecraft PE" },
];

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
    iconAnimation: "feature-pickaxe 2.4s ease-in-out infinite",
    glowColor: "rgba(255, 107, 129, 0.95)",
  },
  {
    title: "Custom Plugins",
    description: "Unique features to enhance your experience",
    icon: "🔧",
    iconAnimation: "feature-wrench 2.8s ease-in-out infinite",
    glowColor: "rgba(46, 213, 115, 0.95)",
  },
  {
    title: "Fun Community",
    description: "Friendly players ready to welcome you",
    icon: "🎮",
    iconAnimation: "feature-controller 2.2s ease-in-out infinite",
    glowColor: "rgba(255, 71, 87, 0.95)",
  },
];

const heroSequence = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const heroItem = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const sectionReveal = {
  hidden: {
    opacity: 0,
    y: 48,
    filter: "blur(12px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      delay: 0.85 + index * 0.14,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const containerReveal = {
  hidden: {
    opacity: 0,
    y: 28,
    filter: "blur(10px)",
  },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      delay: index * 0.1,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const containerGroup = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function SectionReveal({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.section
      custom={index}
      initial="hidden"
      animate="visible"
      variants={sectionReveal}
      className={className}
    >
      {children}
    </motion.section>
  );
}

function ContainerReveal({
  children,
  index = 0,
  className,
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerReveal}
    >
      {children}
    </motion.div>
  );
}

function ContainerRevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={containerGroup}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const copyIP = async () => {
    try {
      await navigator.clipboard.writeText(SERVER_IP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden reduce-motion-on-mobile">
      {/* Background */}
      <div className="background-layer inset-0 z-0">
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
        <Header variant="fixed" />

        {/* Hero Section */}
        <motion.section
          className="min-h-screen flex flex-col items-center justify-center px-4 py-20 pt-24"
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          variants={heroSequence}
        >
          {/* Logo */}
          <motion.div variants={heroItem} className="mb-8">
            <motion.div
              className="relative inline-flex animate-float"
              animate={
                prefersReducedMotion
                  ? undefined
                  : {
                      filter: [
                        "drop-shadow(0 0 14px rgba(255, 71, 87, 0.28)) drop-shadow(0 0 20px rgba(46, 213, 115, 0.16))",
                        "drop-shadow(0 0 24px rgba(255, 71, 87, 0.5)) drop-shadow(0 0 34px rgba(46, 213, 115, 0.32))",
                        "drop-shadow(0 0 14px rgba(255, 71, 87, 0.28)) drop-shadow(0 0 20px rgba(46, 213, 115, 0.16))",
                      ],
                    }
              }
              transition={
                prefersReducedMotion
                  ? undefined
                  : {
                      duration: 3.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }
              }
            >
              <div className="absolute inset-[-18px] rounded-full bg-[radial-gradient(circle,rgba(255,71,87,0.22)_0%,rgba(46,213,115,0.12)_42%,transparent_72%)] blur-2xl" />
              <div className="absolute inset-[-8px] rounded-full border border-[#ff4757]/20 shadow-[0_0_40px_rgba(255,71,87,0.18),0_0_65px_rgba(46,213,115,0.12)]" />
            <img
              src="/watermelon.svg"
              alt="Watermelon Logo"
              width={120}
              height={120}
                className="relative z-10 drop-shadow-2xl"
            />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={heroItem}
            className="font-pixel text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-center mb-4 gradient-text px-4"
          >
            WATERMELON
          </motion.h1>
          <motion.p
            variants={heroItem}
            className="font-pixel text-[10px] sm:text-xs md:text-sm text-[#2ed573] mb-8"
          >
            SMP SERVER
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={heroItem}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 text-center max-w-xs sm:max-w-md lg:max-w-2xl mb-8 px-4"
          >
            A cozy Minecraft server with custom plugins and endless adventures
          </motion.p>

          {/* Server IP */}
          <motion.div
            variants={heroItem}
            className="flex flex-col items-center gap-4 mb-8 px-4"
          >
            <ActionButton
              onClick={copyIP}
              variant="secondary"
              className="px-8 sm:px-10 py-4 animate-pulse-glow hover:scale-105 transition-transform cursor-pointer group w-auto"
            >
              <p className="text-xs sm:text-sm text-gray-400 mb-1">Server IP</p>
              <p className="font-pixel text-sm sm:text-base md:text-lg lg:text-xl text-[#ff4757] group-hover:text-[#ff6b81] transition-colors whitespace-nowrap">
                {SERVER_IP}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {copied ? "✓ Copied!" : "Click to copy"}
              </p>
            </ActionButton>

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
          </motion.div>

        </motion.section>

        {/* Team Section */}
        <SectionReveal index={0} className="py-20 px-4 relative overflow-hidden">
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

            <ContainerRevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  variants={containerReveal}
                  custom={index}
                  className="glass p-6 rounded-2xl text-center hover:[transform:translateY(-8px)_scale(1.03)] cursor-default animation-will-change"
                  style={{
                    animation: `floatCard 3s ease-in-out infinite ${index * 0.3}s, cardGlow 2s ease-in-out infinite ${index * 0.5}s`,
                    transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease, border-color 300ms ease",
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
                </motion.div>
              ))}
            </ContainerRevealGroup>
          </div>
        </SectionReveal>

        {/* Difficulty Warning Section */}
        <SectionReveal index={1} className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <ContainerReveal className="glass rounded-2xl p-8 border-2 border-[#ff4757]/30 relative overflow-hidden">
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
                  <svg className="w-10 h-10 animate-[swing_1s_ease-in-out_infinite] animation-will-change" viewBox="0 0 100 100" fill="none">
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

                  <svg className="w-10 h-10 animate-[swing_1s_ease-in-out_infinite] animation-delay-500 animation-will-change" viewBox="0 0 100 100" fill="none">
                    <path d="M20 80 L50 10 L80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="text-[#ff4757]" />
                    <path d="M30 70 L70 70" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-[#ff6b81]" />
                    <circle cx="50" cy="75" r="3" fill="currentColor" className="text-[#ffa502]" />
                  </svg>
                </div>

                <p className="text-center text-gray-300 mb-8 text-lg">
                  This server is set to <span className="text-[#ff4757] font-bold">HARD mode</span> - Are you ready for the challenge?
                </p>

                <ContainerRevealGroup className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <motion.div variants={containerReveal} custom={0} className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
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
                  </motion.div>

                  <motion.div variants={containerReveal} custom={1} className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 animate-[pulse-glow-filter_2s_ease-in-out_infinite] animation-will-change" viewBox="0 0 100 100" fill="none">
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
                  </motion.div>

                  <motion.div variants={containerReveal} custom={2} className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
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
                  </motion.div>

                  <motion.div variants={containerReveal} custom={3} className="glass p-5 rounded-xl border border-[#ff4757]/20 hover:border-[#ff4757]/50 transition-all">
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
                  </motion.div>
                </ContainerRevealGroup>

                <ContainerReveal index={1} className="glass p-6 rounded-xl bg-[#ff4757]/10 border border-[#ff4757]/30">
                  <p className="text-center text-white font-medium mb-2">
                    💪 Hard mode means <span className="text-[#ff4757]">real challenges</span> and <span className="text-[#2ed573]">epic victories</span>
                  </p>
                  <p className="text-center text-sm text-gray-400">
                    Not for the faint of heart, but perfect for true survivors who love the thrill!
                  </p>
                </ContainerReveal>
              </div>
            </ContainerReveal>
          </div>
        </SectionReveal>

        {/* Features Section */}
        <SectionReveal index={2} className="py-20 px-4 bg-gradient-to-b from-transparent to-[#1a1a1a]/50">
          <div className="max-w-4xl mx-auto">
            <h2
              className="font-pixel text-xl md:text-2xl text-center mb-4 text-[#2ed573] inline-block w-full animate-[glow_2s_ease-in-out_infinite]"
              style={{
                textShadow: "0 0 10px rgba(46, 213, 115, 0.8), 0 0 20px rgba(46, 213, 115, 0.6), 0 0 30px rgba(46, 213, 115, 0.4)",
              }}
            >
              WHAT WE OFFER
            </h2>
            <p className="text-gray-400 text-center mb-12">
              Everything you need for an amazing Minecraft experience
            </p>

            <ContainerRevealGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={containerReveal}
                  custom={index}
                  className="glass p-6 rounded-2xl text-center hover:border-[#ff4757]/50 transition-all group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className="text-4xl mb-4 inline-flex feature-icon"
                    style={{
                      "--feature-glow-color": feature.glowColor,
                      animation: feature.iconAnimation,
                      willChange: "transform, filter",
                    } as CSSProperties}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="font-pixel text-xs text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </ContainerRevealGroup>
          </div>
        </SectionReveal>

        {/* Minecraft Download Section */}
        <SectionReveal index={3} className="py-10 px-4 bg-[#1a1a1a]/50">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-400 mb-4 text-sm">
              📱 Wanna play on mobile?
            </p>
            <ContainerReveal>
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
            </ContainerReveal>
          </div>
        </SectionReveal>

        {/* Footer */}
        <motion.footer
          className="bg-[#0a0a0a] px-4 py-5 sm:py-6"
          initial={prefersReducedMotion ? false : "hidden"}
          animate={prefersReducedMotion ? undefined : "visible"}
          custom={4}
          variants={sectionReveal}
        >
          <div className="max-w-4xl 2xl:max-w-6xl mx-auto">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:justify-between md:gap-x-8">
                <div className="flex items-center gap-2 shrink-0">
                  <img
                    src="/watermelon.svg"
                    alt="Watermelon"
                    width={18}
                    height={18}
                  />
                  <span className="font-pixel text-sm text-[#ff4757]">
                    WATERMELON
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-y-2 text-[13px] text-gray-300">
                  {FOOTER_NAV_LINKS.map((link, index) => (
                    <span key={link.href} className="flex items-center">
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-[#2ed573]"
                      >
                        {link.label}
                      </Link>
                      {index < FOOTER_NAV_LINKS.length - 1 ? (
                        <span className="mx-2 text-gray-500">·</span>
                      ) : null}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-y-2 text-[13px] text-gray-300">
                  {FOOTER_COMMUNITY_LINKS.map((link, index) => (
                    <span key={link.href} className="flex items-center">
                      <Link
                        href={link.href}
                        className="transition-colors hover:text-[#2ed573]"
                      >
                        {link.label}
                      </Link>
                      {index < FOOTER_COMMUNITY_LINKS.length - 1 ? (
                        <span className="mx-2 text-gray-500">·</span>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                  <Link
                    href={`https://${SERVER_IP}`}
                    className="text-[13px] text-gray-400 transition-colors hover:text-[#2ed573]"
                  >
                    {SERVER_IP}
                  </Link>
                  <p className="text-[13px] text-gray-500">
                    © 2026 Watermelon SMP. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
