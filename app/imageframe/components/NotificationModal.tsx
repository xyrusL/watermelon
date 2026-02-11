// Notification Modal Component
import { NotificationState } from "../types";
import { PixelWarning, PixelInfo, PixelCheck, PixelClose } from "./PixelIcons";

interface NotificationModalProps {
    notification: NotificationState;
    onClose: () => void;
}

export default function NotificationModal({ notification, onClose }: NotificationModalProps) {
    if (!notification.show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
            <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-white/10" onClick={(e) => e.stopPropagation()}>
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
                <button
                    onClick={onClose}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${notification.type === "error" ? "bg-red-500 hover:bg-red-600" :
                        notification.type === "warning" ? "bg-yellow-500 hover:bg-yellow-600" :
                            notification.type === "success" ? "bg-[#2ed573] hover:bg-[#26b85f]" :
                                "bg-blue-500 hover:bg-blue-600"
                        }`}
                >
                    Got it
                </button>
            </div>
        </div>
    );
}
