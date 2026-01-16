"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
    PixelClose,
    PixelCrop,
    PixelCheck,
    PixelRefresh,
} from "./PixelIcons";
import { FRAME_SIZES } from "../constants";
import type { FrameSize } from "../types";
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ZoomIn, ZoomOut, Maximize } from "lucide-react";

interface ImageEditorProps {
    isOpen: boolean;
    imageSrc: string | null;
    originalFile: File | null;
    onClose: () => void;
    onApply: (croppedFile: File, previewUrl: string) => void;
}

export default function ImageEditor({
    isOpen,
    imageSrc,
    originalFile,
    onClose,
    onApply,
}: ImageEditorProps) {
    // Crop state
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [selectedFrameSize, setSelectedFrameSize] = useState<FrameSize>(FRAME_SIZES[1]); // Default 2×2

    // Transform state
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Custom frame size state
    const [customWidth, setCustomWidth] = useState(3);
    const [customHeight, setCustomHeight] = useState(2);
    const [isCustomMode, setIsCustomMode] = useState(false);

    // Refs
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Reset all transformations
    const resetTransforms = () => {
        setZoom(1);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
    };

    // Reset when modal opens
    useEffect(() => {
        if (isOpen) {
            resetTransforms();
            setCrop(undefined);
            setCompletedCrop(undefined);
            setSelectedFrameSize(FRAME_SIZES[1]);
            setIsCustomMode(false);
            setCustomWidth(3);
            setCustomHeight(2);
        }
    }, [isOpen]);

    // Get the current aspect ratio (either from preset or custom)
    const getCurrentAspectRatio = useCallback(() => {
        if (isCustomMode) {
            return customWidth / customHeight;
        }
        return selectedFrameSize.ratio;
    }, [isCustomMode, customWidth, customHeight, selectedFrameSize.ratio]);

    // Get display name for current ratio
    const getCurrentRatioName = () => {
        if (isCustomMode) {
            return `${customWidth}×${customHeight}`;
        }
        return selectedFrameSize.name;
    };

    // Get total frame count
    const getTotalFrames = () => {
        if (isCustomMode) {
            return customWidth * customHeight;
        }
        return selectedFrameSize.frames;
    };

    // Initialize crop when image loads
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const aspect = getCurrentAspectRatio();

        if (aspect) {
            const newCrop = centerCrop(
                makeAspectCrop(
                    { unit: "%", width: 90 },
                    aspect,
                    width,
                    height
                ),
                width,
                height
            );
            setCrop(newCrop);
        } else {
            // Free crop
            setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
        }
    }, [getCurrentAspectRatio]);

    // Update crop when frame size or custom dimensions change
    useEffect(() => {
        if (imgRef.current && isOpen) {
            const { width, height } = imgRef.current;
            const aspect = getCurrentAspectRatio();

            if (aspect) {
                const newCrop = centerCrop(
                    makeAspectCrop(
                        { unit: "%", width: 90 },
                        aspect,
                        width,
                        height
                    ),
                    width,
                    height
                );
                setCrop(newCrop);
            } else {
                // Free crop - reset to center
                setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
            }
        }
    }, [selectedFrameSize, isCustomMode, customWidth, customHeight, isOpen, getCurrentAspectRatio]);

    // Auto-fit: maximize crop area to fill the ratio
    const autoFit = () => {
        if (!imgRef.current) return;
        const { width, height } = imgRef.current;
        const aspect = getCurrentAspectRatio();

        if (aspect) {
            // Calculate the largest possible crop that fits the aspect ratio
            let cropWidth = width;
            let cropHeight = width / aspect;

            if (cropHeight > height) {
                cropHeight = height;
                cropWidth = height * aspect;
            }

            const x = (width - cropWidth) / 2;
            const y = (height - cropHeight) / 2;

            setCrop({
                unit: "px",
                x,
                y,
                width: cropWidth,
                height: cropHeight,
            });
        } else {
            // Free crop - maximize
            setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
        }
    };

    // Apply crop with transformations
    const applyCrop = async () => {
        if (!completedCrop || !imgRef.current || !canvasRef.current) return;

        const image = imgRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Calculate crop dimensions
        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        // Determine output dimensions based on rotation
        const isRotated90or270 = rotation === 90 || rotation === 270;
        const outputWidth = isRotated90or270 ? cropHeight : cropWidth;
        const outputHeight = isRotated90or270 ? cropWidth : cropHeight;

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        // Apply transformations
        ctx.save();
        ctx.translate(outputWidth / 2, outputHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Draw the image centered
        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            -cropWidth / 2,
            -cropHeight / 2,
            cropWidth,
            cropHeight
        );
        ctx.restore();

        // Convert to blob and create file
        canvas.toBlob((blob) => {
            if (blob) {
                const croppedUrl = URL.createObjectURL(blob);
                const originalName = originalFile?.name || "image.png";
                const extension = originalName.split('.').pop() || 'png';
                const croppedFile = new File([blob], `watermelon-${Date.now()}.${extension}`, {
                    type: "image/png",
                });
                onApply(croppedFile, croppedUrl);
            }
        }, "image/png");
    };

    // Zoom handlers
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    // Rotation handlers
    const rotateClockwise = () => setRotation(prev => (prev + 90) % 360);
    const rotateCounterClockwise = () => setRotation(prev => (prev - 90 + 360) % 360);

    if (!isOpen || !imageSrc) return null;

    // Build transform style
    const imageTransform = `scale(${zoom}) rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/95">
            <div className="glass md:rounded-2xl w-full max-w-6xl h-full md:h-[90vh] flex flex-col overflow-hidden shadow-2xl border-none md:border border-white/10">

                {/* Header - Always visible */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-md z-10 flex-shrink-0">
                    <h2 className="font-pixel text-lg text-[#ff4757] flex items-center gap-2">
                        <PixelCrop size={20} color="#ff4757" /> EDIT IMAGE
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full glass hover:bg-red-500/20 transition-all flex items-center justify-center"
                    >
                        <PixelClose size={14} color="#ff4757" />
                    </button>
                </div>

                {/* Main Content Area - Responsive Flex */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                    {/* LEFT/TOP: Image Canvas area */}
                    <div className="flex-1 bg-black/40 relative overflow-hidden flex items-center justify-center p-4 lg:p-8">
                        <div
                            style={{
                                transform: imageTransform,
                                transformOrigin: "center center",
                                transition: "transform 0.2s ease-out",
                                maxWidth: "100%",
                                maxHeight: "100%"
                            }}
                        >
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={getCurrentAspectRatio()}
                                className="max-h-[60vh] lg:max-h-[75vh]"
                            >
                                <img
                                    ref={imgRef}
                                    src={imageSrc}
                                    alt="Edit"
                                    onLoad={onImageLoad}
                                    className="max-h-[60vh] lg:max-h-[75vh] object-contain"
                                    style={{ maxWidth: "100%" }}
                                />
                            </ReactCrop>
                        </div>

                        {/* Info Overlay */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs text-gray-300 pointer-events-none whitespace-nowrap z-10 flex items-center gap-2">
                            <span className="text-[#ff4757] font-medium">{getCurrentRatioName()}</span>
                            <span className="text-gray-500">•</span>
                            <span>{getTotalFrames()} frames</span>
                            <span className="text-gray-500">•</span>
                            <span>{Math.round(zoom * 100)}%</span>
                        </div>
                    </div>

                    {/* RIGHT/BOTTOM: Controls Sidebar */}
                    <div className="w-full lg:w-96 bg-[#1a1a1a]/80 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col z-10 h-[40vh] lg:h-auto">

                        {/* Scrollable Controls */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                            {/* Aspect Ratio */}
                            <div>
                                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Frame Size (Minecraft)</p>

                                {/* Preset Sizes */}
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {FRAME_SIZES.filter(s => s.name !== 'Free').map((size) => (
                                        <button
                                            key={size.name}
                                            onClick={() => {
                                                setSelectedFrameSize(size);
                                                setIsCustomMode(false);
                                            }}
                                            className={`px-2 py-2 rounded-lg text-xs transition-all flex flex-col items-center justify-center gap-1 border ${!isCustomMode && selectedFrameSize.name === size.name
                                                ? "bg-[#ff4757] border-[#ff4757] text-white"
                                                : "bg-white/5 border-white/10 hover:border-[#ff4757]/50 text-gray-300"
                                                }`}
                                        >
                                            <span>{size.icon}</span>
                                            <span>{size.name}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Custom Size Input */}
                                <div className={`bg-white/5 rounded-xl p-3 border transition-all ${isCustomMode ? 'border-[#2ed573]/50 bg-[#2ed573]/5' : 'border-white/10'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-400">Custom Size</span>
                                        {isCustomMode && (
                                            <button
                                                onClick={() => setIsCustomMode(false)}
                                                className="text-[10px] text-[#2ed573] uppercase font-medium flex items-center gap-1 hover:text-[#ff4757] transition-colors"
                                                title="Switch back to preset"
                                            >
                                                Active <span className="text-xs">✕</span>
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Width</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={customWidth}
                                                onChange={(e) => {
                                                    const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                                                    setCustomWidth(val);
                                                    setIsCustomMode(true);
                                                }}
                                                onFocus={() => setIsCustomMode(true)}
                                                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-center text-sm focus:border-[#2ed573]/50 focus:outline-none"
                                            />
                                        </div>
                                        <span className="text-gray-500 text-lg font-light pt-4">×</span>
                                        <div className="flex-1">
                                            <label className="text-[10px] text-gray-500 uppercase block mb-1">Height</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={customHeight}
                                                onChange={(e) => {
                                                    const val = Math.max(1, Math.min(100, parseInt(e.target.value) || 1));
                                                    setCustomHeight(val);
                                                    setIsCustomMode(true);
                                                }}
                                                onFocus={() => setIsCustomMode(true)}
                                                className="w-full px-2 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-center text-sm focus:border-[#2ed573]/50 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    {isCustomMode && (
                                        <p className="text-[10px] text-[#2ed573] mt-2 text-center">
                                            = {customWidth * customHeight} item frames
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Transformations */}
                            <div className="space-y-4">
                                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Transformations</p>

                                {/* Zoom */}
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-xs text-gray-400">Zoom</span>
                                        <span className="text-xs text-[#2ed573]">{Math.round(zoom * 100)}%</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ZoomOut size={14} className="text-gray-400" />
                                        <input
                                            type="range"
                                            min="0.5"
                                            max="3"
                                            step="0.1"
                                            value={zoom}
                                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                                            className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#2ed573]"
                                        />
                                        <ZoomIn size={14} className="text-gray-400" />
                                    </div>
                                </div>

                                {/* Rotate & Flip Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/10 flex flex-col items-center justify-center gap-2">
                                        <span className="text-[10px] text-gray-400 uppercase">Rotation</span>
                                        <div className="flex gap-2">
                                            <button onClick={rotateCounterClockwise} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="-90°">
                                                <RotateCcw size={16} />
                                            </button>
                                            <button onClick={rotateClockwise} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="+90°">
                                                <RotateCw size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-2 border border-white/10 flex flex-col items-center justify-center gap-2">
                                        <span className="text-[10px] text-gray-400 uppercase">Flip</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => setFlipH(prev => !prev)} className={`p-1.5 rounded-lg transition-colors ${flipH ? 'text-[#2ed573] bg-[#2ed573]/20' : 'hover:bg-white/10'}`} title="Flip H">
                                                <FlipHorizontal size={16} />
                                            </button>
                                            <button onClick={() => setFlipV(prev => !prev)} className={`p-1.5 rounded-lg transition-colors ${flipV ? 'text-[#2ed573] bg-[#2ed573]/20' : 'hover:bg-white/10'}`} title="Flip V">
                                                <FlipVertical size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={autoFit}
                                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#2ed573]/50 hover:bg-[#2ed573]/10 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <Maximize size={14} /> Auto-Fit
                                </button>
                                <button
                                    onClick={resetTransforms}
                                    className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#ff4757]/50 hover:bg-[#ff4757]/10 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <PixelRefresh size={14} color="currentColor" /> Reset
                                </button>
                            </div>

                        </div>

                        {/* Footer Buttons - Fixed at bottom of sidebar */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 rounded-xl glass border border-white/10 hover:border-white/30 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyCrop}
                                    disabled={!completedCrop}
                                    className="flex-[2] py-3 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-bold text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#2ed573]/20 hover:shadow-[#2ed573]/40"
                                >
                                    <PixelCheck size={16} /> Apply Changes
                                </button>
                            </div>
                        </div>

                    </div>

                </div>

                {/* Hidden Canvas for crop processing */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    );
}
