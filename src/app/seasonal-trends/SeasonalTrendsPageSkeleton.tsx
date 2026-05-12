/**
 * Mirrors `SeasonalTrendsClientPage`: `PeriodPicker` row, top currencies row, gauge grid, pair heatmap block.
 */
export default function SeasonalTrendsPageSkeleton() {
    return (
        <div className="flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading seasonal trends">
            <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-10 animate-pulse rounded bg-foreground/10" />
                    <div className="h-6 w-12 animate-pulse rounded-md bg-foreground/20" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="h-4 w-14 animate-pulse rounded bg-foreground/5" />
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-7 w-12 animate-pulse rounded bg-foreground/5" aria-hidden />
                    ))}
                </div>
            </div>

            <div>
                <div className="mb-6 h-7 w-72 max-w-full animate-pulse rounded-md bg-darkGrey" />
                <div className="flex min-h-[128px] flex-wrap items-center gap-6">
                    <div className="h-32 min-w-[220px] flex-1 animate-pulse rounded-xl bg-darkGrey px-6 py-8" aria-hidden />
                    <div className="h-32 min-w-[220px] flex-1 animate-pulse rounded-xl bg-darkGrey px-6 py-8" aria-hidden />
                </div>
            </div>

            <div
                className="grid grid-cols-[repeat(auto-fit,minmax(88px,1fr))] gap-x-8 gap-y-10 rounded-xl bg-darkGrey px-7 py-8"
                aria-hidden
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-3">
                        <div className="aspect-square w-full max-w-[100px] animate-pulse rounded-full bg-foreground/5" />
                        <div className="h-4 w-8 animate-pulse rounded bg-foreground/10" />
                        <div className="h-4 w-12 animate-pulse rounded bg-foreground/5" />
                    </div>
                ))}
            </div>

            <div>
                <div className="mb-6 h-7 w-80 max-w-full animate-pulse rounded-md bg-darkGrey" />
                <div className="rounded-xl bg-darkGrey px-5 py-6">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-14 animate-pulse rounded-lg bg-foreground/10" aria-hidden />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
