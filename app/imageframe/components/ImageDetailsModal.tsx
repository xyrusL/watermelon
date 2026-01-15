// Image Details Modal Component
import { UploadedImage } from "../types";
import {
    PixelWarning,
    PixelClose,
    PixelUser,
    PixelCheck,
    PixelCopy,
    PixelTrash,
    PixelLock,
    PixelEye
} from "./PixelIcons";
import { formatDate, formatFileSize, ensureAbsoluteUrl } from "../utils";

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
    if (!image) return null;

    const imgId = image.id || image.uploadedAt?.toString();

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90" onClick={onClose}>
            <div className="glass rounded-2xl p-6 max-w-md w-full relative flex flex-col max-h-[90vh] my-auto" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full glass hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                    title="Close"
                >
                    <PixelClose size={12} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                </button>

                {/* Main Image View */}
                <div className="flex-shrink-0 mb-4 bg-black/30 rounded-xl overflow-hidden flex items-center justify-center h-52 relative">
                    {/* NSFW Badge */}
                    {image.is_nsfw && (
                        <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 font-bold shadow-lg">
                            <PixelWarning size={10} color="#fff" /> NSFW
                        </div>
                    )}

                    <img
                        src={image.directUrl}
                        alt={image.filename}
                        className={`max-w-full max-h-full object-contain ${image.is_nsfw ? 'blur-sm hover:blur-none transition-all duration-300' : ''}`}
                    />
                </div>

                {/* Title */}
                <h3 className="font-pixel text-sm text-[#2ed573] mb-4 text-center flex-shrink-0">IMAGE DETAILS</h3>

                {/* Details List - Matches UserPanel Style */}
                <div className="space-y-3 mb-4 text-sm glass-dark rounded-xl p-4 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Filename</span>
                        <span className="text-white truncate ml-4 max-w-[180px] text-right">{image.filename}</span>
                    </div>

                    {image.uploaderName && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Uploader</span>
                            <span className="text-[#2ed573] font-medium flex items-center gap-1">
                                <PixelUser size={12} color="#2ed573" /> {image.uploaderName}
                            </span>
                        </div>
                    )}

                    {/* Visibility Row */}
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

                {/* Action Buttons */}
                {!showDeleteConfirm ? (
                    <div className="grid grid-cols-2 gap-2 flex-shrink-0">
                        {/* Copy URL - Full Width on Mobile, Half on Desktop */}
                        <button
                            onClick={() => onCopyUrl(ensureAbsoluteUrl(image.directUrl))}
                            className="col-span-1 py-2.5 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            {copied ? <><PixelCheck size={14} color="#fff" /> Copied!</> : <><PixelCopy size={14} color="#fff" /> Copy URL</>}
                        </button>

                        {/* Toggle Visibility (Owner or Admin) */}
                        {(isOwner || isAdmin) && onToggleVisibility && imgId && (
                            <button
                                onClick={() => onToggleVisibility(imgId, !!image.is_private)}
                                className={`col-span-1 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${image.is_private
                                    ? "bg-[#2ed573]/20 hover:bg-[#2ed573]/30 text-[#2ed573] border border-[#2ed573]/50"
                                    : "bg-[#ffa502]/20 hover:bg-[#ffa502]/30 text-[#ffa502] border border-[#ffa502]/50"
                                    }`}
                            >
                                {image.is_private ? <><PixelEye size={14} color="currentColor" /> Public</> : <><PixelLock size={14} color="currentColor" /> Private</>}
                            </button>
                        )}

                        {/* Toggle NSFW (Owner or Admin) */}
                        {(isOwner || isAdmin) && onToggleNsfw && imgId && (
                            <button
                                onClick={() => onToggleNsfw(imgId, !!image.is_nsfw)}
                                className={`col-span-1 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${image.is_nsfw
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50"
                                    : "bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/30"
                                    }`}
                            >
                                {image.is_nsfw
                                    ? <><PixelCheck size={14} color="currentColor" /> Safe</>
                                    : <><PixelWarning size={14} color="currentColor" /> NSFW</>}
                            </button>
                        )}

                        {/* Delete Button (Admin or Owner) */}
                        {(isAdmin || isOwner) && onDelete && onShowDeleteConfirm && (
                            <button
                                onClick={() => onShowDeleteConfirm(true)}
                                className="col-span-1 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center"
                                title="Delete Image"
                            >
                                <PixelTrash size={18} color="currentColor" />
                            </button>
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
                        <button
                            onClick={onDelete}
                            disabled={isDeleting}
                            className={`w-full py-3 rounded-xl font-medium transition-all cursor-pointer ${isDeleting ? "bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <button
                            onClick={() => onShowDeleteConfirm && onShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="w-full py-3 rounded-xl glass border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
