"use client";

import type { MarketSentimentSummary } from "@/lib/calendarNewsPageData";

import styles from "./MarketSentimentCard.module.scss";
import MarketSentimentGauge from "./MarketSentimentGauge";

/** Mock-matched palette for the sentiment stats row. */
const SENTIMENT_COLORS = {
    bullish: "#00c853",
    neutral: "#6c7a95",
    bearish: "#ff3b30",
} as const;

type MarketSentimentCardProps = {
    summary: MarketSentimentSummary;
};

export default function MarketSentimentCard({ summary }: MarketSentimentCardProps) {
    return (
        <section className={styles.card} aria-label="Market Sentiment">
            <h2 className={styles.title}>Market Sentiment</h2>

            <div className={styles.gaugeBlock}>
                <MarketSentimentGauge score={summary.gaugeScore} />
                <p className={styles.statusLabel}>{summary.overallLabel}</p>
            </div>

            <div className={styles.statsBox}>
                <SentimentStat value={summary.bullish} label="Bullish" color={SENTIMENT_COLORS.bullish} />
                <SentimentStat value={summary.neutral} label="Neutral" color={SENTIMENT_COLORS.neutral} />
                <SentimentStat value={summary.bearish} label="Bearish" color={SENTIMENT_COLORS.bearish} />
            </div>
        </section>
    );
}

function SentimentStat({ value, label, color }: { value: number; label: string; color: string }) {
    return (
        <div className={styles.statCol}>
            <span className={styles.statValue} style={{ color }}>
                {value}
            </span>
            <span className={styles.statLabel} style={{ color }}>
                {label}
            </span>
        </div>
    );
}
