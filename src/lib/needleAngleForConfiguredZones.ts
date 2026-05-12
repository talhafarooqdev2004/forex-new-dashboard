import type { FxGaugeZone } from "@/lib/gaugeZonesFromConfigurations";
import { FX_TMV_GAUGE_ZONES_DARK, FX_TMV_SCORE_MAX, FX_TMV_SCORE_MIN } from "@/lib/fxTmvGaugeZones";

/**
 * FX Analyzer Pro discrete needle angles (deg) for `SeasonalGaugeNeedle` pivot (24.377, 13.7272).
 * Order matches `FX_TMV_GAUGE_ZONES_DARK` low→high: Strong Sell … Strong Buy.
 */
const TMV_DISCRETE_NEEDLE_ROT_DEG = [
    -148.98, // dark red — Strong Sell
    -125.98, // medium red — Sell
    -97.98, // light red — Weak Sell
    -62.98, // neutral
    -27.704, // light green — Weak Buy
    -1.92, // medium green — Buy
    24.32, // dark green — Strong Buy
] as const;

/** Larger Net Bias gauge on FX Analyzer Pro — same band order, different angles (pivot 24.377 13.7272). */
const NET_BIAS_DISCRETE_NEEDLE_ROT_DEG = [
    -147.327, // dark red — Strong Sell
    -124.327, // medium red — Sell
    -98.327, // light red — Weak Sell
    -61.746, // neutral
    -28.746, // light green — Weak Buy
    -1.746, // medium green — Buy
    22.673, // dark green — Strong Buy
] as const;

function sortedGaugeZones(zones: FxGaugeZone[]): FxGaugeZone[] {
    return [...zones].sort((a, b) => a.minValue - b.minValue);
}

function getConfiguredValueBounds(zones: FxGaugeZone[]): { min: number; max: number } {
    if (!zones?.length) return { min: -100, max: 100 };
    let min = Infinity;
    let max = -Infinity;
    for (const z of zones) {
        min = Math.min(min, z.minValue);
        max = Math.max(max, z.maxValue);
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: -100, max: 100 };
    return { min, max };
}

function getZoneForValue(value: number, gaugeZones: FxGaugeZone[]): FxGaugeZone | null {
    if (!gaugeZones?.length) return null;
    const ordered = sortedGaugeZones(gaugeZones);
    const { min: bMin, max: bMax } = getConfiguredValueBounds(ordered);
    const clampedValue = Math.max(bMin, Math.min(bMax, value));
    const matches = ordered.filter((z) => clampedValue >= z.minValue && clampedValue <= z.maxValue);
    if (matches.length > 0) {
        return matches.reduce((a, b) => (a.minValue >= b.minValue ? a : b));
    }
    const sortedByProximity = [...ordered].sort((a, b) => {
        const distA = Math.min(Math.abs(clampedValue - a.minValue), Math.abs(clampedValue - a.maxValue));
        const distB = Math.min(Math.abs(clampedValue - b.minValue), Math.abs(clampedValue - b.maxValue));
        return distA - distB;
    });
    return sortedByProximity[0] ?? null;
}

/** When admin defines exactly 7 bands (same order as TMV sell→buy), map raw score to arc segment index 0…6. */
export function zoneIndexForConfiguredScore(score: number | null, zones: FxGaugeZone[]): number | null {
    if (score === null || !Number.isFinite(score) || !zones.length) return null;
    const ordered = sortedGaugeZones(zones);
    if (ordered.length !== 7) return null;
    const z = getZoneForValue(score, zones);
    if (!z) return null;
    const idx = ordered.indexOf(z);
    if (idx < 0) return null;
    return Math.min(6, Math.max(0, idx));
}

function normalizeRawScoreToTmvDomain(score: number, rangeMin: number, rangeMax: number): number {
    if (!Number.isFinite(rangeMin) || !Number.isFinite(rangeMax) || rangeMax === rangeMin) return 0;
    const t = (score - rangeMin) / (rangeMax - rangeMin);
    return FX_TMV_SCORE_MIN + t * (FX_TMV_SCORE_MAX - FX_TMV_SCORE_MIN);
}

function tmvBandIndexForNormalizedScore(normalized: number): number {
    const s = Math.max(FX_TMV_SCORE_MIN, Math.min(FX_TMV_SCORE_MAX, normalized));
    const sorted = [...FX_TMV_GAUGE_ZONES_DARK].sort((a, b) => a.minValue - b.minValue);
    for (let i = 0; i < sorted.length; i++) {
        const z = sorted[i]!;
        const isLast = i === sorted.length - 1;
        const upper = isLast ? z.maxValue : sorted[i + 1]!.minValue;
        if (s >= z.minValue && (isLast ? s <= upper : s < upper)) {
            return i;
        }
    }
    return 3;
}

export type FxAnalyzerNeedleVariant = "standard" | "netBias";

/**
 * Discrete needle rotation for FX Analyzer Pro: arc stays TMV-styled; band comes from admin zones
 * when there are exactly seven bands, otherwise from the score linearly mapped into the TMV domain.
 * @param variant — `netBias` uses angles tuned for the large Net Bias gauge; `standard` for the four smaller gauges.
 */
export function fxAnalyzerDiscreteNeedleRotationDeg(
    score: number | null,
    configuredZones: FxGaugeZone[],
    rangeMin: number,
    rangeMax: number,
    variant: FxAnalyzerNeedleVariant = "standard",
): number {
    const idxFromAdmin = zoneIndexForConfiguredScore(score, configuredZones);
    const bandIdx =
        idxFromAdmin !== null
            ? idxFromAdmin
            : score === null || !Number.isFinite(score)
              ? 3
              : tmvBandIndexForNormalizedScore(normalizeRawScoreToTmvDomain(score, rangeMin, rangeMax));
    const rotations = variant === "netBias" ? NET_BIAS_DISCRETE_NEEDLE_ROT_DEG : TMV_DISCRETE_NEEDLE_ROT_DEG;
    return rotations[Math.min(6, Math.max(0, bandIdx))]!;
}

/**
 * Map a raw score to a needle angle on the FX Analyzer semicircle (−180° … 0°),
 * using admin-configured zone spans (same algorithm as forex-admin `useGaugeConfigurations`).
 */
export function needleAngleForConfiguredZones(value: number, zones: FxGaugeZone[]): number {
    const ordered = sortedGaugeZones(zones);
    if (ordered.length === 0) return -90;

    const globalMin = ordered[0]!.minValue;
    const globalMax = ordered[ordered.length - 1]!.maxValue;
    const totalSpan = globalMax - globalMin || 1;
    const clamped = Math.max(globalMin, Math.min(globalMax, value));

    const zone = getZoneForValue(clamped, zones);
    if (!zone) {
        const ratio = (clamped - globalMin) / totalSpan;
        return -180 + ratio * 180;
    }

    const zIndex = ordered.indexOf(zone);
    if (zIndex < 0) {
        const ratio = (clamped - globalMin) / totalSpan;
        return -180 + ratio * 180;
    }

    let angleCursor = -180;
    for (let i = 0; i < ordered.length; i++) {
        const z = ordered[i]!;
        const valSpan = z.maxValue - z.minValue || 1;
        const angularSpan = ((z.maxValue - z.minValue) / totalSpan) * 180;
        if (i === zIndex) {
            const t = (clamped - z.minValue) / valSpan;
            return angleCursor + Math.max(0, Math.min(1, t)) * angularSpan;
        }
        angleCursor += angularSpan;
    }

    const ratio = (clamped - globalMin) / totalSpan;
    return -180 + ratio * 180;
}

export function zoneColorForConfiguredScore(score: number | null, zones: FxGaugeZone[]): string | undefined {
    if (score === null || !Number.isFinite(score) || !zones.length) return undefined;
    const z = getZoneForValue(score, zones);
    return z?.color;
}
