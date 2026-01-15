// Constants for ImageFrame
import { HostType, HostConfig, FrameSize } from "./types";

export const HOSTS: Record<HostType, HostConfig> = {
    imgbb: {
        name: "imgbb",
        maxSize: 32 * 1024 * 1024,
        maxSizeLabel: "32MB",
        deleteSupport: "⚠️ Unreliable (free account)",
        uploadEndpoint: "/api/upload",
        deleteEndpoint: "/api/delete",
        healthEndpoint: "/api/health",
        description: "Third-party hosting - Not recommended",
    },
    supabase: {
        name: "Watermelon Storage",
        maxSize: 8 * 1024 * 1024,
        maxSizeLabel: "8MB",
        deleteSupport: "✅ Full Control",
        uploadEndpoint: "/api/supabase/upload",
        deleteEndpoint: "/api/supabase/delete",
        healthEndpoint: "/api/supabase/health",
        description: "Our private storage - Recommended & Secure",
    },
};

// Minecraft frame size options
export const FRAME_SIZES: FrameSize[] = [
    { name: "1×1", ratio: 1, frames: 1, icon: "🖼️" },
    { name: "2×2", ratio: 1, frames: 4, icon: "⬜" },
    { name: "3×2", ratio: 3 / 2, frames: 6, icon: "▬" },
    { name: "4×2", ratio: 2, frames: 8, icon: "━" },
    { name: "2×3", ratio: 2 / 3, frames: 6, icon: "▮" },
    { name: "2×4", ratio: 0.5, frames: 8, icon: "┃" },
    { name: "Free", ratio: undefined, frames: 0, icon: "✂️" },
];
