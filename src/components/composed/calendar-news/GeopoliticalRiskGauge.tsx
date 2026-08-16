"use client";

import type { CSSProperties } from "react";

import styles from "./GeopoliticalRiskGauge.module.scss";

/** Doc §29 bands on 0.00–1.00. */
export const GEO_RISK_SEGMENTS = [
    { name: "LOW RISK", min: 0, max: 0.25, color: "#0f9d58" },
    { name: "WATCH", min: 0.25, max: 0.5, color: "#f0b90b" },
    { name: "ELEVATED", min: 0.5, max: 0.75, color: "#f59e0b" },
    { name: "HIGH RISK", min: 0.75, max: 1, color: "#d93025" },
] as const;

function clamp01(n: number): number {
    return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

/**
 * Doc §29:
 * 0.00–0.24 Low Risk, 0.25–0.49 Watch, 0.50–0.74 Elevated, 0.75–1.00 High Risk.
 */
export function geoRiskZoneIndex(score01: number): number {
    const s = clamp01(score01);
    if (s <= 0.24) return 0;
    if (s <= 0.49) return 1;
    if (s <= 0.74) return 2;
    return 3;
}

export function geoRiskAccentColor(score01: number): string {
    return GEO_RISK_SEGMENTS[geoRiskZoneIndex(score01)]!.color;
}

/**
 * Angular mid of each 45° wedge (deg from east, CCW) — center of the zone labels
 * (LOW / WATCH / ELEVATED / HIGH).
 */
export const GEO_RISK_WEDGE_MIDS_FROM_EAST = [157.5, 112.5, 67.5, 22.5] as const;

/**
 * Calibrated rotations from the original Risk Watch needle. Keep these values
 * stable: the new FX Analyzer-style line must land on the same visual points
 * as the previous custom needle in every risk band.
 */
export const GEO_RISK_NEEDLE_ROTATE_DEG = [
    -166.708531,
    -113.708531,
    -57.708531,
    -8.708531,
] as const;

/** The old needle tip was angled 1.790° above its local +X axis. */
export const GEO_RISK_NEEDLE_TIP_LOCAL_DEG = Math.atan2(4.01234 - 5.60434, 56.2 - 5.30035) * (180 / Math.PI);

/** Preserve the old custom path's visible tip distance from the raised hub. */
export const GEO_RISK_NEEDLE_LENGTH = Math.hypot(56.2 - 5.30035, 4.01234 - 5.60434) * 0.8;

export function geoRiskNeedleDegTowardWedgeCenter(zoneIndex: number): number {
    const rotation = GEO_RISK_NEEDLE_ROTATE_DEG[zoneIndex] ?? GEO_RISK_NEEDLE_ROTATE_DEG[1]!;
    return rotation + GEO_RISK_NEEDLE_TIP_LOCAL_DEG;
}

export function geoRiskNeedleDeg(score01: number): number {
    return geoRiskNeedleDegTowardWedgeCenter(geoRiskZoneIndex(score01));
}

function polar(cx: number, cy: number, r: number, degFromEast: number) {
    const rad = (degFromEast * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}

function donutSlice(
    cx: number,
    cy: number,
    rInner: number,
    rOuter: number,
    startDeg: number,
    endDeg: number,
): string {
    const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    const o0 = polar(cx, cy, rOuter, startDeg);
    const o1 = polar(cx, cy, rOuter, endDeg);
    const i0 = polar(cx, cy, rInner, startDeg);
    const i1 = polar(cx, cy, rInner, endDeg);
    return [
        `M ${o0.x} ${o0.y}`,
        `A ${rOuter} ${rOuter} 0 ${large} 1 ${o1.x} ${o1.y}`,
        `L ${i1.x} ${i1.y}`,
        `A ${rInner} ${rInner} 0 ${large} 0 ${i0.x} ${i0.y}`,
        "Z",
    ].join(" ");
}

function labelArcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
    const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    const a0 = polar(cx, cy, r, startDeg);
    const a1 = polar(cx, cy, r, endDeg);
    return `M ${a0.x} ${a0.y} A ${r} ${r} 0 ${large} 1 ${a1.x} ${a1.y}`;
}

type GeopoliticalRiskGaugeProps = {
    score: number;
    style?: CSSProperties;
};

/**
 * Thick 4-bar semicircle with labels inside the bars. The slender line-and-hub
 * needle intentionally matches the FX Analyzer Pro gauge treatment while this
 * gauge keeps its existing 200×118 viewbox and card dimensions.
 */
export default function GeopoliticalRiskGauge({ score, style }: GeopoliticalRiskGaugeProps) {
    const s = clamp01(score);
    const cx = 100;
    const cy = 100;
    const rOuter = 88;
    const rInner = 52;
    const rLabel = (rOuter + rInner) / 2;
    /** Raised hub (axis) — do not move; only needleRotate aims at label centers. */
    const needleLift = 10;
    const hubY = cy - needleLift;
    const zoneIndex = geoRiskZoneIndex(s);
    const needleRotate = geoRiskNeedleDegTowardWedgeCenter(zoneIndex);

    const wedges = [
        { start: 180, end: 135, ...GEO_RISK_SEGMENTS[0] },
        { start: 135, end: 90, ...GEO_RISK_SEGMENTS[1] },
        { start: 90, end: 45, ...GEO_RISK_SEGMENTS[2] },
        { start: 45, end: 0, ...GEO_RISK_SEGMENTS[3] },
    ];

    return (
        <div className={styles.wrap} style={style}>
            <svg viewBox="0 0 200 118" className={styles.svg} aria-hidden>
                <defs>
                    {wedges.map((w, i) => (
                        <path
                            key={`path-${w.name}`}
                            id={`geo-risk-label-${i}`}
                            d={labelArcPath(cx, cy, rLabel, w.start, w.end)}
                            fill="none"
                        />
                    ))}
                </defs>

                {wedges.map((w) => (
                    <path
                        key={w.name}
                        d={donutSlice(cx, cy, rInner, rOuter, w.start, w.end)}
                        fill={w.color}
                    />
                ))}

                {wedges.map((w, i) => (
                    <text key={`label-${w.name}`} className={styles.barLabel}>
                        <textPath href={`#geo-risk-label-${i}`} startOffset="50%" textAnchor="middle">
                            {w.name}
                        </textPath>
                    </text>
                ))}

                {/* Same line + ellipse hub construction as the FX Analyzer Pro needle. */}
                <g transform={`translate(${cx} ${hubY}) rotate(${needleRotate})`} className={styles.needle}>
                    <line x1="0" y1="0" x2={GEO_RISK_NEEDLE_LENGTH} y2="0" className={styles.needleLine} />
                    <ellipse cx="0" cy="0" rx="4.2" ry="4.2" className={styles.needleHub} />
                </g>
            </svg>
        </div>
    );
}
