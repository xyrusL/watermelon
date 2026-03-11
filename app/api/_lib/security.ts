import { auth, clerkClient } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export type AuthenticatedUser = {
    userId: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
};

type RateLimitOptions = {
    key: string;
    limit: number;
    windowMs: number;
};

type RateLimitEntry = {
    count: number;
    expiresAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const DEFAULT_BUCKET = "watermelon-images";

const getClientIp = (request: NextRequest): string => {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        return forwarded.split(",")[0]?.trim() || "unknown";
    }
    return request.headers.get("x-real-ip") || "unknown";
};

export const jsonError = (
    error: string,
    status: number,
    extra?: Record<string, unknown>
) => NextResponse.json({ success: false, error, ...extra }, { status });

export const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Supabase storage not configured");
    }

    return createClient(supabaseUrl, supabaseKey);
};

export const getStorageBucketName = () =>
    process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

export async function requireAuthenticatedUser(): Promise<
    { ok: true; user: AuthenticatedUser } | { ok: false; response: NextResponse }
> {
    const { userId } = await auth();

    if (!userId) {
        return {
            ok: false,
            response: jsonError("Unauthorized", 401),
        };
    }

    const client = await clerkClient();
    const currentUser = await client.users.getUser(userId);
    const email = currentUser.emailAddresses[0]?.emailAddress;

    if (!email) {
        return {
            ok: false,
            response: jsonError("User email not found", 400),
        };
    }

    const unsafeDisplayName = currentUser.unsafeMetadata?.displayName;
    const displayName =
        (typeof unsafeDisplayName === "string" && unsafeDisplayName.trim()) ||
        [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ").trim() ||
        currentUser.username ||
        email.split("@")[0] ||
        "Anonymous";

    return {
        ok: true,
        user: {
            userId,
            email,
            displayName,
            isAdmin: currentUser.publicMetadata?.role === "admin",
        },
    };
}

export async function requireAdminUser() {
    const result = await requireAuthenticatedUser();
    if (!result.ok) return result;

    if (!result.user.isAdmin) {
        return {
            ok: false as const,
            response: jsonError("Forbidden - Admin access required", 403),
        };
    }

    return result;
}

export function enforceRateLimit(
    request: NextRequest,
    options: RateLimitOptions
): { ok: true } | { ok: false; response: NextResponse } {
    const now = Date.now();
    const ip = getClientIp(request);
    const storeKey = `${options.key}:${ip}`;
    const current = rateLimitStore.get(storeKey);

    if (!current || current.expiresAt <= now) {
        rateLimitStore.set(storeKey, {
            count: 1,
            expiresAt: now + options.windowMs,
        });
        return { ok: true };
    }

    if (current.count >= options.limit) {
        const retryAfterSeconds = Math.max(
            1,
            Math.ceil((current.expiresAt - now) / 1000)
        );
        return {
            ok: false,
            response: NextResponse.json(
                {
                    success: false,
                    error: "Too many requests",
                    retryAfterSeconds,
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": retryAfterSeconds.toString(),
                    },
                }
            ),
        };
    }

    current.count += 1;
    rateLimitStore.set(storeKey, current);
    return { ok: true };
}

export const buildInternalImageUrl = (imageId: string) => `/api/images/${imageId}`;
