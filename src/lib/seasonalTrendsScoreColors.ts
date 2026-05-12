/**
 * Pair bias colors:
 * - **Gradient** (`getSeasonalBiasGradientHeatMapColors`): pure green (+5) → yellow (0) → pure red (−5) for Pair Seasonal Trends & Bias.
 * - **Discrete bands** (`getSeasonalScoreHeatMapColors`): stepped palette for netSheet / percent100 heat maps.
 */
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

/** Matches `CurrencySeasonalTrends` DARK_GAUGE_ZONES bear / bull arc colors (discrete band palette) */
export const SEASONAL_GAUGE_COLORS = {
    weakBear: GAUGE_SIGNAL_COLORS.weakSell,
    strongBear: GAUGE_SIGNAL_COLORS.sell,
    veryStrongBear: GAUGE_SIGNAL_COLORS.strongSell,
    neutral: GAUGE_SIGNAL_COLORS.neutral,
    weakBull: GAUGE_SIGNAL_COLORS.weakBuy,
    strongBull: GAUGE_SIGNAL_COLORS.buy,
    veryStrongBull: GAUGE_SIGNAL_COLORS.strongBuy,
} as const;

/** Gradient endpoints use the same buy / neutral / sell colors as the gauge. */
export const SEASONAL_BIAS_GRADIENT_GREEN = GAUGE_SIGNAL_COLORS.buy;
export const SEASONAL_BIAS_GRADIENT_YELLOW = GAUGE_SIGNAL_COLORS.neutral;
export const SEASONAL_BIAS_GRADIENT_RED = GAUGE_SIGNAL_COLORS.sell;

/** Mid hue anchors — spaced evenly in score space (0…1); blended in OKLCH for pro-grade hue paths. */
const SEASONAL_BIAS_GRADIENT_ORANGE = "#fb923c";
const SEASONAL_BIAS_GRADIENT_LIME = "#84cc16";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = hex.replace("#", "");
    const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
    return {
        r: parseInt(v.slice(0, 2), 16),
        g: parseInt(v.slice(2, 4), 16),
        b: parseInt(v.slice(4, 6), 16),
    };
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function clamp01(n: number): number {
    return Math.min(1, Math.max(0, n));
}

/** sRGB byte → linear-light 0…1 */
function srgbByteToLinear(u255: number): number {
    const c = u255 / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** linear-light 0…1 → sRGB byte */
function linearToSrgbByte(l: number): number {
    const c = clamp01(l);
    const u = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(clamp01(u) * 255);
}

type Oklab = { L: number; a: number; b: number };

type Oklch = { L: number; C: number; h: number };

/** Linear sRGB 0…1 → OKLab (Björn Ottosson, https://bottosson.github.io/posts/oklab/) */
function linearSrgbToOklab(r: number, g: number, bl: number): Oklab {
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * bl);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * bl);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188386 * g + 0.6299787005 * bl);
    return {
        L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
        a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
        b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    };
}

function oklabToLinearSrgb(L: number, a: number, labB: number): { r: number; g: number; bl: number } {
    const l = L + 0.3963377774 * a + 0.2158037573 * labB;
    const m = L - 0.1055613458 * a - 0.0638541728 * labB;
    const s = L - 0.0894841775 * a - 1.291485548 * labB;
    const l3 = l * l * l;
    const m3 = m * m * m;
    const s3 = s * s * s;
    return {
        r: 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
        g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
        bl: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
    };
}

function hexToOklab(hex: string): Oklab {
    const { r, g, b } = hexToRgb(hex);
    return linearSrgbToOklab(srgbByteToLinear(r), srgbByteToLinear(g), srgbByteToLinear(b));
}

function oklabToOklch(Lab: Oklab): Oklch {
    const C = Math.hypot(Lab.a, Lab.b);
    if (C < 1e-12) return { L: Lab.L, C: 0, h: 0 };
    let h = (Math.atan2(Lab.b, Lab.a) * 180) / Math.PI;
    if (h < 0) h += 360;
    return { L: Lab.L, C, h };
}

function oklchToOklab(o: Oklch): Oklab {
    const C = Math.max(0, o.C);
    const hRad = (((o.h % 360) + 360) % 360) * (Math.PI / 180);
    return {
        L: o.L,
        a: C * Math.cos(hRad),
        b: C * Math.sin(hRad),
    };
}

function hexToOklch(hex: string): Oklch {
    return oklabToOklch(hexToOklab(hex));
}

/** Shortest arc on the hue wheel (degrees 0…360). */
function lerpHueDeg(h0: number, h1: number, t: number): number {
    const u = clamp01(t);
    const a = ((h0 % 360) + 360) % 360;
    const b = ((h1 % 360) + 360) % 360;
    let d = b - a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    let h = a + d * u;
    h %= 360;
    if (h < 0) h += 360;
    return h;
}

/** Interpolate in OKLCH — hue follows the wheel; L/C linear (pro-grade smooth gradients vs RGB/OKLab-only mix). */
function mixOklch(A: Oklch, B: Oklch, t: number): Oklch {
    const u = clamp01(t);
    return {
        L: lerp(A.L, B.L, u),
        C: Math.max(0, lerp(A.C, B.C, u)),
        h: lerpHueDeg(A.h, B.h, u),
    };
}

function oklabToCssRgb(Lab: Oklab): string {
    const { r, g, bl } = oklabToLinearSrgb(Lab.L, Lab.a, Lab.b);
    const rr = linearToSrgbByte(r);
    const gg = linearToSrgbByte(g);
    const bb = linearToSrgbByte(bl);
    if (![rr, gg, bb].every((x) => Number.isFinite(x))) {
        return "rgb(128,128,128)";
    }
    return `rgb(${rr},${gg},${bb})`;
}

/** Normalized score ends (0 = −5 … 1 = +5): hold **pure** red/green flat so −4.x / +4.x aren’t pulled orange/lime by mid stops. */
const SEASONAL_BIAS_ENDPOINT_PLATEAU = 0.12;

/** Global gradient position (0…1) of the bear-side **solid orange** anchor — used when normalizing all-bear grids to red→orange only. */
export const SEASONAL_BIAS_GRADIENT_BEAR_ORANGE_POS = SEASONAL_BIAS_ENDPOINT_PLATEAU + 0.18;

/**
 * Score position 0 = −5 (bear) … 1 = +5 (bull). Piecewise linear in **OKLCH** between anchors; endpoints use a short
 * plateau so the strongest bull/bear tiles match pure green/red, then hue shifts toward orange/lime.
 */
const SEASONAL_BIAS_OKLCH_STOPS: { pos: number; oklch: Oklch }[] = (() => {
    const red = hexToOklch(SEASONAL_BIAS_GRADIENT_RED);
    const orange = hexToOklch(SEASONAL_BIAS_GRADIENT_ORANGE);
    const yellow = hexToOklch(SEASONAL_BIAS_GRADIENT_YELLOW);
    const lime = hexToOklch(SEASONAL_BIAS_GRADIENT_LIME);
    const green = hexToOklch(SEASONAL_BIAS_GRADIENT_GREEN);
    const p = SEASONAL_BIAS_ENDPOINT_PLATEAU;
    const bearOrangePos = SEASONAL_BIAS_GRADIENT_BEAR_ORANGE_POS;
    const bullLimePos = 1 - bearOrangePos;
    const bullGreenPlateauStart = 1 - p;
    return [
        { pos: 0, oklch: red },
        { pos: p, oklch: red },
        { pos: bearOrangePos, oklch: orange },
        { pos: 0.5, oklch: yellow },
        { pos: bullLimePos, oklch: lime },
        { pos: bullGreenPlateauStart, oklch: green },
        { pos: 1, oklch: green },
    ];
})();

function seasonalBiasGradientAtNormalizedPos(x: number): string {
    const u = clamp01(x);
    let i = 0;
    while (i < SEASONAL_BIAS_OKLCH_STOPS.length - 1 && SEASONAL_BIAS_OKLCH_STOPS[i + 1]!.pos < u) i++;
    const left = SEASONAL_BIAS_OKLCH_STOPS[i]!;
    const right = SEASONAL_BIAS_OKLCH_STOPS[i + 1] ?? left;
    const span = right.pos - left.pos || 1;
    const t = (u - left.pos) / span;
    const mixed = mixOklch(left.oklch, right.oklch, t);
    return oklabToCssRgb(oklchToOklab(mixed));
}

/** Interpolate two hex colors in OKLCH (perceptually even steps — good for strength bars). */
export function mixHexColorsOklch(hexA: string, hexB: string, t: number): string {
    const A = hexToOklch(hexA);
    const B = hexToOklch(hexB);
    const mixed = mixOklch(A, B, clamp01(t));
    return oklabToCssRgb(oklchToOklab(mixed));
}

const HEAT_MAP_TEXT = "#000000";

/**
 * Seasonal bias tile color for scores in **[-5, +5]** on the global scale: **OKLCH** ramp with pure red / pure green
 * plateaus at the extremes, then red → orange → yellow → lime → green.
 */
export function getSeasonalBiasGradientHeatMapColors(score: number): { backgroundColor: string; color: string } {
    const s = Math.max(-5, Math.min(5, score));
    const x = (s + 5) / 10;
    const backgroundColor = seasonalBiasGradientAtNormalizedPos(x);
    return { backgroundColor, color: HEAT_MAP_TEXT };
}

const RANGE_EPS = 1e-9;

/**
 * Colors for one tile when the **whole grid** spans `[rangeMin, rangeMax]`:
 * - **All bearish** (`rangeMax ≤ 0`): worst value → solid red, best value → **solid orange** (no bleed into yellow).
 * - **All bullish** (`rangeMin ≥ 0`): weakest bull → yellow, strongest → solid green.
 * - **Crosses zero**: stretches the full red→green ramp across the observed min/max.
 *
 * When `rangeMax - rangeMin` is ~0, falls back to the fixed `[-5, 5]` scale.
 */
export function getSeasonalBiasGradientHeatMapColorsForDisplayRange(
    score: number,
    rangeMin: number,
    rangeMax: number,
): { backgroundColor: string; color: string } {
    const span = rangeMax - rangeMin;
    if (span < RANGE_EPS) {
        return getSeasonalBiasGradientHeatMapColors(score);
    }
    const u = clamp01((score - rangeMin) / span);

    let x: number;
    if (rangeMax <= 0) {
        x = u * SEASONAL_BIAS_GRADIENT_BEAR_ORANGE_POS;
    } else if (rangeMin >= 0) {
        x = 0.5 + u * 0.5;
    } else {
        x = u;
    }

    const backgroundColor = seasonalBiasGradientAtNormalizedPos(x);
    return { backgroundColor, color: HEAT_MAP_TEXT };
}

/**
 * Map a 0–100 score to the same [-5, 5] band scale used by pair bias, so tile colors match
 * “Pair Seasonal Trends & Bias” (50 → neutral, 100 → max bull, 0 → max bear).
 */
export function percent100ToSeasonalScore(percent: number): number {
    const p = Math.max(0, Math.min(100, percent));
    return ((p - 50) / 50) * 5;
}

export function getSeasonalScoreHeatMapColors(score: number): { backgroundColor: string; color: string } {
    const s = Math.max(-5, Math.min(5, score));

    if (s === 0) {
        return { backgroundColor: SEASONAL_GAUGE_COLORS.neutral, color: HEAT_MAP_TEXT };
    }

    if (s > 0) {
        if (s <= 1.5) return { backgroundColor: SEASONAL_GAUGE_COLORS.weakBull, color: HEAT_MAP_TEXT };
        if (s <= 3.5) return { backgroundColor: SEASONAL_GAUGE_COLORS.strongBull, color: HEAT_MAP_TEXT };
        return { backgroundColor: SEASONAL_GAUGE_COLORS.veryStrongBull, color: HEAT_MAP_TEXT };
    }

    if (s >= -1.5) return { backgroundColor: SEASONAL_GAUGE_COLORS.weakBear, color: HEAT_MAP_TEXT };
    if (s >= -3.5) return { backgroundColor: SEASONAL_GAUGE_COLORS.strongBear, color: HEAT_MAP_TEXT };
    return { backgroundColor: SEASONAL_GAUGE_COLORS.veryStrongBear, color: HEAT_MAP_TEXT };
}
