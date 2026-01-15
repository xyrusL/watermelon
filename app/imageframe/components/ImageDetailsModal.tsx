// Image Details Modal Component
import { UploadedImage } from "../types";
import { PixelWarning } from "./PixelIcons";
import { formatDate, formatFileSize, ensureAbsoluteUrl } from "../utils";

interface ImageDetailsModalProps {
    image: UploadedImage | null;
    isAdmin: boolean;
    copied: boolean;
    showDeleteConfirm: boolean;
    deleteSuccess: boolean;
    isDeleting: boolean;
    onClose: () => void;
    onCopyUrl: (url: string) => void;
    onDelete: () => void;
    onShowDeleteConfirm: (show: boolean) => void;
}

export default function ImageDetailsModal({
    image,
    isAdmin,
    copied,
    showDeleteConfirm,
    deleteSuccess,
    isDeleting,
    onClose,
    onCopyUrl,
    onDelete,
    onShowDeleteConfirm,
}: ImageDetailsModalProps) {
    if (!image) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
            <div className="glass rounded-2xl p-6 max-w-md w-full relative" onClick={(e) => e.stopPropagation()}>
                {/* X Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full glass border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center group z-10"
                    title="Close"
                >
                    <span className="text-gray-400 group-hover:text-red-400 transition-colors">✕</span>
                </button>

                {/* NSFW Badge in modal */}
                {image.is_nsfw && (
                    <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 font-bold shadow-lg">
                        <PixelWarning size={12} color="#fff" /> NSFW Content
                    </div>
                )}

                <img
                    src={image.directUrl}
                    alt={image.filename}
                    className="w-full max-h-48 object-contain rounded-xl mb-4"
                />

                {/* NSFW Warning text */}
                {image.is_nsfw && (
                    <p className="text-center text-[#ff4757] text-xs mb-2 font-medium">
                        ⚠️ This content has been marked as NSFW by the uploader
                    </p>
                )}

                <h3 className="font-pixel text-sm text-[#ff4757] mb-4 text-center">IMAGE DETAILS</h3>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Filename</span>
                        <span className="text-white truncate ml-2 max-w-[200px]">{image.filename}</span>
                    </div>
                    {image.uploaderName && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Uploader</span>
                            <span className="text-[#2ed573] font-medium">👤 {image.uploaderName}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Uploaded</span>
                        <span className="text-white">{formatDate(image.uploadedAt)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Size</span>
                        <span className="text-white">{formatFileSize(image.fileSize)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Host</span>
                        <span className={`font-pixel text-xs ${image.host === "supabase" ? "text-[#2ed573]" : "text-[#ff4757]"}`}>
                            {image.host === "supabase" ? "Watermelon Storage" : "imgbb"}
                        </span>
                    </div>
                </div>

                {!showDeleteConfirm ? (
                    <div className="space-y-3">
                        <button
                            onClick={() => onCopyUrl(ensureAbsoluteUrl(image.directUrl))}
                            className="w-full py-3 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-medium transition-all cursor-pointer"
                        >
                            {copied ? "✓ Copied!" : "📋 Copy URL"}
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => onShowDeleteConfirm(true)}
                                className="w-full py-3 rounded-xl glass border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            >
                                🗑️ Delete Image
                            </button>
                        )}
                    </div>
                ) : deleteSuccess ? (
                    <div className="text-center py-4">
                        <div className="text-4xl mb-4">✅</div>
                        <p className="text-[#2ed573] font-medium">Removed from Gallery!</p>
                        <p className="text-xs text-gray-500 mt-2">Note: Image may still exist on imgbb (free account limitation)</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-center text-gray-300 mb-2">Are you sure you want to delete this image?</p>
                        <p className="text-center text-xs text-gray-500 mb-4">This removes from your gallery. imgbb free accounts may not fully delete from server.</p>
                        <button
                            onClick={onDelete}
                            disabled={isDeleting}
                            className={`w-full py-3 rounded-xl font-medium transition-all cursor-pointer ${isDeleting ? "bg-gray-600" : "bg-red-500 hover:bg-red-600"}`}
                        >
                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                        </button>
                        <button
                            onClick={() => onShowDeleteConfirm(false)}
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
