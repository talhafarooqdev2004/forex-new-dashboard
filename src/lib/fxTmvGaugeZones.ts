/** Trend / Momentum / Volatility arc bands (−2.5…+2.5) — shared by Edge Tools, Technical Dashboard, FX Analyzer TMV-style gauges. */

export type FxTmvGaugeZone = {
    readonly name: string;
    readonly minValue: number;
    readonly maxValue: number;
    readonly color: string;
};

/** Accepts dark/light presets, Risk-mode relabelled zones, or any compatible 7-band palette. */
export type FxTmvGaugeZoneList = readonly FxTmvGaugeZone[];

/** Numeric domain for Trend / Momentum / Volatility gauges (sheet aggregates clamp here). */
export const FX_TMV_SCORE_MIN = -2.5;
export const FX_TMV_SCORE_MAX = 2.5;

/** Same relative banding as the legacy −5…+5 layout, scaled to ±2.5. */
export const FX_TMV_GAUGE_ZONES_DARK = [
    { name: "Strong Sell", minValue: -2.5, maxValue: -2, color: "#D30000" },
    { name: "Sell", minValue: -2, maxValue: -1, color: "#FF0000" },
    { name: "Weak Sell", minValue: -1, maxValue: -0.5, color: "#FF8C8C" },
    { name: "Neutral", minValue: -0.5, maxValue: 0.5, color: "#FFFF00" },
    { name: "Weak Buy", minValue: 0.5, maxValue: 1, color: "#2FE24B" },
    { name: "Buy", minValue: 1, maxValue: 2, color: "#25B73C" },
    { name: "Strong Buy", minValue: 2, maxValue: 2.5, color: "#05871A" },
] as const satisfies FxTmvGaugeZoneList;

/**
 * Light theme uses the same TMV arc palette as dark (including **#FFFF00** neutral on gauges).
 * FX Analyzer **table** text uses a separate readable amber via `fxAnalyzerLabelZoneColor` / stance helpers.
 */
export const FX_TMV_GAUGE_ZONES_LIGHT: FxTmvGaugeZoneList = FX_TMV_GAUGE_ZONES_DARK;

/**
 * Volatility arc uses the same solid hues as Trend/Momentum TMV zones (no extra palette):
 * left bands -> Strong Buy (dark green), center -> Weak Sell ("light red" / pink), right -> Sell (full red).
 */
function volatilityPaletteFromTemplate(template: FxTmvGaugeZoneList): {
    green: string;
    center: string;
    red: string;
} {
    const pick = (name: string, fallback: string) =>
        template.find((z) => z.name === name)?.color ?? fallback;
    return {
        green: pick("Strong Buy", "#05871A"),
        center: pick("Weak Sell", "#FF8C8C"),
        red: pick("Sell", "#FF0000"),
    };
}

function colorForVolatilityZone(
    zone: FxTmvGaugeZone,
    palette: { green: string; center: string; red: string },
): string {
    if (zone.maxValue <= 0) return palette.green;
    if (zone.minValue < 0 && zone.maxValue > 0) return palette.center;
    return palette.red;
}

/** Same band edges as TMV zones; only the zero-crossing center segment is light-red/pink. */
export function buildVolatilityGaugeZones(template: FxTmvGaugeZoneList): FxTmvGaugeZone[] {
    const palette = volatilityPaletteFromTemplate(template);
    return template.map((z) => ({
        ...z,
        color: colorForVolatilityZone(z, palette),
    }));
}

/**
 * Volatility history bar fill — same 3-zone rule as `EdgeTmGauge` volatility needle (green / pink / red).
 * Never uses TM neutral yellow (#FFFF00).
 */
export function volatilityHistoryBarColor(
    score: number,
    template: FxTmvGaugeZoneList = FX_TMV_GAUGE_ZONES_DARK,
): string {
    const s = Math.max(FX_TMV_SCORE_MIN, Math.min(FX_TMV_SCORE_MAX, score));
    const zones = buildVolatilityGaugeZones(template);
    const sorted = [...zones].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) {
            return z.color;
        }
    }
    return volatilityPaletteFromTemplate(template).center;
}
