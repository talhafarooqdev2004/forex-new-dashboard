/**
 * Mirrors `CotDataAnalysisClientPage` hero: flexible left block + fixed-width Pair Bias rail.
 */
export default function CotDataAnalysisPageSkeleton() {
    return (
        <div className="flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading COT analysis">
            <div className="flex min-w-0 flex-col items-stretch gap-6 xl:flex-row">
                <div className="flex min-w-0 flex-1 flex-col gap-6">
                    <div className="flex min-h-[min(360px,42vh)] flex-col gap-4 md:flex-row md:gap-6">
                        <div className="min-h-[280px] flex-1 animate-pulse rounded-xl bg-darkGrey" aria-hidden />
                        <div className="flex min-h-[280px] flex-1 flex-col gap-4">
                            <div className="flex-1 animate-pulse rounded-xl bg-darkGrey" aria-hidden />
                            <div className="flex-1 animate-pulse rounded-xl bg-darkGrey" aria-hidden />
                        </div>
                    </div>
                    <div className="min-h-[240px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
                </div>
                <div className="h-[min(480px,55vh)] w-full shrink-0 animate-pulse rounded-xl bg-darkGrey xl:h-auto xl:min-h-[min(640px,70vh)] xl:w-[440px]" aria-hidden />
            </div>

            <div className="min-h-[280px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
            <div className="min-h-[420px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
        </div>
    );
}
