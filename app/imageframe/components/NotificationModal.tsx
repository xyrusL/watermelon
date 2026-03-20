// Notification Modal Component
"use client";

import { useEffect, useState } from "react";
import { NotificationState } from "../types";
import { PixelWarning, PixelInfo, PixelCheck, PixelClose } from "./PixelIcons";
import ActionButton from "../../components/ActionButton";

interface NotificationModalProps {
    notification: NotificationState;
    onClose: () => void;
}

export default function NotificationModal({ notification, onClose }: NotificationModalProps) {
    const [isMounted, setIsMounted] = useState(notification.show);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (notification.show) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsMounted(true);
            setIsClosing(false);
            return;
        }

        if (!isMounted) return;
        setIsClosing(true);
        const timeout = window.setTimeout(() => {
            setIsMounted(false);
            setIsClosing(false);
        }, 180);

        return () => window.clearTimeout(timeout);
    }, [notification.show, isMounted]);

    if (!isMounted) return null;

    return (
        <div className={`motion-backdrop fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/80 ${isClosing ? "is-closing" : "is-open"}`} onClick={onClose}>
            <div className={`motion-modal-panel glass rounded-2xl p-6 max-w-md w-full border-2 border-white/10 ${isClosing ? "is-closing" : "is-open"}`} onClick={(e) => e.stopPropagation()}>
                {/* Icon */}
                <div className="text-center mb-4 flex justify-center">
                    {notification.type === "error" && <PixelClose size={48} color="#ff4757" />}
                    {notification.type === "warning" && <PixelWarning size={48} color="#ffa502" />}
                    {notification.type === "success" && <PixelCheck size={48} color="#2ed573" />}
                    {notification.type === "info" && <PixelInfo size={48} color="#3742fa" />}
                </div>

                {/* Title */}
                <h3 className={`font-pixel text-lg mb-4 text-center ${notification.type === "error" ? "text-red-400" :
                    notification.type === "warning" ? "text-yellow-400" :
                        notification.type === "success" ? "text-[#2ed573]" :
                            "text-blue-400"
                    }`}>
                    {notification.title.toUpperCase()}
                </h3>

                {/* Message */}
                <p className="text-gray-300 text-center mb-4">
                    {notification.message}
                </p>

                {/* Details */}
                {notification.details && (
                    <div className="glass p-3 rounded-lg mb-4 border border-white/10">
                        <p className="text-xs text-gray-400 text-center">
                            {notification.details}
                        </p>
                    </div>
                )}

                {/* Close Button */}
                <ActionButton
                    onClick={onClose}
                    variant={notification.type === "error" ? "danger" : "primary"}
                    fullWidth
                    className={`${notification.type === "warning" ? "bg-yellow-500 hover:bg-yellow-600 border-yellow-500" :
                        notification.type === "info" ? "bg-blue-500 hover:bg-blue-600 border-blue-500" : ""
                        }`}
                >
                    Got it
                </ActionButton>
            </div>
        </div>
    );
}
