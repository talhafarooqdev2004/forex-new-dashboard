import { mixHexColorsOklch, SEASONAL_GAUGE_COLORS } from "@/lib/seasonalTrendsScoreColors";

/** Matches `CurrencyStrengthIndex` bar magnitude cap (±10). */
const MAX_ABS_SCALE = 10;

/** Palest tint (small score in group) — OKLCH mixes read cleaner than weakBear alone. */
const BEAR_PALE = "#FFF1F1";
/** Deepest bear bar at max intensity (darker than `veryStrongBear` for clear “strongest” cue). */
const BEAR_DEEP = "#5A0404";

const BULL_PALE = "#E9FBEF";
const BULL_DEEP = "#023D18";

function clamp01(x: number): number {
    return Math.min(1, Math.max(0, x));
}

/**
 * S-curve 0…1: more color change in the mid range so e.g. −2.7 vs −3.3 vs −4.5 read as clearly different steps
 * (linear `t` keeps those too close in RGB).
 */
function remapStrengthVisual(t: number): number {
    const u = clamp01(t);
    return u * u * (3 - 2 * u);
}

export type CurrencyStrengthStrengthRange = { min: number; max: number };

/**
 * How “strong” this bar is within the list (0 = palest, 1 = deepest), heatmap-style.
 * Uses group min/max when provided; otherwise |value| / 10.
 */
export function getCurrencyStrengthBarIntensity(value: number, strengthRange?: CurrencyStrengthStrengthRange): number {
    if (!Number.isFinite(value) || value === 0) return 0;
    if (!strengthRange || strengthRange.min === strengthRange.max) {
        return clamp01(Math.abs(value) / MAX_ABS_SCALE);
    }
    const { min, max } = strengthRange;
    if (value > 0) {
        const hi = Math.max(max, 0);
        if (hi < 1e-9) return clamp01(value / MAX_ABS_SCALE);
        return clamp01(value / hi);
    }
    if (value < 0) {
        const lo = Math.min(min, 0);
        if (lo > -1e-9) return clamp01(Math.abs(value) / MAX_ABS_SCALE);
        return clamp01(value / lo);
    }
    return 0;
}

function bearSolidColor(tVisual: number): string {
    const u = clamp01(tVisual);
    if (u < 1 / 3) {
        return mixHexColorsOklch(BEAR_PALE, SEASONAL_GAUGE_COLORS.weakBear, u * 3);
    }
    if (u < 2 / 3) {
        return mixHexColorsOklch(
            SEASONAL_GAUGE_COLORS.weakBear,
            SEASONAL_GAUGE_COLORS.strongBear,
            (u - 1 / 3) * 3,
        );
    }
    return mixHexColorsOklch(SEASONAL_GAUGE_COLORS.strongBear, BEAR_DEEP, (u - 2 / 3) * 3);
}

function bullSolidColorFromT(tVisual: number): string {
    const u = clamp01(tVisual);
    if (u < 1 / 3) {
        return mixHexColorsOklch(BULL_PALE, SEASONAL_GAUGE_COLORS.weakBull, u * 3);
    }
    if (u < 2 / 3) {
        return mixHexColorsOklch(
            SEASONAL_GAUGE_COLORS.weakBull,
            SEASONAL_GAUGE_COLORS.strongBull,
            (u - 1 / 3) * 3,
        );
    }
    return mixHexColorsOklch(SEASONAL_GAUGE_COLORS.strongBull, BULL_DEEP, (u - 2 / 3) * 3);
}

/**
 * Stronger perceptual spread + OKLCH 3-segment ramp (pale → gauge weak → strong → deep).
 * Narrow horizontal gradient so reads like one accurate fill, not a washed overlay.
 */
export function getCurrencyStrengthBarBackground(
    value: number,
    strengthRange?: CurrencyStrengthStrengthRange,
): string | undefined {
    if (!Number.isFinite(value) || value === 0) return undefined;
    const tRaw = getCurrencyStrengthBarIntensity(value, strengthRange);
    const t = remapStrengthVisual(tRaw);

    if (value > 0) {
        const mid = bullSolidColorFromT(t);
        const left = mixHexColorsOklch(mid, "#FFFFFF", 0.02 + (1 - t) * 0.035);
        const right = mixHexColorsOklch(mid, BULL_DEEP, 0.06 + t * 0.14);
        return `linear-gradient(90deg, ${left} 0%, ${mid} 48%, ${right} 100%)`;
    }

    const mid = bearSolidColor(t);
    const left = mixHexColorsOklch(mid, "#FFFFFF", 0.018 + (1 - t) * 0.045);
    const right = mixHexColorsOklch(mid, BEAR_DEEP, 0.07 + t * 0.16);
    return `linear-gradient(90deg, ${left} 0%, ${mid} 48%, ${right} 100%)`;
}
