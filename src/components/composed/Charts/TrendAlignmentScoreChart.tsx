"use client";

import React from "react";
import Section from "@/components/ui/layout/Section";

const TREND_ALIGNMENT_MAX = 10;

export type TrendAlignmentScoreRow = {
    currency: string;
    ultf: number;
    ltf: number;
    mtf: number;
    htf: number;
};

// ——— Static Figma (fallback when no table data) ———
const blueBars: [number, number, number, number][] = [
    [40.5, 22, 7.94, 91.34],
    [31.12, 22, 15.15, 84.13],
    [49.87, 22, 22.36, 76.92],
    [59.25, 22, 29.57, 69.71],
    [68.62, 22, 36.79, 62.5],
    [40.5, 22, 44, 55.29],
    [31.12, 22, 51.21, 48.08],
    [59.25, 22, 58.42, 40.87],
    [68.62, 22, 65.63, 33.66],
    [21.75, 22, 72.84, 26.45],
    [49.87, 22, 80.05, 19.23],
    [59.25, 22, 87.26, 12.02],
    [40.5, 22, 94.47, 4.81],
];

const orangeBars: [number, number, number, number][] = [
    [59.25, 22, 9.02, 90.27],
    [21.75, 22, 16.23, 83.06],
    [59.25, 22, 23.44, 75.85],
    [49.87, 22, 30.65, 68.64],
    [59.25, 22, 37.86, 61.43],
    [31.12, 22, 45.07, 54.21],
    [40.5, 22, 52.28, 47],
    [68.62, 22, 59.49, 39.79],
    [59.25, 22, 66.7, 32.58],
    [31.12, 22, 73.91, 25.37],
    [40.5, 22, 81.12, 18.16],
    [59.25, 22, 88.33, 10.95],
    [49.87, 22, 95.54, 3.74],
];

const greenBars: [number, number, number, number][] = [
    [31.12, 22, 10.09, 89.19],
    [40.5, 22, 17.3, 81.98],
    [68.62, 22, 24.51, 74.77],
    [40.5, 22, 31.72, 67.56],
    [49.87, 22, 38.93, 60.35],
    [21.75, 22, 46.14, 53.14],
    [49.87, 22, 53.35, 45.93],
    [49.87, 22, 60.56, 38.72],
    [68.62, 22, 67.78, 31.51],
    [40.5, 22, 74.99, 24.3],
    [31.12, 22, 82.2, 17.09],
    [59.25, 22, 89.41, 9.88],
    [31.12, 22, 96.62, 2.67],
];

const currencyLabels = [
    { label: "USD", leftPct: 8.37, rightPct: 89.66 },
    { label: "EUR", leftPct: 15.72, rightPct: 82.49 },
    { label: "GBP", leftPct: 22.88, rightPct: 75.24 },
    { label: "CAD", leftPct: 30.05, rightPct: 67.98 },
    { label: "JPY", leftPct: 37.39, rightPct: 60.91 },
    { label: "JPY", leftPct: 44.61, rightPct: 53.7 },
    { label: "CAD", leftPct: 51.68, rightPct: 46.35 },
    { label: "JPY", leftPct: 59.03, rightPct: 39.27 },
    { label: "NZD", leftPct: 66.06, rightPct: 31.97 },
    { label: "XAU", leftPct: 73.27, rightPct: 24.76 },
    { label: "XAU", leftPct: 80.48, rightPct: 17.55 },
    { label: "RTC", leftPct: 87.82, rightPct: 10.39 },
    { label: "RTC", leftPct: 95.04, rightPct: 3.18 },
];

/** Chart plot area insets */
const PLOT_LEFT = 5.8;
const PLOT_RIGHT = 0.47;

/**
 * The baseline is the bottom dashed grid line.
 * In the chart's coordinate space (0% = top, 100% = bottom of the relative container),
 * the baseline sits at 78% from top (matching the third dashed line).
 * Bars grow UPWARD from this baseline for positive values,
 * and DOWNWARD for negative values.
 */
const BASELINE_PCT = 78; // % from top — matches the bottom dashed line

/**
 * The top dashed line (value = 8) sits at 3% from top.
 * So the usable chart height from baseline to top line = BASELINE_PCT - 3 = 75%.
 * We scale bar height as: barHeightPct = (|value| / MAX) * (BASELINE_PCT - TOP_LINE_PCT)
 */
const TOP_LINE_PCT = 3;
const CHART_HEIGHT_PCT = BASELINE_PCT - TOP_LINE_PCT; // 75%

function columnLeftRight(i: number, n: number): { colLeft: number; colRight: number } {
    if (n <= 0) return { colLeft: PLOT_LEFT, colRight: PLOT_RIGHT };
    const usable = 100 - PLOT_LEFT - PLOT_RIGHT;
    return {
        colLeft: PLOT_LEFT + (usable * i) / n,
        colRight: 100 - PLOT_LEFT - (usable * (i + 1)) / n,
    };
}

/**
 * Each group has up to 4 bars (ULTF, LTF, MTF, HTF).
 * We compute positions for all 4 slots but only render non-zero bars.
 * Zero bars are skipped entirely — no gap left in their place.
 * The rendered bars are re-packed tightly (no phantom slots).
 *
 * Bar width matches image 2: wide bars with a small fixed gap between them.
 */
// Fixed gap between bars in % of total chart width
const BAR_GAP_PCT = 0.15;
// Each bar takes up this fraction of the column width (divided among present bars)
const BAR_FILL_FRACTION = 0.55;

function computeBarPositions(
    colLeft: number,
    colRight: number,
    presentIndices: number[], // indices of non-zero bars (0=ULTF,1=LTF,2=MTF,3=HTF)
): Record<number, { left: number; right: number }> {
    const groupW = 100 - colLeft - colRight;
    const count = presentIndices.length;
    if (count === 0) return {};

    // Bar width is always computed as if all 4 bars were present — ensures equal width everywhere
    const totalGaps = (4 - 1) * BAR_GAP_PCT;
    const clusterW = groupW * BAR_FILL_FRACTION;
    const barW = Math.max(0.1, (clusterW - totalGaps) / 4);
    // Center the actual cluster of present bars
    const actualClusterW = count * barW + (count - 1) * BAR_GAP_PCT;
    const clusterStart = colLeft + (groupW - actualClusterW) / 2;

    const result: Record<number, { left: number; right: number }> = {};
    presentIndices.forEach((tfIndex, slot) => {
        const left = clusterStart + slot * (barW + BAR_GAP_PCT);
        result[tfIndex] = { left, right: 100 - left - barW };
    });
    return result;
}

function shouldShowBar(v: number) {
    return Math.abs(v) >= 0.01;
}

/**
 * Compute top% and bottom% for a bar that grows from BASELINE_PCT.
 * Positive value → bar grows upward (top < BASELINE_PCT, bottom = BASELINE_PCT%).
 *   but we express bottom as distance from bottom of container:
 *   bottom% = 100 - BASELINE_PCT
 * Negative value → bar grows downward (top = BASELINE_PCT%, bottom decreases).
 */
function valueToTopBottom(value: number, max: number) {
    const clamped = Math.max(-max, Math.min(max, value));
    const barHeightPct = (Math.abs(clamped) / max) * CHART_HEIGHT_PCT;
    const bottomFromContainerBottom = 100 - BASELINE_PCT; // fixed = 22%

    if (clamped >= 0) {
        // grows upward
        const top = BASELINE_PCT - barHeightPct;
        return { top, bottom: bottomFromContainerBottom };
    } else {
        // grows downward
        const top = BASELINE_PCT;
        const bottom = bottomFromContainerBottom - barHeightPct;
        return { top, bottom: Math.max(0, bottom) };
    }
}

const COL_ULTF = "#2b7fff";
const COL_LTF = "#fe9a00";
const COL_MTF = "#00bc7d";
const COL_HTF = "#FF4D6D";

function Bar({
    top,
    bottom,
    left,
    right,
    color,
    positive,
}: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    color: string;
    positive?: boolean;
}) {
    return (
        <div
            className="absolute"
            style={{
                top: `${top}%`,
                bottom: `${bottom}%`,
                left: `${left}%`,
                right: `${right}%`,
                backgroundColor: color,
                // Round top corners for positive bars, bottom corners for negative
                borderRadius: positive !== false
                    ? "2px 2px 0 0"
                    : "0 0 2px 2px",
            }}
        />
    );
}

export default function TrendAlignmentScoreChart({ rows }: { rows?: TrendAlignmentScoreRow[] | null }) {
    const useDynamic = rows && rows.length > 0;
    const n = useDynamic ? rows!.length : 0;

    return (
        <Section padding={false} className="w-full min-w-0">
            <div className="w-full min-w-0 horizontal-scroll bg-darkGrey rounded-[12px] text-foreground">
                <div
                    className="relative min-w-[800px] w-full max-w-[1124px] mx-auto aspect-[1124/250] overflow-hidden flex flex-col p-[16.8px] pb-[0.8px] gap-4"
                >
                    {/* Title */}
                    <div className="w-full h-5">
                        <p className="text-center w-full font-bold text-[min(1.8vw,20px)] leading-6">
                            Trend Alignment Score
                        </p>
                    </div>

                    {/* Chart area */}
                    <div className="relative flex-1 w-full">
                        {/* Dashed grid lines at top (8), mid (6), and baseline */}
                        {[TOP_LINE_PCT, 31.12, BASELINE_PCT].map((pct, i) => (
                            <div
                                key={`grid-${i}`}
                                className="absolute"
                                style={{
                                    top: `${pct}%`,
                                    left: "5.8%",
                                    right: "0.47%",
                                    height: 0,
                                }}
                            >
                                <svg
                                    className="block w-full h-px"
                                    fill="none"
                                    preserveAspectRatio="none"
                                    viewBox="0 0 1022.13 1"
                                >
                                    <path d="M0 0.5H1022.13" stroke="#6A7282" strokeDasharray="3 3" />
                                </svg>
                            </div>
                        ))}

                        {/* Y-axis labels */}
                        <p className="absolute text-right text-[10px] top-[0.53%] left-[4.45%] w-[2%] text-foreground">8</p>
                        <p className="absolute text-right text-[10px] top-[17.72%] left-[4.45%] w-[2%] text-foreground">6</p>

                        {/* Dynamic bars */}
                        {useDynamic ? (
                            <>
                                {rows!.map((row, i) => {
                                    const { colLeft, colRight } = columnLeftRight(i, n);
                                    const allSeries = [
                                        { v: row.ultf, color: COL_ULTF, k: 0 },
                                        { v: row.ltf,  color: COL_LTF,  k: 1 },
                                        { v: row.mtf,  color: COL_MTF,  k: 2 },
                                        { v: row.htf,  color: COL_HTF,  k: 3 },
                                    ];
                                    // Only include bars with a non-zero value — no phantom slots
                                    const present = allSeries.filter(({ v }) => shouldShowBar(v));
                                    const positions = computeBarPositions(
                                        colLeft,
                                        colRight,
                                        present.map(({ k }) => k),
                                    );
                                    return (
                                        <React.Fragment key={`${row.currency}-${i}`}>
                                            {present.map(({ v, color, k }) => {
                                                const pos = positions[k];
                                                const tb = valueToTopBottom(v, TREND_ALIGNMENT_MAX);
                                                return (
                                                    <Bar
                                                        key={k}
                                                        {...tb}
                                                        left={pos.left}
                                                        right={pos.right}
                                                        color={color}
                                                        positive={v >= 0}
                                                    />
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}

                                {/* Currency labels — always rendered above bars via z-index */}
                                {rows!.map((row, i) => {
                                    const { colLeft, colRight } = columnLeftRight(i, n);
                                    return (
                                        <p
                                            key={`label-dyn-${row.currency}-${i}`}
                                            className="absolute text-center text-[9px] font-medium leading-tight text-foreground px-0.5 whitespace-nowrap overflow-hidden text-ellipsis"
                                            style={{
                                                top: `${BASELINE_PCT + 2}%`,
                                                left: `${colLeft}%`,
                                                right: `${colRight}%`,
                                                zIndex: 10,
                                            }}
                                            title={row.currency}
                                        >
                                            {row.currency}
                                        </p>
                                    );
                                })}
                            </>
                        ) : (
                            /* Static fallback bars */
                            <>
                                {blueBars.map((bar, j) => (
                                    <Bar key={`blue-${j}`} top={bar[0]} bottom={bar[1]} left={bar[2]} right={bar[3]} color="#2b7fff" positive />
                                ))}
                                {orangeBars.map((bar, j) => (
                                    <Bar key={`orange-${j}`} top={bar[0]} bottom={bar[1]} left={bar[2]} right={bar[3]} color="#fe9a00" positive />
                                ))}
                                {greenBars.map((bar, j) => (
                                    <Bar key={`green-${j}`} top={bar[0]} bottom={bar[1]} left={bar[2]} right={bar[3]} color="#00bc7d" positive />
                                ))}
                                {currencyLabels.map((item, j) => (
                                    <p
                                        key={`label-${j}`}
                                        className="absolute text-center text-[10px] font-medium top-[81.19%] text-foreground"
                                        style={{ left: `${item.leftPct}%`, right: `${item.rightPct}%` }}
                                    >
                                        {item.label}
                                    </p>
                                ))}
                            </>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-row justify-center gap-4 pb-2 flex-wrap">
                        {useDynamic ? (
                            <>
                                <LegendItem color={COL_ULTF} label="ULTF" />
                                <LegendItem color={COL_LTF} label="LTF" />
                                <LegendItem color={COL_MTF} label="MTF" />
                                <LegendItem color={COL_HTF} label="HTF" />
                            </>
                        ) : (
                            <>
                                <LegendItem color="#2b7fff" label="M15" />
                                <LegendItem color="#fe9a00" label="M30" />
                                <LegendItem color="#00bc7d" label="H1" />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
}

function LegendItem({ color, label }: { color: string; label: string }) {
    return (
        <div className="flex items-center gap-1">
            <div className="w-2 h-[2px]" style={{ backgroundColor: color }} />
            <span className="text-[9px] font-normal leading-[13.5px] text-foreground">{label}</span>
        </div>
    );
}