// Image Gallery Component
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { UploadedImage } from "../types";
import { PixelWarning, PixelLock, PixelUser, PixelEye } from "./PixelIcons";
import ActionButton from "../../components/ActionButton";

interface ImageGalleryProps {
    images: UploadedImage[];
    currentUserEmail?: string;
    revealedNsfwImages: Set<number>;
    onImageClick: (img: UploadedImage) => void;
    onToggleNsfwReveal: (timestamp: number, e: React.MouseEvent) => void;
    isSignedIn?: boolean;
    imagesPerPage?: number;
}

const DEFAULT_IMAGES_PER_PAGE = 12;
const UI_ACCENT = "#2ed573";
const NEW_RELEASE_WINDOW_MS = 24 * 60 * 60 * 1000;

type SortOrder = "newest" | "oldest";
type DateWindow = "all" | "day" | "week" | "month" | "year";

const DATE_WINDOW_MS: Record<Exclude<DateWindow, "all">, number> = {
    day: 24 * 60 * 60 * 1000,
    week: 7 * 24 * 60 * 60 * 1000,
    month: 30 * 24 * 60 * 60 * 1000,
    year: 365 * 24 * 60 * 60 * 1000,
};

const buildPageItems = (totalPages: number, currentPage: number): Array<number | "ellipsis"> => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
    const safePages = Array.from(pages)
        .filter((page) => page >= 1 && page <= totalPages)
        .sort((a, b) => a - b);

    const items: Array<number | "ellipsis"> = [];
    for (let i = 0; i < safePages.length; i++) {
        const page = safePages[i];
        const prev = safePages[i - 1];
        if (prev && page - prev > 1) {
            items.push("ellipsis");
        }
        items.push(page);
    }

    return items;
};

export default function ImageGallery({
    images,
    currentUserEmail,
    revealedNsfwImages,
    onImageClick,
    onToggleNsfwReveal,
    isSignedIn = false,
    imagesPerPage,
}: ImageGalleryProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
    const [dateWindow, setDateWindow] = useState<DateWindow>("all");
    const [newReleaseOnly, setNewReleaseOnly] = useState(false);
    const [autoImagesPerPage, setAutoImagesPerPage] = useState(DEFAULT_IMAGES_PER_PAGE);
    const [nowTs, setNowTs] = useState(() => Date.now());

    useEffect(() => {
        if (imagesPerPage && imagesPerPage > 0) return;

        const recomputeAutoPerPage = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;

            const columns = width >= 1280 ? 4 : width >= 768 ? 3 : 2;
            let rows = 3;
            if (height >= 1200) rows = 5;
            else if (height >= 900) rows = 4;
            else if (height < 760) rows = 2;

            const next = Math.max(4, columns * rows);
            setAutoImagesPerPage(next);
        };

        recomputeAutoPerPage();
        window.addEventListener("resize", recomputeAutoPerPage);
        return () => window.removeEventListener("resize", recomputeAutoPerPage);
    }, [imagesPerPage]);

    useEffect(() => {
        const refreshTimer = window.setInterval(() => {
            setNowTs(Date.now());
        }, 60_000);
        return () => window.clearInterval(refreshTimer);
    }, []);

    const effectiveImagesPerPage = imagesPerPage && imagesPerPage > 0 ? imagesPerPage : autoImagesPerPage;

    const filteredImages = useMemo(() => {
        const windowMs = dateWindow === "all" ? null : DATE_WINDOW_MS[dateWindow];

        const visible = images.filter((img) => {
            const age = nowTs - img.uploadedAt;
            const withinWindow = windowMs === null || age <= windowMs;
            const withinReleaseWindow = !newReleaseOnly || age <= NEW_RELEASE_WINDOW_MS;
            return withinWindow && withinReleaseWindow;
        });

        return [...visible].sort((a, b) =>
            sortOrder === "newest" ? b.uploadedAt - a.uploadedAt : a.uploadedAt - b.uploadedAt
        );
    }, [images, sortOrder, dateWindow, newReleaseOnly, nowTs]);

    const totalPages = Math.max(1, Math.ceil(filteredImages.length / effectiveImagesPerPage));
    const activePage = Math.min(currentPage, totalPages);
    const startIndex = (activePage - 1) * effectiveImagesPerPage;

    const pageItems = useMemo(() => buildPageItems(totalPages, activePage), [totalPages, activePage]);
    const pagedImages = useMemo(
        () => filteredImages.slice(startIndex, startIndex + effectiveImagesPerPage),
        [filteredImages, startIndex, effectiveImagesPerPage]
    );

    if (!isSignedIn) return null;
    if (images.length === 0) return null;

    const getActiveStyle = () => ({
        borderColor: `${UI_ACCENT}66`,
        color: UI_ACCENT,
        backgroundColor: `${UI_ACCENT}22`,
    });

    return (
        <div className="mt-16">
            <h2 className="font-pixel text-lg text-[#2ed573] mb-2 text-center">
                RECENT UPLOADS
            </h2>
            <p className="text-gray-500 text-sm text-center mb-6">Click an image to view details</p>

            <div className="glass rounded-2xl border border-white/10 p-3 sm:p-4 mb-5">
                <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-[11px] uppercase tracking-wide text-gray-400">Sort</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value as SortOrder);
                                setCurrentPage(1);
                            }}
                            className="h-9 px-3 rounded-lg glass border border-white/10 text-sm text-gray-200 focus:outline-none focus:border-[#2ed573]/60"
                        >
                            <option value="newest" className="bg-[#1a1a1a]">Newest</option>
                            <option value="oldest" className="bg-[#1a1a1a]">Oldest</option>
                        </select>
                    </label>
                    <label className="flex flex-col gap-1 min-w-[140px]">
                        <span className="text-[11px] uppercase tracking-wide text-gray-400">Range</span>
                        <select
                            value={dateWindow}
                            onChange={(e) => {
                                setDateWindow(e.target.value as DateWindow);
                                setCurrentPage(1);
                            }}
                            className="h-9 px-3 rounded-lg glass border border-white/10 text-sm text-gray-200 focus:outline-none focus:border-[#2ed573]/60"
                        >
                            <option value="all" className="bg-[#1a1a1a]">All</option>
                            <option value="day" className="bg-[#1a1a1a]">Day</option>
                            <option value="week" className="bg-[#1a1a1a]">Week</option>
                            <option value="month" className="bg-[#1a1a1a]">Month</option>
                            <option value="year" className="bg-[#1a1a1a]">Year</option>
                        </select>
                    </label>
                    <ActionButton
                        type="button"
                        onClick={() => {
                            setNewReleaseOnly((prev) => !prev);
                            setCurrentPage(1);
                        }}
                        variant="secondary"
                        size="sm"
                        className="h-9 px-3 rounded-lg text-sm border-white/10 text-gray-300 hover:text-white hover:border-white/25"
                        style={newReleaseOnly ? getActiveStyle() : undefined}
                    >
                        New Release
                    </ActionButton>
                    <span className="text-xs text-gray-500 ml-auto mb-2">
                        {filteredImages.length} result{filteredImages.length === 1 ? "" : "s"} · {effectiveImagesPerPage}/page
                    </span>
                </div>
            </div>

            {filteredImages.length === 0 ? (
                <div className="glass rounded-2xl border border-white/10 p-6 text-center text-gray-400">
                    No images match the selected filters.
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {pagedImages.map((img) => {
                        const isOwnPrivate = img.is_private && img.uploaderEmail === currentUserEmail;
                        const isNsfwImage = img.is_nsfw === true;
                        const imageKey = img.id || img.directUrl || `${img.uploadedAt}-${img.filename}`;

                        return (
                            <div
                                key={imageKey}
                                onClick={() => onImageClick(img)}
                                className={`glass rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 group relative border ${isOwnPrivate
                                    ? "border-[#ffa502]/60 shadow-[0_0_28px_rgba(255,165,2,0.25)]"
                                    : "border-white/10 shadow-[0_0_16px_rgba(0,0,0,0.35)] hover:border-[#2ed573]/35"
                                    }`}
                            >
                                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                                    {isOwnPrivate && (
                                        <div className="bg-[#ffa502]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg border border-white/10">
                                            <PixelLock size={10} color="#fff" /> PRIVATE
                                        </div>
                                    )}
                                    {isNsfwImage && (
                                        <div className="bg-[#ff4757]/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg border border-white/10">
                                            <PixelWarning size={10} color="#fff" /> NSFW
                                        </div>
                                    )}
                                </div>

                                {isOwnPrivate && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#ffa502]/10 to-transparent pointer-events-none z-[5]"></div>
                                )}
                                {isNsfwImage && !revealedNsfwImages.has(img.uploadedAt) && (
                                    <div className="absolute inset-0 bg-[#ff4757]/10 pointer-events-none z-[5]"></div>
                                )}

                                {isNsfwImage && (
                                    <ActionButton
                                        onClick={(e) => onToggleNsfwReveal(img.uploadedAt, e)}
                                        variant="secondary"
                                        shape="pill"
                                        className="absolute bottom-[42px] right-2 z-20 w-7 h-7 bg-black/70 hover:bg-[#ff4757] flex items-center justify-center border-white/20 p-0"
                                        title={revealedNsfwImages.has(img.uploadedAt) ? "Hide NSFW content" : "Reveal NSFW content"}
                                    >
                                        {revealedNsfwImages.has(img.uploadedAt) ? (
                                            <PixelEye size={14} color="#fff" />
                                        ) : (
                                            <PixelEye size={14} color="#888" />
                                        )}
                                    </ActionButton>
                                )}

                                <div className="relative w-full h-32 md:h-36">
                                    <Image
                                        src={img.thumbnail || img.directUrl}
                                        alt={img.filename}
                                        fill
                                        unoptimized
                                        sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
                                        className={`object-cover ${isNsfwImage && !revealedNsfwImages.has(img.uploadedAt) ? "blur-lg" : ""}`}
                                    />
                                </div>

                                <div className="p-2.5 space-y-2">
                                    <div className="flex items-center gap-1.5 text-sm font-medium">
                                        <PixelUser size={12} color={isOwnPrivate ? "#ffa502" : "#9ce6ca"} />
                                        <span className={`${isOwnPrivate ? "text-[#ffa502]" : "text-[#2ed573]"} truncate`}>
                                            {img.uploaderName || "Anonymous"}
                                        </span>
                                    </div>
                                    <div className={`w-full rounded-full py-1 text-center text-sm font-medium border transition-all ${isOwnPrivate
                                        ? "bg-[#3f2f15] border-[#ffa502]/40 text-[#ffc569]"
                                        : "bg-black/30 border-white/10 text-gray-300 group-hover:bg-black/40 group-hover:text-white"
                                        }`}>
                                        {isOwnPrivate ? "Only you can see" : "View details"}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {filteredImages.length > 0 && totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                    <ActionButton
                        type="button"
                        onClick={() => setCurrentPage(Math.max(1, activePage - 1))}
                        disabled={activePage === 1}
                        variant="secondary"
                        className="min-w-12 h-11 px-4 border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/25"
                    >
                        Prev
                    </ActionButton>
                    {pageItems.map((item, idx) => {
                        if (item === "ellipsis") {
                            return (
                                <span key={`ellipsis-${idx}`} className="min-w-10 h-11 px-2 flex items-center justify-center text-gray-400">
                                    ...
                                </span>
                            );
                        }

                        const isActive = item === activePage;
                        return (
                            <ActionButton
                                key={item}
                                type="button"
                                onClick={() => setCurrentPage(item)}
                                aria-current={isActive ? "page" : undefined}
                                variant="secondary"
                                className={`min-w-11 h-11 px-3 text-sm font-semibold ${isActive
                                    ? ""
                                    : "border-white/10 text-gray-300 hover:text-white hover:border-white/25"
                                    }`}
                                style={
                                    isActive
                                        ? {
                                            borderColor: `${UI_ACCENT}66`,
                                            color: UI_ACCENT,
                                            backgroundColor: `${UI_ACCENT}33`,
                                            boxShadow: `0 0 16px ${UI_ACCENT}44`,
                                        }
                                        : undefined
                                }
                            >
                                {item}
                            </ActionButton>
                        );
                    })}
                    <ActionButton
                        type="button"
                        onClick={() => setCurrentPage(Math.min(totalPages, activePage + 1))}
                        disabled={activePage === totalPages}
                        variant="secondary"
                        className="min-w-12 h-11 px-4 border-white/10 text-sm text-gray-300 hover:text-white hover:border-white/25"
                    >
                        Next
                    </ActionButton>
                </div>
            )}
        </div>
    );
}
