const AUTH_COOKIE = "forex_jwt";

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
