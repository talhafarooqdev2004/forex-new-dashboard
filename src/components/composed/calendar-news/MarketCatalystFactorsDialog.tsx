"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    formatCatalystFactorAge,
    formatCatalystFactorTime,
    formatNewsScore,
    newsImpactTextColor,
    newsScoreTextColor,
    type CatalystFactorRow,
} from "@/lib/calendarNewsHeadlinesData";
import { SCOREBOARD_UI } from "@/lib/calendarNewsScoreboardData";

import styles from "./MarketCatalystFactorsDialog.module.scss";

type MarketCatalystFactorsDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currency: string;
    bullishCount: number;
    bearishCount: number;
    factors: CatalystFactorRow[];
};

export default function MarketCatalystFactorsDialog({
    open,
    onOpenChange,
    currency,
    factors,
}: MarketCatalystFactorsDialogProps) {
    // Header counts come from the listed (already-collapsed) factors so they always
    // match the body. Collapse mirrors backend oilCatalystCluster → same as scoreboard.
    const bullish = factors.filter((f) => f.score > 0);
    const bearish = factors.filter((f) => f.score < 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={styles.dialogContent}>
                <DialogHeader>
                    <DialogTitle className={styles.title}>
                        {currency} · Catalyst factors
                    </DialogTitle>
                    <DialogDescription className={styles.description}>
                        <span style={{ color: SCOREBOARD_UI.green }}>{bullish.length} bullish</span>
                        {" · "}
                        <span style={{ color: SCOREBOARD_UI.red }}>{bearish.length} bearish</span>
                        <span className={styles.note}>
                            {" "}
                            · Same-event paraphrases count once (strongest |score| kept)
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <div className={styles.scrollBody}>
                    {factors.length === 0 ? (
                        <p className={styles.empty}>No classified factors for this currency.</p>
                    ) : (
                        <>
                            <FactorSection
                                label="Bullish"
                                tone="bullish"
                                items={bullish}
                                emptyLabel="No bullish factors"
                            />
                            <FactorSection
                                label="Bearish"
                                tone="bearish"
                                items={bearish}
                                emptyLabel="No bearish factors"
                            />
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function FactorSection({
    label,
    tone,
    items,
    emptyLabel,
}: {
    label: string;
    tone: "bullish" | "bearish";
    items: CatalystFactorRow[];
    emptyLabel: string;
}) {
    return (
        <section className={styles.section} aria-label={`${label} factors`}>
            <h3
                className={styles.sectionTitle}
                style={{ color: tone === "bullish" ? SCOREBOARD_UI.green : SCOREBOARD_UI.red }}
            >
                {label}
                <span className={styles.sectionCount}>{items.length}</span>
            </h3>
            {items.length === 0 ? (
                <p className={styles.emptySection}>{emptyLabel}</p>
            ) : (
                <ul className={styles.list}>
                    {items.map((item) => (
                        <li key={item.id} className={styles.item}>
                            <div className={styles.metaRow}>
                                <time
                                    className={styles.time}
                                    dateTime={item.publishedAt ?? item.createdAt}
                                    title={formatCatalystFactorTime(item.publishedAt ?? item.createdAt)}
                                >
                                    {formatCatalystFactorTime(item.publishedAt ?? item.createdAt)}
                                    <span className={styles.age}>
                                        · {formatCatalystFactorAge(item.publishedAt ?? item.createdAt)}
                                    </span>
                                </time>
                                <span className={styles.badges}>
                                    <span
                                        className={styles.impact}
                                        style={{ color: newsImpactTextColor(item.impact) }}
                                    >
                                        {item.impact}
                                    </span>
                                    <span
                                        className={styles.score}
                                        style={{ color: newsScoreTextColor(item.score) }}
                                    >
                                        {formatNewsScore(item.score)}
                                    </span>
                                </span>
                            </div>
                            <p className={styles.headline}>{item.news}</p>
                            {item.summary ? <p className={styles.summary}>{item.summary}</p> : null}
                            <p className={styles.footerMeta}>
                                {item.category}
                                {item.source ? ` · ${item.source}` : ""}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
