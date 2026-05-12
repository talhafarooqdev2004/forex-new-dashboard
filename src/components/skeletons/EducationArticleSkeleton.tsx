const lineWidths = ["w-[92%]", "w-[88%]", "w-[95%]", "w-[72%]"] as const;

/** Mirrors education article column: title + body lines + media block (`min-h` stable while topics load). */
export function EducationArticleSkeleton() {
    return (
        <div className="min-h-[min(55vh,480px)] space-y-4" aria-busy="true" aria-label="Loading article">
            <div className="h-9 w-2/3 max-w-lg animate-pulse rounded-md bg-foreground/10" />
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className={`h-4 animate-pulse rounded bg-foreground/5 ${lineWidths[i % 4]}`}
                />
            ))}
            <div className="h-52 w-full max-w-2xl animate-pulse rounded-xl bg-foreground/5" />
        </div>
    );
}
