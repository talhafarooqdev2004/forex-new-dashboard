"use client";

import styles from "./SideBar.module.scss";

import Image from "next/image";
import Link from "next/link";
import { SvgIcon } from "@/components/composed";
import { ChevronRightIcon } from "lucide-react";
import { sidebarItems } from "@/constants/sidebarItems";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconName } from "../composed/SvgIcon";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function SideBar() {
    const pathname = usePathname();

    return (
        <div className={cn("flex flex-col items-center gap-5 px-4 pt-1.5 pb-6 bg-darkGrey w-full sticky top-0 h-full", styles.sidebar)}>
            <BrandLogo />

            <SideBarItems>
                {sidebarItems.map((item) => (
                    <SideBarItem
                        key={item.href}
                        icon={item.icon as IconName}
                        href={item.href}
                        active={item.href === pathname}
                    >
                        {item.label}
                    </SideBarItem>
                ))}
            </SideBarItems>
        </div>
    );
};

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
        <div className={cn("flex flex-col items-start gap-[14px]", styles.sidebarItems)}>
            {children}
        </div>
    );
};

function SideBarItem({
    icon,
    href,
    active,
    children
}: {
    icon: IconName,
    href: string,
    active: boolean,
    children: React.ReactNode
}) {
    return (
        <Link
            href={href}
            className={cn(styles.sideBarItem, active && styles.active)}
        >
            <div className="flex items-center [max-width:1250px]:gap-1 gap-1">
                <span className={active ? "text-white" : "text-foreground"}>
                    <SvgIcon icon={icon} />
                </span>
                <span className="font-normal text-sidebarText whitespace-nowrap">{children}</span>
            </div>
            <ChevronRightIcon className={styles.chevronRightIcon} />
        </Link>
    );
};