import { FX_TMV_SCORE_MAX, FX_TMV_SCORE_MIN } from "@/lib/fxTmvGaugeZones";

/** Currency Seasonal Trends page — full span ±5; center yellow −0.5…+0.5; reds/greens per product bands. */
export const SEASONAL_CURRENCY_TREND_MIN = -5;
export const SEASONAL_CURRENCY_TREND_MAX = 5;

/** Same palette semantics as TMV (Strong Sell → Strong Buy), asymmetric numeric breaks. */
export const SEASONAL_CURRENCY_TREND_GAUGE_ZONES_DARK = [
    { name: "Strong Sell", minValue: -5, maxValue: -3.5, color: "#D30000" },
    { name: "Sell", minValue: -3.5, maxValue: -2, color: "#FF0000" },
    { name: "Weak Sell", minValue: -2, maxValue: -0.5, color: "#FF8C8C" },
    { name: "Neutral", minValue: -0.5, maxValue: 0.5, color: "#FFFF00" },
    { name: "Weak Buy", minValue: 0.5, maxValue: 2, color: "#2FE24B" },
    { name: "Buy", minValue: 2, maxValue: 3.5, color: "#25B73C" },
    { name: "Strong Buy", minValue: 3.5, maxValue: 5, color: "#05871A" },
] as const;

export const SEASONAL_CURRENCY_TREND_GAUGE_ZONES_LIGHT = SEASONAL_CURRENCY_TREND_GAUGE_ZONES_DARK;

/** Aliases used by `CurrencySeasonalTrends` chart. */
export const DARK_GAUGE_ZONES = SEASONAL_CURRENCY_TREND_GAUGE_ZONES_DARK.map((z) => ({ ...z }));
export const LIGHT_GAUGE_ZONES = SEASONAL_CURRENCY_TREND_GAUGE_ZONES_LIGHT.map((z) => ({ ...z }));

/** @deprecated Use `SEASONAL_CURRENCY_TREND_MIN` — kept for external imports. */
export const SEASONAL_MIN_SCORE = SEASONAL_CURRENCY_TREND_MIN;
/** @deprecated Use `SEASONAL_CURRENCY_TREND_MAX` — kept for external imports. */
export const SEASONAL_MAX_SCORE = SEASONAL_CURRENCY_TREND_MAX;

const EDGE_TMV_ROT_MIN = -151;
const EDGE_TMV_ROT_MAX = 27;

/**
 * Currency Seasonal Trends only — discrete needle per band (pivot `24.377 13.7272` in `SeasonalGaugeNeedle`).
 * Order matches `SEASONAL_CURRENCY_TREND_GAUGE_ZONES_DARK` sorted by `minValue`: Strong Sell → … → Strong Buy.
 */
const SEASONAL_DISCRETE_NEEDLE_ROT_DEG = [
    -148.34, // dark red — Strong Sell
    -125.34, // medium red — Sell
    -98.34, // light red — Weak Sell
    -62.34, // Neutral
    -29.34, // light green — Weak Buy
    -2.34, // medium green — Buy
    24.66, // dark green — Strong Buy
] as const;

/**
 * Needle rotation for Currency Seasonal Trends gauges (±5 domain), discrete per zone.
 * Pivot in SVG: `rotate(angle 24.377 13.7272)` — same pivot as TMV; TMV angles stay in `EdgeTmGauge` only.
 */
export function getRotationForScore(score: number): number {
    const s = Math.max(SEASONAL_CURRENCY_TREND_MIN, Math.min(SEASONAL_CURRENCY_TREND_MAX, score));
    const sorted = [...SEASONAL_CURRENCY_TREND_GAUGE_ZONES_DARK].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) {
            return SEASONAL_DISCRETE_NEEDLE_ROT_DEG[i]!;
        }
    }
    return SEASONAL_DISCRETE_NEEDLE_ROT_DEG[3];
}

/** Edge Tools / Technical Dashboard Trend · Momentum · Volatility (−2.5…+2.5). */
export function getRotationForEdgeTmvScore(score: number): number {
    const s = Math.max(FX_TMV_SCORE_MIN, Math.min(FX_TMV_SCORE_MAX, score));
    const span = FX_TMV_SCORE_MAX - FX_TMV_SCORE_MIN;
    return EDGE_TMV_ROT_MIN + ((s - FX_TMV_SCORE_MIN) / span) * (EDGE_TMV_ROT_MAX - EDGE_TMV_ROT_MIN);
}

/** Fundamental dashboard — Central Bank Policies Bias. Needle uses `rotate(angle 24.377 13.7272)` only; three fixed angles (no interpolation). */
const CENTRAL_BANK_BIAS_ROT_DOVISH = -125.4;
const CENTRAL_BANK_BIAS_ROT_HAWKISH = 0.4;
/** Neutral: midpoint of dovish↔hawkish arc (only angle not named in product spec). */
const CENTRAL_BANK_BIAS_ROT_NEUTRAL = (CENTRAL_BANK_BIAS_ROT_DOVISH + CENTRAL_BANK_BIAS_ROT_HAWKISH) / 2;

export function getRotationForCentralBankPolicyStanceScore(score: number): number {
    const s = Math.max(FX_TMV_SCORE_MIN, Math.min(FX_TMV_SCORE_MAX, score));
    if (s < 0) return CENTRAL_BANK_BIAS_ROT_DOVISH;
    if (s > 0) return CENTRAL_BANK_BIAS_ROT_HAWKISH;
    return CENTRAL_BANK_BIAS_ROT_NEUTRAL;
}
