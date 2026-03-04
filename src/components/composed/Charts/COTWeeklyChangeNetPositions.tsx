"use client";

import { Section } from "@/components/ui/layout";

// Exact pixel positions from Figma design converted to percentages
// Base Container: 1124 x 519
// Inner frame (Frame52): centered, top 15, width 1105, height 467

const yAxisLabels = [
    { text: "15", left: "1.41%", top: "15.75%", fontSize: "min(1.4vw, 16px)" },
    { text: "10", left: "1.41%", top: "26.29%", fontSize: "min(1.4vw, 16px)" },
    { text: "05", left: "1.23%", top: "36.83%", fontSize: "min(1.4vw, 16px)" },
    { text: "0", left: "2.12%", top: "47.38%", fontSize: "min(1.4vw, 16px)" },
    { text: "-5", left: "0.78%", top: "57.93%", fontSize: "min(1.4vw, 16px)" },
    { text: "-10", left: "0.96%", top: "68.47%", fontSize: "min(1.2vw, 14px)" },
];

const gridLines = [
    { top: "18.07%", opacity: 0.35 },
    { top: "28.61%", opacity: 0.35 },
    { top: "39.16%", opacity: 0.35 },
    { top: "49.71%", opacity: 0.35 },
    { top: "60.25%", opacity: 0.35 },
    { top: "70.80%", opacity: 1 },
];

const greenBars = [
    { left: "6.61%", top: "33.83%", height: "15.85%" },
    { left: "18.55%", top: "39.83%", height: "9.85%" },
    { left: "30.50%", top: "19.91%", height: "29.76%" },
    { left: "42.44%", top: "33.83%", height: "15.85%" },
    { left: "54.30%", top: "39.83%", height: "9.85%" },
    { left: "66.24%", top: "19.91%", height: "29.76%" },
    { left: "78.10%", top: "40.69%", height: "8.99%" },
    { left: "89.95%", top: "28.48%", height: "21.20%" },
];

const redBars = [
    { left: "10.68%", top: "49.89%", height: "10.28%" },
    { left: "35.11%", top: "49.89%", height: "4.93%" },
    { left: "45.52%", top: "49.89%", height: "7.07%" },
    { left: "49.77%", top: "49.89%", height: "13.49%" },
    { left: "58.73%", top: "49.89%", height: "13.49%" },
    { left: "71.58%", top: "49.89%", height: "13.49%" },
    { left: "84.43%", top: "49.89%", height: "10.28%" },
    { left: "95.93%", top: "49.89%", height: "10.28%" },
];

const percentMarkers = [
    { left: "7.34%", top: "28.99%" },
    { left: "11.41%", top: "61.54%" },
    { left: "19.28%", top: "34.98%" },
    { left: "31.23%", top: "15.28%" },
    { left: "35.84%", top: "55.75%" },
    { left: "43.17%", top: "29.20%" },
    { left: "46.25%", top: "58.54%" },
    { left: "50.50%", top: "64.53%" },
    { left: "55.03%", top: "33.91%" },
    { left: "59.46%", top: "64.53%" },
    { left: "66.97%", top: "14.43%" },
    { left: "72.31%", top: "64.53%" },
    { left: "78.83%", top: "34.98%" },
    { left: "85.16%", top: "60.89%" },
    { left: "90.68%", top: "23.21%" },
    { left: "96.66%", top: "60.89%" },
];

const xLabels = [
    { text: " USD", left: "9.54%", top: "74.01%", w: "2.92%", h: "6.70%" },
    { text: "EUR", left: "14.62%", top: "74.09%", w: "2.58%", h: "5.98%" },
    { text: "GBP", left: "20.61%", top: "73.95%", w: "2.65%", h: "6.12%" },
    { text: "CAD", left: "27.00%", top: "73.90%", w: "2.72%", h: "6.27%" },
    { text: "JPY", left: "32.67%", top: "73.97%", w: "2.45%", h: "5.70%" },
    { text: "CHF", left: "37.72%", top: "73.97%", w: "2.65%", h: "6.12%" },
    { text: "AUD", left: "42.78%", top: "74.02%", w: "2.72%", h: "6.27%" },
    { text: "NEW DEALAND DOLLAR", left: "47.98%", top: "73.94%", w: "10.20%", h: "22.14%" },
    { text: "GOLD", left: "53.82%", top: "74.03%", w: "3.26%", h: "7.41%" },
    { text: "CRUDE OIL", left: "59.68%", top: "73.96%", w: "5.28%", h: "11.70%" },
    { text: "SILVER", left: "65.63%", top: "74.02%", w: "3.66%", h: "8.27%" },
    { text: "NASDAQ 100", left: "70.96%", top: "73.94%", w: "5.89%", h: "12.99%" },
    { text: "WHEAT SRW", left: "76.78%", top: "73.94%", w: "5.82%", h: "12.84%" },
    { text: "CORN", left: "82.02%", top: "73.67%", w: "3.32%", h: "7.55%" },
    { text: "COTTON", left: "87.61%", top: "73.99%", w: "4.40%", h: "9.84%" },
    { text: "SUGAR", left: "93.99%", top: "74.01%", w: "3.73%", h: "8.41%" },
];

export default function COTWeeklyChangeNetPositions() {
    return (
        <Section padding={false} className="w-full">
            <div className="w-full horizontal-scroll">
                <div
                    className="relative min-w-[800px] xl:min-w-0 w-full max-w-[1124px] mx-auto aspect-[1124/519] overflow-hidden"
                >
                {/* Title */}
                <p
                    className="absolute top-[5.20%] font-['Inter',sans-serif] font-bold leading-6 text-[min(1.8vw,20px)] text-white whitespace-nowrap"
                    style={{ left: "calc(50% - min(19.6vw, 220.5px))" }}
                >
                    Weekly Change Net Non Commercial Positions
                </p>

                {/* Y-axis labels */}
                {yAxisLabels.map((label, i) => (
                    <p
                        key={`y-${i}`}
                        className="absolute font-['Inter',sans-serif] font-normal leading-[22px] text-white tracking-[-0.18px] whitespace-nowrap"
                        style={{
                            left: label.left,
                            top: label.top,
                            fontSize: label.fontSize,
                        }}
                    >
                        {label.text}
                    </p>
                ))}

                {/* Grid lines */}
                {gridLines.map((line, i) => (
                    <div
                        key={`grid-${i}`}
                        className="absolute left-[4.71%] h-px"
                        style={{ top: line.top, width: "91.81%" }}
                    >
                        <svg
                            width="100%"
                            height="1"
                            fill="none"
                            preserveAspectRatio="none"
                            viewBox="0 0 1013.61 1"
                            className="block"
                        >
                            <path
                                d="M1013.61 0.5H0"
                                stroke="white"
                                strokeOpacity={line.opacity}
                            />
                        </svg>
                    </div>
                ))}

                {/* Green bars */}
                {greenBars.map((bar, i) => (
                    <div
                        key={`gbar-${i}`}
                        className="absolute w-[1.45%] bg-[#34a853]"
                        style={{
                            left: bar.left,
                            top: bar.top,
                            height: bar.height,
                        }}
                    />
                ))}

                {/* Red bars */}
                {redBars.map((bar, i) => (
                    <div
                        key={`rbar-${i}`}
                        className="absolute w-[1.45%] bg-red-500"
                        style={{
                            left: bar.left,
                            top: bar.top,
                            height: bar.height,
                        }}
                    />
                ))}

                {/* % markers */}
                {percentMarkers.map((m, i) => (
                    <span
                        key={`pct-${i}`}
                        className="absolute -translate-x-1/2 font-['Poppins',sans-serif] font-medium leading-[1.4] text-[min(1.1vw,12px)] text-white text-center"
                        style={{ left: m.left, top: m.top, width: "1.45%" }}
                    >
                        %
                    </span>
                ))}

                {/* X-axis labels (rotated) */}
                {xLabels.map((label, i) => (
                    <div
                        key={`xlabel-${i}`}
                        className="absolute -translate-x-full flex items-center justify-center"
                        style={{
                            left: label.left,
                            top: label.top,
                            width: label.w,
                            height: label.h,
                        }}
                    >
                        <div className="shrink-0" style={{ transform: "rotate(-41.88deg)" }}>
                            <p className="font-['Inter',sans-serif] font-normal leading-4 text-[min(1.1vw,12px)] text-white text-right tracking-[-0.12px] whitespace-nowrap">
                                {label.text}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </Section>
    );
}
