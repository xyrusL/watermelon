"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonVariant = "primary" | "secondary" | "danger";
type ActionButtonSize = "sm" | "md" | "lg";
type ActionButtonShape = "rounded" | "pill";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ActionButtonVariant;
    size?: ActionButtonSize;
    shape?: ActionButtonShape;
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

export default function ActionButton({
    children,
    className = "",
    variant = "secondary",
    size = "md",
    shape = "rounded",
    fullWidth = false,
    leftIcon,
    ...props
}: ActionButtonProps) {
    return (
        <button
            className={`${baseClass} ${shapeClassMap[shape]} ${sizeClassMap[size]} ${variantClassMap[variant]} ${fullWidth ? "w-full" : ""} ${className}`.trim()}
            {...props}
        >
            {leftIcon}
            <span>{children}</span>
        </button>
    );
}
