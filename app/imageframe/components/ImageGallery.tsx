// Image Gallery Component
import { UploadedImage } from "../types";
import { PixelWarning, PixelLock, PixelUser, PixelEye } from "./PixelIcons";

interface ImageGalleryProps {
    images: UploadedImage[];
    currentUserEmail?: string;
    revealedNsfwImages: Set<number>;
    onImageClick: (img: UploadedImage) => void;
    onToggleNsfwReveal: (timestamp: number, e: React.MouseEvent) => void;
    isSignedIn?: boolean;
}

export default function ImageGallery({
    images,
    currentUserEmail,
    revealedNsfwImages,
    onImageClick,
    onToggleNsfwReveal,
    isSignedIn = false,
}: ImageGalleryProps) {
    // Don't show gallery if user is not signed in
    if (!isSignedIn) return null;
    if (images.length === 0) return null;

    return (
        <div className="mt-16">
            <h2 className="font-pixel text-lg text-[#2ed573] mb-2 text-center">
                RECENT UPLOADS
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">Click an image to view details</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img) => {
                    const isOwnPrivate = img.is_private && img.uploaderEmail === currentUserEmail;
                    const isNsfwImage = img.is_nsfw === true;
                    const imageKey = img.id || img.directUrl || `${img.uploadedAt}-${img.filename}`;
                    return (
                        <div
                            key={imageKey}
                            onClick={() => onImageClick(img)}
                            className={`glass rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all group relative ${isOwnPrivate
                                ? 'ring-2 ring-[#ffa502] ring-offset-2 ring-offset-black/50 shadow-lg shadow-[#ffa502]/20'
                                : ''
                                }`}
                        >
                            {/* Status Badges Container */}
                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5">
                                {/* Private Badge */}
                                {isOwnPrivate && (
                                    <div className="bg-[#ffa502]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg border border-white/10">
                                        <PixelLock size={10} color="#fff" /> PRIVATE
                                    </div>
                                )}
                                {/* NSFW Badge */}
                                {isNsfwImage && (
                                    <div className="bg-[#ff4757]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-lg border border-white/10">
                                        <PixelWarning size={10} color="#fff" /> NSFW
                                    </div>
                                )}
                            </div>
                            {/* Private overlay effect */}
                            {isOwnPrivate && (
                                <div className="absolute inset-0 bg-gradient-to-t from-[#ffa502]/10 to-transparent pointer-events-none z-[5]"></div>
                            )}
                            {/* NSFW blur overlay */}
                            {isNsfwImage && !revealedNsfwImages.has(img.uploadedAt) && (
                                <div className="absolute inset-0 bg-[#ff4757]/10 pointer-events-none z-[5]"></div>
                            )}
                            {/* Eye toggle button to reveal/hide NSFW */}
                            {isNsfwImage && (
                                <button
                                    onClick={(e) => onToggleNsfwReveal(img.uploadedAt, e)}
                                    className="absolute bottom-12 right-2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-[#ff4757] flex items-center justify-center transition-all border border-white/20"
                                    title={revealedNsfwImages.has(img.uploadedAt) ? "Hide NSFW content" : "Reveal NSFW content"}
                                >
                                    {revealedNsfwImages.has(img.uploadedAt) ? (
                                        <PixelEye size={14} color="#fff" />
                                    ) : (
                                        <PixelEye size={14} color="#888" />
                                    )}
                                </button>
                            )}
                            <img
                                src={img.thumbnail || img.directUrl}
                                alt={img.filename}
                                className={`w-full h-24 object-cover ${isNsfwImage && !revealedNsfwImages.has(img.uploadedAt) ? 'blur-lg' : ''}`}
                            />
                            <div className="p-2">
                                {img.uploaderName && (
                                    <p className={`text-xs font-medium truncate mb-1 flex items-center gap-1 ${isOwnPrivate ? 'text-[#ffa502]' : 'text-[#2ed573]'}`}>
                                        <PixelUser size={12} color={isOwnPrivate ? '#ffa502' : '#2ed573'} /> {img.uploaderName}
                                    </p>
                                )}
                                <p className={`text-xs transition-colors text-center ${isOwnPrivate ? 'text-[#ffa502]/70 group-hover:text-[#ffa502]' : 'text-gray-500 group-hover:text-[#ff4757]'}`}>
                                    {isOwnPrivate ? '🔒 Only you can see' : 'View details'}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
