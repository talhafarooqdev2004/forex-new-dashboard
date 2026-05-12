import styles from "./FxAnalyzerPro.module.scss";

/**
 * Mirrors `FXAnalyzerProClient` layout: SCSS `pageContainer` → 15% currency rail + 85% two panels.
 */
export default function FxAnalyzerProPageSkeleton() {
    return (
        <div className="flex max-w-full min-w-0 flex-col gap-6" role="status" aria-label="Loading FX Analyzer Pro">
            <div className={styles.fxAnalyzerPro__pageContainer}>
                <div className={`${styles.fxAnalyzerPro__dropdownSection} bg-darkGrey`}>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-foreground/10" aria-hidden />
                    ))}
                </div>
                <div className={styles.fxAnalyzerPro__contentSection}>
                    <div
                        className={`${styles.fxAnalyzerPro__sentimentPanel} rounded-2xl border border-stroke/50`}
                        style={{ borderRight: "none" }}
                    >
                        <div className="h-11 w-40 animate-pulse rounded-md bg-foreground/10 px-4 pt-4" />
                        <div className="mx-4 mt-2 h-11 max-w-[280px] animate-pulse rounded-lg bg-foreground/5" />
                        <div className="mx-auto mt-4 h-[280px] w-[280px] shrink-0 animate-pulse rounded-full bg-foreground/5" />
                        <div className="mt-4 grid w-full grid-cols-2 gap-5 px-5 pb-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-[130px] animate-pulse rounded-xl bg-foreground/5" aria-hidden />
                            ))}
                        </div>
                        <div className="mt-2 min-h-[140px] flex-1 px-2 pb-2">
                            <div className="min-h-[120px] w-full animate-pulse rounded-b-2xl bg-foreground/5" />
                        </div>
                    </div>

                    <div className={styles.fxAnalyzerPro__fundamentalsPanel}>
                        <div className="overflow-visible rounded-xl bg-darkGrey px-1">
                            <div className="grid grid-cols-2 gap-4 pb-2 pt-2">
                                <div className="min-h-[120px] animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                                <div className="min-h-[120px] animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                            </div>
                            <div className="mx-2 mb-4 h-20 animate-pulse rounded-lg bg-foreground/5" aria-hidden />
                        </div>

                        <div className="rounded-xl bg-darkGrey p-5">
                            <div className="mb-5 h-8 w-[min(100%,280px)] animate-pulse rounded bg-foreground/10" />
                            <div className="mb-5 space-y-3">
                                <div className="h-4 w-full animate-pulse rounded bg-foreground/5" />
                                <div className="h-2 w-full animate-pulse rounded-full bg-foreground/5" />
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-full animate-pulse rounded bg-foreground/5" />
                                <div className="h-2 w-full animate-pulse rounded-full bg-foreground/5" />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-darkGrey pb-0 pt-4">
                            <div className="mx-auto mb-3 h-5 w-40 animate-pulse rounded bg-foreground/10" />
                            <div className="space-y-0 px-2 pb-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-12 w-full animate-pulse bg-foreground/[0.04]" aria-hidden />
                                ))}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-darkGrey pb-0 pt-4">
                            <div className="mx-auto mb-3 h-5 w-44 animate-pulse rounded bg-foreground/10" />
                            <div className="grid grid-cols-4 gap-1 px-2 pb-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="h-10 animate-pulse rounded bg-foreground/10" aria-hidden />
                                ))}
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={`c-${i}`} className="h-11 animate-pulse rounded-sm bg-foreground/[0.04]" aria-hidden />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
