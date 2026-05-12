import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export default function PrimaryCard({ children, className }: PropsWithChildren<{
    className?: string;
}>) {
    return (
        <div className={cn("bg-darkGrey rounded-[12px] p-6 flex-1", className)}>
            {children}
        </div>
    );
}