"use client";

import dynamic from "next/dynamic";

const MusicPlayer = dynamic(() => import("./MusicPlayer"), { ssr: false });
const CookieBanner = dynamic(() => import("./CookieBanner"), { ssr: false });

export default function ClientEnhancements() {
  return (
    <>
      <CookieBanner />
      <MusicPlayer />
    </>
  );
}
