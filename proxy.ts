import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "watermelon.deze.me";
const LEGACY_HOSTS = new Set(["deze.me", "www.deze.me"]);

export default clerkMiddleware((auth, req) => {
  const host = req.headers.get("host") || "";

  if (LEGACY_HOSTS.has(host)) {
    const url = req.nextUrl.clone();
    url.protocol = "https";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
