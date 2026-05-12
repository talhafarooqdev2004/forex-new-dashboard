/**
 * Mirrors `FundamentalDashboardClientPage`: `Container` gap-8 + 2×2 / 3-col grid with a stacked fourth column.
 */
function FundamentalSectionCardSkeleton() {
    return (
        <section className="relative flex h-full min-h-[min(36vh,380px)] w-full flex-col rounded-xl bg-darkGrey p-6">
            <div className="h-6 w-3/5 max-w-[280px] animate-pulse rounded-md bg-foreground/10" />
            <hr className="pointer-events-none absolute top-[60px] right-0 left-0 border-stroke" />
            <div className="mt-[72px] flex flex-1 flex-col gap-3">
                <div className="h-4 w-full animate-pulse rounded bg-foreground/5" />
                <div className="h-4 w-[92%] animate-pulse rounded bg-foreground/5" />
                <div className="h-24 w-full animate-pulse rounded-md bg-foreground/5" />
            </div>
        </section>
    );
}

export default function FundamentalDashboardPageSkeleton() {
    return (
        <div
            className="grid grid-cols-2 items-stretch gap-8 3xl:grid-cols-3"
            role="status"
            aria-label="Loading fundamental dashboard"
        >
            <FundamentalSectionCardSkeleton />
            <FundamentalSectionCardSkeleton />
            <FundamentalSectionCardSkeleton />
            <div className="flex h-full w-full min-w-0 flex-col gap-8">
                <FundamentalSectionCardSkeleton />
                <FundamentalSectionCardSkeleton />
            </div>
        </div>
    );
}
