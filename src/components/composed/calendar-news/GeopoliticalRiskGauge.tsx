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
 * Continuous needle: score 0.00 → left (−90°), 1.00 → right (+90°).
 * So 0.45 sits in Watch; 0.545 sits in Elevated (not Watch).
 */
export function geoRiskNeedleDeg(score01: number): number {
    return -90 + clamp01(score01) * 180;
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
 * Thick 4-bar semicircle with labels inside the bars + theme-aware needle.
 * Needle angle tracks the live 0–1 score continuously (doc §29 bands).
 */
export default function GeopoliticalRiskGauge({ score, style }: GeopoliticalRiskGaugeProps) {
    const s = clamp01(score);
    const rotation = geoRiskNeedleDeg(s);
    const cx = 100;
    const cy = 100;
    const rOuter = 88;
    const rInner = 52;
    const rLabel = (rOuter + rInner) / 2;
    /** Scale GuageChartIndicator (63×12, hub at 5.3,5.6) so tip reaches into the arc. */
    const needleScale = 0.95;

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

                {/* Theme-aware needle: white in dark, black in light (same idea as SeasonalGaugeNeedle). */}
                <g
                    className={styles.needle}
                    style={{
                        transformOrigin: `${cx}px ${cy}px`,
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 0.8s ease-out",
                    }}
                >
                    <g transform={`translate(${cx} ${cy}) scale(${needleScale}) rotate(-90) translate(-5.30035 -5.60434)`}>
                        <ellipse cx="5.30035" cy="5.60434" rx="5.30035" ry="5.60434" />
                        <path d="M10.6016 0.700684L62.9425 4.01234L10.6016 9.80774C13.7499 6.82725 11.9134 2.4945 10.6016 0.700684Z" />
                    </g>
                </g>
            </svg>
        </div>
    );
}
