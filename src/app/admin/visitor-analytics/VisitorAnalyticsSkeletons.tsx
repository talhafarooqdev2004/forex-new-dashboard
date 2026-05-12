/** Stats + tables while `fetchVisitorGeoAdminStats` runs (page title already visible). */
export function VisitorAnalyticsDataSkeleton() {
    return (
        <div className="space-y-8" role="status" aria-label="Loading statistics">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-stroke bg-darkGrey p-4">
                        <div className="h-3 w-24 animate-pulse rounded bg-foreground/10" />
                        <div className="mt-3 h-8 w-16 animate-pulse rounded bg-foreground/10" />
                    </div>
                ))}
            </div>
            <div
                className="min-h-[280px] w-full animate-pulse rounded-xl border border-stroke bg-darkGrey p-6"
                aria-hidden
            />
            <div
                className="min-h-[240px] w-full animate-pulse rounded-xl border border-stroke bg-darkGrey p-6"
                aria-hidden
            />
            <div className="h-10 w-28 animate-pulse rounded-lg bg-foreground/10" aria-hidden />
        </div>
    );
}

/** Full visitor analytics shell before `useAuth().ready`. */
export function VisitorAnalyticsPageSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-8" role="status" aria-label="Loading visitor analytics">
            <div className="space-y-2">
                <div className="h-7 w-56 animate-pulse rounded bg-darkGrey" />
                <div className="h-4 w-full max-w-3xl animate-pulse rounded bg-foreground/10" />
            </div>
            <VisitorAnalyticsDataSkeleton />
        </div>
    );
}
