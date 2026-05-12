import { NextResponse, type NextRequest } from "next/server";

import { verifyJwtHs256 } from "@/lib/jwtHs256Verify";

const COOKIE = "forex_jwt";

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
        const login = new URL("/login", request.url);
        login.searchParams.set("next", pathname);
        return NextResponse.redirect(login);
    }

    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
        console.error("[proxy] JWT_SECRET is not set — cannot verify session.");
        return NextResponse.next();
    }

    const payload = await verifyJwtHs256(token, secret);
    if (!payload) {
        const login = new URL("/login", request.url);
        return NextResponse.redirect(login);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image).*)"],
};
