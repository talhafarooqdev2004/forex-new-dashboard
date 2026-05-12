/**
 * Mirrors `AdminSettingsClientPage`: maintenance card + visitor analytics link card.
 */
export default function AdminSettingsPageSkeleton() {
    return (
        <div className="mx-auto max-w-4xl space-y-10 py-4" role="status" aria-label="Loading settings">
            <div className="space-y-6 rounded-xl border border-stroke bg-darkGrey p-6">
                <div className="h-7 w-40 animate-pulse rounded bg-foreground/10" />
                <div className="h-4 w-full max-w-md animate-pulse rounded bg-foreground/10" />
                <div className="h-24 w-full animate-pulse rounded-lg bg-foreground/5" />
            </div>
            <div className="rounded-xl border border-stroke bg-darkGrey p-6">
                <div className="h-7 w-56 animate-pulse rounded bg-foreground/10" />
                <div className="mt-4 min-h-[200px] w-full animate-pulse rounded-lg bg-foreground/5" />
            </div>
        </div>
    );
}
