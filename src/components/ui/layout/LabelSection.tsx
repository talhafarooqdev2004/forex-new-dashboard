import { cn } from "@/lib/utils";

export default function LabelSection({
    padding = true,
    label = "",
    icon,
    className,
    children
}: React.PropsWithChildren<{
    padding?: boolean,
    label?: string,
    icon?: React.ReactNode,
    className?: string
}>) {
    return (
        <section className={cn("bg-darkGrey rounded-xl flex-1 relative", className)}>
            <div className="px-6 py-3 border-b border-solid border-stroke">
                <div className="flex items-center gap-2">
                    {icon}
                    <h5>{label}</h5>
                </div>
            </div>

            <div className={cn("py-3", padding && "px-6")}>
                {children}
            </div>
        </section>
    );
};
