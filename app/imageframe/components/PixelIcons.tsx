"use client";

import React from "react";

interface IconProps {
    className?: string;
    size?: number;
    color?: string;
}

// Pixel-art style loading spinner with Minecraft aesthetic
export function PixelLoader({ className = "", size = 24, color = "#2ed573" }: IconProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={`animate-spin ${className}`}
            style={{ color }}
        >
            {/* Pixelated circular loader */}
            <rect x="10" y="2" width="4" height="4" fill="currentColor" opacity="1" />
            <rect x="16" y="4" width="4" height="4" fill="currentColor" opacity="0.9" />
            <rect x="18" y="10" width="4" height="4" fill="currentColor" opacity="0.8" />
            <rect x="16" y="16" width="4" height="4" fill="currentColor" opacity="0.7" />
            <rect x="10" y="18" width="4" height="4" fill="currentColor" opacity="0.6" />
            <rect x="4" y="16" width="4" height="4" fill="currentColor" opacity="0.5" />
            <rect x="2" y="10" width="4" height="4" fill="currentColor" opacity="0.4" />
            <rect x="4" y="4" width="4" height="4" fill="currentColor" opacity="0.3" />
        </svg>
    );
}

// Pixel-art lock icon
export function PixelLock({ className = "", size = 16, color = "#ffa502" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Lock body */}
            <rect x="3" y="7" width="10" height="8" fill="currentColor" />
            {/* Lock shackle */}
            <rect x="5" y="3" width="2" height="5" fill="currentColor" />
            <rect x="9" y="3" width="2" height="5" fill="currentColor" />
            <rect x="5" y="2" width="6" height="2" fill="currentColor" />
            {/* Keyhole */}
            <rect x="7" y="10" width="2" height="3" fill="#1a1a2e" />
            <rect x="6" y="9" width="4" height="2" fill="#1a1a2e" />
        </svg>
    );
}

// Pixel-art unlock icon
export function PixelUnlock({ className = "", size = 16, color = "#2ed573" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Lock body */}
            <rect x="3" y="7" width="10" height="8" fill="currentColor" />
            {/* Open shackle */}
            <rect x="9" y="1" width="2" height="7" fill="currentColor" />
            <rect x="9" y="0" width="6" height="2" fill="currentColor" />
            <rect x="13" y="0" width="2" height="4" fill="currentColor" />
            {/* Keyhole */}
            <rect x="7" y="10" width="2" height="3" fill="#1a1a2e" />
            <rect x="6" y="9" width="4" height="2" fill="#1a1a2e" />
        </svg>
    );
}

// Pixel-art user icon
export function PixelUser({ className = "", size = 16, color = "#2ed573" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Head */}
            <rect x="5" y="1" width="6" height="6" fill="currentColor" />
            {/* Body */}
            <rect x="3" y="8" width="10" height="7" fill="currentColor" />
            {/* Neck */}
            <rect x="6" y="7" width="4" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art image/gallery icon
export function PixelImage({ className = "", size = 16, color = "#2ed573" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Frame */}
            <rect x="1" y="2" width="14" height="12" fill="currentColor" />
            {/* Inner */}
            <rect x="2" y="3" width="12" height="10" fill="#1a1a2e" />
            {/* Mountain */}
            <rect x="3" y="10" width="2" height="2" fill="currentColor" />
            <rect x="4" y="9" width="2" height="1" fill="currentColor" />
            <rect x="5" y="8" width="2" height="1" fill="currentColor" />
            <rect x="6" y="9" width="2" height="1" fill="currentColor" />
            <rect x="7" y="10" width="4" height="2" fill="currentColor" />
            <rect x="10" y="9" width="2" height="1" fill="currentColor" />
            {/* Sun */}
            <rect x="10" y="4" width="3" height="3" fill="#ffa502" />
        </svg>
    );
}

// Pixel-art check/success icon
export function PixelCheck({ className = "", size = 16, color = "#2ed573" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            <rect x="2" y="8" width="2" height="2" fill="currentColor" />
            <rect x="4" y="10" width="2" height="2" fill="currentColor" />
            <rect x="6" y="12" width="2" height="2" fill="currentColor" />
            <rect x="8" y="10" width="2" height="2" fill="currentColor" />
            <rect x="10" y="8" width="2" height="2" fill="currentColor" />
            <rect x="12" y="6" width="2" height="2" fill="currentColor" />
            <rect x="14" y="4" width="2" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art X/close icon
export function PixelClose({ className = "", size = 16, color = "#ff4757" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            <rect x="2" y="2" width="2" height="2" fill="currentColor" />
            <rect x="4" y="4" width="2" height="2" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="currentColor" />
            <rect x="10" y="4" width="2" height="2" fill="currentColor" />
            <rect x="12" y="2" width="2" height="2" fill="currentColor" />
            <rect x="2" y="12" width="2" height="2" fill="currentColor" />
            <rect x="4" y="10" width="2" height="2" fill="currentColor" />
            <rect x="10" y="10" width="2" height="2" fill="currentColor" />
            <rect x="12" y="12" width="2" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art copy/clipboard icon
export function PixelCopy({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Back document */}
            <rect x="4" y="1" width="10" height="12" fill="currentColor" opacity="0.5" />
            {/* Front document */}
            <rect x="2" y="3" width="10" height="12" fill="currentColor" />
            <rect x="3" y="4" width="8" height="10" fill="#1a1a2e" />
            {/* Lines */}
            <rect x="4" y="6" width="6" height="1" fill="currentColor" opacity="0.5" />
            <rect x="4" y="8" width="6" height="1" fill="currentColor" opacity="0.5" />
            <rect x="4" y="10" width="4" height="1" fill="currentColor" opacity="0.5" />
        </svg>
    );
}

// Pixel-art refresh icon
export function PixelRefresh({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Circular arrow */}
            <rect x="6" y="1" width="4" height="2" fill="currentColor" />
            <rect x="10" y="2" width="2" height="2" fill="currentColor" />
            <rect x="12" y="4" width="2" height="2" fill="currentColor" />
            <rect x="13" y="6" width="2" height="4" fill="currentColor" />
            <rect x="12" y="10" width="2" height="2" fill="currentColor" />
            <rect x="10" y="12" width="2" height="2" fill="currentColor" />
            <rect x="6" y="13" width="4" height="2" fill="currentColor" />
            <rect x="4" y="12" width="2" height="2" fill="currentColor" />
            <rect x="2" y="10" width="2" height="2" fill="currentColor" />
            <rect x="1" y="6" width="2" height="4" fill="currentColor" />
            <rect x="2" y="4" width="2" height="2" fill="currentColor" />
            {/* Arrow head */}
            <rect x="4" y="0" width="2" height="2" fill="currentColor" />
            <rect x="6" y="2" width="2" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art search/magnifying glass icon
export function PixelSearch({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Glass circle */}
            <rect x="4" y="1" width="5" height="2" fill="currentColor" />
            <rect x="2" y="3" width="2" height="2" fill="currentColor" />
            <rect x="9" y="3" width="2" height="2" fill="currentColor" />
            <rect x="1" y="5" width="2" height="3" fill="currentColor" />
            <rect x="10" y="5" width="2" height="3" fill="currentColor" />
            <rect x="2" y="8" width="2" height="2" fill="currentColor" />
            <rect x="9" y="8" width="2" height="2" fill="currentColor" />
            <rect x="4" y="10" width="5" height="2" fill="currentColor" />
            {/* Handle */}
            <rect x="10" y="10" width="2" height="2" fill="currentColor" />
            <rect x="12" y="12" width="2" height="2" fill="currentColor" />
            <rect x="14" y="14" width="2" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art key/sign-in icon
export function PixelKey({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Key head */}
            <rect x="1" y="3" width="6" height="6" fill="currentColor" />
            <rect x="2" y="4" width="4" height="4" fill="#1a1a2e" />
            <rect x="3" y="5" width="2" height="2" fill="currentColor" />
            {/* Key shaft */}
            <rect x="7" y="5" width="8" height="2" fill="currentColor" />
            {/* Key teeth */}
            <rect x="12" y="7" width="2" height="2" fill="currentColor" />
            <rect x="14" y="7" width="2" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art upload icon
export function PixelUpload({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Arrow up */}
            <rect x="7" y="1" width="2" height="2" fill="currentColor" />
            <rect x="5" y="3" width="2" height="2" fill="currentColor" />
            <rect x="9" y="3" width="2" height="2" fill="currentColor" />
            <rect x="7" y="3" width="2" height="6" fill="currentColor" />
            {/* Box */}
            <rect x="2" y="9" width="2" height="5" fill="currentColor" />
            <rect x="12" y="9" width="2" height="5" fill="currentColor" />
            <rect x="2" y="13" width="12" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art trash/delete icon
export function PixelTrash({ className = "", size = 16, color = "#ff4757" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Lid */}
            <rect x="3" y="2" width="10" height="2" fill="currentColor" />
            <rect x="6" y="0" width="4" height="2" fill="currentColor" />
            {/* Can body */}
            <rect x="4" y="4" width="8" height="11" fill="currentColor" />
            {/* Lines */}
            <rect x="6" y="6" width="1" height="7" fill="#1a1a2e" />
            <rect x="9" y="6" width="1" height="7" fill="#1a1a2e" />
        </svg>
    );
}

// Pixel-art info icon
export function PixelInfo({ className = "", size = 16, color = "#5353ff" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Circle */}
            <rect x="5" y="1" width="6" height="2" fill="currentColor" />
            <rect x="3" y="3" width="2" height="2" fill="currentColor" />
            <rect x="11" y="3" width="2" height="2" fill="currentColor" />
            <rect x="1" y="5" width="2" height="6" fill="currentColor" />
            <rect x="13" y="5" width="2" height="6" fill="currentColor" />
            <rect x="3" y="11" width="2" height="2" fill="currentColor" />
            <rect x="11" y="11" width="2" height="2" fill="currentColor" />
            <rect x="5" y="13" width="6" height="2" fill="currentColor" />
            {/* i dot */}
            <rect x="7" y="4" width="2" height="2" fill="currentColor" />
            {/* i body */}
            <rect x="7" y="7" width="2" height="5" fill="currentColor" />
        </svg>
    );
}

// Pixel-art warning icon
export function PixelWarning({ className = "", size = 16, color = "#ffa502" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Triangle */}
            <rect x="7" y="1" width="2" height="2" fill="currentColor" />
            <rect x="6" y="3" width="4" height="2" fill="currentColor" />
            <rect x="5" y="5" width="6" height="2" fill="currentColor" />
            <rect x="4" y="7" width="8" height="2" fill="currentColor" />
            <rect x="3" y="9" width="10" height="2" fill="currentColor" />
            <rect x="2" y="11" width="12" height="2" fill="currentColor" />
            <rect x="1" y="13" width="14" height="2" fill="currentColor" />
            {/* Exclamation */}
            <rect x="7" y="5" width="2" height="4" fill="#1a1a2e" />
            <rect x="7" y="11" width="2" height="2" fill="#1a1a2e" />
        </svg>
    );
}

// Pixel-art eye/view icon
export function PixelEye({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Eye shape */}
            <rect x="5" y="4" width="6" height="2" fill="currentColor" />
            <rect x="3" y="6" width="2" height="4" fill="currentColor" />
            <rect x="11" y="6" width="2" height="4" fill="currentColor" />
            <rect x="5" y="10" width="6" height="2" fill="currentColor" />
            <rect x="1" y="7" width="2" height="2" fill="currentColor" />
            <rect x="13" y="7" width="2" height="2" fill="currentColor" />
            {/* Pupil */}
            <rect x="6" y="6" width="4" height="4" fill="currentColor" />
            <rect x="7" y="7" width="2" height="2" fill="#1a1a2e" />
        </svg>
    );
}

// Pixel-art globe/world icon
export function PixelGlobe({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Circle */}
            <rect x="5" y="1" width="6" height="2" fill="currentColor" />
            <rect x="3" y="3" width="2" height="2" fill="currentColor" />
            <rect x="11" y="3" width="2" height="2" fill="currentColor" />
            <rect x="1" y="5" width="2" height="6" fill="currentColor" />
            <rect x="13" y="5" width="2" height="6" fill="currentColor" />
            <rect x="3" y="11" width="2" height="2" fill="currentColor" />
            <rect x="11" y="11" width="2" height="2" fill="currentColor" />
            <rect x="5" y="13" width="6" height="2" fill="currentColor" />
            {/* Meridian */}
            <rect x="7" y="2" width="2" height="12" fill="currentColor" opacity="0.5" />
            {/* Equator */}
            <rect x="2" y="7" width="12" height="2" fill="currentColor" opacity="0.5" />
        </svg>
    );
}

// Pixel-art settings/gear icon
export function PixelSettings({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Outer teeth */}
            <rect x="6" y="0" width="4" height="2" fill="currentColor" />
            <rect x="6" y="14" width="4" height="2" fill="currentColor" />
            <rect x="0" y="6" width="2" height="4" fill="currentColor" />
            <rect x="14" y="6" width="2" height="4" fill="currentColor" />
            {/* Diagonal teeth */}
            <rect x="2" y="2" width="2" height="2" fill="currentColor" />
            <rect x="12" y="2" width="2" height="2" fill="currentColor" />
            <rect x="2" y="12" width="2" height="2" fill="currentColor" />
            <rect x="12" y="12" width="2" height="2" fill="currentColor" />
            {/* Center circle */}
            <rect x="4" y="4" width="8" height="8" fill="currentColor" />
            <rect x="6" y="6" width="4" height="4" fill="#1a1a2e" />
        </svg>
    );
}

// Pixel-art crop/scissors icon
export function PixelCrop({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Frame corners */}
            <rect x="2" y="2" width="4" height="2" fill="currentColor" />
            <rect x="2" y="2" width="2" height="4" fill="currentColor" />
            <rect x="10" y="2" width="4" height="2" fill="currentColor" />
            <rect x="12" y="2" width="2" height="4" fill="currentColor" />
            <rect x="2" y="12" width="4" height="2" fill="currentColor" />
            <rect x="2" y="10" width="2" height="4" fill="currentColor" />
            <rect x="10" y="12" width="4" height="2" fill="currentColor" />
            <rect x="12" y="10" width="2" height="4" fill="currentColor" />
        </svg>
    );
}

// Pixel-art external link icon
export function PixelExternalLink({ className = "", size = 16, color = "currentColor" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Box */}
            <rect x="1" y="4" width="2" height="11" fill="currentColor" />
            <rect x="1" y="13" width="11" height="2" fill="currentColor" />
            <rect x="10" y="8" width="2" height="7" fill="currentColor" />
            <rect x="1" y="4" width="6" height="2" fill="currentColor" />
            {/* Arrow */}
            <rect x="8" y="1" width="7" height="2" fill="currentColor" />
            <rect x="13" y="1" width="2" height="7" fill="currentColor" />
            <rect x="7" y="6" width="2" height="2" fill="currentColor" />
            <rect x="9" y="4" width="2" height="2" fill="currentColor" />
            <rect x="11" y="2" width="2" height="2" fill="currentColor" />
        </svg>
    );
}

// Pixel-art admin/shield icon
export function PixelShield({ className = "", size = 16, color = "#ffa502" }: IconProps) {
    return (
        <svg width={size} height={size} viewBox="0 0 16 16" className={className} style={{ color }}>
            {/* Shield shape */}
            <rect x="2" y="1" width="12" height="2" fill="currentColor" />
            <rect x="1" y="3" width="2" height="6" fill="currentColor" />
            <rect x="13" y="3" width="2" height="6" fill="currentColor" />
            <rect x="2" y="9" width="2" height="2" fill="currentColor" />
            <rect x="12" y="9" width="2" height="2" fill="currentColor" />
            <rect x="4" y="11" width="2" height="2" fill="currentColor" />
            <rect x="10" y="11" width="2" height="2" fill="currentColor" />
            <rect x="6" y="13" width="4" height="2" fill="currentColor" />
            {/* Star inside */}
            <rect x="7" y="4" width="2" height="2" fill="#1a1a2e" />
            <rect x="5" y="6" width="6" height="2" fill="#1a1a2e" />
            <rect x="6" y="8" width="4" height="2" fill="#1a1a2e" />
        </svg>
    );
}
