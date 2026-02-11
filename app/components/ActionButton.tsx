"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonVariant = "primary" | "secondary" | "danger";
type ActionButtonSize = "sm" | "md" | "lg";
type ActionButtonShape = "rounded" | "pill";
type ActionButtonTone = "default" | "info" | "success" | "warning" | "dangerSoft";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ActionButtonVariant;
    size?: ActionButtonSize;
    shape?: ActionButtonShape;
    tone?: ActionButtonTone;
    fullWidth?: boolean;
    leftIcon?: ReactNode;
}

const baseClass =
    "font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border";

const sizeClassMap: Record<ActionButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base",
};

const shapeClassMap: Record<ActionButtonShape, string> = {
    rounded: "rounded-xl",
    pill: "rounded-full",
};

const variantClassMap: Record<ActionButtonVariant, string> = {
    primary: "bg-[#2ed573] hover:bg-[#26b85f] text-white border-[#2ed573]",
    secondary: "glass border-white/10 text-white hover:border-[#2ed573]/50 hover:bg-[#2ed573]/10",
    danger: "bg-[#ff4757] hover:bg-[#ff6b81] text-white border-[#ff4757]",
};

const secondaryToneClassMap: Record<ActionButtonTone, string> = {
    default: variantClassMap.secondary,
    info: "border-sky-300/60 text-sky-200 bg-sky-500/25 hover:bg-sky-500/35 hover:text-sky-100",
    success: "border-[#2ed573]/60 text-[#7dffb0] bg-[#2ed573]/25 hover:bg-[#2ed573]/35 hover:text-[#b2ffd0]",
    warning: "border-[#ffa502]/60 text-[#ffd280] bg-[#ffa502]/20 hover:bg-[#ffa502]/30 hover:text-[#ffe4a8]",
    dangerSoft: "border-red-400/50 text-red-300 bg-red-500/15 hover:bg-red-500/25 hover:text-red-200",
};

function hasExplicitColorClasses(className: string): boolean {
    // Only treat base (non-hover) color tokens as explicit overrides.
    // Hover-only tokens should not disable default secondary styling.
    return /(?:^|\s)(?:bg|text|border)-/.test(className);
}

export default function ActionButton({
    children,
    className = "",
    variant = "secondary",
    size = "md",
    shape = "rounded",
    tone = "default",
    fullWidth = false,
    leftIcon,
    ...props
}: ActionButtonProps) {
    let variantClasses = variantClassMap[variant];
    if (variant === "secondary") {
        variantClasses = tone !== "default"
            ? secondaryToneClassMap[tone]
            : hasExplicitColorClasses(className)
                ? ""
                : secondaryToneClassMap.default;
    }
    const isPrimitiveChild = typeof children === "string" || typeof children === "number";

    return (
        <button
            className={`${baseClass} ${shapeClassMap[shape]} ${sizeClassMap[size]} ${variantClasses} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
            {...props}
        >
            {leftIcon}
            {isPrimitiveChild ? (
                <span>{children}</span>
            ) : (
                <span className="inline-flex items-center gap-2 leading-none">{children}</span>
            )}
        </button>
    );
}
