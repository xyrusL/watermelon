"use client";

import { useState } from "react";

const CONSENT_KEY = "watermelon_cookie_consent_v1";
const LATER_KEY = "watermelon_cookie_later_until";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function CookieBanner() {
  const [isReady] = useState(true);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;

    const consent = localStorage.getItem(CONSENT_KEY);
    const laterUntil = Number(localStorage.getItem(LATER_KEY) || 0);
    const now = Date.now();

    return !consent && now > laterUntil;
  });

  const acceptCookies = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    localStorage.removeItem(LATER_KEY);
    setIsVisible(false);
  };

  const remindLater = () => {
    localStorage.setItem(LATER_KEY, String(Date.now() + ONE_DAY_MS));
    setIsVisible(false);
  };

  if (!isReady || !isVisible) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-[90] pb-[max(env(safe-area-inset-bottom),0px)] sm:inset-x-4 sm:bottom-4">
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-[#121212]/95 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-5 md:p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#ff4757]/10 via-transparent to-[#2ed573]/10" />

        <div className="relative flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2ed573]/40 bg-[#2ed573]/15">
              <span className="text-lg" aria-hidden>
                🍪
              </span>
            </div>
            <div>
              <p className="font-pixel text-[10px] text-[#2ed573] sm:text-xs">COOKIE NOTICE</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-200 sm:text-[15px]">
                We use essential cookies for sign-in and keeping the site secure. No ads, just smooth gameplay tools.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={remindLater}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-200 transition-all hover:border-white/35 hover:bg-white/10 sm:w-auto"
            >
              Later
            </button>
            <button
              type="button"
              onClick={acceptCookies}
              className="w-full rounded-xl border border-[#2ed573]/60 bg-[#2ed573] px-4 py-2.5 text-sm font-semibold text-[#0d0d0d] transition-all hover:bg-[#26de81] sm:w-auto"
            >
              Okay, got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
