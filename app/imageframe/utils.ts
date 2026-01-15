// Utility functions for ImageFrame

/**
 * Ensure URL is absolute
 */
export const ensureAbsoluteUrl = (url: string): string => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url; // Already absolute
    }
    // Get current origin (works in both browser and SSR)
    if (typeof window !== 'undefined') {
        return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url; // Fallback
};

/**
 * Format date in Manila/PH timezone
 */
export const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};
