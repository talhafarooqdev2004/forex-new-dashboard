"use client";

import React from "react";
import { Section } from "@/components/ui/layout";

// Exact Figma bar data extracted from Group24-68
// Format: [topPct, bottomPct, leftPct, rightPct]
// Blue bars (M15) - #2b7fff
const blueBars: [number, number, number, number][] = [
    [40.5, 22, 7.94, 91.34],   // USD: 60h
    [31.12, 22, 15.15, 84.13], // EUR: 75h
    [49.87, 22, 22.36, 76.92], // GBP: 45h
    [59.25, 22, 29.57, 69.71], // CAD: 30h
    [68.62, 22, 36.79, 62.5],  // JPY: 15h
    [40.5, 22, 44, 55.29],     // JPY: 60h
    [31.12, 22, 51.21, 48.08], // CAD: 75h
    [59.25, 22, 58.42, 40.87], // JPY: 30h
    [68.62, 22, 65.63, 33.66], // NZD: 15h
    [21.75, 22, 72.84, 26.45], // XAU: 90h
    [49.87, 22, 80.05, 19.23], // XAU: 45h
    [59.25, 22, 87.26, 12.02], // RTC: 30h
    [40.5, 22, 94.47, 4.81],   // RTC: 60h
];

// Orange bars (M30) - #fe9a00
const orangeBars: [number, number, number, number][] = [
    [59.25, 22, 9.02, 90.27],   // USD: 30h
    [21.75, 22, 16.23, 83.06],  // EUR: 90h
    [59.25, 22, 23.44, 75.85],  // GBP: 30h
    [49.87, 22, 30.65, 68.64],  // CAD: 45h
    [59.25, 22, 37.86, 61.43],  // JPY: 30h
    [31.12, 22, 45.07, 54.21],  // JPY: 75h
    [40.5, 22, 52.28, 47],      // CAD: 60h
    [68.62, 22, 59.49, 39.79],  // JPY: 15h
    [59.25, 22, 66.7, 32.58],   // NZD: 30h
    [31.12, 22, 73.91, 25.37],  // XAU: 75h
    [40.5, 22, 81.12, 18.16],   // XAU: 60h
    [59.25, 22, 88.33, 10.95],  // RTC: 30h
    [49.87, 22, 95.54, 3.74],   // RTC: 45h
];

// Green bars (H1) - #00bc7d
const greenBars: [number, number, number, number][] = [
    [31.12, 22, 10.09, 89.19],  // USD: 75h
    [40.5, 22, 17.3, 81.98],    // EUR: 60h
    [68.62, 22, 24.51, 74.77],  // GBP: 15h
    [40.5, 22, 31.72, 67.56],   // CAD: 60h
    [49.87, 22, 38.93, 60.35],  // JPY: 45h
    [21.75, 22, 46.14, 53.14],  // JPY: 90h
    [49.87, 22, 53.35, 45.93],  // CAD: 45h
    [49.87, 22, 60.56, 38.72],  // JPY: 45h
    [68.62, 22, 67.78, 31.51],  // NZD: 15h
    [40.5, 22, 74.99, 24.3],    // XAU: 60h
    [31.12, 22, 82.2, 17.09],   // XAU: 75h
    [59.25, 22, 89.41, 9.88],   // RTC: 30h
    [31.12, 22, 96.62, 2.67],   // RTC: 75h
];

// Currency labels with their left% positions (from Group4-16)
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

function Bar({
    top,
    bottom,
    left,
    right,
    color,
}: {
    top: number;
    bottom: number;
    left: number;
    right: number;
    color: string;
}) {
    return (
        <div
            className="absolute rounded-t-[2px]"
            style={{
                top: `${top}%`,
                bottom: `${bottom}%`,
                left: `${left}%`,
                right: `${right}%`,
                backgroundColor: color,
            }}
        />
    );
}

export default function TrendAlignmentScoreChart() {
    return (
        <Section padding={false} className="w-full">
            <div className="w-full horizontal-scroll bg-darkGrey rounded-[12px] text-foreground">
                <div
                    className="relative min-w-[800px] xl:min-w-0 w-full max-w-[1124px] mx-auto aspect-[1124/250] overflow-hidden flex flex-col p-[16.8px] pb-[0.8px] gap-4"
                >
                    {/* Title */}
                    <div className="w-full h-5">
                        <p
                            className="text-center w-full font-bold text-[min(1.8vw,20px)] leading-6"
                        >
                            Trend Alignment Score
                        </p>
                    </div>

                    {/* BarChart container */}
                    <div className="relative flex-1 w-full">
                        {/* Dashed grid lines */}
                        {[3, 31.12, 78].map((pct, i) => (
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
                                    <path
                                        d="M0 0.5H1022.13"
                                        stroke="#6A7282"
                                        strokeDasharray="3 3"
                                    />
                                </svg>
                            </div>
                        ))}

                        {/* Y-axis labels */}
                        <p className="absolute text-right text-[10px] top-[0.53%] left-[4.45%] w-[2%]">8</p>
                        <p className="absolute text-right text-[10px] top-[17.72%] left-[4.45%] w-[2%]">6</p>

                        {/* Bars */}
                        {blueBars.map((bar, i) => (
                            <Bar key={`blue-${i}`} top={bar[0]} bottom={bar[1]} left={bar[2]} right={bar[3]} color="#2b7fff" />
                        ))}
                        {orangeBars.map((bar, i) => (
                            <Bar key={`orange-${i}`} top={bar[0]} bottom={bar[1]} left={bar[2]} right={bar[3]} color="#fe9a00" />
                        ))}
                        {greenBars.map((bar, i) => (
                            <Bar key={`green-${i}`} top={bar[0]} bottom={bar[1]} left={bar[2]} right={bar[3]} color="#00bc7d" />
                        ))}

                        {/* Currency labels */}
                        {currencyLabels.map((item, i) => (
                            <p
                                key={`label-${i}`}
                                className="absolute text-center text-[10px] font-medium top-[81.19%]"
                                style={{ left: `${item.leftPct}%`, right: `${item.rightPct}%` }}
                            >
                                {item.label}
                            </p>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-row justify-center gap-4 pb-2">
                        <LegendItem color="#2b7fff" label="M15" />
                        <LegendItem color="#fe9a00" label="M30" />
                        <LegendItem color="#00bc7d" label="H1" />
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
            <span className="text-[9px] font-normal leading-[13.5px]">{label}</span>
        </div>
    );
}
