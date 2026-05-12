/**
 * Shown while server data for the technical dashboard streams in.
 * Mirrors main section layout and min-heights to reduce layout shift.
 */
export default function TechnicalDashboardPageSkeleton() {
    return (
        <div className="flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading dashboard">
            <div className="h-12 w-full animate-pulse rounded-lg bg-darkGrey" />

            <div className="flex min-w-0 flex-col gap-6 lg:flex-row">
                <div className="flex min-w-0 flex-1 flex-col lg:w-[70%] lg:min-h-0">
                    <div className="mb-5 h-6 w-48 shrink-0 animate-pulse rounded bg-darkGrey" />
                    <div className="min-h-[200px] rounded-xl bg-darkGrey px-5 py-6">
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="h-14 animate-pulse rounded-lg bg-foreground/10" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex w-full flex-shrink-0 flex-col gap-4 min-h-0 lg:w-[30%] lg:self-stretch">
                    <div className="shrink-0 rounded-xl bg-darkGrey px-6 py-4">
                        <div className="mb-3 h-5 w-52 animate-pulse rounded bg-foreground/10" />
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-10 animate-pulse rounded-lg bg-foreground/10" />
                            ))}
                        </div>
                    </div>
                    <div className="bg-darkGrey rounded-xl flex flex-col flex-1 min-h-0 basis-0 overflow-hidden lg:min-h-[420px]">
                        <div
                            className="scrollable-container flex flex-1 min-h-0 justify-center overflow-x-hidden px-4 pb-4 pt-4"
                            aria-label="Technical analysis widget"
                        >
                            <div
                                className="h-[440px] w-[380px] max-w-full shrink-0 animate-pulse rounded-lg bg-foreground/5"
                                aria-hidden
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex min-w-0 flex-col gap-6">
                <div
                    className="h-[min(70vh,720px)] min-h-[520px] w-full animate-pulse rounded-xl bg-darkGrey"
                    aria-hidden
                />
                <div className="flex min-w-0 flex-col gap-6">
                    <div className="relative mb-0 min-h-[40px] w-full shrink-0 px-1">
                        <div className="mx-auto mt-2 h-6 w-36 animate-pulse rounded bg-darkGrey" />
                    </div>
                    <div className="flex min-h-0 flex-col gap-6 xl:flex-row xl:items-stretch">
                        <div className="flex w-full min-h-0 gap-4 xl:w-[45%]">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="min-h-[120px] min-w-0 flex-1 animate-pulse rounded-2xl bg-darkGrey" />
                            ))}
                        </div>
                        <div className="min-h-[280px] w-full flex-1 animate-pulse rounded-xl bg-darkGrey xl:w-[55%] xl:flex-col" />
                    </div>
                </div>
            </div>
        </div>
    );
}
