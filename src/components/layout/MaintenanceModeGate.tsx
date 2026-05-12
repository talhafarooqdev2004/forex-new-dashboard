"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiConfig } from "@/services/api.config";

const AUTH_PAGES = new Set(["/login", "/register", "/admin/login", "/maintenance"]);

function isAuthPath(pathname: string | null): boolean {
    if (!pathname) return false;
    if (AUTH_PAGES.has(pathname)) return true;
    return ["/login", "/register", "/admin/login", "/maintenance"].some(
        (p) => pathname.startsWith(`${p}/`),
    );
}

async function fetchMaintenanceOn(): Promise<boolean> {
    try {
        const res = await fetch(`${apiConfig.baseURL}/api/v1/public/status`, {
            cache: "no-store",
            credentials: "omit",
        });
        const json = (await res.json()) as { data?: { maintenanceMode?: boolean } };
        return Boolean(res.ok && json?.data?.maintenanceMode === true);
    } catch {
        return false;
    }
}

/** Real chrome (sidebar + header); avoids a second full-app skeleton before route Suspense fallbacks. */
function ShellMainPlaceholder() {
    return (
        <div
            className="flex w-full max-w-full min-w-0 flex-col gap-4"
            role="status"
            aria-label="Loading"
        >
            <div className="h-9 w-56 max-w-[55%] animate-pulse rounded-lg bg-foreground/10" />
            <div className="min-h-[min(60vh,560px)] w-full flex-1 animate-pulse rounded-xl bg-foreground/5" />
        </div>
    );
}

function MaintenanceScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-charcoal px-4 py-10 text-foreground">
            <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
                <h1 className="text-2xl font-semibold">Maintenance mode</h1>
                <p className="text-sm text-[rgb(var(--secondary))]">
                    The site is temporarily unavailable. Please try again later.
                </p>
            </div>
        </div>
    );
}

/**
 * When maintenance is on and the signed-in user is not an admin, only the maintenance screen is shown.
 * Auth pages stay normal. Admins always see the full app.
 */
export function MaintenanceModeGate({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { ready, user, isAdmin } = useAuth();
    const [maintenanceOn, setMaintenanceOn] = useState<boolean | null>(null);

    const onAuthPath = isAuthPath(pathname);

    useEffect(() => {
        if (onAuthPath) {
            setMaintenanceOn(false);
            return;
        }

        let cancelled = false;

        void (async () => {
            const on = await fetchMaintenanceOn();
            if (!cancelled) setMaintenanceOn(on);
        })();

        return () => {
            cancelled = true;
        };
    }, [onAuthPath, pathname]);

    // Re-check periodically so toggling maintenance in admin settings applies without full reload.
    useEffect(() => {
        if (onAuthPath || isAdmin || !user) return;
        const t = setInterval(() => {
            void fetchMaintenanceOn().then(setMaintenanceOn);
        }, 15000);
        return () => clearInterval(t);
    }, [onAuthPath, isAdmin, user]);

    if (onAuthPath) {
        return <AppShell>{children}</AppShell>;
    }

    if (!ready) {
        return (
            <AppShell>
                <ShellMainPlaceholder />
            </AppShell>
        );
    }

    if (isAdmin || !user) {
        return <AppShell>{children}</AppShell>;
    }

    if (maintenanceOn === null) {
        return (
            <AppShell>
                <ShellMainPlaceholder />
            </AppShell>
        );
    }

    if (maintenanceOn) {
        return <MaintenanceScreen />;
    }

    return <AppShell>{children}</AppShell>;
}
