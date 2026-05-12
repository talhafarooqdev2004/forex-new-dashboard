/**
 * Mirrors `RetailSentimentClientPage`: `main.space-y-6` + `xl:grid-cols-[2fr_3fr]` for table + chart.
 */
export default function RetailSentimentPageSkeleton() {
    return (
        <main className="min-w-0 space-y-6" role="status" aria-label="Loading retail sentiment">
            <div className="grid min-h-[480px] gap-6 xl:grid-cols-[2fr_3fr] xl:items-start">
                <section className="min-h-[480px] overflow-hidden rounded-xl bg-darkGrey" aria-hidden>
                    <div className="h-full min-h-[440px] w-full animate-pulse bg-foreground/[0.06]" />
                </section>
                <section className="min-h-[480px] overflow-hidden rounded-xl bg-darkGrey" aria-hidden>
                    <div className="h-full min-h-[440px] w-full animate-pulse bg-foreground/[0.06]" />
                </section>
            </div>
        </main>
    );
}
