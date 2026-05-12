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
        <div className={cn("flex flex-col items-center gap-5 px-4 pt-1.5 pb-6 bg-darkGrey w-full sticky top-0 h-full", styles.sidebar)}>
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
        <Link href="/" className="w-20 h-20 relative">
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
