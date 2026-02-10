"use client";

import Link from "next/link";
import { ReactNode } from "react";

type ActionLinkVariant = "primary" | "secondary" | "danger";
type ActionLinkSize = "md" | "lg";
type ActionLinkShape = "rounded" | "pill";

interface ActionLinkProps {
    href: string;
    children: ReactNode;
    className?: string;
    variant?: ActionLinkVariant;
    size?: ActionLinkSize;
    shape?: ActionLinkShape;
}

const baseClass =
    "font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 border";

const sizeClassMap: Record<ActionLinkSize, string> = {
    md: "px-4 py-3 text-sm",
    lg: "px-5 py-4 text-base",
};

const shapeClassMap: Record<ActionLinkShape, string> = {
    rounded: "rounded-xl",
    pill: "rounded-full",
};

const variantClassMap: Record<ActionLinkVariant, string> = {
    primary: "bg-[#2ed573] hover:bg-[#26b85f] text-white border-[#2ed573]",
    secondary: "glass border-white/10 text-white hover:border-[#2ed573]/50 hover:bg-[#2ed573]/10",
    danger: "bg-[#ff4757] hover:bg-[#ff6b81] text-white border-[#ff4757]",
};

export default function ActionLink({
    href,
    children,
    className = "",
    variant = "secondary",
    size = "md",
    shape = "rounded",
}: ActionLinkProps) {
    return (
        <Link
            href={href}
            className={`${baseClass} ${shapeClassMap[shape]} ${sizeClassMap[size]} ${variantClassMap[variant]} ${className}`.trim()}
        >
            {children}
        </Link>
    );
}
