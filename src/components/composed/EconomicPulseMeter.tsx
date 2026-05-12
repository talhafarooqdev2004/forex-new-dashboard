"use client";

import { ECONOMIC_PULSE_SCALE_ANCHORS, type EconomicPulseRow } from "@/lib/fundamentalDashboardData";

import styles from "./EconomicPulseMeter.module.scss";

function scaleAnchorPct(index: number): number {
    const segmentCount = ECONOMIC_PULSE_SCALE_ANCHORS.length - 1;
    return segmentCount > 0 ? (index / segmentCount) * 100 : 0;
}

type EconomicPulseMeterProps = {
    rows: EconomicPulseRow[];
};

export default function EconomicPulseMeter({ rows }: EconomicPulseMeterProps) {
    return (
        <div className={styles.root}>
            <div className={styles.legend}>
                <span className={styles.legendCurrency}>Currency</span>
                <div className={styles.legendZones}>
                    <span className={styles.strongBear}>Strong Bearish</span>
                    <span className={styles.bear}>Bearish</span>
                    <span className={styles.neutral}>Neutral</span>
                    <span className={styles.bull}>Bullish</span>
                    <span className={styles.strongBull}>Strong Bullish</span>
                </div>
            </div>

            {rows.map((row) => (
                <div key={row.currency} className={styles.row}>
                    <div className={styles.labelCell}>
                        <span className={styles.flag} aria-hidden>
                            {row.flagEmoji}
                        </span>
                        <span className={styles.code}>{row.currency}</span>
                    </div>
                    <div className={styles.trackWrap}>
                        <div className={styles.track} aria-hidden />
                        <div
                            className={styles.markerAnchor}
                            style={{ left: `${row.bluePct}%` }}
                            title="Macroshift score"
                            aria-label={`${row.currency} Macroshift score`}
                        >
                            <svg
                                className={styles.markerBlueSvg}
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                            >
                                <circle
                                    cx="6"
                                    cy="6"
                                    r="4.75"
                                    fill="#1a237e"
                                    stroke="#ffffff"
                                    strokeWidth="1"
                                />
                            </svg>
                        </div>
                        <div
                            className={styles.markerAnchor}
                            style={{ left: `${row.greenPct}%` }}
                            title="Divergence score"
                            aria-label={`${row.currency} Divergence score`}
                        >
                            <svg
                                className={styles.markerGreenSvg}
                                viewBox="0 0 14 15"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                aria-hidden
                            >
                                <path
                                    d="M7 1.2L13.2 13.4H0.8L7 1.2Z"
                                    fill="#00ff44"
                                    stroke="#ffffff"
                                    strokeWidth="1"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            ))}

            <div className={styles.scaleRow}>
                <span aria-hidden />
                <div className={styles.scale}>
                    {ECONOMIC_PULSE_SCALE_ANCHORS.map((n, index) => (
                        <span
                            key={n}
                            className={styles.scaleTick}
                            style={{ left: `${scaleAnchorPct(index)}%` }}
                        >
                            {n <= 0 ? String(n) : `+${n}`}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
