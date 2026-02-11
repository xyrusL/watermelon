const DEFAULT_PREFIX = "watermelon";

const getExtension = (name: string): string => {
    const trimmed = name.trim();
    const dotIndex = trimmed.lastIndexOf(".");
    if (dotIndex <= 0 || dotIndex === trimmed.length - 1) return "";
    return trimmed.slice(dotIndex + 1).toLowerCase();
};

export const buildWatermelonFilename = (
    originalName: string,
    uniqueSuffix: string,
    fallbackExtension = "bin"
): string => {
    const ext = getExtension(originalName) || fallbackExtension.toLowerCase();
    return `${DEFAULT_PREFIX}-${uniqueSuffix}.${ext}`;
};
