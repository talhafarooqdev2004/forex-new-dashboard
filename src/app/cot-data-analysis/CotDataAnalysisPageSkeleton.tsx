/**
 * Mirrors `CotDataAnalysisClientPage`: primary column + desktop `COTPairBiasTable` rail; stacked sections below.
 */
export default function CotDataAnalysisPageSkeleton() {
    return (
        <div className="flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading COT analysis">
            <div className="flex min-w-0 flex-row items-stretch gap-6">
                <div className="flex min-w-0 flex-[55_1_0%] flex-col gap-6 self-stretch">
                    <section className="relative flex min-h-[min(42vh,440px)] flex-1 flex-col rounded-xl bg-darkGrey p-6">
                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                                <div className="h-6 w-48 animate-pulse rounded bg-foreground/10" />
                                <div className="h-6 w-32 animate-pulse rounded bg-foreground/10" />
                            </div>
                            <div className="h-20 max-w-3xl animate-pulse rounded-md bg-foreground/5" />
                            <div className="mt-3 flex flex-1 flex-col items-center justify-center border-t border-stroke/60 pt-4">
                                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                                    <div className="h-10 w-20 animate-pulse rounded bg-foreground/10" />
                                    <div className="h-40 w-40 animate-pulse rounded-full bg-foreground/5" />
                                </div>
                            </div>
                            <div className="grid min-h-[200px] gap-4 sm:grid-cols-2">
                                <div className="min-h-[200px] animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                                <div className="min-h-[200px] animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                            </div>
                            <div className="min-h-[140px] w-full animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                        </div>
                    </section>
                </div>

                <div className="min-h-[min(42vh,440px)] min-w-0 flex-[45_1_0%] self-stretch overflow-hidden rounded-xl bg-darkGrey">
                    <div className="h-full min-h-[400px] w-full animate-pulse bg-foreground/[0.04]" aria-hidden />
                </div>
            </div>

            <div className="min-h-[280px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
            <div className="min-h-[280px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
            <div className="min-h-[420px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
        </div>
    );
}
