import { cn } from "@/lib/utils";

export default function Section({ className, children }: React.PropsWithChildren<{ className?: string }>) {
    return (
        <div className={cn("bg-darkGrey rounded-xl p-6", className)}>
            {children}
        </div>
    );
};
