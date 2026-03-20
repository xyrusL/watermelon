"use client";

import { useState, useEffect, useRef } from "react";
import {
    PixelLoader,
    PixelLock,
    PixelUser,
    PixelImage,
    PixelClose,
    PixelInfo,
    PixelEye,
    PixelRefresh,
    PixelWarning,
    PixelCheck,
} from "./PixelIcons";
import ActionButton from "../../components/ActionButton";

import { UploadedImage } from "../types";
import ImageDetailsModal from "./ImageDetailsModal";
import { mapDbImagesToUploadedImages, type DbImage } from "../lib/image-mapper";

// Types - Use existing UploadedImage from types.ts
// interface UserImage removed in favor of UploadedImage

interface UserStats {
    totalImages: number;
    publicImages: number;
    privateImages: number;
    nsfwImages?: number;
}

interface UserImagesApiResponse {
    success?: boolean;
    images?: DbImage[];
    stats?: UserStats;
    error?: string;
    message?: string;
}

interface UserPanelProps {
    isSignedIn: boolean;
    showUserPanel: boolean;
    setShowUserPanel: (show: boolean) => void;
    formatDate: (timestamp: number) => string;
    formatFileSize: (bytes?: number) => string;
    onCopyValue: (value: string, target: "url" | "command") => Promise<void>;
    copiedTarget: "url" | "command" | null;
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
    onCopyValue,
    copiedTarget,
    showNotification,
    onClose,
    onImageUpdate,
}: UserPanelProps) {
    const [userImages, setUserImages] = useState<UploadedImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [filterText, setFilterText] = useState("");
    const [filterVisibility, setFilterVisibility] = useState<"all" | "public" | "private">("all");
    const lastUserImagesErrorRef = useRef<string | null>(null);

    const notifyUserImagesError = (message: string, details?: string, dedupe = false) => {
        const dedupeKey = `${message}::${details || ""}`;
        if (dedupe && lastUserImagesErrorRef.current === dedupeKey) return;
        lastUserImagesErrorRef.current = dedupeKey;
        showNotification("error", "User Images Error", message, details);
    };


    // Fetch user's images (uses centralized mapper)
    const fetchUserImages = async (isPolling = false) => {
        if (!isSignedIn) return;
        if (!isPolling) setIsLoading(true);
        try {
            const response = await fetch('/api/user/images');
            let data: UserImagesApiResponse | null = null;
            try {
                data = await response.json();
            } catch {
                // Non-JSON response; we'll fall back to status-based errors below.
            }

            if (!response.ok) {
                const statusMessage = `Request failed with status ${response.status}`;
                const apiMessage = data?.error || data?.message || statusMessage;
                notifyUserImagesError(
                    apiMessage,
                    "Endpoint: /api/user/images",
                    isPolling
                );
                return;
            }

            if (data?.success && Array.isArray(data.images)) {
                const images = mapDbImagesToUploadedImages(data.images);
                setUserImages(images);
                setStats(data.stats || null);
                lastUserImagesErrorRef.current = null;
            } else {
                notifyUserImagesError(
                    data?.error || "Failed to fetch your images",
                    "Endpoint: /api/user/images",
                    isPolling
                );
            }
        } catch (err) {
            console.error("Failed to fetch user images:", err);
            notifyUserImagesError(
                err instanceof Error ? err.message : "Network error while fetching your images",
                "Endpoint: /api/user/images",
                isPolling
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle image visibility (Optimistic UI - no flicker)
    const toggleVisibility = async (imageId: string, currentPrivate: boolean): Promise<boolean> => {
        const newPrivate = !currentPrivate;

        // Optimistic update - update local state immediately
        setUserImages(prev => prev.map(img =>
            (img.id || img.uploadedAt.toString()) === imageId
                ? { ...img, is_private: newPrivate }
                : img
        ));
        // Also update selected image if it's the same one
        setSelectedImage(prev =>
            prev && (prev.id || prev.uploadedAt.toString()) === imageId
                ? { ...prev, is_private: newPrivate }
                : prev
        );

        try {
            const response = await fetch('/api/user/update-visibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, isPrivate: newPrivate }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification("success", "Updated", data.message);
                onImageUpdate?.(); // Notify parent for gallery sync
                return true;
            } else {
                // Revert on failure
                setUserImages(prev => prev.map(img =>
                    (img.id || img.uploadedAt.toString()) === imageId
                        ? { ...img, is_private: currentPrivate }
                        : img
                ));
                showNotification("error", "Update Failed", data.error || "Failed to update visibility");
                return false;
            }
        } catch (err) {
            // Revert on error
            setUserImages(prev => prev.map(img =>
                (img.id || img.uploadedAt.toString()) === imageId
                    ? { ...img, is_private: currentPrivate }
                    : img
            ));
            console.error("Visibility update error:", err);
            showNotification("error", "Error", "An error occurred while updating visibility");
            return false;
        }
    };

    // Toggle NSFW status (Optimistic UI - no flicker)
    const toggleNsfw = async (imageId: string, currentNsfw: boolean): Promise<boolean> => {
        const newNsfw = !currentNsfw;

        // Optimistic update - update local state immediately
        setUserImages(prev => prev.map(img =>
            (img.id || img.uploadedAt.toString()) === imageId
                ? { ...img, is_nsfw: newNsfw }
                : img
        ));
        // Also update selected image if it's the same one
        setSelectedImage(prev =>
            prev && (prev.id || prev.uploadedAt.toString()) === imageId
                ? { ...prev, is_nsfw: newNsfw }
                : prev
        );

        try {
            const response = await fetch('/api/user/update-nsfw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId, isNsfw: newNsfw }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification("success", "Updated", data.message);
                onImageUpdate?.(); // Notify parent for gallery sync
                return true;
            } else {
                // Revert on failure
                setUserImages(prev => prev.map(img =>
                    (img.id || img.uploadedAt.toString()) === imageId
                        ? { ...img, is_nsfw: currentNsfw }
                        : img
                ));
                showNotification("error", "Update Failed", data.error || "Failed to update NSFW status");
                return false;
            }
        } catch (err) {
            // Revert on error
            setUserImages(prev => prev.map(img =>
                (img.id || img.uploadedAt.toString()) === imageId
                    ? { ...img, is_nsfw: currentNsfw }
                    : img
            ));
            console.error("NSFW update error:", err);
            showNotification("error", "Error", "An error occurred while updating NSFW status");
            return false;
        }
    };

    const softDeleteImage = async (imageId: string): Promise<boolean> => {
        setIsDeleting(true);
        try {
            const response = await fetch('/api/user/soft-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageId }),
            });

            const data = await response.json();
            if (data.success) {
                setUserImages(prev => prev.filter(img => (img.id || img.uploadedAt.toString()) !== imageId));
                setDeleteSuccess(true);
                onImageUpdate?.();
                showNotification("success", "Removed", data.message || "Image removed from your uploads");
                setTimeout(() => {
                    setSelectedImage(null);
                    setShowDeleteConfirm(false);
                    setDeleteSuccess(false);
                }, 1200);
                return true;
            }

            showNotification("error", "Delete Failed", data.error || "Failed to remove image");
            return false;
        } catch (err) {
            console.error("Soft delete error:", err);
            showNotification("error", "Delete Failed", "An error occurred while removing image");
            return false;
        } finally {
            setIsDeleting(false);
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
                        <ActionButton
                            onClick={() => {
                                setShowUserPanel(false);
                                setSelectedImage(null);
                                onClose?.();
                            }}
                            variant="secondary"
                            shape="pill"
                            className="w-10 h-10 border-transparent hover:bg-red-500/20 flex items-center justify-center p-0"
                        >
                            <PixelClose size={16} color="#ff4757" />
                        </ActionButton>
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
                        <ActionButton
                            onClick={() => fetchUserImages(false)}
                            variant="secondary"
                            size="sm"
                            className="px-3 py-2 glass-dark border-white/10 hover:border-[#2ed573]/50 text-sm flex items-center justify-center"
                        >
                            <PixelRefresh size={16} color="currentColor" />
                        </ActionButton>
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
                                        <div key={imgId} className="relative group rounded-xl border border-white/10 bg-[#171b22]/70 overflow-hidden transition-all hover:border-[#2ed573]/40 hover:shadow-[0_0_0_1px_rgba(46,213,115,0.25)]">
                                            {/* Status Toggles Container - Flex Column to prevent overlap */}
                                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                                                {/* Privacy Badge */}
                                                <ActionButton
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent opening modal
                                                        toggleVisibility(imgId, img.is_private || false);
                                                    }}
                                                    variant="secondary"
                                                    size="sm"
                                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/10 ${img.is_private
                                                        ? "bg-[#ffa502]/85 hover:bg-[#ffa502] text-white"
                                                        : "bg-[#2ed573]/85 hover:bg-[#2ed573] text-white"
                                                        }`}
                                                    title={img.is_private ? "Private - Click to make public" : "Public - Click to make private"}
                                                >
                                                    {img.is_private ? <><PixelLock size={10} color="#fff" /> PRIVATE</> : <><PixelEye size={10} color="#fff" /> PUBLIC</>}
                                                </ActionButton>

                                                {/* NSFW Badge */}
                                                <ActionButton
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent opening modal
                                                        toggleNsfw(imgId, img.is_nsfw || false);
                                                    }}
                                                    variant="secondary"
                                                    size="sm"
                                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 border border-white/10 ${img.is_nsfw
                                                        ? "bg-[#ff4757]/85 hover:bg-[#ff4757] text-white"
                                                        : "bg-gray-500/85 hover:bg-gray-500 text-white"
                                                        }`}
                                                    title={img.is_nsfw ? "NSFW - Click to mark as safe" : "Safe - Click to mark as NSFW"}
                                                >
                                                    {img.is_nsfw ? <><PixelWarning size={10} color="#fff" /> NSFW</> : <><PixelCheck size={10} color="#fff" /> SAFE</>}
                                                </ActionButton>
                                            </div>

                                            {/* Info Button */}
                                            <div
                                                onClick={() => setSelectedImage(img)}
                                                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/35 border border-white/20 hover:border-[#2ed573]/60 hover:bg-[#2ed573]/25 flex items-center justify-center cursor-pointer transition-all"
                                            >
                                                <PixelInfo size={12} color="currentColor" />
                                            </div>

                                            {/* Image */}
                                            <img
                                                src={img.directUrl}
                                                alt={img.filename}
                                                className={`w-full h-36 object-cover ${img.is_nsfw ? 'blur-lg' : ''}`}
                                            />

                                            {/* Card Meta */}
                                            <div className="p-2.5 bg-gradient-to-b from-black/25 to-black/45 border-t border-white/10">
                                                <p className="text-xs text-white truncate font-medium">{img.filename}</p>
                                                <div className="mt-1 flex items-center justify-between gap-2">
                                                    <p className="text-[11px] text-gray-400 truncate">{formatDate(img.uploadedAt)}</p>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${img.is_private ? "text-[#ffa502] border-[#ffa502]/40 bg-[#ffa502]/10" : "text-[#2ed573] border-[#2ed573]/40 bg-[#2ed573]/10"}`}>
                                                        {img.is_private ? "PRIVATE" : "PUBLIC"}
                                                    </span>
                                                </div>
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
                copiedTarget={copiedTarget}
                onClose={() => {
                    setSelectedImage(null);
                    setShowDeleteConfirm(false);
                    setDeleteSuccess(false);
                }}
                onCopyValue={onCopyValue}
                showDeleteConfirm={showDeleteConfirm}
                deleteSuccess={deleteSuccess}
                isDeleting={isDeleting}
                onDelete={() => {
                    if (!selectedImage) return;
                    const imageId = selectedImage.id || selectedImage.uploadedAt.toString();
                    softDeleteImage(imageId);
                }}
                onShowDeleteConfirm={setShowDeleteConfirm}
                onToggleVisibility={async (id, val) => {
                    const success = await toggleVisibility(id, val);
                    if (success) setSelectedImage(null);
                }}
                onToggleNsfw={async (id, val) => {
                    const success = await toggleNsfw(id, val);
                    if (success) setSelectedImage(null);
                }}
            />
        </>
    );
}

// Export the button component to trigger the panel
export function UserPanelButton({ isSignedIn, onClick }: { isSignedIn: boolean; onClick: () => void }) {
    if (!isSignedIn) return null;
    return (
        <ActionButton
            onClick={onClick}
            variant="primary"
            shape="pill"
            size="md"
            className="px-4 py-2.5 text-sm hover:scale-105 flex items-center gap-2 shrink-0"
        >
            <PixelUser size={14} color="currentColor" />
            <span className="hidden sm:inline">My Uploads</span>
        </ActionButton>
    );
}
