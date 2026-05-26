"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Header from "@/components/layout/Header";

const SideBar = dynamic(() => import("@/components/layout/SideBar"), {
    ssr: true,
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
            <div className="w-[19%] layout-wide:w-[15%]">
                <SideBar />
            </div>
            <div className="w-[81%] min-w-0 flex flex-col layout-wide:w-[85%]">
                <Header />
                <main className="min-w-0 flex-1 bg-charcoal p-8">
                    <div className="mx-auto w-full min-w-0 max-w-dashboard-main">{children}</div>
                </main>
            </div>
        </div>
    );
}
