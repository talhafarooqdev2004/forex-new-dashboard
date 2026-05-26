import { NextResponse, type NextRequest } from "next/server";

import { verifyJwtHs256 } from "@/lib/jwtHs256Verify";

import { AUTH_COOKIE } from "@/lib/authCookie";

const COOKIE = AUTH_COOKIE;

function redirectToLogin(request: NextRequest, pathname: string, clearSession = false) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    const response = NextResponse.redirect(login);
    if (clearSession) {
        response.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
    }
    return response;
}

const PUBLIC_PREFIXES = [
    "/login",
    "/register",
    "/admin/login",
    "/maintenance",
    "/_next",
    "/favicon.ico",
];

function isPublicPath(pathname: string): boolean {
    if (pathname.startsWith("/_next") || pathname.startsWith("/images/") || pathname.startsWith("/fonts/")) {
        return true;
    }
    return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const token = request.cookies.get(COOKIE)?.value;
    if (!token) {
        return redirectToLogin(request, pathname);
    }

    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        console.error(
            "[proxy] JWT_SECRET is not set — cannot verify session. Set it in .env to match forex-admin-backend.",
        );
        return redirectToLogin(request, pathname, true);
    }

    const payload = await verifyJwtHs256(token, secret);
    if (!payload) {
        if (process.env.NODE_ENV !== "production") {
            console.warn(
                "[proxy] Invalid or expired session cookie. If login succeeds but you return to /login, " +
                    "ensure forex-dashboard JWT_SECRET matches forex-admin-backend JWT_SECRET.",
            );
        }
        return redirectToLogin(request, pathname, true);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image).*)"],
};
