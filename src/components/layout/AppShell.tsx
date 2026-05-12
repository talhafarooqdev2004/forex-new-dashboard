"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";

const SideBar = dynamic(() => import("@/components/layout/SideBar"), {
    ssr: true,
    loading: () => (
        <div
            className="flex w-full min-h-[120px] flex-col gap-2 bg-darkGrey px-3 py-4"
            aria-busy="true"
            aria-label="Loading navigation"
        >
            <div className="mx-auto mb-4 h-9 w-[80%] animate-pulse rounded-lg bg-foreground/10" />
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-foreground/5" />
            ))}
        </div>
    ),
});

const AUTH_LAYOUT_PATHS = new Set([
    "/login",
    "/register",
    "/admin/login",
    "/maintenance",
]);

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const minimal = pathname && AUTH_LAYOUT_PATHS.has(pathname);

    if (minimal) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-10 text-foreground">
                {children}
            </div>
        );
    }

    return (
        <div className="flex min-w-[1024px] w-full">
            <div className="w-[19%]">
                <SideBar />
            </div>
            <div className="w-[81%] min-w-0 flex flex-col">
                <Header />
                <main className="bg-charcoal p-8 min-w-0 flex-1">{children}</main>
            </div>
        </div>
    );
}
