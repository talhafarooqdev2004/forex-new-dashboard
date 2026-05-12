"use client";

import React, { useMemo, useState } from "react";
import Section from "@/components/ui/layout/Section";
import { FX_TMV_GAUGE_ZONES_DARK } from "@/lib/fxTmvGaugeZones";

export type DriveIndexBar = { label: string; value: number };

interface DriveIndexChartProps {
    title: string;
    /** When set (including `[]`), renders bars from table data; when omitted, uses original static Figma layout. */
    bars?: DriveIndexBar[] | null;
    /** Kept for API compatibility; pair labels use the same color as Sentiment for both indices. */
    pairLabelTone?: "direction" | "sentiment";
    /**
     * Half-range of the value axis (symm. ±scaleMax). Used for bar height mapping and default tick spacing
     * (thirds of `scaleMax`) unless `axisTicks` is set.
     */
    scaleMax?: number;
    /** Optional Y-axis tick values (labels + horizontal grid). Sentiment uses equal 5-unit steps ±25. */
    axisTicks?: readonly number[];
    /**
     * Fraction of each horizontal slot used for bar width; the rest is gap between adjacent bars.
     * Default 0.82 (Direction). Sentiment uses a lower value for clearer separation.
     */
    barSlotFillRatio?: number;
}

const BASE_CHART_W = 506.959;
const CHART_W = BASE_CHART_W;
const SX = CHART_W / BASE_CHART_W;

function sx(x: number): number {
    return x * SX;
}

/** Shorter plot vs original Figma height */
const ORIGINAL_PLOT_H = 198.712;
const CHART_PLOT_H = 156;
const V_SCALE = CHART_PLOT_H / ORIGINAL_PLOT_H;

function vy(y: number): number {
    return y * V_SCALE;
}

const BAR_W = 7.374 * SX;
const BAR_R = 5.856 * SX;
const Y_ZERO = vy(86.36);

const DEFAULT_SCALE_MAX = 15;
const MAX_BAR_H = 54.9 * V_SCALE;

/** Bottom of plotted grid / bars — pair labels sit just below this */
const LOWEST_GRID_Y = vy(141.86);
const CHART_CONTENT_BOTTOM = Math.max(LOWEST_GRID_Y, Y_ZERO + MAX_BAR_H);
/** Vertical gap between bar/grid bottom and rotated currency labels */
const PAIR_LABEL_GAP = 12;
const PAIR_LABEL_BASELINE_Y = CHART_CONTENT_BOTTOM + PAIR_LABEL_GAP;
/** Room below rotated currency labels before BUY/SELL row */
const LABEL_TO_BADGE_GAP = 20;
const BUY_SELL_BADGE_Y = PAIR_LABEL_BASELINE_Y + LABEL_TO_BADGE_GAP;
const CHART_H = BUY_SELL_BADGE_Y + 12 + 4;

const MIN_BAR_H_FOR_INLINE_SCORE = 11;
const SCORE_FONT_SIZE = 4.25;

/** Inherits `color` from chart wrapper (`text-foreground`) — avoids faint gray on light `bg-chartInnerBg`. */
const PAIR_LABEL_FILL = "currentColor";

const gridLines = [
    { mt: vy(31.47), w: sx(465.353), ml: sx(23.51) },
    { mt: vy(49.77), w: sx(465.353), ml: sx(23.51) },
    { mt: vy(68.07), w: sx(465.353), ml: sx(23.51) },
    { mt: vy(86.36), w: sx(465.353), ml: sx(23.51) },
    { mt: vy(104.66), w: sx(465.353), ml: sx(23.51) },
    { mt: vy(123.56), w: sx(465.353), ml: sx(23.51) },
    { mt: vy(141.86), w: sx(465.353), ml: sx(23.51) },
];

const GRID_LEFT = gridLines[0]!.ml;
const GRID_RIGHT = gridLines[0]!.ml + gridLines[0]!.w;

/** Bars span full grid width — first slot flush with grid left (no inset past axis). */
const BAR_TRACK_LEFT = GRID_LEFT;
const BAR_TRACK_RIGHT = GRID_RIGHT;

const zeroLine = { mt: Y_ZERO, w: GRID_RIGHT - GRID_LEFT, ml: GRID_LEFT };

const LABEL_X = sx(21);

/** Map data value in [-scaleMax, scaleMax] to SVG y (positive values above zero line). */
function valueToAxisY(value: number, scaleMax: number): number {
    return Y_ZERO - (value / scaleMax) * MAX_BAR_H;
}

/** Remove float noise from computed tick values (e.g. 16.666666666666664). */
function normalizeAxisTickValue(v: number): number {
    if (!Number.isFinite(v)) return 0;
    if (Math.abs(v) < 1e-9) return 0;
    return Math.round(v * 1e6) / 1e6;
}

function driveAxisTickValues(scaleMax: number): number[] {
    const step = scaleMax / 3;
    return [
        normalizeAxisTickValue(scaleMax),
        normalizeAxisTickValue(scaleMax - step),
        normalizeAxisTickValue(scaleMax - 2 * step),
        0,
        normalizeAxisTickValue(-scaleMax + 2 * step),
        normalizeAxisTickValue(-scaleMax + step),
        normalizeAxisTickValue(-scaleMax),
    ];
}

function resolveAxisTicks(scaleMax: number, axisTicks?: readonly number[]): number[] {
    if (axisTicks && axisTicks.length > 0) {
        return axisTicks.map(normalizeAxisTickValue);
    }
    return driveAxisTickValues(scaleMax);
}

function formatDriveAxisTick(v: number, scaleMax: number): string {
    const n = normalizeAxisTickValue(v);
    if (Math.abs(n) < 1e-9) return "0";
    /** Match legacy sentiment labels: 5 → "05"; negatives stay "-5". */
    if (scaleMax <= 15 && n > 0 && n < 10) return `0${Math.round(n)}`;
    const rounded = Math.round(n);
    if (Math.abs(n - rounded) < 0.0005) return String(rounded);
    const t = Number.parseFloat(n.toFixed(2));
    return String(t);
}

/** Same solid fills as TMV gauge “Strong Buy” / “Strong Sell” bands (dark theme). */
const DRIVE_POSITIVE_BAR_FILL =
    FX_TMV_GAUGE_ZONES_DARK.find((z) => z.name === "Strong Buy")?.color ?? "#05871A";
const DRIVE_NEGATIVE_BAR_FILL =
    FX_TMV_GAUGE_ZONES_DARK.find((z) => z.name === "Strong Sell")?.color ?? "#D30000";

type BarLayout = { x: number; y: number; h: number; val: number; label: string; bw: number };

/**
 * Positives then negatives share one continuous X band [BAR_TRACK_LEFT, BAR_TRACK_RIGHT] with equal slots — no center gap.
 * Greens: left → right = largest positive … smallest; reds: smallest |neg| … largest |neg|.
 */
function layoutDriveBarsFromData(bars: DriveIndexBar[], scaleMax: number, barSlotFillRatio = 0.82) {
    const positivesAsc = [...bars]
        .filter((b) => b.value >= 0)
        .sort((a, b) => Math.abs(a.value) - Math.abs(b.value));
    const negativesAsc = [...bars]
        .filter((b) => b.value < 0)
        .sort((a, b) => Math.abs(a.value) - Math.abs(b.value));

    const greensLTR = [...positivesAsc].reverse();
    const nG = greensLTR.length;
    const nP = negativesAsc.length;
    const nTotal = nG + nP;

    const trackW = BAR_TRACK_RIGHT - BAR_TRACK_LEFT;
    if (nTotal <= 0 || trackW <= 0) {
        return { green: [] as BarLayout[], pink: [] as BarLayout[] };
    }

    const slotW = trackW / nTotal;
    const fill = Math.min(0.96, Math.max(0.38, barSlotFillRatio));
    const bw = Math.max(2.8 * SX, Math.min(BAR_W, slotW * fill));
    const inset = Math.max(0, (slotW - bw) / 2);

    const green: BarLayout[] = greensLTR.map((b, i) => {
        const absVal = Math.min(scaleMax, Math.abs(b.value));
        const h = Math.max(3 * V_SCALE, (absVal / scaleMax) * MAX_BAR_H);
        const x = BAR_TRACK_LEFT + i * slotW + inset;
        return { x, h, y: Y_ZERO - h, val: b.value, label: b.label, bw };
    });

    const pink: BarLayout[] = negativesAsc.map((b, j) => {
        const i = nG + j;
        const h = Math.min(MAX_BAR_H, (Math.min(scaleMax, Math.abs(b.value)) / scaleMax) * MAX_BAR_H);
        const x = BAR_TRACK_LEFT + i * slotW + inset;
        return { x, h, y: Y_ZERO, val: b.value, label: b.label, bw };
    });

    return { green, pink };
}

function YAxisLabels({ scaleMax, axisTicks }: { scaleMax: number; axisTicks?: readonly number[] }) {
    const ticks = resolveAxisTicks(scaleMax, axisTicks);
    return (
        <>
            {ticks.map((v, i) => (
                <text
                    key={i}
                    x={LABEL_X}
                    y={valueToAxisY(v, scaleMax)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    fill="currentColor"
                    fontFamily="'Poppins', sans-serif"
                    fontWeight={500}
                    fontSize={5.4}
                >
                    {formatDriveAxisTick(v, scaleMax)}
                </text>
            ))}
        </>
    );
}

function GridLines({ scaleMax, axisTicks }: { scaleMax: number; axisTicks?: readonly number[] }) {
    const ticks = resolveAxisTicks(scaleMax, axisTicks);
    const g0 = gridLines[0]!;
    return (
        <>
            {ticks.map((v, i) => (
                <line
                    key={`grid-${i}`}
                    x1={g0.ml}
                    y1={valueToAxisY(v, scaleMax)}
                    x2={g0.ml + g0.w}
                    y2={valueToAxisY(v, scaleMax)}
                    stroke="currentColor"
                    strokeOpacity={0.35}
                    strokeWidth={0.7}
                />
            ))}
        </>
    );
}

function BuySellCornerBadges() {
    const badgeH = 12;
    const badgeY = BUY_SELL_BADGE_Y;
    const buyW = 28;
    const sellW = 32;
    const buyX = GRID_LEFT;
    const sellX = GRID_RIGHT - sellW;
    return (
        <g style={{ pointerEvents: "none" }}>
            <rect x={buyX} y={badgeY} width={buyW} height={badgeH} rx={4} fill="#14532d" stroke="#166534" strokeWidth={0.25} />
            <text
                x={buyX + buyW / 2}
                y={badgeY + badgeH / 2}
                dominantBaseline="central"
                textAnchor="middle"
                fill="#86efac"
                fontFamily="'Poppins', sans-serif"
                fontWeight={700}
                fontSize={5.5}
            >
                BUY
            </text>
            <rect x={sellX} y={badgeY} width={sellW} height={badgeH} rx={4} fill="#450a0a" stroke="#7f1d1d" strokeWidth={0.25} />
            <text
                x={sellX + sellW / 2}
                y={badgeY + badgeH / 2}
                dominantBaseline="central"
                textAnchor="middle"
                fill="#fca5a5"
                fontFamily="'Poppins', sans-serif"
                fontWeight={700}
                fontSize={5.5}
            >
                SELL
            </text>
        </g>
    );
}

const staticGreenHeights = [47.868, 47.868, 47.868, 43.884, 43.884, 43.884, 43.884, 34.523, 28.684, 22.519, 15.678];
const staticPinkHeights = [15.678, 22.519, 28.684, 34.523, 43.884, 43.884, 43.884, 43.884, 47.868, 47.868];

function StaticDriveSvg() {
    const nSlots = 22;
    const trackW = BAR_TRACK_RIGHT - BAR_TRACK_LEFT;
    const slotW = trackW / nSlots;
    const bw = Math.max(2.8 * SX, Math.min(BAR_W, slotW * 0.82));
    const inset = Math.max(0, (slotW - bw) / 2);
    const slotX = (i: number) => BAR_TRACK_LEFT + i * slotW + inset;

    return (
        <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            width="100%"
            height="100%"
            className="block rounded-[5.8px] bg-chartInnerBg text-foreground"
            preserveAspectRatio="xMidYMid meet"
        >
            <YAxisLabels scaleMax={DEFAULT_SCALE_MAX} />
            <GridLines scaleMax={DEFAULT_SCALE_MAX} />
            <line
                x1={zeroLine.ml}
                y1={zeroLine.mt}
                x2={zeroLine.ml + zeroLine.w}
                y2={zeroLine.mt}
                stroke="currentColor"
                strokeWidth={0.7}
            />
            {staticGreenHeights.map((rawH, i) => {
                const h = rawH * V_SCALE;
                return (
                    <rect
                        key={`green-${i}`}
                        x={slotX(i)}
                        y={Y_ZERO - h}
                        width={bw}
                        height={h}
                        rx={Math.min(BAR_R, bw / 2)}
                        fill={DRIVE_POSITIVE_BAR_FILL}
                    />
                );
            })}
            <rect
                x={slotX(11)}
                y={Y_ZERO - (10.507 * V_SCALE) / 2}
                width={bw}
                height={10.507 * V_SCALE}
                rx={Math.min(BAR_R, bw / 2)}
                fill={DRIVE_NEGATIVE_BAR_FILL}
            />
            {staticPinkHeights.map((rawH, j) => {
                const i = 12 + j;
                const h = rawH * V_SCALE;
                return (
                    <rect key={`pink-${j}`} x={slotX(i)} y={Y_ZERO} width={bw} height={h} rx={Math.min(BAR_R, bw / 2)} fill={DRIVE_NEGATIVE_BAR_FILL} />
                );
            })}
            <BuySellCornerBadges />
        </svg>
    );
}

type TooltipState = { svgX: number; svgY: number; label: string; val: number; dir: "up" | "down" } | null;

const TW = 95;
const TH = 18;
const TR = 3;

function Tooltip({ tip }: { tip: TooltipState }) {
    if (!tip) return null;
    const ty =
        tip.dir === "up" ? Math.max(2, tip.svgY - TH - 4) : Math.min(CHART_H - TH - 2, tip.svgY + 4);
    const tx = Math.max(8, Math.min(CHART_W - TW - 5, tip.svgX - TW / 2));
    const valStr = Number.isInteger(tip.val) ? String(tip.val) : tip.val.toFixed(2);
    return (
        <g style={{ pointerEvents: "none" }}>
            <rect x={tx} y={ty} width={TW} height={TH} rx={TR} fill="#0f172a" fillOpacity={0.94} />
            <text
                x={tx + TW / 2}
                y={ty + TH / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontFamily="'Poppins', sans-serif"
                fontWeight={600}
                fontSize={6}
            >
                {tip.label}: {valStr}
            </text>
        </g>
    );
}

function formatBarScore(val: number): string {
    return Number.isInteger(val) ? String(val) : val.toFixed(1);
}

function BarScoreVertical({ cx, cy, val }: { cx: number; cy: number; val: number }) {
    return (
        <text
            x={cx}
            y={cy}
            transform={`rotate(-90 ${cx} ${cy})`}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontFamily="'Poppins', sans-serif"
            fontWeight={600}
            fontSize={SCORE_FONT_SIZE}
            style={{ pointerEvents: "none" }}
        >
            {formatBarScore(val)}
        </text>
    );
}

function RotatedPairLabels({ layout }: { layout: { green: BarLayout[]; pink: BarLayout[] } }) {
    const labelY = PAIR_LABEL_BASELINE_Y;
    const bars = [...layout.green, ...layout.pink].sort((a, b) => a.x - b.x);
    /** Uniform shift left so centered glyphs sit under bar middles (fixes end-anchor skew on first/last). */
    const labelShiftX = -1.35;
    return (
        <g style={{ pointerEvents: "none" }}>
            {bars.map((bar, i) => {
                const cx = bar.x + bar.bw / 2;
                const ax = cx + labelShiftX;
                return (
                    <text
                        key={`pair-${bar.label}-${i}`}
                        x={ax}
                        y={labelY}
                        fill={PAIR_LABEL_FILL}
                        fontFamily="'Poppins', sans-serif"
                        fontWeight={500}
                        fontSize={4.9}
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(-42 ${ax} ${labelY})`}
                    >
                        {bar.label}
                    </text>
                );
            })}
        </g>
    );
}

function DataDriveSvg({
    bars,
    scaleMax,
    axisTicks,
    barSlotFillRatio,
}: {
    bars: DriveIndexBar[];
    scaleMax: number;
    axisTicks?: readonly number[];
    barSlotFillRatio?: number;
}) {
    const [tooltip, setTooltip] = useState<TooltipState>(null);
    const layout = useMemo(
        () => layoutDriveBarsFromData(bars, scaleMax, barSlotFillRatio),
        [bars, scaleMax, barSlotFillRatio],
    );

    const handleBarEnter = (bar: BarLayout, dir: "up" | "down", showTooltipOnly: boolean) => {
        if (!showTooltipOnly) return;
        const anchorY = dir === "up" ? bar.y : bar.y + bar.h;
        setTooltip({
            svgX: bar.x + bar.bw / 2,
            svgY: anchorY,
            label: bar.label,
            val: bar.val,
            dir,
        });
    };

    return (
        <svg
            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
            width="100%"
            height="100%"
            className="block rounded-[5.8px] bg-chartInnerBg text-foreground"
            preserveAspectRatio="xMidYMid meet"
            onMouseLeave={() => setTooltip(null)}
        >
            <YAxisLabels scaleMax={scaleMax} axisTicks={axisTicks} />
            <GridLines scaleMax={scaleMax} axisTicks={axisTicks} />
            <line
                x1={zeroLine.ml}
                y1={Y_ZERO}
                x2={zeroLine.ml + zeroLine.w}
                y2={Y_ZERO}
                stroke="currentColor"
                strokeWidth={0.7}
            />

            {layout.green.map((bar, i) => {
                const showInline = bar.h >= MIN_BAR_H_FOR_INLINE_SCORE;
                const tooltipOnly = !showInline;
                return (
                    <g key={`g-${i}`}>
                        <rect
                            x={bar.x}
                            y={bar.y}
                            width={bar.bw}
                            height={bar.h}
                            rx={Math.min(BAR_R, bar.bw / 2)}
                            fill={DRIVE_POSITIVE_BAR_FILL}
                            className={tooltipOnly ? "cursor-pointer" : "cursor-default"}
                            onMouseEnter={() => handleBarEnter(bar, "up", tooltipOnly)}
                            onMouseLeave={() => tooltipOnly && setTooltip(null)}
                        />
                        {showInline ? (
                            <BarScoreVertical
                                cx={bar.x + bar.bw / 2}
                                cy={bar.y + bar.h / 2}
                                val={bar.val}
                            />
                        ) : null}
                    </g>
                );
            })}

            {layout.pink.map((bar, i) => {
                const showInline = bar.h >= MIN_BAR_H_FOR_INLINE_SCORE;
                const tooltipOnly = !showInline;
                return (
                    <g key={`p-${i}`}>
                        <rect
                            x={bar.x}
                            y={bar.y}
                            width={bar.bw}
                            height={bar.h}
                            rx={Math.min(BAR_R, bar.bw / 2)}
                            fill={DRIVE_NEGATIVE_BAR_FILL}
                            className={tooltipOnly ? "cursor-pointer" : "cursor-default"}
                            onMouseEnter={() => handleBarEnter(bar, "down", tooltipOnly)}
                            onMouseLeave={() => tooltipOnly && setTooltip(null)}
                        />
                        {showInline ? (
                            <BarScoreVertical
                                cx={bar.x + bar.bw / 2}
                                cy={bar.y + bar.h / 2}
                                val={bar.val}
                            />
                        ) : null}
                    </g>
                );
            })}

            <BuySellCornerBadges />
            <RotatedPairLabels layout={layout} />
            <Tooltip tip={tooltip} />
        </svg>
    );
}

export default function DriveIndexChart({
    title,
    bars,
    scaleMax = DEFAULT_SCALE_MAX,
    axisTicks,
    barSlotFillRatio,
}: DriveIndexChartProps) {
    const isData = bars !== undefined && bars !== null;

    return (
        <Section padding={false} className="w-full min-w-0">
            <div className="w-full min-w-0 horizontal-scroll bg-darkGrey rounded-[12px] text-foreground">
                <div className="w-full min-w-0 flex flex-col gap-5 overflow-hidden p-3">
                    <div className="flex items-center gap-2 w-full min-h-[24px]">
                        <div className="w-[10.3px] h-[11.5px] bg-primary rounded-full shrink-0" />
                        <p className="font-bold text-[min(1.8vw,18px)] leading-tight">{title}</p>
                    </div>

                    <div className="w-full h-px bg-stroke" />

                    <div
                        className="w-full min-h-0 text-foreground"
                        style={{ aspectRatio: `${CHART_W} / ${CHART_H}` }}
                    >
                        {isData ? (
                            <DataDriveSvg
                                bars={bars}
                                scaleMax={scaleMax}
                                axisTicks={axisTicks}
                                barSlotFillRatio={barSlotFillRatio}
                            />
                        ) : (
                            <StaticDriveSvg />
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
}
