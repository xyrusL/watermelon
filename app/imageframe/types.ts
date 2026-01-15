// Type definitions for ImageFrame
export interface UploadedImage {
    url: string;
    directUrl: string;
    deleteUrl?: string;
    thumbnail?: string;
    filename: string;
    uploadedAt: number;
    fileSize?: number;
    host?: HostType;
    uploaderName?: string;
    uploaderEmail?: string;
    id?: string;
    is_private?: boolean;
    is_nsfw?: boolean;
}

export type HostType = "imgbb" | "supabase";

export interface HostConfig {
    name: string;
    maxSize: number;
    maxSizeLabel: string;
    deleteSupport: React.ReactNode | string;
    uploadEndpoint: string;
    deleteEndpoint: string;
    healthEndpoint: string;
    description?: string;
}

export interface NotificationState {
    show: boolean;
    type: "error" | "warning" | "success" | "info";
    title: string;
    message: string;
    details?: string;
}

export interface FrameSize {
    name: string;
    ratio: number | undefined;
    frames: number;
    icon: React.ReactNode | string;
}
