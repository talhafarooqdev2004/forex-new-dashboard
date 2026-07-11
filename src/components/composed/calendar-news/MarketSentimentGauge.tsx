"use client";

import GuageChart from "@/components/chart/GuageChart";
import { FX_TMV_GAUGE_ZONES_DARK, FX_TMV_SCORE_MAX, FX_TMV_SCORE_MIN } from "@/lib/fxTmvGaugeZones";

import styles from "./MarketSentimentGauge.module.scss";

/** TMV discrete angles — convert to 0° = straight up (neutral). */
const TMV_NEEDLE_ROT_DEG = [
    -152.331429,
    -129.331429,
    -102.331429,
    -62,
    -25,
    2,
    27.668571,
] as const;

const NEUTRAL_NEEDLE_OFFSET = 62;

function needleRotationDeg(score: number): number {
    const s = Math.max(FX_TMV_SCORE_MIN, Math.min(FX_TMV_SCORE_MAX, score));
    const sorted = [...FX_TMV_GAUGE_ZONES_DARK].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) {
            return TMV_NEEDLE_ROT_DEG[i]! + NEUTRAL_NEEDLE_OFFSET;
        }
    }
    return 0;
}

type MarketSentimentNeedleProps = {
    rotationDeg: number;
    transition?: string;
};

function MarketSentimentNeedle({ rotationDeg, transition }: MarketSentimentNeedleProps) {
    return (
        <div
            className={styles.needleWrap}
            style={{
                transform: `rotate(${rotationDeg}deg)`,
                transition: transition ?? "transform 0.8s ease-out",
            }}
            aria-hidden
        >
            <div className={styles.needleLine} />
            <div className={styles.needleHub} />
        </div>
    );
}

type MarketSentimentGaugeProps = {
    score: number;
};

export default function MarketSentimentGauge({ score }: MarketSentimentGaugeProps) {
    const rotation = needleRotationDeg(score);
    const gaugeZones = FX_TMV_GAUGE_ZONES_DARK.map((z) => ({ ...z }));

    return (
        <div className={styles.wrap}>
            <GuageChart
                style={{ width: "204px", height: "124px" }}
                indicatorStyle={{
                    transition: "0.8s ease-out",
                    rotation,
                }}
                gaugeZones={gaugeZones}
                hideArcLabels
                renderIndicator={({ rotation: rot, transition }) => (
                    <MarketSentimentNeedle rotationDeg={rot} transition={transition} />
                )}
            />
        </div>
    );
}
