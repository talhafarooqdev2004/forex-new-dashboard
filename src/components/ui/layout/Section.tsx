import { cn } from "@/lib/utils";

export default function Section({ padding = true, className, children }: React.PropsWithChildren<{ padding?: boolean, className?: string }>) {
    const baseClass = "bg-darkGrey rounded-xl flex-1";

    return (
        <section className={cn(baseClass, "p-6", className)}>
            {children}
        </section>
    );
};
