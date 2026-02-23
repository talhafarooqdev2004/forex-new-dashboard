import clsx from "clsx";

export default function Container({
    children,
    className = "",
    ...props
}: { children: React.ReactNode, className?: string } & React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={clsx("flex flex-col gap-6 max-w-full min-w-0", className)} {...props}>
            {children}
        </div>
    );
};