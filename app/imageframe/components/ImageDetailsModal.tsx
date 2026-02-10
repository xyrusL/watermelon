// Image Details Modal Component
import { useEffect, useMemo, useState } from "react";
import { UploadedImage } from "../types";
import {
    PixelWarning,
    PixelClose,
    PixelUser,
    PixelCheck,
    PixelCopy,
    PixelTrash,
    PixelLock,
    PixelEye,
    PixelExternalLink
} from "./PixelIcons";
import ActionButton from "../../components/ActionButton";
import { formatDate, formatFileSize, ensureAbsoluteUrl } from "../utils";
import {
    buildImageFrameCreateCommand,
    sanitizeImageFrameName,
    suggestFrameSizeFromPixels,
} from "../lib/imageframe-command";

interface ImageDetailsModalProps {
    image: UploadedImage | null;
    isAdmin?: boolean;
    isOwner?: boolean;
    copied: boolean;
    showDeleteConfirm?: boolean;
    deleteSuccess?: boolean;
    isDeleting?: boolean;
    onClose: () => void;
    onCopyUrl: (url: string) => void;
    onDelete?: () => void;
    onShowDeleteConfirm?: (show: boolean) => void;
    onToggleVisibility?: (imageId: string, currentPrivate: boolean) => void;
    onToggleNsfw?: (imageId: string, currentNsfw: boolean) => void;
}

export default function ImageDetailsModal({
    image,
    isAdmin = false,
    isOwner = false,
    copied,
    showDeleteConfirm = false,
    deleteSuccess = false,
    isDeleting = false,
    onClose,
    onCopyUrl,
    onDelete,
    onShowDeleteConfirm,
    onToggleVisibility,
    onToggleNsfw,
}: ImageDetailsModalProps) {
    const [commandName, setCommandName] = useState(sanitizeImageFrameName(image?.filename || "image-frame"));

    useEffect(() => {
        if (!image) return;
        setCommandName(sanitizeImageFrameName(image.filename));
    }, [image]);

    const frameSuggestion = useMemo(() => {
        if (!image) {
            return { width: 1, height: 1, source: "fallback" as const };
        }
        if (image.frameWidth && image.frameHeight) {
            return { width: image.frameWidth, height: image.frameHeight, source: "saved" as const };
        }
        if (image.imageWidth && image.imageHeight) {
            const suggested = suggestFrameSizeFromPixels(image.imageWidth, image.imageHeight);
            return {
                width: suggested.dimensions.width,
                height: suggested.dimensions.height,
                source: suggested.source as string,
            };
        }
        return { width: 1, height: 1, source: "fallback" as const };
    }, [image]);

    const imageFrameCommand = useMemo(() => {
        if (!image) return "";
        return buildImageFrameCreateCommand({
            name: commandName,
            url: ensureAbsoluteUrl(image.directUrl),
            width: frameSuggestion.width,
            height: frameSuggestion.height,
        });
    }, [commandName, image, frameSuggestion.width, frameSuggestion.height]);

    const showOwnerControls = isOwner && !isAdmin;
    const showAdminControls = isAdmin;
    if (!image) return null;

    const imgId = image.id || image.uploadedAt?.toString();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90" onClick={onClose}>
            <div
                className="glass rounded-2xl p-3 sm:p-4 md:p-6 max-w-4xl w-full relative max-h-[90vh] my-auto overflow-y-auto overflow-x-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <ActionButton
                    onClick={onClose}
                    variant="secondary"
                    shape="pill"
                    className="absolute top-3 right-3 w-8 h-8 hover:bg-red-500/20 text-gray-400 hover:text-white z-10 p-0"
                    title="Close"
                >
                    <PixelClose size={12} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                </ActionButton>

                <div className="grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-3 sm:gap-4 md:gap-5 h-full">
                    <div className="glass-dark rounded-xl p-3 border border-white/10">
                        <div className="bg-black/30 rounded-xl overflow-hidden flex items-center justify-center h-[220px] sm:h-[280px] md:h-[360px] relative">
                            {image.is_nsfw && (
                                <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold shadow-lg">
                                    <PixelWarning size={10} color="#fff" /> NSFW
                                </div>
                            )}
                            <ActionButton
                                onClick={() => window.open(ensureAbsoluteUrl(image.directUrl), "_blank", "noopener,noreferrer")}
                                variant="secondary"
                                className="absolute left-2 top-2 z-10 w-8 h-8 rounded-lg hover:border-[#2ed573]/60 hover:text-[#2ed573] text-gray-300 flex items-center justify-center p-0"
                                title="Open full image"
                            >
                                <PixelExternalLink size={12} color="currentColor" />
                            </ActionButton>

                            <img
                                src={image.directUrl}
                                alt={image.filename}
                                className={`max-w-full max-h-full object-contain ${image.is_nsfw ? "blur-sm hover:blur-none transition-all duration-300" : ""}`}
                            />
                        </div>
                    </div>

                    <div className="min-h-0 min-w-0 flex flex-col">
                        <h3 className="font-pixel text-sm text-[#2ed573] mb-3 text-left flex-shrink-0">IMAGE DETAILS</h3>

                        <div className="space-y-3 mb-4 text-sm glass-dark rounded-xl p-3 sm:p-4 overflow-y-auto custom-scrollbar max-h-[34vh] lg:max-h-none">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Filename</span>
                                <span className="text-white truncate ml-4 max-w-[55vw] sm:max-w-[260px] text-right">{image.filename}</span>
                            </div>

                            {image.uploaderName && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Uploader</span>
                                    <span className="text-[#2ed573] font-medium flex items-center gap-1">
                                        <PixelUser size={12} color="#2ed573" /> {image.uploaderName}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Visibility</span>
                                <span className={`flex items-center gap-1 ${image.is_private ? "text-[#ffa502]" : "text-[#2ed573]"}`}>
                                    {image.is_private ? <><PixelLock size={12} color="#ffa502" /> Private</> : <><PixelEye size={12} color="#2ed573" /> Public</>}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Uploaded</span>
                                <span className="text-white">{formatDate(image.uploadedAt)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Size</span>
                                <span className="text-white">{formatFileSize(image.fileSize)}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Host</span>
                                <span className={`font-pixel text-[10px] ${image.host === "supabase" ? "text-[#2ed573]" : "text-[#ff4757]"}`}>
                                    {image.host === "supabase" ? "WATERMELON" : "IMGBB"}
                                </span>
                            </div>
                        </div>

                        {!showDeleteConfirm ? (
                            <div className="space-y-3 flex-shrink-0">
                                <div className="glass-dark rounded-xl p-3 border border-white/10">
                                    <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-2">ImageFrame Command Name</p>
                                    <input
                                        value={commandName}
                                        onChange={(e) => setCommandName(e.target.value)}
                                        placeholder="my-frame"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-[#2ed573]/60 outline-none"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2">
                                        Uses {frameSuggestion.width}x{frameSuggestion.height} frames ({String(frameSuggestion.source)})
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <ActionButton
                                        onClick={() => onCopyUrl(ensureAbsoluteUrl(image.directUrl))}
                                        variant="secondary"
                                        className="py-2.5 bg-sky-500/20 hover:bg-sky-500/30 border-sky-400/50 text-sky-300 text-sm cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        {copied ? <><PixelCheck size={14} color="currentColor" /> Copied!</> : <><PixelCopy size={14} color="currentColor" /> Copy URL</>}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => onCopyUrl(imageFrameCommand)}
                                        variant="secondary"
                                        className="py-2.5 bg-[#2ed573]/20 hover:bg-[#2ed573]/30 border-[#2ed573]/50 text-[#2ed573] text-sm cursor-pointer flex items-center justify-center gap-2"
                                    >
                                        <PixelCopy size={14} color="currentColor" /> Copy Command
                                    </ActionButton>
                                </div>

                                {showOwnerControls && (
                                    <div className="glass-dark rounded-xl p-3 border border-[#2ed573]/20 space-y-2">
                                        <p className="text-[10px] uppercase tracking-wide text-[#2ed573]">User Controls</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {onToggleVisibility && imgId && (
                                                <ActionButton
                                                    onClick={() => onToggleVisibility(imgId, !!image.is_private)}
                                                    variant="secondary"
                                                    className={`py-2.5 text-sm cursor-pointer flex items-center justify-center gap-2 ${image.is_private
                                                        ? "bg-[#2ed573]/20 hover:bg-[#2ed573]/30 text-[#2ed573] border border-[#2ed573]/50"
                                                        : "bg-[#ffa502]/20 hover:bg-[#ffa502]/30 text-[#ffa502] border border-[#ffa502]/50"
                                                        }`}
                                                >
                                                    {image.is_private ? <><PixelEye size={14} color="currentColor" /> Public</> : <><PixelLock size={14} color="currentColor" /> Private</>}
                                                </ActionButton>
                                            )}
                                            {onToggleNsfw && imgId && (
                                                <ActionButton
                                                    onClick={() => onToggleNsfw(imgId, !!image.is_nsfw)}
                                                    variant="secondary"
                                                    className={`py-2.5 text-sm cursor-pointer flex items-center justify-center gap-2 ${image.is_nsfw
                                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                                                        : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30"
                                                        }`}
                                                >
                                                    {image.is_nsfw
                                                        ? <><PixelCheck size={14} color="currentColor" /> Safe</>
                                                        : <><PixelWarning size={14} color="currentColor" /> NSFW</>}
                                                </ActionButton>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {showAdminControls && (
                                    <div className="glass-dark rounded-xl p-3 border border-red-500/20 space-y-2">
                                        <p className="text-[10px] uppercase tracking-wide text-red-400">Admin Controls</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {onToggleVisibility && imgId && (
                                                <ActionButton
                                                    onClick={() => onToggleVisibility(imgId, !!image.is_private)}
                                                    variant="secondary"
                                                    className={`py-2.5 text-sm cursor-pointer flex items-center justify-center gap-2 ${image.is_private
                                                        ? "bg-[#2ed573]/20 hover:bg-[#2ed573]/30 text-[#2ed573] border border-[#2ed573]/50"
                                                        : "bg-[#ffa502]/20 hover:bg-[#ffa502]/30 text-[#ffa502] border border-[#ffa502]/50"
                                                        }`}
                                                >
                                                    {image.is_private ? <><PixelEye size={14} color="currentColor" /> Public</> : <><PixelLock size={14} color="currentColor" /> Private</>}
                                                </ActionButton>
                                            )}
                                            {onToggleNsfw && imgId && (
                                                <ActionButton
                                                    onClick={() => onToggleNsfw(imgId, !!image.is_nsfw)}
                                                    variant="secondary"
                                                    className={`py-2.5 text-sm cursor-pointer flex items-center justify-center gap-2 ${image.is_nsfw
                                                        ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                                                        : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30"
                                                        }`}
                                                >
                                                    {image.is_nsfw
                                                        ? <><PixelCheck size={14} color="currentColor" /> Safe</>
                                                        : <><PixelWarning size={14} color="currentColor" /> NSFW</>}
                                                </ActionButton>
                                            )}
                                            {onDelete && onShowDeleteConfirm && (
                                                <ActionButton
                                                    onClick={() => onShowDeleteConfirm(true)}
                                                    variant="secondary"
                                                    className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30 cursor-pointer flex items-center justify-center"
                                                    title="Delete Image"
                                                >
                                                    <PixelTrash size={18} color="currentColor" />
                                                </ActionButton>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : deleteSuccess ? (
                            <div className="text-center py-4">
                                <div className="flex justify-center mb-4"><PixelCheck size={48} color="#2ed573" /></div>
                                <p className="text-[#2ed573] font-medium">Removed from Gallery!</p>
                                <p className="text-xs text-gray-500 mt-2">Note: Image may still exist on imgbb (free account limitation)</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-center text-gray-300 mb-2">Are you sure you want to delete this image?</p>
                                <ActionButton
                                    onClick={onDelete}
                                    disabled={isDeleting}
                                    variant="danger"
                                    fullWidth
                                    className={`cursor-pointer ${isDeleting ? "bg-gray-600 border-gray-600 hover:bg-gray-600" : ""}`}
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                                </ActionButton>
                                <ActionButton
                                    onClick={() => onShowDeleteConfirm && onShowDeleteConfirm(false)}
                                    disabled={isDeleting}
                                    variant="secondary"
                                    fullWidth
                                    className="hover:border-white/30 cursor-pointer"
                                >
                                    Cancel
                                </ActionButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
