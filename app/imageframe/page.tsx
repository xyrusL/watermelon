"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactCrop, { Crop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import AdminPanel, { AdminButton } from "./components/AdminPanel";
import UserPanel, { UserPanelButton } from "./components/UserPanel";
import NotificationModal from "./components/NotificationModal";
import ImageDetailsModal from "./components/ImageDetailsModal";
import ImageGallery from "./components/ImageGallery";
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
    PixelKey,
    PixelUpload,
    PixelTrash,
    PixelInfo,
    PixelWarning,
    PixelEye,
    PixelGlobe,
    PixelSettings,
    PixelCrop as PixelCropIcon,
    PixelExternalLink,
    PixelShield,
} from "./components/PixelIcons";
import { Edit3, Save, X, ChevronDown, ImageIcon, Scissors, Square, RectangleHorizontal, RectangleVertical } from "lucide-react";

// Import types, constants, and utils
import type { UploadedImage, HostType, HostConfig, NotificationState, FrameSize } from "./types";
import { HOSTS, FRAME_SIZES } from "./constants";
import { ensureAbsoluteUrl, formatDate, formatFileSize } from "./utils";

// Types, constants, and utilities are now imported from separate files above

export default function ImageFramePage() {
    const { isSignedIn, user } = useUser();

    // Check if user is admin (via Clerk's publicMetadata)
    const isAdmin = user?.publicMetadata?.role === "admin";

    // Utility functions now imported from ./utils

    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [gallery, setGallery] = useState<UploadedImage[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isCheckingApi, setIsCheckingApi] = useState(true);
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<UploadedImage | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [selectedHost, setSelectedHost] = useState<HostType | null>(null);
    const [username, setUsername] = useState<string>("");
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    // Admin panel states
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    // User panel states
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [adminImages, setAdminImages] = useState<UploadedImage[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
    const [adminStats, setAdminStats] = useState<{ totalImages: number } | null>(null);
    const [filterText, setFilterText] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "size" | "uploader">("date");
    const [adminTab, setAdminTab] = useState<"images" | "members">("images");
    const [adminSelectedImage, setAdminSelectedImage] = useState<(UploadedImage & { id?: string }) | null>(null);
    const [membersList, setMembersList] = useState<{ name: string; email: string; uploads: number; firstUpload: number | null }[]>([]);
    const [selectedMember, setSelectedMember] = useState<{ name: string; email: string } | null>(null);

    // Notification modal states
    const [notification, setNotification] = useState<{
        show: boolean;
        type: "error" | "warning" | "success" | "info";
        title: string;
        message: string;
        details?: string;
    }>({
        show: false,
        type: "info",
        title: "",
        message: "",
    });

    // Image editor states
    const [showEditor, setShowEditor] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<Crop>();
    const [selectedFrameSize, setSelectedFrameSize] = useState(FRAME_SIZES[1]); // Default 2×2
    const [croppedPreview, setCroppedPreview] = useState<string | null>(null);

    // Visibility state
    const [isPrivate, setIsPrivate] = useState(false); // Default is public
    const [isNsfw, setIsNsfw] = useState(false); // Default is not NSFW
    const [revealedNsfwImages, setRevealedNsfwImages] = useState<Set<number>>(new Set()); // Track temporarily revealed NSFW images

    // Toggle NSFW reveal for gallery
    const toggleNsfwReveal = (imageTimestamp: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening image details
        setRevealedNsfwImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(imageTimestamp)) {
                newSet.delete(imageTimestamp);
            } else {
                newSet.add(imageTimestamp);
            }
            return newSet;
        });
    };

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Show notification helper
    const showNotification = (
        type: "error" | "warning" | "success" | "info",
        title: string,
        message: string,
        details?: string
    ) => {
        setNotification({ show: true, type, title, message, details });
    };

    const closeNotification = () => {
        setNotification({ ...notification, show: false });
    };

    // formatDate and formatFileSize now imported from ./utils

    // Check API health when host is selected
    useEffect(() => {
        if (!selectedHost) {
            setIsCheckingApi(false);
            return;
        }

        const checkApi = async () => {
            setIsCheckingApi(true);
            setApiError(null);
            try {
                const response = await fetch(HOSTS[selectedHost].healthEndpoint);
                const data = await response.json();
                if (data.status !== "ok") {
                    setApiError(data.message || "API is not available");
                }
            } catch (err) {
                setApiError("Failed to connect to upload service");
            } finally {
                setIsCheckingApi(false);
            }
        };
        checkApi();
    }, [selectedHost]);

    // Function to fetch recent images
    const fetchRecentImages = async () => {
        try {
            const response = await fetch('/api/supabase/recent');
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.images) {
                    const images: UploadedImage[] = data.images.map((img: any) => ({
                        url: img.url,
                        directUrl: img.url,
                        deleteUrl: img.file_path,
                        filename: img.filename,
                        uploadedAt: new Date(img.uploaded_at).getTime(),
                        fileSize: img.file_size,
                        host: 'supabase',
                        uploaderName: img.uploader_name,
                        uploaderEmail: img.uploader_email,
                        id: img.id,
                        is_private: img.is_private || false,
                        is_nsfw: img.is_nsfw || false,
                    }));
                    setGallery(images);
                }
            }
        } catch (err) {
            console.warn('Failed to fetch recent images:', err);
            // Fallback to localStorage
            const saved = localStorage.getItem("watermelon-gallery");
            if (saved) {
                setGallery(JSON.parse(saved));
            }
        }
    };

    // Load gallery from Supabase database on mount
    useEffect(() => {
        const loadGallery = async () => {
            try {
                const response = await fetch('/api/supabase/recent');
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.images) {
                        const images: UploadedImage[] = data.images.map((img: any) => ({
                            url: img.url,
                            directUrl: img.url,
                            deleteUrl: img.file_path,
                            filename: img.filename,
                            uploadedAt: new Date(img.uploaded_at).getTime(),
                            fileSize: img.file_size,
                            host: 'supabase',
                            uploaderName: img.uploader_name,
                            uploaderEmail: img.uploader_email,
                            id: img.id,
                            is_private: img.is_private || false,
                            is_nsfw: img.is_nsfw || false,
                        }));
                        setGallery(images);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch recent images:', err);
                // Fallback to localStorage
                const saved = localStorage.getItem("watermelon-gallery");
                if (saved) {
                    setGallery(JSON.parse(saved));
                }
            }
        };
        loadGallery();
    }, []);

    // Load/generate username from Clerk metadata or email
    useEffect(() => {
        if (user?.primaryEmailAddress?.emailAddress) {
            // Check Clerk metadata first
            const clerkUsername = user.unsafeMetadata?.displayName as string;
            if (clerkUsername) {
                setUsername(clerkUsername);
            } else {
                // Fallback to localStorage
                const savedUsername = localStorage.getItem(`username-${user.id}`);
                if (savedUsername) {
                    setUsername(savedUsername);
                } else {
                    // Generate username from email
                    const emailUsername = user.primaryEmailAddress.emailAddress.split('@')[0];
                    setUsername(emailUsername);
                }
            }
        }
    }, [user]);

    // Save username when changed
    const handleSaveUsername = async () => {
        if (!user?.id || !username.trim()) return;

        setIsEditingUsername(false);

        // Save to localStorage as backup
        localStorage.setItem(`username-${user.id}`, username.trim());

        // Update Clerk user metadata directly using client-side method
        try {
            await user.update({
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    displayName: username.trim()
                }
            });
            console.log('Display name saved to Clerk!');
        } catch (err) {
            console.error('Failed to save display name:', err);
        }
    };

    // Detect logout and show modal
    useEffect(() => {
        const wasSignedIn = localStorage.getItem('wasSignedIn');
        if (wasSignedIn === 'true' && !isSignedIn) {
            setShowLogoutConfirm(true);
            localStorage.removeItem('wasSignedIn');
        } else if (isSignedIn) {
            localStorage.setItem('wasSignedIn', 'true');
        }
    }, [isSignedIn]);

    // Initialize crop when image loads
    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const aspect = selectedFrameSize.ratio;

        if (aspect) {
            const crop = centerCrop(
                makeAspectCrop(
                    { unit: "%", width: 90 },
                    aspect,
                    width,
                    height
                ),
                width,
                height
            );
            setCrop(crop);
        }
    }, [selectedFrameSize.ratio]);

    // Update crop when frame size changes
    useEffect(() => {
        if (imgRef.current && showEditor) {
            const { width, height } = imgRef.current;
            const aspect = selectedFrameSize.ratio;

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
    }, [selectedFrameSize, showEditor]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showNotification(
                    "error",
                    "Invalid File Type",
                    "Please upload an image file (PNG, JPG, or GIF)",
                    `File type: ${file.type || "unknown"}`
                );
                return;
            }
            selectFile(file);
        }
    }, []);

    const selectFile = (file: File) => {
        setSelectedFile(file);
        setError(null);
        setUploadedImage(null);
        setCroppedPreview(null);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
            if (!validTypes.includes(file.type)) {
                showNotification(
                    "error",
                    "Invalid File Format",
                    "Only PNG, JPG, and GIF images are supported",
                    `You selected: ${file.type || "unknown file type"}`
                );
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }
            selectFile(file);
        }
    };

    // Apply crop and create cropped image
    const applyCrop = async () => {
        if (!completedCrop || !imgRef.current || !canvasRef.current) return;

        const image = imgRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        canvas.width = completedCrop.width * scaleX;
        canvas.height = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Convert to blob and update preview
        canvas.toBlob((blob) => {
            if (blob) {
                const croppedUrl = URL.createObjectURL(blob);
                setCroppedPreview(croppedUrl);

                // Create new file from blob
                const originalName = selectedFile?.name || "image.png";
                const extension = originalName.split('.').pop() || 'png';
                const croppedFile = new File([blob], `watermelon-${Date.now()}.${extension}`, {
                    type: "image/png",
                });
                setSelectedFile(croppedFile);
                setPreview(croppedUrl);
                setShowEditor(false);
            }
        }, "image/png");
    };

    const uploadImage = async () => {
        if (!selectedFile || !selectedHost) return;

        const hostConfig = HOSTS[selectedHost];

        // Check file size
        if (selectedFile.size > hostConfig.maxSize) {
            showNotification(
                "error",
                "File Too Large",
                `The maximum file size for ${hostConfig.name} is ${hostConfig.maxSizeLabel}`,
                `Your file: ${formatFileSize(selectedFile.size)} • Try compressing the image or use a different hosting service.`
            );
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("image", selectedFile);

            const response = await fetch(hostConfig.uploadEndpoint, {
                method: "POST",
                body: formData,
                headers: {
                    'x-uploader-name': username || 'Anonymous',
                    'x-uploader-email': user?.primaryEmailAddress?.emailAddress || '',
                    'x-is-private': isPrivate.toString(),
                    'x-is-nsfw': isNsfw.toString(),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle different error scenarios
                if (data.error?.includes("quota") || data.error?.includes("limit") || data.error?.includes("exceeded")) {
                    showNotification(
                        "warning",
                        "Hosting Limit Reached",
                        `${hostConfig.name} has reached its upload limit`,
                        `Try switching to ${selectedHost === "imgbb" ? "Watermelon Storage" : "imgbb"} or try again later.`
                    );
                } else if (data.error?.includes("API") || data.error?.includes("key") || data.error?.includes("token")) {
                    showNotification(
                        "error",
                        "API Error",
                        "There's an issue with the hosting service configuration",
                        `${data.error || "Unknown API error"} • Try another hosting service.`
                    );
                } else {
                    showNotification(
                        "error",
                        "Upload Failed",
                        data.error || "An unknown error occurred",
                        `Host: ${hostConfig.name} • Try another hosting service or check your internet connection.`
                    );
                }
                throw new Error(data.error || "Upload failed");
            }

            const newImage: UploadedImage = {
                url: data.url,
                directUrl: data.directUrl,
                deleteUrl: data.deleteUrl,
                thumbnail: data.thumbnail,
                filename: data.filename,
                uploadedAt: Date.now(),
                fileSize: selectedFile.size,
                host: selectedHost,
                uploaderName: username,
                uploaderEmail: user?.primaryEmailAddress?.emailAddress,
            };

            setUploadedImage(newImage);

            // Save to gallery
            const updatedGallery = [newImage, ...gallery].slice(0, 20);
            setGallery(updatedGallery);
            localStorage.setItem("watermelon-gallery", JSON.stringify(updatedGallery));

            // Show success notification
            showNotification(
                "success",
                "Upload Successful! 🎉",
                "Your image has been uploaded and is ready to use",
                `Host: ${hostConfig.name} • Size: ${formatFileSize(selectedFile.size)}`
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const copyUrl = async (url: string) => {
        try {
            // Try modern clipboard API first (requires HTTPS)
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                // Fallback for HTTP/localhost
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                textArea.style.top = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand("copy");
                document.body.removeChild(textArea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setPreview(null);
        setUploadedImage(null);
        setError(null);
        setCroppedPreview(null);
        setShowEditor(false);
        setIsPrivate(false); // Reset to public
        setIsNsfw(false); // Reset to not NSFW
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openImageDetails = (img: UploadedImage) => {
        setSelectedGalleryImage(img);
        setShowDeleteConfirm(false);
    };

    const closeImageDetails = () => {
        setSelectedGalleryImage(null);
        setShowDeleteConfirm(false);
        setDeleteSuccess(false);
    };

    const changeHost = () => {
        setSelectedHost(null);
        // Reset upload state
        setSelectedFile(null);
        setPreview(null);
        setUploadedImage(null);
        setError(null);
        setCroppedPreview(null);
        setShowEditor(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const deleteImage = async () => {
        if (!selectedGalleryImage) return;

        setIsDeleting(true);

        try {
            const host = selectedGalleryImage.host || "supabase";

            // Delete from storage
            if (selectedGalleryImage.deleteUrl) {
                const deleteEndpoint = HOSTS[host].deleteEndpoint;
                const response = await fetch(deleteEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ deleteUrl: selectedGalleryImage.deleteUrl }),
                });

                if (!response.ok) {
                    console.error("Failed to delete from storage");
                }
            }

            // Delete from database if it's a supabase image
            if (host === "supabase") {
                try {
                    await fetch('/api/supabase/delete-record', {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            url: selectedGalleryImage.directUrl,
                            file_path: selectedGalleryImage.deleteUrl
                        }),
                    });
                } catch (dbErr) {
                    console.error("Failed to delete from database:", dbErr);
                }
            }
        } catch (err) {
            console.error("Failed to delete:", err);
        }

        // Remove from local gallery
        const updatedGallery = gallery.filter(img => img.uploadedAt !== selectedGalleryImage.uploadedAt);
        setGallery(updatedGallery);
        localStorage.setItem("watermelon-gallery", JSON.stringify(updatedGallery));

        // If the deleted image is the same as the one in "Upload Successful" screen, clear it
        if (uploadedImage && uploadedImage.directUrl === selectedGalleryImage.directUrl) {
            setUploadedImage(null);
            // Also clear preview states to fully reset the form
            setSelectedFile(null);
            setPreview(null);
            setCroppedPreview(null);
        }

        setIsDeleting(false);
        setDeleteSuccess(true);

        // Auto close after 1.5 seconds
        setTimeout(() => {
            closeImageDetails();
        }, 1500);
    };

    // Admin functions
    const fetchAdminImages = async () => {
        if (!isAdmin) return;
        setIsLoadingAdmin(true);
        try {
            const response = await fetch('/api/admin/images');
            const data = await response.json();
            if (data.success) {
                // Convert database format to UploadedImage format
                const images: (UploadedImage & { id?: string })[] = data.images.map((img: {
                    url: string;
                    file_path: string;
                    filename: string;
                    uploaded_at: string;
                    file_size: number;
                    host: HostType;
                    uploader_name: string;
                    uploader_email: string;
                    id: string;
                }) => ({
                    url: img.url,
                    directUrl: img.url,
                    deleteUrl: img.file_path,
                    filename: img.filename,
                    uploadedAt: new Date(img.uploaded_at).getTime(),
                    fileSize: img.file_size,
                    host: img.host as HostType,
                    uploaderName: img.uploader_name,
                    uploaderEmail: img.uploader_email,
                    id: img.id,
                }));
                setAdminImages(images);
                setAdminStats(data.stats);

                // Build members list from uploads
                const membersMap = new Map<string, { name: string; email: string; uploads: number; firstUpload: number | null }>();
                images.forEach(img => {
                    const key = img.uploaderEmail || img.uploaderName || "anonymous";
                    if (!membersMap.has(key)) {
                        membersMap.set(key, {
                            name: img.uploaderName || "Anonymous",
                            email: img.uploaderEmail || "",
                            uploads: 0,
                            firstUpload: null
                        });
                    }
                    const member = membersMap.get(key)!;
                    member.uploads++;
                    if (!member.firstUpload || img.uploadedAt < member.firstUpload) {
                        member.firstUpload = img.uploadedAt;
                    }
                });
                setMembersList(Array.from(membersMap.values()).sort((a, b) => b.uploads - a.uploads));
            }
        } catch (err) {
            console.error("Failed to fetch admin images:", err);
        } finally {
            setIsLoadingAdmin(false);
        }
    };

    const toggleImageSelection = (id: string) => {
        setSelectedImages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const selectAllImages = () => {
        if (selectedImages.size === filteredAdminImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(filteredAdminImages.map((img: UploadedImage & { id?: string }) => img.id || img.uploadedAt.toString())));
        }
    };

    const bulkDeleteImages = async () => {
        if (selectedImages.size === 0) return;

        setIsDeleting(true);
        try {
            const imagesToDelete = adminImages.filter((img: UploadedImage & { id?: string }) =>
                selectedImages.has(img.id || img.uploadedAt.toString())
            );
            const imageIds = imagesToDelete.map((img: UploadedImage & { id?: string }) => img.id);
            const filePaths = imagesToDelete.map(img => img.deleteUrl).filter(Boolean);

            const response = await fetch('/api/admin/images', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageIds, filePaths }),
            });

            const data = await response.json();
            if (data.success) {
                showNotification("success", "Bulk Delete Complete", `Deleted ${selectedImages.size} image(s)`);
                setSelectedImages(new Set());
                fetchAdminImages(); // Refresh the list
                fetchRecentImages(); // Refresh the main gallery
            } else {
                showNotification("error", "Delete Failed", data.error || "Failed to delete images");
            }
        } catch (err) {
            console.error("Bulk delete error:", err);
            showNotification("error", "Delete Failed", "An error occurred while deleting");
        } finally {
            setIsDeleting(false);
        }
    };

    // Filter and sort admin images
    const filteredAdminImages = adminImages
        .filter(img => {
            // Filter by selected member if set
            if (selectedMember) {
                const matchesEmail = img.uploaderEmail === selectedMember.email;
                const matchesName = img.uploaderName === selectedMember.name;
                if (!matchesEmail && !matchesName) return false;
            }
            // Text search filter
            return img.filename.toLowerCase().includes(filterText.toLowerCase()) ||
                img.uploaderName?.toLowerCase().includes(filterText.toLowerCase()) ||
                img.uploaderEmail?.toLowerCase().includes(filterText.toLowerCase());
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "date": return b.uploadedAt - a.uploadedAt;
                case "size": return (b.fileSize || 0) - (a.fileSize || 0);
                case "uploader": return (a.uploaderName || "").localeCompare(b.uploaderName || "");
                default: return 0;
            }
        });

    // Open admin panel and fetch images
    const openAdminPanel = () => {
        setShowAdminPanel(true);
        fetchAdminImages();
    };

    // Open user panel
    const openUserPanel = () => {
        setShowUserPanel(true);
    };

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white overflow-x-hidden">
            {/* Hidden canvas for crop processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Notification Modal */}
            <NotificationModal
                notification={notification}
                onClose={closeNotification}
            />

            {/* Admin Panel Modal */}
            {showAdminPanel && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
                    <div className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <PixelShield size={28} color="#ff4757" />
                                <h2 className="font-pixel text-xl text-[#ff4757]">ADMIN PANEL</h2>
                                <span className="bg-[#ff4757]/20 text-[#ff4757] text-xs px-2 py-1 rounded-full font-pixel">ADMIN</span>
                            </div>
                            <button
                                onClick={() => { setShowAdminPanel(false); setAdminSelectedImage(null); }}
                                className="w-10 h-10 rounded-full glass hover:bg-red-500/20 transition-all flex items-center justify-center"
                            >
                                <PixelClose size={16} color="#ff4757" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4">
                            <button
                                onClick={() => setAdminTab("images")}
                                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${adminTab === "images" ? "bg-[#ff4757] text-white" : "glass border border-white/10 hover:border-[#ff4757]/50"}`}
                            >
                                <PixelImage size={14} color="currentColor" /> Images ({adminStats?.totalImages || 0})
                            </button>
                            <button
                                onClick={() => setAdminTab("members")}
                                className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${adminTab === "members" ? "bg-[#2ed573] text-white" : "glass border border-white/10 hover:border-[#2ed573]/50"}`}
                            >
                                <PixelUser size={14} color="currentColor" /> Members ({membersList.length})
                            </button>
                        </div>

                        {/* Images Tab */}
                        {adminTab === "images" && (
                            <>
                                {/* Stats */}
                                {adminStats && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="glass-dark p-3 rounded-xl text-center">
                                            <p className="text-xl font-bold text-[#2ed573]">{adminStats.totalImages}</p>
                                            <p className="text-xs text-gray-400">Total Images</p>
                                        </div>
                                        <div className="glass-dark p-3 rounded-xl text-center">
                                            <p className="text-xl font-bold text-[#ffa502]">{membersList.length}</p>
                                            <p className="text-xs text-gray-400">Uploaders</p>
                                        </div>
                                        <div className="glass-dark p-3 rounded-xl text-center">
                                            <p className="text-xl font-bold text-[#ff4757]">{selectedImages.size}</p>
                                            <p className="text-xs text-gray-400">Selected</p>
                                        </div>
                                        <div className="glass-dark p-3 rounded-xl text-center">
                                            <p className="text-xl font-bold text-white">{formatFileSize(adminImages.reduce((acc, img) => acc + (img.fileSize || 0), 0))}</p>
                                            <p className="text-xs text-gray-400">Total Size</p>
                                        </div>
                                    </div>
                                )}

                                {/* Member Filter Banner */}
                                {selectedMember && (
                                    <div className="flex items-center gap-3 mb-3 p-3 bg-[#2ed573]/10 border border-[#2ed573]/30 rounded-xl">
                                        <span className="text-[#2ed573] flex items-center gap-1"><PixelUser size={12} color="#2ed573" /> Viewing uploads from: <strong>{selectedMember.name}</strong></span>
                                        <button
                                            onClick={() => setSelectedMember(null)}
                                            className="ml-auto px-3 py-1.5 glass hover:bg-red-500/20 rounded-xl text-sm border border-white/10 flex items-center gap-1"
                                        >
                                            <PixelClose size={12} color="currentColor" /> Clear Filter
                                        </button>
                                    </div>
                                )}

                                {/* Controls */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <input type="text" placeholder="Search..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="flex-1 min-w-[150px] px-3 py-2 glass-dark rounded-xl border border-white/10 focus:border-[#ff4757]/50 outline-none text-sm" />
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "size" | "uploader")} className="px-3 py-2 glass-dark rounded-xl border border-white/10 text-sm">
                                        <option value="date">Date</option>
                                        <option value="size">Size</option>
                                        <option value="uploader">Uploader</option>
                                    </select>
                                    <button onClick={selectAllImages} className="px-3 py-2 glass rounded-xl border border-white/10 hover:border-[#2ed573]/50 text-sm flex items-center gap-1">
                                        {selectedImages.size === filteredAdminImages.length && filteredAdminImages.length > 0 ? <><PixelCheck size={12} /> Deselect</> : "Select All"}
                                    </button>
                                    <button onClick={fetchAdminImages} className="px-3 py-2 glass rounded-xl border border-white/10 hover:border-[#ffa502]/50 text-sm flex items-center justify-center">
                                        <PixelRefresh size={16} color="currentColor" />
                                    </button>
                                </div>

                                {/* Bulk delete */}
                                {selectedImages.size > 0 && (
                                    <div className="flex items-center gap-3 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-sm">
                                        <span className="text-red-400 flex items-center gap-1"><PixelWarning size={14} color="#f87171" /> {selectedImages.size} selected</span>
                                        <button onClick={bulkDeleteImages} disabled={isDeleting} className="ml-auto px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-xl font-medium text-sm disabled:opacity-50 flex items-center gap-1">
                                            {isDeleting ? "..." : <><PixelTrash size={14} color="#fff" /> Delete</>}
                                        </button>
                                    </div>
                                )}

                                {/* Image grid */}
                                <div className="flex-1 overflow-y-auto">
                                    {isLoadingAdmin ? (
                                        <div className="flex items-center justify-center py-12"><PixelLoader size={48} color="#ff4757" /></div>
                                    ) : filteredAdminImages.length === 0 ? (
                                        <div className="text-center py-12"><div className="mb-4 flex justify-center"><PixelImage size={48} color="#6b7280" /></div><p className="text-gray-400">No images found</p></div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            {filteredAdminImages.map((img: UploadedImage & { id?: string }) => {
                                                const imgId = img.id || img.uploadedAt.toString();
                                                const isSelected = selectedImages.has(imgId);
                                                return (
                                                    <div key={imgId} className={`relative rounded-xl overflow-hidden transition-all group ${isSelected ? "ring-2 ring-[#ff4757] scale-95" : ""}`}>
                                                        {/* Selection checkbox */}
                                                        <div onClick={() => toggleImageSelection(imgId)} className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-[#ff4757]" : "bg-black/50 hover:bg-black/70"}`}>
                                                            {isSelected ? <PixelCheck size={12} color="#fff" /> : ""}
                                                        </div>
                                                        {/* Info button */}
                                                        <div onClick={() => setAdminSelectedImage(img)} className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 hover:bg-[#2ed573] flex items-center justify-center cursor-pointer transition-all">
                                                            <PixelInfo size={12} color="currentColor" />
                                                        </div>
                                                        <img src={img.directUrl} alt={img.filename} className="w-full h-24 object-cover" />
                                                        <div className="p-1.5 bg-black/40 flex items-center gap-1">
                                                            <PixelUser size={10} color="#2ed573" /><p className="text-xs text-[#2ed573] truncate">{img.uploaderName || "Anon"}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Members Tab */}
                        {adminTab === "members" && (
                            <div className="flex-1 overflow-y-auto">
                                {membersList.length === 0 ? (
                                    <div className="text-center py-12"><div className="mb-4 flex justify-center"><PixelUser size={48} color="#6b7280" /></div><p className="text-gray-400">No members yet</p></div>
                                ) : (
                                    <div className="space-y-3">
                                        {membersList.map((member, idx) => (
                                            <div key={idx} className="glass-dark p-4 rounded-xl flex items-center gap-4 hover:border-[#2ed573]/30 border border-transparent transition-all">
                                                <div className="w-12 h-12 rounded-full bg-[#2ed573]/20 flex items-center justify-center">
                                                    <PixelUser size={24} color="#2ed573" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-white truncate">{member.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{member.email || "No email"}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-bold text-[#ff4757]">{member.uploads}</p>
                                                    <p className="text-xs text-gray-400">uploads</p>
                                                </div>
                                                <div className="text-center min-w-[90px]">
                                                    <p className="text-xs text-gray-400">First seen</p>
                                                    <p className="text-xs text-white">{member.firstUpload ? formatDate(member.firstUpload) : "N/A"}</p>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedMember({ name: member.name, email: member.email }); setAdminTab("images"); }}
                                                    className="px-3 py-2 bg-[#ff4757] hover:bg-[#ff6b81] rounded-xl text-sm font-medium transition-all flex items-center gap-1"
                                                >
                                                    <PixelImage size={14} color="#fff" /> View
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-[#ffa502]/30 relative">
                        {/* Close X Button */}
                        <button
                            onClick={() => setShowLogoutConfirm(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-xl"
                        >
                            ✕
                        </button>

                        {/* Icon */}
                        <div className="text-center mb-4 mt-2">
                            <div className="text-5xl">👋</div>
                        </div>

                        {/* Title */}
                        <h3 className="font-pixel text-lg mb-4 text-center text-[#ffa502]">
                            YOU'VE LOGGED OUT
                        </h3>

                        {/* Message */}
                        <p className="text-gray-300 text-center mb-6">
                            Your account has been signed out successfully.
                            If you want to use ImageFrame again, please sign in.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 py-3 rounded-xl glass border border-white/10 hover:border-white/30 transition-colors"
                            >
                                Close
                            </button>
                            <SignInButton mode="modal">
                                <button className="flex-1 py-3 bg-[#2ed573] hover:bg-[#26de81] rounded-xl font-medium transition-all cursor-pointer">
                                    Sign In Again
                                </button>
                            </SignInButton>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Image Detail Modal - Outside admin panel for proper z-index */}
            {adminSelectedImage && showAdminPanel && isAdmin && (
                <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[70] p-4" onClick={() => setAdminSelectedImage(null)}>
                    <div className="glass rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                        {/* Close Button */}
                        <button
                            onClick={() => setAdminSelectedImage(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full glass hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10"
                        >
                            ✕
                        </button>

                        {/* Image Preview */}
                        <div className="bg-black/30 rounded-xl overflow-hidden flex items-center justify-center mb-6" style={{ minHeight: '200px', maxHeight: '300px' }}>
                            <img
                                src={adminSelectedImage.directUrl}
                                alt={adminSelectedImage.filename}
                                className="max-w-full max-h-[300px] object-contain"
                            />
                        </div>

                        {/* Title */}
                        <h3 className="font-pixel text-base text-[#ff4757] mb-6 text-center">IMAGE DETAILS</h3>

                        {/* Details Grid */}
                        <div className="space-y-4 mb-6">
                            <div className="glass-dark rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-2">Filename</p>
                                <p className="text-white font-medium break-all">{adminSelectedImage.filename}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="glass-dark rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-2">Uploader</p>
                                    <p className="text-[#2ed573] font-medium flex items-center gap-2">
                                        <span>👤</span>
                                        <span className="truncate">{adminSelectedImage.uploaderName || "Anonymous"}</span>
                                    </p>
                                </div>

                                <div className="glass-dark rounded-xl p-4">
                                    <p className="text-xs text-gray-400 mb-2">File Size</p>
                                    <p className="text-white font-medium">{formatFileSize(adminSelectedImage.fileSize)}</p>
                                </div>
                            </div>

                            <div className="glass-dark rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-2">Email</p>
                                <p className="text-white break-all">{adminSelectedImage.uploaderEmail || "N/A"}</p>
                            </div>

                            <div className="glass-dark rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-2">Upload Date & Time</p>
                                <p className="text-white">{formatDate(adminSelectedImage.uploadedAt)}</p>
                            </div>

                            <div className="glass-dark rounded-xl p-4">
                                <p className="text-xs text-gray-400 mb-2">Image URL</p>
                                <code className="text-xs text-[#ff4757] break-all block">{adminSelectedImage.directUrl}</code>
                            </div>
                        </div>

                        {/* Copy URL Button */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => copyUrl(adminSelectedImage.directUrl)}
                                className="flex-1 py-3 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-medium transition-all hover:scale-105 flex items-center justify-center gap-2"
                            >
                                <span>{copied ? "✓" : "📋"}</span>
                                <span>{copied ? "Copied!" : "Copy URL"}</span>
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to delete this image?")) {
                                        setIsDeleting(true);
                                        try {
                                            const response = await fetch('/api/admin/images', {
                                                method: 'DELETE',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    imageIds: [adminSelectedImage.id],
                                                    filePaths: [adminSelectedImage.deleteUrl].filter(Boolean)
                                                }),
                                            });
                                            const data = await response.json();
                                            if (data.success) {
                                                showNotification("success", "Deleted", "Image removed successfully");
                                                setAdminSelectedImage(null);
                                                fetchAdminImages();
                                                fetchRecentImages();
                                            } else {
                                                showNotification("error", "Error", data.error || "Failed to delete");
                                            }
                                        } catch (err) {
                                            console.error("Delete error:", err);
                                            showNotification("error", "Error", "Failed to delete image");
                                        } finally {
                                            setIsDeleting(false);
                                        }
                                    }
                                }}
                                disabled={isDeleting}
                                className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 transition-all flex items-center justify-center"
                            >
                                {isDeleting ? "..." : <PixelTrash size={20} color="currentColor" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Editor Modal */}
            {showEditor && preview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
                    <div className="glass rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="font-pixel text-lg text-[#ff4757] mb-4 text-center">EDIT IMAGE</h2>

                        {/* Frame Size Selector */}
                        <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-2 text-center">Select frame size:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {FRAME_SIZES.map((size) => (
                                    <button
                                        key={size.name}
                                        onClick={() => setSelectedFrameSize(size)}
                                        className={`px-3 py-2 rounded-lg text-sm transition-all ${selectedFrameSize.name === size.name
                                            ? "bg-[#ff4757] text-white"
                                            : "glass border border-white/10 hover:border-[#ff4757]/50"
                                            }`}
                                    >
                                        <span className="mr-1">{size.icon}</span>
                                        {size.name}
                                        {size.frames > 0 && (
                                            <span className="text-xs opacity-70 ml-1">({size.frames} frames)</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Crop Area */}
                        <div className="flex justify-center mb-4">
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={selectedFrameSize.ratio}
                                className="max-h-[50vh]"
                            >
                                <img
                                    ref={imgRef}
                                    src={preview}
                                    alt="Edit"
                                    onLoad={onImageLoad}
                                    className="max-h-[50vh] object-contain"
                                />
                            </ReactCrop>
                        </div>

                        {/* Info */}
                        <p className="text-xs text-gray-500 text-center mb-4">
                            Drag to position • {selectedFrameSize.name} ratio
                            {selectedFrameSize.frames > 0 && ` • Fits ${selectedFrameSize.frames} Minecraft frames`}
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditor(false)}
                                className="flex-1 py-3 rounded-xl glass border border-white/10 hover:border-white/30 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyCrop}
                                className="flex-1 py-3 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-medium transition-all"
                            >
                                ✓ Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Details Modal */}
            <ImageDetailsModal
                image={selectedGalleryImage}
                isAdmin={isAdmin}
                copied={copied}
                showDeleteConfirm={showDeleteConfirm}
                deleteSuccess={deleteSuccess}
                isDeleting={isDeleting}
                onClose={closeImageDetails}
                onCopyUrl={copyUrl}
                onDelete={deleteImage}
                onShowDeleteConfirm={setShowDeleteConfirm}
            />

            {/* API Error Modal */}
            {apiError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
                    <div className="glass rounded-2xl p-8 max-w-md text-center border border-red-500/50">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="font-pixel text-lg text-red-400 mb-4">API ERROR</h2>
                        <p className="text-gray-300 mb-6">
                            There's something wrong with the upload service. Please let the server admin know!
                        </p>
                        <div className="glass p-3 rounded-lg mb-6">
                            <code className="text-red-400 text-sm">{apiError}</code>
                        </div>
                        <Link
                            href="/"
                            className="inline-block px-6 py-3 bg-[#ff4757] hover:bg-[#ff6b81] rounded-xl font-medium transition-all"
                        >
                            Go Back Home
                        </Link>
                    </div>
                </div>
            )}

            {/* Loading Check */}
            {isCheckingApi && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d0d]">
                    <div className="text-center">
                        <div className="text-4xl animate-bounce mb-4">🍉</div>
                        <p className="text-gray-400">Checking service...</p>
                    </div>
                </div>
            )}

            {/* Uploading Modal */}
            {isUploading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="glass rounded-2xl p-8 max-w-sm text-center">
                        <div className="text-5xl mb-4 animate-pulse">📤</div>
                        <h3 className="font-pixel text-lg text-[#ff4757] mb-4">UPLOADING</h3>
                        <p className="text-gray-300 mb-2">
                            Uploading to {selectedHost && HOSTS[selectedHost].name}...
                        </p>
                        <p className="text-xs text-gray-500">
                            {selectedFile && formatFileSize(selectedFile.size)}
                        </p>
                        {/* Loading spinner */}
                        <div className="mt-6 flex justify-center">
                            <div className="w-8 h-8 border-4 border-[#ff4757]/30 border-t-[#ff4757] rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Background */}
            <div className="fixed inset-0 z-0">
                <Image
                    src="/imageframe-bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-30"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d]/70 via-transparent to-[#0d0d0d]" />
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen">
                {/* Header */}
                <header className="py-6 px-4 border-b border-white/5">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <img src="/watermelon.svg" alt="Watermelon" width={32} height={32} />
                            <span className="font-pixel text-xs text-[#ff4757]">WATERMELON</span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/about"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#5f27cd]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">ℹ️ About</span>
                                <span className="sm:hidden">ℹ️</span>
                            </Link>
                            <Link
                                href="/mods"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#ffa502]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">🎮 Mods</span>
                                <span className="sm:hidden">🎮</span>
                            </Link>
                            <Link
                                href="/commands"
                                className="px-4 py-2.5 glass border border-white/10 hover:border-[#2ed573]/50 rounded-full text-sm font-medium transition-all"
                            >
                                <span className="hidden sm:inline">📖 Commands</span>
                                <span className="sm:hidden">📖</span>
                            </Link>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-4 py-2.5 bg-[#2ed573] hover:bg-[#26de81] rounded-full text-sm font-medium transition-all hover:scale-105 cursor-pointer flex items-center gap-2">
                                        <PixelKey size={14} color="currentColor" />
                                        <span className="hidden sm:inline">Sign In</span>
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <AdminButton isAdmin={isAdmin} onClick={openAdminPanel} />
                                <UserPanelButton isSignedIn={isSignedIn ?? false} onClick={openUserPanel} />
                                <UserButton
                                    afterSignOutUrl="/"
                                    appearance={{
                                        elements: {
                                            userButtonPopoverActionButton__signOut: "logout-trigger"
                                        }
                                    }}
                                />
                            </SignedIn>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="py-12 px-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Username Editor - Only show when signed in */}
                        {isSignedIn && (
                            <div className="glass rounded-2xl p-6 mb-8 border border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-sm font-medium text-gray-400">Uploader Name</h3>
                                    {!isEditingUsername ? (
                                        <button
                                            onClick={() => setIsEditingUsername(true)}
                                            className="text-xs text-[#2ed573] hover:text-[#26de81] transition-colors flex items-center gap-1"
                                        >
                                            <Edit3 size={12} /> Edit
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSaveUsername}
                                            className="text-xs text-[#2ed573] hover:text-[#26de81] transition-colors flex items-center gap-1"
                                        >
                                            <Save size={12} /> Save
                                        </button>
                                    )}
                                </div>
                                {isEditingUsername ? (
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                                        className="w-full bg-black/30 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#2ed573]"
                                        placeholder="Enter your username"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{username || 'Not set'}</span>
                                        <span className="text-gray-500 text-sm">({user?.primaryEmailAddress?.emailAddress})</span>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-2">
                                    This name will be shown on your uploaded images
                                </p>
                            </div>
                        )}

                        {/* Title */}
                        <div className="text-center mb-12">
                            <h1 className="font-pixel text-2xl md:text-3xl text-[#ff4757] mb-4">
                                IMAGEFRAME
                            </h1>
                            <p className="text-gray-400 mb-4">
                                Upload images for your Minecraft ImageFrame plugin
                            </p>
                            {selectedHost && (
                                <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-full border border-white/10">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#2ed573] rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-300">Using</span>
                                        <span className={`font-pixel text-sm ${selectedHost === "imgbb" ? "text-[#ff4757]" : "text-[#2ed573]"
                                            }`}>
                                            {HOSTS[selectedHost].name}
                                        </span>
                                    </div>
                                    <div className="w-px h-4 bg-white/20"></div>
                                    <button
                                        onClick={changeHost}
                                        className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                                    >
                                        <span>🔄</span> Change
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sign In Prompt for Non-Authenticated Users */}
                        {!isSignedIn && (
                            <div className="glass rounded-2xl p-8 border-2 border-[#ffa502]/30 bg-gradient-to-br from-[#ffa502]/5 to-transparent mb-8">
                                <div className="text-center space-y-4">
                                    <div className="text-5xl mb-4">🔒</div>
                                    <h2 className="font-pixel text-xl text-[#ffa502]">AUTHENTICATION REQUIRED</h2>
                                    <p className="text-gray-300 max-w-md mx-auto mb-2">
                                        To upload images, you need to authenticate first
                                    </p>
                                    <div className="glass-dark rounded-lg p-4 max-w-lg mx-auto border border-[#2ed573]/20">
                                        <p className="text-sm text-gray-400 mb-2">
                                            <span className="text-[#2ed573] font-medium">ℹ️ How it works:</span>
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            Click the button below to open Clerk's secure authentication.
                                            You can <strong className="text-white">sign in with an existing account</strong> or <strong className="text-white">create a new account</strong> there.
                                            After authentication, you'll be redirected back here to continue uploading.
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-center gap-3 pt-4">
                                        <SignInButton mode="modal">
                                            <button className="px-6 py-3 bg-[#2ed573] hover:bg-[#26de81] rounded-full font-medium transition-all hover:scale-105 flex items-center gap-2 cursor-pointer">
                                                <span>🔑</span>
                                                <span>Continue to Clerk Sign In</span>
                                            </button>
                                        </SignInButton>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Secured by <span className="text-white font-medium">Clerk</span> • Safe & Encrypted
                                    </p>
                                </div>
                            </div>
                        )}

                        {!selectedHost ? (
                            <div className="space-y-10 max-w-5xl mx-auto">
                                <div className="text-center space-y-2">
                                    <h2 className="font-pixel text-xl text-white">CHOOSE YOUR IMAGE HOSTING SERVICE</h2>
                                    <p className="text-gray-500 text-sm">Select the best option for your needs</p>
                                </div>
                                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                    {/* Supabase Card - RECOMMENDED */}
                                    <div
                                        onClick={() => setSelectedHost("supabase")}
                                        className="relative cursor-pointer group h-full"
                                    >
                                        {/* Gradient Border Effect */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2ed573] via-[#3ecf8e] to-[#2ed573] rounded-2xl opacity-75 group-hover:opacity-100 blur-sm group-hover:blur transition-all duration-300"></div>

                                        <div className="relative glass rounded-2xl p-8 h-[400px] flex flex-col bg-gradient-to-br from-[#2ed573]/10 to-transparent border border-[#2ed573]/30">
                                            {/* Recommended Badge */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                <div className="bg-gradient-to-r from-[#2ed573] to-[#26de81] text-black text-xs font-bold px-5 py-2 rounded-full shadow-lg border-2 border-black/20 whitespace-nowrap">
                                                    ⭐ RECOMMENDED
                                                </div>
                                            </div>

                                            {/* Icon */}
                                            <div className="text-6xl mb-6 mt-4 text-center group-hover:scale-110 transition-transform duration-300">
                                                🍉
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-pixel text-xl text-white mb-3 text-center group-hover:text-[#2ed573] transition-colors">
                                                Watermelon Storage
                                            </h3>

                                            {/* Subtitle */}
                                            <div className="flex items-center justify-center gap-2 mb-6">
                                                <PixelLock size={18} color="#2ed573" />
                                                <p className="text-sm text-[#2ed573] font-semibold uppercase tracking-wide">Our Private Storage</p>
                                            </div>

                                            {/* Features */}
                                            <ul className="space-y-4 text-sm mt-auto">
                                                <li className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#2ed573]/20 flex items-center justify-center flex-shrink-0">
                                                        <PixelCheck size={12} color="#2ed573" />
                                                    </div>
                                                    <span className="text-gray-300"><span className="text-white font-bold">{HOSTS.supabase.maxSizeLabel}</span> Max Size</span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#2ed573]/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[#2ed573] text-sm">✓</span>
                                                    </div>
                                                    <span className="text-[#2ed573] font-bold">Full Privacy Control</span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#2ed573]/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[#2ed573] text-sm">✓</span>
                                                    </div>
                                                    <span className="text-gray-300 font-medium">Fast & Secure</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                    {/* ImgBB Card */}
                                    <div
                                        onClick={() => setSelectedHost("imgbb")}
                                        className="relative cursor-pointer group h-full"
                                    >
                                        {/* Hover Effect */}
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff4757] to-[#ff6b81] rounded-2xl opacity-0 group-hover:opacity-50 blur transition-all duration-300"></div>

                                        <div className="relative glass rounded-2xl p-8 h-[400px] flex flex-col border border-white/10 group-hover:border-[#ff4757]/50 transition-all duration-300">
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-5 py-2 rounded-full shadow-lg border-2 border-black/20 whitespace-nowrap flex items-center gap-1">
                                                    <PixelWarning size={14} color="#000" /> NOT RECOMMENDED
                                                </div>
                                            </div>

                                            {/* Icon */}
                                            <div className="mb-6 mt-4 text-center group-hover:scale-110 transition-transform duration-300 flex justify-center">
                                                <PixelImage size={64} color="#ff4757" />
                                            </div>

                                            {/* Title */}
                                            <h3 className="font-pixel text-xl text-white mb-3 text-center group-hover:text-[#ff4757] transition-colors">
                                                imgbb
                                            </h3>

                                            {/* Subtitle */}
                                            <p className="text-xs text-gray-500 mb-8 text-center uppercase tracking-wide font-semibold">Third-party service</p>

                                            {/* Features */}
                                            <ul className="space-y-4 text-sm mt-auto">
                                                <li className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#2ed573]/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[#2ed573] text-sm">✓</span>
                                                    </div>
                                                    <span className="text-gray-300"><span className="text-white font-bold">{HOSTS.imgbb.maxSizeLabel}</span> Max Size</span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#2ed573]/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[#2ed573] text-sm">✓</span>
                                                    </div>
                                                    <span className="text-gray-300 font-medium">Fast Upload Speed</span>
                                                </li>
                                                <li className="flex items-center gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-red-400 text-sm">✕</span>
                                                    </div>
                                                    <span className="text-red-400 font-bold">Not Private</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        ) : !uploadedImage ? (
                            <div className="space-y-6">
                                {/* Drop Zone */}
                                <div
                                    onClick={() => !preview && isSignedIn && fileInputRef.current?.click()}
                                    onDragOver={isSignedIn ? handleDragOver : undefined}
                                    onDragLeave={isSignedIn ? handleDragLeave : undefined}
                                    onDrop={isSignedIn ? handleDrop : undefined}
                                    className={`
                    ${preview ? "bg-black/60 backdrop-blur-sm" : "glass"} rounded-2xl p-8 text-center transition-all border-2
                    ${!preview && isSignedIn ? "cursor-pointer border-dashed border-white/20 hover:border-[#ff4757]/50" : ""}
                    ${preview ? "border-white/20" : ""}
                    ${isDragging && isSignedIn ? "border-[#2ed573] bg-[#2ed573]/10" : ""}
                  `}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/gif"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        disabled={!isSignedIn}
                                    />

                                    {preview ? (
                                        <div className="space-y-4">
                                            <img
                                                src={preview}
                                                alt="Preview"
                                                className="max-h-64 mx-auto rounded-lg"
                                            />
                                            <p className="text-gray-400 text-sm">{selectedFile?.name}</p>
                                            <p className="text-gray-500 text-xs">{formatFileSize(selectedFile?.size)}</p>

                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowEditor(true);
                                                }}
                                                className="px-6 py-2 rounded-full bg-[#ff4757]/20 border border-[#ff4757]/50 text-[#ff4757] hover:bg-[#ff4757]/30 transition-all flex items-center gap-2 mx-auto"
                                            >
                                                <PixelCropIcon size={14} color="#ff4757" /> Edit & Crop
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-8">
                                            <div className="mb-4 flex justify-center">
                                                <PixelImage size={48} color="#ff4757" />
                                            </div>
                                            <p className="text-lg text-gray-300 mb-2">
                                                Drop your image here
                                            </p>
                                            <p className="text-sm text-gray-500 mb-3">
                                                or click to browse
                                            </p>
                                            <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full">
                                                <PixelUpload size={14} color="#9ca3af" />
                                                <p className="text-xs text-gray-400">
                                                    PNG, JPG, GIF • Max {selectedHost && HOSTS[selectedHost].maxSizeLabel}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="glass p-4 rounded-xl border border-red-500/50 text-red-400 text-center">
                                        {error}
                                    </div>
                                )}

                                {/* Visibility Toggle */}
                                {selectedFile && (
                                    <div className="glass p-4 rounded-xl border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {isPrivate ? (
                                                    <PixelLock size={16} color="#ff4757" />
                                                ) : (
                                                    <PixelGlobe size={16} color="#2ed573" />
                                                )}
                                                <span className="text-sm text-gray-300">
                                                    Visibility:
                                                </span>
                                                <span className={`text-sm font-medium ${isPrivate ? 'text-[#ff4757]' : 'text-[#2ed573]'}`}>
                                                    {isPrivate ? 'Private' : 'Public'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setIsPrivate(!isPrivate)}
                                                className={`
                                                    relative w-14 h-7 rounded-full transition-all duration-300
                                                    ${isPrivate ? 'bg-[#ff4757]/20 border-[#ff4757]/50' : 'bg-[#2ed573]/20 border-[#2ed573]/50'}
                                                    border
                                                `}
                                            >
                                                <div
                                                    className={`
                                                        absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300
                                                        ${isPrivate ? 'translate-x-7 bg-[#ff4757]' : 'translate-x-0 bg-[#2ed573]'}
                                                    `}
                                                />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {isPrivate
                                                ? '🔒 Only you can see this image'
                                                : '🌍 Visible to everyone in public gallery'
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* NSFW Toggle */}
                                {selectedFile && (
                                    <div className="glass p-4 rounded-xl border border-white/10">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {isNsfw ? <PixelWarning size={18} color="#ff4757" /> : <PixelCheck size={18} color="#2ed573" />}
                                                <span className="text-sm text-gray-300">
                                                    Content:
                                                </span>
                                                <span className={`text-sm font-medium ${isNsfw ? 'text-[#ff4757]' : 'text-[#2ed573]'}`}>
                                                    {isNsfw ? 'NSFW' : 'Safe'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setIsNsfw(!isNsfw)}
                                                className={`
                                                    relative w-14 h-7 rounded-full transition-all duration-300
                                                    ${isNsfw ? 'bg-[#ff4757]/20 border-[#ff4757]/50' : 'bg-[#2ed573]/20 border-[#2ed573]/50'}
                                                    border
                                                `}
                                            >
                                                <div
                                                    className={`
                                                        absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300
                                                        ${isNsfw ? 'translate-x-7 bg-[#ff4757]' : 'translate-x-0 bg-[#2ed573]'}
                                                    `}
                                                />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                                            {isNsfw
                                                ? <><PixelWarning size={12} color="#ff4757" /> Image will appear blurred in gallery</>
                                                : <><PixelCheck size={12} color="#2ed573" /> Image will appear normally</>
                                            }
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {selectedFile && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={resetUpload}
                                            className="flex-1 py-4 rounded-xl glass border border-white/10 hover:border-white/30 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={uploadImage}
                                            disabled={isUploading}
                                            className={`
                        flex-1 py-4 rounded-xl font-medium transition-all
                        ${isUploading
                                                    ? "bg-gray-600 cursor-not-allowed"
                                                    : "bg-[#ff4757] hover:bg-[#ff6b81] hover:scale-105"
                                                }
                      `}
                                        >
                                            {isUploading ? "Uploading..." : "Upload Image"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Success State */
                            <div className="space-y-6">
                                <div className="glass rounded-2xl p-6 text-center relative">
                                    {/* X Close Button */}
                                    <button
                                        onClick={resetUpload}
                                        className="absolute top-4 right-4 w-8 h-8 rounded-full glass border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center group"
                                        title="Close"
                                    >
                                        <span className="text-gray-400 group-hover:text-red-400 transition-colors">✕</span>
                                    </button>

                                    <div className="text-4xl mb-4">✅</div>
                                    <p className="text-[#2ed573] font-medium mb-6">Upload Successful!</p>

                                    <img
                                        src={uploadedImage.directUrl}
                                        alt="Uploaded"
                                        className="max-h-48 mx-auto rounded-lg mb-6"
                                    />

                                    {uploadedImage.uploaderName && (
                                        <div className="glass-dark rounded-lg p-3 mb-4 border border-[#2ed573]/20">
                                            <p className="text-xs text-gray-400">Uploaded by</p>
                                            <p className="text-[#2ed573] font-medium">👤 {uploadedImage.uploaderName}</p>
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-400">Direct URL (paste in Minecraft)</p>
                                        <div
                                            onClick={() => copyUrl(ensureAbsoluteUrl(uploadedImage.directUrl))}
                                            className="glass p-4 rounded-xl cursor-pointer hover:border-[#ff4757]/50 transition-all group"
                                        >
                                            <code className="text-[#ff4757] text-sm break-all">
                                                {ensureAbsoluteUrl(uploadedImage.directUrl)}
                                            </code>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {copied ? "✓ Copied!" : "Click to copy"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={resetUpload}
                                    className="w-full py-4 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-medium transition-all hover:scale-105"
                                >
                                    Upload Another Image
                                </button>
                            </div>
                        )}

                        {/* Gallery */}
                        <ImageGallery
                            images={gallery}
                            currentUserEmail={user?.primaryEmailAddress?.emailAddress}
                            revealedNsfwImages={revealedNsfwImages}
                            onImageClick={openImageDetails}
                            onToggleNsfwReveal={toggleNsfwReveal}
                        />
                    </div>
                </main>

                {/* User Panel */}
                <UserPanel
                    isSignedIn={isSignedIn ?? false}
                    showUserPanel={showUserPanel}
                    setShowUserPanel={setShowUserPanel}
                    formatDate={formatDate}
                    formatFileSize={formatFileSize}
                    copyUrl={copyUrl}
                    copied={copied}
                    showNotification={showNotification}
                />
            </div>
        </div>
    );
}
