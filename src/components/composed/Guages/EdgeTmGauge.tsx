"use client";

import GuageChart from "@/components/chart/GuageChart";
import SeasonalGaugeNeedle from "@/components/chart/SeasonalGaugeNeedle";
import { TMV_SCORE_MAX, TMV_SCORE_MIN } from "@/lib/edgeTechnicalDashboardTmv";
import { FX_TMV_GAUGE_ZONES_DARK, type FxTmvGaugeZoneList } from "@/lib/fxTmvGaugeZones";

/**
 * Trend / Momentum — discrete needle per TMV band (pivot `24.377 13.7272` in `SeasonalGaugeNeedle`).
 * Order matches `FX_TMV_GAUGE_ZONES_DARK` sorted by `minValue`: Strong Sell → … → Strong Buy.
 */
const TMV_DISCRETE_NEEDLE_ROT_DEG = [
    -152.331429, // dark red — Strong Sell
    -129.331429, // medium red — Sell
    -102.331429, // light red — Weak Sell
    -62, // Neutral
    -25, // light green — Weak Buy
    2, // medium green — Buy
    27.668571, // dark green — Strong Buy
] as const;

function discreteTmvNeedleRotationDeg(score: number): number {
    const s = Math.max(TMV_SCORE_MIN, Math.min(TMV_SCORE_MAX, score));
    const sorted = [...FX_TMV_GAUGE_ZONES_DARK].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) {
            return TMV_DISCRETE_NEEDLE_ROT_DEG[i]!;
        }
    }
    return TMV_DISCRETE_NEEDLE_ROT_DEG[3];
}

/** Volatility arc is 3 hues (green left, pink center, red right); pivot matches `SeasonalGaugeNeedle`. */
const VOLATILITY_NEEDLE_ROT_DEG = {
    green: -125,
    center: -62.285714,
    red: 0.714286,
} as const;

function volatilityNeedleRotationDeg(score: number): number {
    const s = Math.max(TMV_SCORE_MIN, Math.min(TMV_SCORE_MAX, score));
    const sorted = [...FX_TMV_GAUGE_ZONES_DARK].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) {
            if (z.maxValue <= 0) return VOLATILITY_NEEDLE_ROT_DEG.green;
            if (z.minValue < 0 && z.maxValue > 0) return VOLATILITY_NEEDLE_ROT_DEG.center;
            return VOLATILITY_NEEDLE_ROT_DEG.red;
        }
    }
    return VOLATILITY_NEEDLE_ROT_DEG.center;
}

type EdgeTmGaugeProps = {
    title: string;
    score: number;
    gaugeZones: FxTmvGaugeZoneList;
    isDark: boolean;
    /** `tmv` = Trend/Momentum discrete 7-band angles; `volatility` = 3-band angles. */
    needleMode?: "tmv" | "volatility";
};

/** Same layout / needle / zones as Edge Tools Trend · Momentum · Volatility gauges. */
export default function EdgeTmGauge({ title, score, gaugeZones, isDark, needleMode = "tmv" }: EdgeTmGaugeProps) {
    const rotation =
        needleMode === "volatility" ? volatilityNeedleRotationDeg(score) : discreteTmvNeedleRotationDeg(score);
    const displayScore = Math.max(TMV_SCORE_MIN, Math.min(TMV_SCORE_MAX, score));

    return (
        <div className="flex min-w-[140px] flex-1 basis-0 flex-col rounded-xl bg-darkGrey">
            <h5 className="border-b border-stroke p-3 text-center">{title}</h5>
            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-3 py-4">
                <div className="mx-auto flex h-[86px] w-[140px] shrink-0 justify-center">
                    <GuageChart
                        style={{ width: "140px", height: "86px" }}
                        indicatorStyle={{
                            transition: "0.8s ease-out",
                            rotation,
                        }}
                        gaugeZones={[...gaugeZones]}
                        hideArcLabels
                        renderIndicator={({ rotation: rot, transition }) => (
                            <SeasonalGaugeNeedle
                                rotationDeg={rot}
                                isDark={isDark}
                                transition={transition}
                                width="40px"
                                height="30px"
                                style={{ left: "26.5%", top: "52%", transform: "none" }}
                            />
                        )}
                    />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-semibold tabular-nums leading-none text-foreground">
                        {displayScore.toFixed(1)}
                    </span>
                </div>
            </div>
        </div>
    );
}
