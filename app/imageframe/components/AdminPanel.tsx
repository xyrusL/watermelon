"use client";

import { useState, useEffect } from "react";

// Types
export interface UploadedImage {
    url: string;
    directUrl: string;
    deleteUrl?: string;
    thumbnail?: string;
    filename: string;
    uploadedAt: number;
    fileSize?: number;
    host?: "imgbb" | "supabase";
    uploaderName?: string;
    uploaderEmail?: string;
    id?: string;
}

export interface Member {
    name: string;
    email: string;
    uploads: number;
    firstUpload: number | null;
}

interface AdminPanelProps {
    isAdmin: boolean;
    showAdminPanel: boolean;
    setShowAdminPanel: (show: boolean) => void;
    formatDate: (timestamp: number) => string;
    formatFileSize: (bytes?: number) => string;
    copyUrl: (url: string) => Promise<void>;
    copied: boolean;
    showNotification: (type: "error" | "warning" | "success" | "info", title: string, message: string, details?: string) => void;
    onOpen?: () => void; // Callback when panel opens
}

export default function AdminPanel({
    isAdmin,
    showAdminPanel,
    setShowAdminPanel,
    formatDate,
    formatFileSize,
    copyUrl,
    copied,
    showNotification,
    onOpen,
}: AdminPanelProps) {
    // Admin panel states
    const [adminImages, setAdminImages] = useState<UploadedImage[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [isLoadingAdmin, setIsLoadingAdmin] = useState(false);
    const [adminStats, setAdminStats] = useState<{ totalImages: number } | null>(null);
    const [filterText, setFilterText] = useState("");
    const [sortBy, setSortBy] = useState<"date" | "size" | "uploader">("date");
    const [adminTab, setAdminTab] = useState<"images" | "members">("images");
    const [adminSelectedImage, setAdminSelectedImage] = useState<UploadedImage | null>(null);
    const [membersList, setMembersList] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState<{ name: string; email: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch admin images
    const fetchAdminImages = async () => {
        if (!isAdmin) return;
        setIsLoadingAdmin(true);
        try {
            const response = await fetch('/api/admin/images');
            const data = await response.json();
            if (data.success) {
                const images: UploadedImage[] = data.images.map((img: {
                    url: string;
                    file_path: string;
                    filename: string;
                    uploaded_at: string;
                    file_size: number;
                    host: string;
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
                    host: img.host as "imgbb" | "supabase",
                    uploaderName: img.uploader_name,
                    uploaderEmail: img.uploader_email,
                    id: img.id,
                }));
                setAdminImages(images);
                setAdminStats(data.stats);

                // Build members list
                const membersMap = new Map<string, Member>();
                images.forEach(img => {
                    const key = img.uploaderEmail || img.uploaderName || "anonymous";
                    if (!membersMap.has(key)) {
                        membersMap.set(key, { name: img.uploaderName || "Anonymous", email: img.uploaderEmail || "", uploads: 0, firstUpload: null });
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
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const selectAllImages = () => {
        if (selectedImages.size === filteredAdminImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(filteredAdminImages.map(img => img.id || img.uploadedAt.toString())));
        }
    };

    const bulkDeleteImages = async () => {
        if (selectedImages.size === 0) return;
        setIsDeleting(true);
        try {
            const imagesToDelete = adminImages.filter(img => selectedImages.has(img.id || img.uploadedAt.toString()));
            const imageIds = imagesToDelete.map(img => img.id);
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
                fetchAdminImages();
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

    // Filter and sort images
    const filteredAdminImages = adminImages
        .filter(img => {
            if (selectedMember) {
                if (img.uploaderEmail !== selectedMember.email && img.uploaderName !== selectedMember.name) return false;
            }
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

    // Open panel and fetch
    const openPanel = () => {
        setShowAdminPanel(true);
        fetchAdminImages();
    };

    // Fetch data when panel opens
    useEffect(() => {
        if (showAdminPanel && isAdmin) {
            fetchAdminImages();
        }
    }, [showAdminPanel, isAdmin]);

    if (!showAdminPanel || !isAdmin) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
            <div className="glass rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🛡️</span>
                        <h2 className="font-pixel text-xl text-[#ff4757]">ADMIN PANEL</h2>
                        <span className="bg-[#ff4757]/20 text-[#ff4757] text-xs px-2 py-1 rounded-full font-pixel">ADMIN</span>
                    </div>
                    <button onClick={() => { setShowAdminPanel(false); setAdminSelectedImage(null); }} className="w-10 h-10 rounded-full glass hover:bg-red-500/20 transition-all flex items-center justify-center">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setAdminTab("images")} className={`px-4 py-2 rounded-xl font-medium transition-all ${adminTab === "images" ? "bg-[#ff4757] text-white" : "glass border border-white/10 hover:border-[#ff4757]/50"}`}>
                        🖼️ Images ({adminStats?.totalImages || 0})
                    </button>
                    <button onClick={() => setAdminTab("members")} className={`px-4 py-2 rounded-xl font-medium transition-all ${adminTab === "members" ? "bg-[#2ed573] text-white" : "glass border border-white/10 hover:border-[#2ed573]/50"}`}>
                        👥 Members ({membersList.length})
                    </button>
                </div>

                {/* Image Detail Modal */}
                {adminSelectedImage && (
                    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4" onClick={() => setAdminSelectedImage(null)}>
                        <div className="glass rounded-2xl p-6 max-w-md w-full relative flex flex-col max-h-[90vh] my-auto" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => setAdminSelectedImage(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full glass hover:bg-red-500/20 flex items-center justify-center text-gray-400 hover:text-white transition-all z-10">✕</button>

                            <div className="flex-shrink-0 mb-4 bg-black/30 rounded-xl overflow-hidden flex items-center justify-center h-52">
                                <img src={adminSelectedImage.directUrl} alt={adminSelectedImage.filename} className="max-w-full max-h-full object-contain" />
                            </div>

                            <h3 className="font-pixel text-sm text-[#ff4757] mb-4 text-center flex-shrink-0">IMAGE DETAILS</h3>

                            <div className="space-y-3 text-sm glass-dark rounded-xl p-4 overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-center"><span className="text-gray-400">Filename</span><span className="text-white truncate ml-4 max-w-[180px] text-right">{adminSelectedImage.filename}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Uploader</span><span className="text-[#2ed573]">👤 {adminSelectedImage.uploaderName || "Anonymous"}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Email</span><span className="text-white truncate ml-4 max-w-[180px] text-right">{adminSelectedImage.uploaderEmail || "N/A"}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Uploaded</span><span className="text-white">{formatDate(adminSelectedImage.uploadedAt)}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400">Size</span><span className="text-white">{formatFileSize(adminSelectedImage.fileSize)}</span></div>
                            </div>

                            <button onClick={() => copyUrl(adminSelectedImage.directUrl)} className="w-full mt-4 py-3 rounded-xl bg-[#2ed573] hover:bg-[#26b85f] font-medium transition-all flex-shrink-0">
                                {copied ? "✓ Copied!" : "📋 Copy URL"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Images Tab */}
                {adminTab === "images" && (
                    <>
                        {/* Stats */}
                        {adminStats && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="glass-dark p-3 rounded-xl text-center"><p className="text-xl font-bold text-[#2ed573]">{adminStats.totalImages}</p><p className="text-xs text-gray-400">Total Images</p></div>
                                <div className="glass-dark p-3 rounded-xl text-center"><p className="text-xl font-bold text-[#ffa502]">{membersList.length}</p><p className="text-xs text-gray-400">Uploaders</p></div>
                                <div className="glass-dark p-3 rounded-xl text-center"><p className="text-xl font-bold text-[#ff4757]">{selectedImages.size}</p><p className="text-xs text-gray-400">Selected</p></div>
                                <div className="glass-dark p-3 rounded-xl text-center"><p className="text-xl font-bold text-white">{formatFileSize(adminImages.reduce((acc, img) => acc + (img.fileSize || 0), 0))}</p><p className="text-xs text-gray-400">Total Size</p></div>
                            </div>
                        )}

                        {/* Member Filter Banner */}
                        {selectedMember && (
                            <div className="flex items-center gap-3 mb-3 p-3 bg-[#2ed573]/10 border border-[#2ed573]/30 rounded-xl">
                                <span className="text-[#2ed573]">👤 Viewing uploads from: <strong>{selectedMember.name}</strong></span>
                                <button onClick={() => setSelectedMember(null)} className="ml-auto px-3 py-1.5 glass hover:bg-red-500/20 rounded-xl text-sm border border-white/10">✕ Clear Filter</button>
                            </div>
                        )}

                        {/* Controls */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            <input type="text" placeholder="🔍 Search..." value={filterText} onChange={(e) => setFilterText(e.target.value)} className="flex-1 min-w-[150px] px-3 py-2 glass-dark rounded-xl border border-white/10 focus:border-[#ff4757]/50 outline-none text-sm" />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "date" | "size" | "uploader")} className="px-3 py-2 glass-dark rounded-xl border border-white/10 text-sm">
                                <option value="date">📅 Date</option>
                                <option value="size">📦 Size</option>
                                <option value="uploader">👤 Uploader</option>
                            </select>
                            <button onClick={selectAllImages} className="px-3 py-2 glass rounded-xl border border-white/10 hover:border-[#2ed573]/50 text-sm">{selectedImages.size === filteredAdminImages.length && filteredAdminImages.length > 0 ? "✓ Deselect" : "☐ Select All"}</button>
                            <button onClick={fetchAdminImages} className="px-3 py-2 glass rounded-xl border border-white/10 hover:border-[#ffa502]/50 text-sm">🔄</button>
                        </div>

                        {/* Bulk delete */}
                        {selectedImages.size > 0 && (
                            <div className="flex items-center gap-3 mb-3 p-2 bg-red-500/10 border border-red-500/30 rounded-xl text-sm">
                                <span className="text-red-400">⚠️ {selectedImages.size} selected</span>
                                <button onClick={bulkDeleteImages} disabled={isDeleting} className="ml-auto px-3 py-1.5 bg-red-500 hover:bg-red-600 rounded-xl font-medium text-sm disabled:opacity-50">{isDeleting ? "..." : "🗑️ Delete"}</button>
                            </div>
                        )}

                        {/* Image grid */}
                        <div className="flex-1 overflow-y-auto">
                            {isLoadingAdmin ? (
                                <div className="flex items-center justify-center py-12"><div className="animate-spin text-4xl">🔄</div></div>
                            ) : filteredAdminImages.length === 0 ? (
                                <div className="text-center py-12"><p className="text-4xl mb-4">📭</p><p className="text-gray-400">No images found</p></div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {filteredAdminImages.map((img) => {
                                        const imgId = img.id || img.uploadedAt.toString();
                                        const isSelected = selectedImages.has(imgId);
                                        return (
                                            <div key={imgId} className={`relative rounded-xl overflow-hidden transition-all group ${isSelected ? "ring-2 ring-[#ff4757] scale-95" : ""}`}>
                                                <div onClick={() => toggleImageSelection(imgId)} className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all ${isSelected ? "bg-[#ff4757]" : "bg-black/50 hover:bg-black/70"}`}>{isSelected ? "✓" : ""}</div>
                                                <div onClick={() => setAdminSelectedImage(img)} className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 hover:bg-[#2ed573] flex items-center justify-center cursor-pointer transition-all text-xs">ℹ</div>
                                                <img src={img.directUrl} alt={img.filename} className="w-full h-24 object-cover" />
                                                <div className="p-1.5 bg-black/40"><p className="text-xs text-[#2ed573] truncate">👤 {img.uploaderName || "Anon"}</p></div>
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
                            <div className="text-center py-12"><p className="text-4xl mb-4">👥</p><p className="text-gray-400">No members yet</p></div>
                        ) : (
                            <div className="space-y-3">
                                {membersList.map((member, idx) => (
                                    <div key={idx} className="glass-dark p-4 rounded-xl flex items-center gap-4 hover:border-[#2ed573]/30 border border-transparent transition-all">
                                        <div className="w-12 h-12 rounded-full bg-[#2ed573]/20 flex items-center justify-center text-2xl">👤</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{member.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{member.email || "No email"}</p>
                                        </div>
                                        <div className="text-center"><p className="text-lg font-bold text-[#ff4757]">{member.uploads}</p><p className="text-xs text-gray-400">uploads</p></div>
                                        <div className="text-center min-w-[90px]"><p className="text-xs text-gray-400">First seen</p><p className="text-xs text-white">{member.firstUpload ? formatDate(member.firstUpload) : "N/A"}</p></div>
                                        <button onClick={() => { setSelectedMember({ name: member.name, email: member.email }); setAdminTab("images"); }} className="px-3 py-2 bg-[#ff4757] hover:bg-[#ff6b81] rounded-xl text-sm font-medium transition-all">🖼️ View</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Export the button component to trigger the panel
export function AdminButton({ isAdmin, onClick }: { isAdmin: boolean; onClick: () => void }) {
    if (!isAdmin) return null;
    return (
        <button onClick={onClick} className="px-4 py-2.5 bg-[#ff4757] hover:bg-[#ff6b81] rounded-full text-sm font-medium transition-all hover:scale-105 flex items-center gap-2">
            <span className="hidden sm:inline">🛡️ Admin</span>
            <span className="sm:hidden">🛡️</span>
        </button>
    );
}
