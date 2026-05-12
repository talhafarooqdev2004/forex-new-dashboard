import { cn } from "@/lib/utils";

export default function Section({ padding = true, hasFlex = true, className, children }: React.PropsWithChildren<{ padding?: boolean, hasFlex?: boolean, className?: string }>) {
    const baseClass = "bg-darkGrey rounded-xl";
    const flexClass = hasFlex ? "flex-1" : "";

    return (
        <section className={cn(baseClass, flexClass, padding ? "p-6" : "p-0", className)}>
            {children}
        </section>
    );
}
