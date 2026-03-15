"use client";

import React from "react";
import { Section } from "@/components/ui/layout";

interface DriveIndexChartProps {
    title: string;
}

// Green bars (positive, above zero line) - from Figma exact data
const greenBars = [
    { ml: 27.52, h: 47.868, mt: 38.5, val: "40" },
    { ml: 40.43, h: 47.868, mt: 38.5, val: "40" },
    { ml: 53.33, h: 47.868, mt: 38.5, val: "40" },
    { ml: 66.24, h: 43.884, mt: 42.48, val: "39" },
    { ml: 79.14, h: 43.884, mt: 42.48, val: "39" },
    { ml: 92.05, h: 43.884, mt: 42.48, val: "39" },
    { ml: 104.95, h: 43.884, mt: 42.48, val: "39" },
    { ml: 117.85, h: 34.523, mt: 51.84, val: "36" },
    { ml: 130.76, h: 28.684, mt: 57.68, val: "30" },
    { ml: 143.66, h: 22.519, mt: 63.84, val: "26" },
    { ml: 156.57, h: 15.678, mt: 70.69, val: "17" },
];

// Green bar label positions from Figma
const greenLabels = [
    { ml: 28.9, mt: 58.62, val: "40" },
    { ml: 41.81, mt: 58.62, val: "40" },
    { ml: 54.71, mt: 58.62, val: "40" },
    { ml: 67.62, mt: 60.23, val: "39" },
    { ml: 80.52, mt: 60.23, val: "39" },
    { ml: 93.43, mt: 60.23, val: "39" },
    { ml: 106.33, mt: 60.23, val: "39" },
    { ml: 119.23, mt: 64.91, val: "36" },
    { ml: 132.14, mt: 67.83, val: "30" },
    { ml: 145.05, mt: 70.91, val: "26" },
    { ml: 157.94, mt: 75.09, val: "17" },
];

// Red bar (single, near zero)
const redBar = { ml: 246.1, h: 10.507, mt: 75.86, val: "02" };

// Pink bars (negative, below zero line) - from Figma exact data
const pinkBars = [
    { ml: 308.38, h: 15.678, val: "-17" },
    { ml: 321.29, h: 22.519, val: "-26" },
    { ml: 334.19, h: 28.684, val: "-30" },
    { ml: 347.1, h: 34.523, val: "-36" },
    { ml: 360, h: 43.884, val: "-39" },
    { ml: 372.91, h: 43.884, val: "-39" },
    { ml: 385.81, h: 43.884, val: "-39" },
    { ml: 398.72, h: 43.884, val: "-39" },
    { ml: 411.62, h: 47.868, val: "-40" },
    { ml: 424.52, h: 47.868, val: "-40" },
    { ml: 437.43, h: 47.868, val: "-40" },
];

// Grid line positions (from Figma)
const gridLines = [
    { mt: 31.47, w: 465.353, ml: 23.51 },
    { mt: 49.77, w: 465.353, ml: 23.51 },
    { mt: 68.07, w: 465.353, ml: 23.51 },
    { mt: 86.36, w: 465.353, ml: 23.51 },
    { mt: 104.66, w: 465.353, ml: 23.51 },
];

// Zero line
const zeroLine = { mt: 123.56, w: 446.262, ml: 42.67 };

// Y-axis labels (from Figma)
const yLabels = [
    { text: "15", ml: 6.6, mt: 27.53 },
    { text: "10", ml: 6.6, mt: 45.82 },
    { text: "05", ml: 6.6, mt: 64.11 },
    { text: "0", ml: 11.12, mt: 82.4 },
    { text: "-5", ml: 2.09, mt: 100.69 },
    { text: "-10", ml: 6.6, mt: 118.99 },
];

const CHART_W = 506.959;
const CHART_H = 180.412;
const BAR_W = 7.374;
const BAR_R = 5.856;
const PINK_MT = 68.59; // all pink bars start at this mt (top of growing-down area)

export default function DriveIndexChart({ title }: DriveIndexChartProps) {
    return (
        <Section padding={false} className="w-full">
            <div className="w-full horizontal-scroll bg-darkGrey rounded-[12px] text-foreground">
                <div
                    className="relative min-w-[450px] xl:min-w-0 w-full max-w-ful mx-auto aspect-[507/250] overflow-hidden flex flex-col p-4 gap-4"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between w-full h-[28.8px]">
                        <div className="flex items-center gap-2">
                            <div className="w-[10.3px] h-[11.5px] bg-primary rounded-full" />
                            <p className="font-bold text-[min(1.8vw,20px)] leading-6">
                                {title}
                            </p>
                        </div>
                        {/* Three dot icon */}
                        <svg width="20.7" height="23" viewBox="0 0 20.687 23.0457" fill="none">
                            <circle cx="10.34" cy="5.76" r="1.5" stroke="#6A7282" strokeWidth="1.82" fill="none" />
                            <circle cx="10.34" cy="11.52" r="1.5" stroke="#6A7282" strokeWidth="1.82" fill="none" />
                            <circle cx="10.34" cy="17.28" r="1.5" stroke="#6A7282" strokeWidth="1.82" fill="none" />
                        </svg>
                    </div>

                    {/* Divider line */}
                    <div className="w-full h-px bg-stroke" />

                    {/* Chart area */}
                    <div className="relative flex-1 w-full text-foreground">
                        <svg
                            viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                            width="100%"
                            height="100%"
                            className="block rounded-[5.8px] bg-chartInnerBg"
                            preserveAspectRatio="xMidYMid meet"
                        >
                            {/* EUR/USD label */}
                            <text x={CHART_W / 2} y={15} textAnchor="middle" fill="currentColor" fontFamily="'Arimo', sans-serif" fontWeight={400} fontSize={14.6}>EUR/USD</text>

                            {/* Y-axis labels */}
                            {yLabels.map((l, i) => (
                                <text key={i} x={l.ml} y={l.mt + 6} fill="currentColor" fontFamily="'Poppins', sans-serif" fontWeight={500} fontSize={5.7}>{l.text}</text>
                            ))}

                            {/* Grid lines */}
                            {gridLines.map((g, i) => (
                                <line key={`grid-${i}`} x1={g.ml} y1={g.mt} x2={g.ml + g.w} y2={g.mt} stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.7} />
                            ))}

                            {/* Zero line */}
                            <line x1={zeroLine.ml} y1={zeroLine.mt} x2={zeroLine.ml + zeroLine.w} y2={zeroLine.mt} stroke="currentColor" strokeWidth={0.7} />

                            {/* Green bars */}
                            {greenBars.map((bar, i) => (
                                <rect key={`green-${i}`} x={bar.ml} y={bar.mt} width={BAR_W} height={bar.h} rx={BAR_R} fill="#34a853" />
                            ))}

                            {/* Green bar value labels */}
                            {greenLabels.map((l, i) => (
                                <g key={`gl-${i}`} transform={`translate(${l.ml + 1.84}, ${l.mt + 3.8}) rotate(-90)`}>
                                    <text fill="currentColor" fontFamily="'Poppins', sans-serif" fontWeight={500} fontSize={5.1} textAnchor="middle" dominantBaseline="middle">{l.val}</text>
                                </g>
                            ))}

                            {/* Red bar */}
                            <rect x={redBar.ml} y={redBar.mt} width={BAR_W} height={redBar.h} rx={BAR_R} fill="red" />
                            <g transform={`translate(${redBar.ml + 3.5}, ${redBar.mt + 5.2}) rotate(-90)`}>
                                <text fill="currentColor" fontFamily="'Poppins', sans-serif" fontWeight={500} fontSize={5.1} textAnchor="middle" dominantBaseline="middle">02</text>
                            </g>

                            {/* Pink bars */}
                            {pinkBars.map((bar, i) => (
                                <rect key={`pink-${i}`} x={bar.ml} y={PINK_MT} width={BAR_W} height={bar.h} rx={BAR_R} fill="#ffb5c0" />
                            ))}

                            {/* Pink bar value labels */}
                            {pinkBars.map((bar, i) => (
                                <g key={`pl-${i}`} transform={`translate(${bar.ml + 3.1}, ${PINK_MT + bar.h / 2 + 4}) rotate(-90)`}>
                                    <text fill="currentColor" fontFamily="'Poppins', sans-serif" fontWeight={500} fontSize={5.1} textAnchor="middle" dominantBaseline="middle">{bar.val}</text>
                                </g>
                            ))}
                        </svg>

                        {/* SELL badge + price footer */}
                        <div className="absolute bottom-2 left-0 right-0 px-4 flex items-center justify-between">
                            <div className="bg-[#fb2c3633] rounded-[4px] px-2 py-1">
                                <span className="text-[#ff6467] text-[12px] font-normal leading-4">SELL</span>
                            </div>
                            <span className="text-secondary text-[12px] font-normal leading-4">1.1846</span>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
}
