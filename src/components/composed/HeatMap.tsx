"use client";

import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import {
    getSeasonalBiasGradientHeatMapColors,
    getSeasonalBiasGradientHeatMapColorsForDisplayRange,
    getSeasonalScoreHeatMapColors,
    percent100ToSeasonalScore,
} from "@/lib/seasonalTrendsScoreColors";

type HeatMapProps = {
    pair: string;
    value: number;
    /**
     * - `seasonal`: seasonal OKLCH gradient. With **`seasonalDisplayRange`**, colors match Pair Seasonal Trends & Bias (grid min/max); label shows **raw** `value`. Without it, fixed **[-5, 5]** scale and clamped label.
     * - `percent100`: scores in [0, 100]; colors use the same seasonal bands via a 50→0, 100→+5 map.
     * - `netSheet`: `value` is raw net score (any typical range); `colorScore` is **-5…+5** for seasonal colors only.
     */
    scoreScale?: "default" | "seasonal" | "percent100" | "netSheet";
    /** Required when `scoreScale` is `netSheet` — normalized score for palette (see Score Dashboard heatmap builder). */
    colorScore?: number;
    /**
     * With `seasonal`, min/max of the **whole heatmap** so “best in grid” → solid orange (bear-only) / full ramp if mixed.
     */
    seasonalDisplayRange?: { min: number; max: number };
};

export default function HeatMap({
    pair,
    value,
    scoreScale = "default",
    colorScore,
    seasonalDisplayRange,
}: HeatMapProps) {
    if (scoreScale === "netSheet") {
        const s = colorScore ?? 0;
        const clampedColor = Math.max(-5, Math.min(5, s));
        const { backgroundColor, color } = getSeasonalScoreHeatMapColors(clampedColor);
        const label =
            Math.abs(value) < 1e-9 ? "0.0" : `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
        return (
            <div
                className="flex flex-col items-center justify-center gap-[7px] h-24 py-3 rounded-2xl"
                style={{ backgroundColor }}
            >
                <span className="text-xl font-semibold" style={{ color }}>
                    {pair}
                </span>
                <span className="font-normal tabular-nums" style={{ color }}>
                    {label}
                </span>
            </div>
        );
    }

    if (scoreScale === "percent100") {
        const clamped = Math.max(0, Math.min(100, value));
        const mapped = percent100ToSeasonalScore(clamped);
        const { backgroundColor, color } = getSeasonalScoreHeatMapColors(mapped);
        const label =
            Number.isInteger(clamped) || Math.abs(clamped - Math.round(clamped)) < 1e-6
                ? String(Math.round(clamped))
                : clamped.toFixed(1);
        return (
            <div
                className="flex flex-col items-center justify-center gap-[7px] h-24 py-3 rounded-2xl"
                style={{ backgroundColor }}
            >
                <span className="text-xl font-semibold" style={{ color }}>
                    {pair}
                </span>
                <span className="font-normal tabular-nums" style={{ color }}>
                    {label}
                </span>
            </div>
        );
    }

    if (scoreScale === "seasonal") {
        const clamped = Math.max(-5, Math.min(5, value));
        const { backgroundColor, color } = seasonalDisplayRange
            ? getSeasonalBiasGradientHeatMapColorsForDisplayRange(value, seasonalDisplayRange.min, seasonalDisplayRange.max)
            : getSeasonalBiasGradientHeatMapColors(clamped);
        const label = seasonalDisplayRange
            ? Math.abs(value) < 1e-9
                ? "0.0"
                : `${value > 0 ? "+" : ""}${value.toFixed(1)}`
            : clamped === 0
              ? "0.0"
              : `${clamped > 0 ? "+" : ""}${clamped.toFixed(1)}`;
        return (
            <div
                className="flex flex-col items-center justify-center gap-[7px] h-24 py-3 rounded-2xl"
                style={{ backgroundColor }}
            >
                <span className="text-xl font-semibold" style={{ color }}>
                    {pair}
                </span>
                <span className="font-normal tabular-nums" style={{ color }}>
                    {label}
                </span>
            </div>
        );
    }

    const colorMap = {
        positive: { bg: GAUGE_SIGNAL_COLORS.buy, color: "#000000" },
        negative: { bg: GAUGE_SIGNAL_COLORS.sell, color: "#000000" },
        neutral: { bg: GAUGE_SIGNAL_COLORS.neutral, color: "#000000" },
    };

    const variant = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
    const { bg, color } = colorMap[variant as keyof typeof colorMap];

    return (
        <div className="flex flex-col items-center justify-center gap-[7px] h-24 py-3 rounded-2xl" style={{ backgroundColor: bg }}>
            <span className="text-xl font-semibold" style={{ color }}>{pair}</span>
            <span className="font-normal" style={{ color }}>{value}</span>
        </div>
    );
}