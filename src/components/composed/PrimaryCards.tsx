import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export default function PrimaryCards({ children, className }: PropsWithChildren<{
    className?: string;
}>) {
    return (
        <div className={cn("flex flex-col lg:flex-row gap-4", className)}  >
            {children}
        </div>
    );
}