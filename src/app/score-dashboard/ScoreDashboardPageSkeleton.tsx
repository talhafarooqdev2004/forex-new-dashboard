/**
 * Mirrors `ScoreDashboardClientPage`: `Container` → `main.space-y-6` → single `DynamicTableDisplay` card.
 */
export default function ScoreDashboardPageSkeleton() {
    return (
        <main className="min-w-0 space-y-6" role="status" aria-label="Loading score dashboard">
            <section
                className="min-h-[520px] overflow-hidden rounded-xl bg-darkGrey"
                aria-hidden
            >
                <div className="h-full min-h-[480px] w-full animate-pulse bg-foreground/[0.06]" />
            </section>
        </main>
    );
}
