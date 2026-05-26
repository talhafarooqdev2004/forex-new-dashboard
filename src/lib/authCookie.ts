export const AUTH_COOKIE = "forex_jwt";

/** Reads the session JWT set by `setAuthCookie` (used when `localStorage` is empty but the cookie remains). */
export function readAuthTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const prefix = `${AUTH_COOKIE}=`;
    for (const part of document.cookie.split(";")) {
        const trimmed = part.trim();
        if (!trimmed.startsWith(prefix)) continue;
        const raw = trimmed.slice(prefix.length);
        if (!raw) return null;
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }
    return null;
}

/** Sets the cookie Next.js middleware reads (same token as `localStorage.authToken`). */
export function setAuthCookie(token: string): void {
    if (typeof document === "undefined") return;
    const maxAge = 7 * 24 * 60 * 60;
    document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
    if (typeof document === "undefined") return;
    document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0`;
}
