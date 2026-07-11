"use client";

import type { RiskModeDisplay } from "@/lib/calendarNewsPageData";
import { STATIC_RISK_MODE_DISPLAY } from "@/lib/calendarNewsPageData";

import styles from "./RiskModeCard.module.scss";

/**
 * Seven fixed equal-width color bars.
 * Score only moves the pointer into the matching zone:
 * −100…−35 red, −35…65 yellow, 65…100 green.
 */
const RISK_BAR_SEGMENTS = [
    { color: "#D30000" },
    { color: "#FF0000" },
    { color: "#FF8C8C" },
    { color: "#FFFF00" },
    { color: "#2FE24B" },
    { color: "#25B73C" },
    { color: "#05871A" },
] as const;

const RISK_MODE_UI_COLORS = {
    riskOn: "#00c853",
    riskOff: "#ff1744",
    neutral: "#ffd600",
} as const;

type RiskModeCardProps = {
    riskMode?: RiskModeDisplay | null;
};

export default function RiskModeCard({ riskMode }: RiskModeCardProps) {
    const mode = riskMode ?? STATIC_RISK_MODE_DISPLAY;

    const headerAccent =
        mode.headerBias === "Risk-On"
            ? RISK_MODE_UI_COLORS.riskOn
            : mode.headerBias === "Risk-Off"
              ? RISK_MODE_UI_COLORS.riskOff
              : RISK_MODE_UI_COLORS.neutral;

    const pointerPct = Math.max(0, Math.min(100, mode.pointerPct ?? mode.score0100 ?? 50));

    return (
        <section className={styles.card} aria-label="Risk Mode">
            <h2 className={styles.title}>
                Risk Mode{" "}
                <span className={styles.titleAccent} style={{ color: headerAccent }}>
                    ({mode.headerBias})
                </span>
            </h2>

            <div className={styles.gaugeBlock}>
                <div className={styles.barTrack}>
                    <div
                        className={styles.barPointer}
                        style={{ left: `${pointerPct}%` }}
                        aria-hidden
                    />
                    <div
                        className={styles.barSegments}
                        role="meter"
                        aria-valuemin={-100}
                        aria-valuemax={100}
                        aria-valuenow={Math.round(mode.rawScore ?? 0)}
                        aria-label={`Risk mode score ${Number(mode.rawScore ?? 0).toFixed(0)}`}
                    >
                        {RISK_BAR_SEGMENTS.map((segment, index) => (
                            <div
                                key={index}
                                className={styles.barSegment}
                                style={{ backgroundColor: segment.color }}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.barLabels}>
                    <span className={styles.labelOff} style={{ color: RISK_MODE_UI_COLORS.riskOff }}>
                        Risk-Off
                    </span>
                    <span className={styles.labelNeutral} style={{ color: RISK_MODE_UI_COLORS.neutral }}>
                        Neutral
                    </span>
                    <span className={styles.labelOn} style={{ color: RISK_MODE_UI_COLORS.riskOn }}>
                        Risk-On
                    </span>
                </div>
            </div>
        </section>
    );
}
