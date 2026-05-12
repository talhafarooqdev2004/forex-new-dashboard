/** Default landing after sign-in when no safe `next` is provided. */
export const DEFAULT_POST_LOGIN_PATH = "/technical-dashboard";

/**
 * Resolves post-login navigation. Unbuilt/stub routes like `/dashboard` go to the technical dashboard.
 */
export function resolvePostLoginPath(next: string | null | undefined): string {
    if (!next || !next.startsWith("/")) return DEFAULT_POST_LOGIN_PATH;
    if (next === "/" || next === "/dashboard" || next.startsWith("/dashboard/")) return DEFAULT_POST_LOGIN_PATH;
    return next;
}
