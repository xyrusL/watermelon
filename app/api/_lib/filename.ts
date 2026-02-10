const DEFAULT_PREFIX = "watermelon";

const getExtension = (name: string): string => {
    const trimmed = name.trim();
    const dotIndex = trimmed.lastIndexOf(".");
    if (dotIndex <= 0 || dotIndex === trimmed.length - 1) return "";
    return trimmed.slice(dotIndex + 1).toLowerCase();
};

const sanitizeBaseName = (name: string): string => {
    return name
        .trim()
        .toLowerCase()
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-z0-9-_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
};

export const buildWatermelonFilename = (
    originalName: string,
    uniqueSuffix: string,
    fallbackExtension = "bin"
): string => {
    const ext = getExtension(originalName) || fallbackExtension.toLowerCase();
    const base = sanitizeBaseName(originalName);
    const hasPrefix = base.startsWith(`${DEFAULT_PREFIX}-`);
    const prefix = hasPrefix ? "" : `${DEFAULT_PREFIX}-`;
    return `${prefix}${uniqueSuffix}.${ext}`;
};

