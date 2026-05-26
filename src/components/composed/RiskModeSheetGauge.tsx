"use client";

import GuageChart from "@/components/chart/GuageChart";
import SeasonalGaugeNeedle from "@/components/chart/SeasonalGaugeNeedle";
import type { FxTmvGaugeZoneList } from "@/lib/fxTmvGaugeZones";

/**
 * Seven arc segments on 0–100 — same hues as Fundamental / TMV Risk Mode
 * (3 reds left, yellow center, 3 distinct greens right: #2FE24B, #25B73C, #05871A).
 */
const RISK_MODE_GAUGE_ZONES: FxTmvGaugeZoneList = [
    { name: "Strong Off", minValue: 0, maxValue: 14.29, color: "#D30000" },
    { name: "Off", minValue: 14.29, maxValue: 28.57, color: "#FF0000" },
    { name: "Weak Off", minValue: 28.57, maxValue: 42.86, color: "#FF8C8C" },
    { name: "Neutral", minValue: 42.86, maxValue: 57.14, color: "#FFFF00" },
    { name: "Weak On", minValue: 57.14, maxValue: 71.43, color: "#2FE24B" },
    { name: "On", minValue: 71.43, maxValue: 85.71, color: "#25B73C" },
    { name: "Strong On", minValue: 85.71, maxValue: 100, color: "#05871A" },
];

/**
 * Needle angles per band (pivot `24.377 13.7272` in `SeasonalGaugeNeedle`), low score (Off / red) → left.
 * Order follows zones sorted ascending by `minValue`.
 */
const RISK_MODE_NEEDLE_ROT_DEG = [
    -149.14, // dark red
    -125.14, // medium red
    -97.14, // light red
    -63.14, // neutral (yellow arc)
    -29.14, // light green
    -1.14, // medium green
    22.86, // dark green
] as const;

function riskModeZoneIndex(rawScore: number): number {
    const s = Math.max(0, Math.min(100, rawScore));
    const sorted = [...RISK_MODE_GAUGE_ZONES].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) return i;
    }
    return 3;
}

/** Discrete needle angle per colored band (Edge Tools Risk Mode 0–100). */
export function getRiskModeNeedleRotationDeg(rawScore: number): number {
    const idx = riskModeZoneIndex(rawScore);
    return RISK_MODE_NEEDLE_ROT_DEG[Math.min(Math.max(idx, 0), RISK_MODE_NEEDLE_ROT_DEG.length - 1)]!;
}

export function riskModeGaugeZonesForTheme(_isDark: boolean): FxTmvGaugeZoneList {
    return RISK_MODE_GAUGE_ZONES;
}

type RiskModeSheetGaugeProps = {
    riskModeScore: number;
    isDark: boolean;
    /** Wrapper around the chart (width / alignment). */
    className?: string;
    /** SVG x for the “On” label (default 126; Edge Tools uses 146). */
    onLabelX?: number;
};

/**
 * Risk Mode sheet **0–100**: seven arc bands; needle uses discrete rotation per band (pivot in `SeasonalGaugeNeedle`).
 */
export default function RiskModeSheetGauge({ riskModeScore, isDark, className, onLabelX = 126 }: RiskModeSheetGaugeProps) {
    const rotation = getRiskModeNeedleRotationDeg(riskModeScore);
    const gaugeZones = riskModeGaugeZonesForTheme(isDark);

    return (
        <div className={className ?? "flex w-[220px] max-w-full shrink-0 justify-center"}>
            <GuageChart
                style={{ width: "100%" }}
                indicatorStyle={{
                    transition: "0.8s ease-out",
                    rotation,
                }}
                gaugeZones={gaugeZones}
                customLeftLabel="Off"
                customRightLabel="On"
                customRightLabelX={onLabelX}
                customRightLabelTextAnchor="middle"
                renderIndicator={({ rotation: rot, transition }) => (
                    <SeasonalGaugeNeedle
                        rotationDeg={rot}
                        isDark={isDark}
                        transition={transition}
                        width="56px"
                        height="45px"
                        style={{ left: "29%", top: "57%", transform: "none" }}
                    />
                )}
            />
        </div>
    );
}
