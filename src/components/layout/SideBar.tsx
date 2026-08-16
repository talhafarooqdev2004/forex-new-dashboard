"use client";

import styles from "./SideBar.module.scss";

import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { sidebarItems } from "@/constants/sidebarItems";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import SvgIcon, { type IconName } from "@/components/composed/SvgIcon";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SideBar() {
    const pathname = usePathname();
    const { isAdmin } = useAuth();
    const visibleItems = sidebarItems.filter((item) => !item.adminOnly || isAdmin);

    return (
        <div className={cn("sticky top-0 z-40 flex w-full flex-row items-center gap-3 overflow-hidden bg-darkGrey px-3 py-2 lg:h-screen lg:flex-col lg:gap-5 lg:px-4 lg:pb-6 lg:pt-1.5", styles.sidebar)}>
            <BrandLogo />

            <SideBarItems>
                {visibleItems.map((item) => (
                    <SideBarItem
                        key={`${item.href}:${item.label}`}
                        icon={item.icon as IconName}
                        href={item.href}
                        active={item.href === pathname}
                        navigable={item.navigable !== false}
                        comingSoonHint={item.comingSoonHint}
                    >
                        {item.label}
                    </SideBarItem>
                ))}
            </SideBarItems>
        </div>
    );
}

function BrandLogo() {
    const { theme } = useTheme();
    const logoSrc = theme === "light" ? "/images/brand-logo-black.png" : "/images/brand-logo.png";
    return (
        <Link href="/" className="relative h-12 w-12 shrink-0 lg:h-20 lg:w-20">
            <Image
                src={logoSrc}
                alt="Logo"
                fill
                className="object-contain"
            />
        </Link>
    );
}

function SideBarItems({ children }: { children: React.ReactNode }) {
    return (
        <div className={cn("scrollable-container flex flex-col items-start gap-[14px]", styles.sidebarItems)}>
            {children}
        </div>
    );
}

function SideBarItem({
    icon,
    href,
    active,
    navigable,
    comingSoonHint,
    children,
}: {
    icon: IconName;
    href: string;
    active: boolean;
    navigable: boolean;
    comingSoonHint?: string;
    children: React.ReactNode;
}) {
    const hint = comingSoonHint ?? "Coming soon";
    const rowClass = cn(
        navigable ? styles.sideBarItem : styles.sideBarItemDisabled,
        active && navigable && styles.active,
    );

    const inner = (
        <>
            <div className="flex items-center [max-width:1250px]:gap-1 gap-1">
                <span className={active && navigable ? "text-white" : "text-foreground"}>
                    <SvgIcon icon={icon} />
                </span>
                <span className="font-normal text-sidebarText whitespace-nowrap">{children}</span>
            </div>
            <ChevronRightIcon className={styles.chevronRightIcon} />
        </>
    );

    if (navigable) {
        return (
            <Link href={href} className={rowClass}>
                {inner}
            </Link>
        );
    }

    return (
        <div
            className={rowClass}
            role="presentation"
            title={hint}
            aria-label={`${children} — ${hint}`}
        >
            {inner}
        </div>
    );
}
