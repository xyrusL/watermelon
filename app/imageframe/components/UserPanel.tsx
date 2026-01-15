"use client";

import { useState, useEffect } from "react";
import {
    PixelLoader,
    PixelLock,
    PixelUnlock,
    PixelUser,
    PixelImage,
    PixelCheck,
    PixelClose,
    PixelCopy,
    PixelRefresh,
    PixelSearch,
    PixelInfo,
    PixelEye,
    PixelGlobe,
    PixelWarning,
} from "./PixelIcons";

import { UploadedImage } from "../types";
import ImageDetailsModal from "./ImageDetailsModal";
import { mapDbImagesToUploadedImages } from "../lib/image-mapper";

// Types - Use existing UploadedImage from types.ts
// interface UserImage removed in favor of UploadedImage

interface UserStats {
    totalImages: number;
    publicImages: number;
    privateImages: number;
    nsfwImages?: number;
}

interface UserPanelProps {
    isSignedIn: boolean;
    showUserPanel: boolean;
    setShowUserPanel: (show: boolean) => void;
    formatDate: (timestamp: number) => string;
    formatFileSize: (bytes?: number) => string;
    copyUrl: (url: string) => Promise<void>;
    copied: boolean;
    showNotification: (type: "error" | "warning" | "success" | "info", title: string, message: string, details?: string) => void;
    onClose?: () => void;
    onImageUpdate?: () => void;
}

export default function UserPanel({
    isSignedIn,
    showUserPanel,
    setShowUserPanel,
    formatDate,
    formatFileSize,
    copyUrl,
    copied,
    showNotification,
    onClose,
    onImageUpdate,
}: UserPanelProps) {
    const [userImages, setUserImages] = useState<UploadedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
    const [filterText, setFilterText] = useState("");
    const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");

    // Fetch user's images (uses centralized mapper)
    const fetchUserImages = async (isPolling = false) => {
        if (!isSignedIn) return;
        if (!isPolling) setIsLoading(true);
        try {
            const response = await fetch('/api/user/images');
            const data = await response.json();
            if (data.success) {
                const images = mapDbImagesToUploadedImages(data.images);
                setUserImages(images);
                setStats(data.stats);
            } else {
                showNotification("error", "Fetch Failed", data.error || "Failed to fetch your images");
            }
        } catch (err) {
            console.error("Failed to fetch user images:", err);
            showNotification("error", "Error", "An error occurred while fetching your images");
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle image visibility
    const toggleVisibility = async (imageId: string, currentPrivate: boolean) => {
        try {
            const response = await fetch('/api/user/update-visibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, isPrivate: !currentPrivate }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification("success", "Updated", data.message);
                fetchUserImages(); // Refresh
                onImageUpdate?.(); // Notify parent
            } else {
                showNotification("error", "Update Failed", data.error || "Failed to update visibility");
            }
        } catch (err) {
            console.error("Visibility update error:", err);
            showNotification("error", "Error", "An error occurred while updating visibility");
        }
    };

    // Toggle NSFW status
    const toggleNsfw = async (imageId: string, currentNsfw: boolean) => {
        try {
            const response = await fetch('/api/user/update-nsfw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, isNsfw: !currentNsfw }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification("success", "Updated", data.message);
                fetchUserImages(); // Refresh
                onImageUpdate?.(); // Notify parent
            } else {
                showNotification("error", "Update Failed", data.error || "Failed to update NSFW status");
            }
        } catch (err) {
            console.error("NSFW update error:", err);
            showNotification("error", "Error", "An error occurred while updating NSFW status");
        }
    };

    // Filter images
    const filteredImages = userImages.filter(img => {
        const matchesText = img.filename.toLowerCase().includes(filterText.toLowerCase());
        const matchesVisibility =
            filterVisibility === "all" ? true :
                filterVisibility === "public" ? !img.is_private :
                    img.is_private;
        return matchesText && matchesVisibility;
    });

    // Fetch when panel opens and poll for updates
    useEffect(() => {
        if (showUserPanel && isSignedIn) {
            fetchUserImages(); // Initial load (shows loader)

            // Poll for updates every 3 seconds (silent)
            const interval = setInterval(() => fetchUserImages(true), 3000);
            return () => clearInterval(interval);
        }
    }, [showUserPanel, isSignedIn]);

    if (!showUserPanel || !isSignedIn) return null;

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
                <div className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <PixelUser size={28} color="#2ed573" />
                            <h2 className="font-pixel text-xl text-[#2ed573]">MY UPLOADS</h2>
                        </div>
                        <button
                            onClick={() => {
                                setShowUserPanel(false);
                                setSelectedImage(null);
                                onClose?.();
                            }}
                            className="w-10 h-10 rounded-full glass hover:bg-red-500/20 transition-all flex items-center justify-center"
                        >
                            <PixelClose size={16} color="#ff4757" />
                        </button>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="glass-dark p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-white">{stats.totalImages}</p>
                                <p className="text-xs text-gray-400">Total Uploads</p>
                            </div>
                            <div className="glass-dark p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-[#2ed573]">{stats.publicImages}</p>
                                <p className="text-xs text-gray-400">Public</p>
                            </div>
                            <div className="glass-dark p-3 rounded-xl text-center">
                                <p className="text-xl font-bold text-[#ffa502]">{stats.privateImages}</p>
                                <p className="text-xs text-gray-400">Private</p>
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="flex-1 min-w-[150px] px-3 py-2 pl-9 glass-dark rounded-xl border border-white/10 focus:border-[#2ed573]/50 outline-none text-sm relative"
                        />
                        <select
                            value={filterVisibility}
                            onChange={(e) => setFilterVisibility(e.target.value as "all" | "public" | "private")}
                            className="px-3 py-2 glass-dark rounded-xl border border-white/10 text-sm"
                        >
                            <option value="all">All</option>
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button
                            onClick={() => fetchUserImages(false)}
                            className="px-3 py-2 glass rounded-xl border border-white/10 hover:border-[#2ed573]/50 text-sm flex items-center justify-center"
                        >
                            <PixelRefresh size={16} color="currentColor" />
                        </button>
                    </div>

                    {/* Image Grid */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <PixelLoader size={48} color="#2ed573" />
                            </div>
                        ) : filteredImages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="mb-4 flex justify-center">
                                    <PixelImage size={48} color="#6b7280" />
                                </div>
                                <p className="text-gray-400">No images found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {filteredImages.map((img) => {
                                    const imgId = img.id || img.uploadedAt.toString();
                                    return (
                                        <div key={imgId} className="relative rounded-xl overflow-hidden group">
                                            {/* Privacy Badge */}
                                            <div className="absolute top-2 left-2 z-10">
                                                <button
                                                    onClick={() => toggleVisibility(imgId, img.is_private || false)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${img.is_private
                                                        ? "bg-[#ffa502] hover:bg-[#ff8c00]"
                                                        : "bg-[#2ed573] hover:bg-[#26b85f]"
                                                        }`}
                                                    title={img.is_private ? "Private - Click to make public" : "Public - Click to make private"}
                                                >
                                                    {img.is_private ? <PixelLock size={12} color="#fff" /> : <PixelEye size={12} color="#fff" />}
                                                </button>
                                            </div>

                                            {/* NSFW Badge */}
                                            <div className="absolute top-2 left-10 z-10">
                                                <button
                                                    onClick={() => toggleNsfw(imgId, img.is_nsfw || false)}
                                                    className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${img.is_nsfw
                                                        ? "bg-[#ff4757] hover:bg-[#ff6b81]"
                                                        : "bg-gray-500 hover:bg-gray-400"
                                                        }`}
                                                    title={img.is_nsfw ? "NSFW - Click to mark as safe" : "Safe - Click to mark as NSFW"}
                                                >
                                                    {img.is_nsfw ? <PixelWarning size={12} color="#fff" /> : <PixelCheck size={12} color="#fff" />}
                                                </button>
                                            </div>

                                            {/* Info Button */}
                                            <div
                                                onClick={() => setSelectedImage(img)}
                                                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 hover:bg-[#2ed573] flex items-center justify-center cursor-pointer transition-all"
                                            >
                                                <PixelInfo size={12} color="currentColor" />
                                            </div>

                                            {/* Image */}
                                            <img
                                                src={img.directUrl}
                                                alt={img.filename}
                                                className={`w-full h-32 object-cover ${img.is_nsfw ? 'blur-lg' : ''}`}
                                            />

                                            {/* Filename */}
                                            <div className="p-2 bg-black/40">
                                                <p className="text-xs text-white truncate">{img.filename}</p>
                                                <p className="text-xs text-gray-400">{formatDate(img.uploadedAt)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Unified Image Detail Modal */}
            <ImageDetailsModal
                image={selectedImage}
                isAdmin={false}
                isOwner={true}
                copied={copied}
                onClose={() => setSelectedImage(null)}
                onCopyUrl={copyUrl}
                onToggleVisibility={toggleVisibility}
                onToggleNsfw={toggleNsfw}
            />
        </>
    );
}

// Export the button component to trigger the panel
export function UserPanelButton({ isSignedIn, onClick }: { isSignedIn: boolean; onClick: () => void }) {
    if (!isSignedIn) return null;
    return (
        <button
            onClick={onClick}
            className="px-4 py-2.5 bg-[#2ed573] hover:bg-[#26b85f] rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-2"
        >
            <PixelUser size={14} color="currentColor" />
            <span className="hidden sm:inline">My Uploads</span>
        </button>
    );
}
