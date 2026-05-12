/**
 * Mirrors `CurrencyFundamentalsClientPage`: `TabsList` currency triggers + summary bar + main table card.
 */
export default function CurrencyFundamentalsPageSkeleton() {
    return (
        <div className="relative flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading currency fundamentals">
            <div className="flex flex-wrap gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-9 w-14 animate-pulse rounded-md bg-darkGrey" aria-hidden />
                ))}
            </div>
            <div className="h-14 w-full max-w-2xl animate-pulse rounded-lg bg-darkGrey" aria-hidden />
            <section className="space-y-3 rounded-xl bg-darkGrey py-4">
                <div className="mx-auto h-7 w-48 animate-pulse rounded bg-foreground/10" />
                <div className="min-h-[520px] w-full animate-pulse bg-foreground/[0.04]" aria-hidden />
            </section>
        </div>
    );
}
