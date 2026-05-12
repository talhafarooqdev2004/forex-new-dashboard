"use client";

import { sidebarItems } from "@/constants/sidebarItems";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Sun } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** First matching label wins when multiple items share the same path (same rules as `sidebarItems`). */
const headerLabelsMap = sidebarItems.reduce<Record<string, string>>((acc, item) => {
    if (!(item.href in acc)) acc[item.href] = item.label;
    return acc;
}, {});

export default function Header() {
    const pathname = usePathname();
    const headerLabel = headerLabelsMap[pathname as keyof typeof headerLabelsMap];
    const { theme, toggleTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <header
            className="flex justify-between items-center bg-darkGrey h-20 px-8 py-4 text-foreground"
            suppressHydrationWarning
        >
            <h4 className="font-medium">{headerLabel}</h4>

            <div className="flex items-center gap-4">
                {mounted && (
                    <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-foreground/70" aria-hidden />
                        <Switch
                            checked={theme === "dark"}
                            onCheckedChange={toggleTheme}
                            aria-label="Toggle dark mode"
                        />
                        <Moon className="h-4 w-4 text-foreground/70" aria-hidden />
                    </div>
                )}
                <QuickProfile />
            </div>
        </header>
    );
}

function QuickProfile() {
    const { user, logout, ready } = useAuth();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    if (!ready) {
        return <span className="text-sm text-secondary">…</span>;
    }

    const displayName =
        user && [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
            ? [user.firstName, user.lastName].filter(Boolean).join(" ")
            : user?.email ?? "Signed in";
    const initial = profileInitial(user);

    return (
        <div className="relative flex items-center gap-2">
            <button
                type="button"
                className="flex items-center gap-3"
                onClick={() => setOpen((o) => !o)}
                aria-label={`Account menu for ${displayName}`}
            >
                <ProfileAvatarInitial letter={initial} />

                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{displayName}</span>

                    <ChevronRight className="w-4 h-4 stroke-[2.5px] text-secondary" />
                </div>
            </button>
            {open ? (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[10rem] rounded-lg border border-stroke bg-darkGrey py-1 shadow-lg">
                    <button
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-charcoal"
                        onClick={() => {
                            setOpen(false);
                            logout();
                            router.push("/login");
                        }}
                    >
                        Sign out
                    </button>
                </div>
            ) : null}
        </div>
    );
}

function profileInitial(user: { firstName?: string; email?: string } | null): string {
    if (!user) return "?";
    const first = user.firstName?.trim();
    if (first) return first.charAt(0).toUpperCase();
    const email = user.email?.trim();
    if (email) return email.charAt(0).toUpperCase();
    return "?";
}

function ProfileAvatarInitial({ letter }: { letter: string }) {
    return (
        <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--electric-blue))] text-base font-semibold text-white"
            aria-hidden
        >
            {letter}
        </span>
    );
}