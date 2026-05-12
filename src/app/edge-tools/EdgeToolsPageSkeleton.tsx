import Section from "@/components/ui/layout/Section";

/**
 * Mirrors `EdgeToolsAlertsClientPage`: TMV row + Risk `Section`, drive charts, 2-column `Section`s, calculator strip.
 */
export default function EdgeToolsPageSkeleton() {
    return (
        <div className="flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading Edge Tools">
            <div className="mt-6 flex flex-col gap-6 xl:flex-row">
                <div className="flex w-full gap-4 xl:w-[45%]">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="min-h-[128px] min-w-0 flex-1 animate-pulse rounded-2xl bg-darkGrey"
                            aria-hidden
                        />
                    ))}
                </div>
                <Section className="w-full overflow-visible xl:w-[55%]">
                    <div className="flex min-h-[200px] flex-wrap items-center justify-center gap-8 p-6 sm:gap-10">
                        <div className="h-8 w-36 shrink-0 animate-pulse rounded-md bg-foreground/10" />
                        <div className="h-36 w-36 shrink-0 animate-pulse rounded-full bg-foreground/5" aria-hidden />
                    </div>
                </Section>
            </div>

            <div className="mt-6 flex flex-col gap-6">
                <div className="min-h-[200px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
                <div className="min-h-[200px] w-full animate-pulse rounded-xl bg-darkGrey" aria-hidden />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <Section>
                    <div className="mb-3 h-6 w-48 animate-pulse rounded bg-foreground/10" />
                    <div className="flex flex-col gap-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-10 animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                        ))}
                    </div>
                </Section>
                <Section className="flex flex-col">
                    <div className="min-h-[220px] flex-1 animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                </Section>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex h-[52px] items-center justify-between gap-3 rounded-xl border border-stroke/60 bg-darkGrey px-4"
                        aria-hidden
                    >
                        <div className="h-4 w-24 animate-pulse rounded bg-foreground/10" />
                        <div className="h-7 w-14 shrink-0 animate-pulse rounded-full bg-foreground/5" />
                    </div>
                ))}
            </div>
        </div>
    );
}
