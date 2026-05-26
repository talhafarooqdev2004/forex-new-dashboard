import { mapCotOverallRiskScoreToGauge0100 } from "@/lib/cotDataAnalysisFromTables";

/** Seven arc bands on 0–100 (same as `RiskModeSheetGauge` / Fundamental Risk Mode). */
const RISK_MODE_GAUGE_ZONES = [
    { name: "Strong Off", minValue: 0, maxValue: 14.29 },
    { name: "Off", minValue: 14.29, maxValue: 28.57 },
    { name: "Weak Off", minValue: 28.57, maxValue: 42.86 },
    { name: "Neutral", minValue: 42.86, maxValue: 57.14 },
    { name: "Weak On", minValue: 57.14, maxValue: 71.43 },
    { name: "On", minValue: 71.43, maxValue: 85.71 },
    { name: "Strong On", minValue: 85.71, maxValue: 100 },
] as const;

export type RiskModeBiasLabel = "Risk Off" | "Neutral" | "Risk On";

/** Map sheet value (−2.5…+2.5 or 0–100) to the gauge’s 0–100 scale. */
export function riskModeScoreToGauge0100(raw: number): number {
    return mapCotOverallRiskScoreToGauge0100(raw);
}

/** Active band index (0–6) for a 0–100 gauge score. */
export function riskModeZoneIndex(score0100: number): number {
    const s = Math.max(0, Math.min(100, score0100));
    const sorted = [...RISK_MODE_GAUGE_ZONES].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) return i;
    }
    return 3;
}

/** Label from gauge band — red/off, yellow/neutral, green/on (same bands as Risk Mode needle). */
export function riskModeBiasLabelFromGauge0100(score0100: number): RiskModeBiasLabel {
    const idx = riskModeZoneIndex(score0100);
    if (idx <= 2) return "Risk Off";
    if (idx === 3) return "Neutral";
    return "Risk On";
}

export function riskModeBiasLabelFromRawScore(raw: number | null): RiskModeBiasLabel | "N/A" {
    if (raw === null || !Number.isFinite(raw)) return "N/A";
    return riskModeBiasLabelFromGauge0100(riskModeScoreToGauge0100(raw));
}

/** For `BiasIcon` / TMV palette colors (On → buy, Off → sell). */
export function riskModeBiasToSentiment(label: RiskModeBiasLabel | "N/A"): "Bullish" | "Bearish" | "Neutral" {
    if (label === "Risk On") return "Bullish";
    if (label === "Risk Off") return "Bearish";
    return "Neutral";
}
