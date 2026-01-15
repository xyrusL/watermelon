// Constants for ImageFrame
import React from "react";
import { HostType, HostConfig, FrameSize } from "./types";
import {
    PixelFrame,
    PixelSquare,
    PixelRectangleH,
    PixelRectangleV,
    PixelCrop,
    PixelWarning,
    PixelCheck
} from "./components/PixelIcons";

export const HOSTS: Record<HostType, HostConfig> = {
    imgbb: {
        name: "imgbb",
        maxSize: 32 * 1024 * 1024,
        maxSizeLabel: "32MB",
        deleteSupport: <span className="flex items-center gap-1"><PixelWarning size={14} color="#ffa502" /> Unreliable (free account)</span>,
        uploadEndpoint: "/api/upload",
        deleteEndpoint: "/api/delete",
        healthEndpoint: "/api/health",
        description: "Third-party hosting - Not recommended",
    },
    supabase: {
        name: "Watermelon Storage",
        maxSize: 8 * 1024 * 1024,
        maxSizeLabel: "8MB",
        deleteSupport: <span className="flex items-center gap-1"><PixelCheck size={14} color="#2ed573" /> Full Control</span>,
        uploadEndpoint: "/api/supabase/upload",
        deleteEndpoint: "/api/supabase/delete",
        healthEndpoint: "/api/supabase/health",
        description: "Our private storage - Recommended & Secure",
    },
};

// Minecraft frame size options


export const FRAME_SIZES: FrameSize[] = [
    { name: "1×1", ratio: 1, frames: 1, icon: <PixelFrame size={16} /> },
    { name: "2×2", ratio: 1, frames: 4, icon: <PixelSquare size={16} /> },
    { name: "3×2", ratio: 3 / 2, frames: 6, icon: <PixelRectangleH size={16} /> },
    { name: "4×2", ratio: 2, frames: 8, icon: <PixelRectangleH size={16} /> },
    { name: "2×3", ratio: 2 / 3, frames: 6, icon: <PixelRectangleV size={16} /> },
    { name: "2×4", ratio: 0.5, frames: 8, icon: <PixelRectangleV size={16} /> },
    { name: "Free", ratio: undefined, frames: 0, icon: <PixelCrop size={16} /> },
];
