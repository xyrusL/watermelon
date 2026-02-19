"use client";

import { SignInButton } from "@clerk/nextjs";
import ActionButton from "./ActionButton";
import { PixelInfo, PixelKey, PixelLock } from "../imageframe/components/PixelIcons";

type AuthRequiredCardProps = {
    description: string;
    postAuthAction: string;
    className?: string;
};

export default function AuthRequiredCard({
    description,
    postAuthAction,
    className = "",
}: AuthRequiredCardProps) {
    return (
        <div className={`glass rounded-2xl p-8 border-2 border-[#ffa502]/30 bg-gradient-to-br from-[#ffa502]/5 to-transparent ${className}`.trim()}>
            <div className="text-center space-y-4">
                <div className="flex justify-center mb-4"><PixelLock size={48} color="#ffa502" /></div>
                <h2 className="font-pixel text-xl text-[#ffa502]">AUTHENTICATION REQUIRED</h2>
                <p className="text-gray-300 max-w-md mx-auto mb-2">{description}</p>
                <div className="glass-dark rounded-lg p-4 max-w-lg mx-auto border border-[#2ed573]/20">
                    <p className="text-sm text-gray-400 mb-2">
                        <span className="text-[#2ed573] font-medium flex items-center gap-2">
                            <PixelInfo size={16} color="#2ed573" />
                            How it works:
                        </span>
                    </p>
                    <p className="text-sm text-gray-300">
                        Click the button below to open Clerk&apos;s secure authentication.
                        You can <strong className="text-white">sign in with an existing account</strong> or <strong className="text-white">create a new account</strong> there.
                        After authentication, you&apos;ll be redirected back here to {postAuthAction}.
                    </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-4">
                    <SignInButton mode="modal">
                        <ActionButton
                            variant="primary"
                            shape="pill"
                            className="px-6 py-3 hover:scale-105 flex items-center gap-2 cursor-pointer"
                        >
                            <PixelKey size={16} color="currentColor" />
                            <span>Continue to Clerk Sign In</span>
                        </ActionButton>
                    </SignInButton>
                </div>
                <p className="text-xs text-gray-500">
                    Secured by <span className="text-white font-medium">Clerk</span> • Safe & Encrypted
                </p>
            </div>
        </div>
    );
}
