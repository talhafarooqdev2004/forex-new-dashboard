"use client";

import { headerLabelsMap } from "@/constants/sidebarItems";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Switch } from "@/components/ui/switch";
import { ChevronRight, Moon, Sun } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
};

function QuickProfile() {
    const profile = {
        name: "Mustiq",
        role: "Admin",
        image: "/images/temporary/profile.png",
    };

    return (
        <button
            className="flex items-center gap-3"
            onClick={() => {
                console.log("Profile clicked");
            }}
        >
            <ProfileImage name={profile.image} />

            <div className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                    <span className="font-semibold text-foreground">{profile.name}</span>
                    <span className="text-[12px] text-secondary">{profile.role}</span>
                </div>

                <ChevronRight className="w-4 h-4 stroke-[2.5px] text-secondary" />
            </div>
        </button>
    );
};

function ProfileImage({ name }: { name: string }) {
    return (
        <div className="relative w-12 h-12">
            <Image
                src={name}
                alt="Profile"
                fill
                className="rounded-xl object-cover"
            />
        </div>
    );
};