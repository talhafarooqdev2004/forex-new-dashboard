/** Generic route fallback when a page has no dedicated skeleton. */
export default function DefaultRouteLoading() {
    return (
        <div
            className="flex w-full max-w-full min-w-0 flex-col gap-4"
            role="status"
            aria-label="Loading page"
        >
            <div className="h-9 w-56 max-w-[55%] animate-pulse rounded-lg bg-foreground/10" />
            <div className="min-h-[min(60vh,560px)] w-full flex-1 animate-pulse rounded-xl bg-foreground/5" />
        </div>
    );
}
