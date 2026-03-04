"use client";

import { Section } from "@/components/ui/layout";

// Exact pixel positions from Figma design converted to percentages
// Base Container: 1124 x 666

const labels = [
    { text: "US DOLLAR (USD)", left: "8.55%", top: "15.77%" },
    { text: "EURO FX (EUR)", left: "10.04%", top: "20.71%" },
    { text: "BRITISH POUND (GBP)", left: "6.09%", top: "25.66%" },
    { text: "CANADIAN DOLLAR (CAD)", left: "3.81%", top: "30.60%" },
    { text: "JAPANESE YEN (JPY)", left: "6.80%", top: "35.55%" },
    { text: "SWISS FRANC (CHF)", left: "6.97%", top: "40.49%" },
    { text: "AUSTRALIAN DOLLAR (AUD)", left: "3.02%", top: "45.44%" },
    { text: "NEW DEALAND DOLLAR", left: "5.74%", top: "50.38%" },
    { text: "GOLD", left: "15.13%", top: "55.33%" },
    { text: "CRUDE OIL", left: "12.41%", top: "60.28%" },
    { text: "SILVER", left: "14.60%", top: "65.22%" },
    { text: "NASDAQ 100", left: "11.27%", top: "70.17%" },
    { text: "WHEAT SRW", left: "11.44%", top: "75.11%" },
    { text: "CORN", left: "14.95%", top: "80.06%" },
    { text: "COTTON", left: "13.46%", top: "85.00%" },
    { text: "SUGAR", left: "14.34%", top: "89.95%" },
];

const greenBarTops = [
    "15.95%", "20.91%", "25.71%", "30.67%", "35.62%", "40.58%", "45.53%",
    "50.49%", "55.44%", "60.40%", "65.35%", "70.31%", "75.26%", "80.22%",
    "85.17%", "90.13%",
];

const redBars = [
    { left: "33.04%", top: "15.95%", width: "63.88%" },
    { left: "52.52%", top: "20.91%", width: "44.40%" },
    { left: "56.97%", top: "25.71%", width: "39.95%" },
    { left: "62.75%", top: "30.67%", width: "34.16%" },
    { left: "33.04%", top: "35.62%", width: "63.88%" },
    { left: "52.52%", top: "40.58%", width: "44.40%" },
    { left: "56.97%", top: "45.53%", width: "39.95%" },
    { left: "62.75%", top: "50.49%", width: "34.16%" },
    { left: "38.02%", top: "55.44%", width: "58.90%" },
    { left: "65.42%", top: "60.40%", width: "31.49%" },
    { left: "44.78%", top: "80.22%", width: "52.14%" },
    { left: "62.75%", top: "90.13%", width: "34.16%" },
];

const longLabels = [
    { left: "28.91%", top: "16.55%", value: "72" },
    { left: "43.29%", top: "21.49%", value: "72" },
    { left: "43.29%", top: "26.44%", value: "72" },
    { left: "43.29%", top: "31.38%", value: "72" },
    { left: "28.91%", top: "36.33%", value: "72" },
    { left: "43.29%", top: "41.27%", value: "72" },
    { left: "43.29%", top: "46.22%", value: "72" },
    { left: "43.29%", top: "51.17%", value: "72" },
    { left: "30.84%", top: "56.11%", value: "72" },
    { left: "43.29%", top: "61.06%", value: "72" },
    { left: "43.29%", top: "66.00%", value: "72" },
    { left: "43.29%", top: "70.95%", value: "72" },
    { left: "43.29%", top: "75.89%", value: "72" },
    { left: "43.29%", top: "80.84%", value: "72" },
    { left: "43.29%", top: "85.78%", value: "72" },
    { left: "43.29%", top: "90.73%", value: "72" },
];

const shortLabels = [
    { left: "87.85%", top: "16.55%", value: "43" },
    { left: "87.85%", top: "21.49%", value: "43" },
    { left: "87.85%", top: "26.44%", value: "43" },
    { left: "87.85%", top: "31.38%", value: "43" },
    { left: "87.85%", top: "36.33%", value: "43" },
    { left: "87.85%", top: "41.27%", value: "43" },
    { left: "87.85%", top: "46.22%", value: "43" },
    { left: "87.85%", top: "51.17%", value: "43" },
    { left: "87.85%", top: "56.11%", value: "43" },
    { left: "87.85%", top: "61.06%", value: "43" },
    { left: "87.85%", top: "66.00%", value: "43" },
    { left: "87.85%", top: "80.84%", value: "43" },
    { left: "87.85%", top: "90.73%", value: "43" },
];

const xAxisTicks = [
    { left: "19.60%", value: "0" },
    { left: "37.75%", value: "25" },
    { left: "56.70%", value: "50" },
    { left: "75.73%", value: "75" },
    { left: "94.67%", value: "100" },
];

export default function COTNonComLongVsShort() {
    return (
        <Section padding={false} className="w-full">
            <div className="w-full horizontal-scroll">
                <div
                    className="relative min-w-[800px] xl:min-w-0 w-full max-w-[1124px] mx-auto aspect-[1124/666] overflow-hidden"
                >

                    <div
                        className="absolute left-[37.10%] top-[3.60%] flex items-center justify-center"
                    >
                        <p className="font-['Inter',sans-serif] font-medium leading-[1.2] text-[min(1.8vw,20px)] text-white text-center whitespace-nowrap">
                            Non Com Long % vs Short %
                        </p>
                    </div>

                    {/* Legend - Green box */}
                    <div
                        className="absolute left-[41.55%] top-[9.65%] w-[1.82%] h-[2.03%] bg-[#34a853]"
                    />
                    {/* Legend - Red box */}
                    <div
                        className="absolute left-[51.78%] top-[9.66%] w-[1.82%] h-[2.03%] bg-red-500"
                    />
                    {/* Legend - Long% text */}
                    <p
                        className="absolute left-[46.17%] top-[9.36%] -translate-x-1/2 font-['Inter',sans-serif] font-normal leading-[1.4] text-[min(1.2vw,14px)] text-white text-center tracking-[-0.16px] whitespace-nowrap"
                    >
                        Long%
                    </p>
                    {/* Legend - Short% text */}
                    <p
                        className="absolute left-[56.63%] top-[9.36%] -translate-x-1/2 font-['Inter',sans-serif] font-normal leading-[1.4] text-[min(1.2vw,14px)] text-white text-center tracking-[-0.16px] whitespace-nowrap"
                    >
                        Short%
                    </p>

                    {/* Row labels */}
                    {labels.map((l, i) => (
                        <p
                            key={`label-${i}`}
                            className="absolute font-['Poppins',sans-serif] font-medium leading-[1.4] text-[min(1.1vw,12px)] text-white whitespace-nowrap"
                            style={{ left: l.left, top: l.top }}
                        >
                            {l.text}
                        </p>
                    ))}

                    {/* Green bars (full width) */}
                    {greenBarTops.map((top, i) => (
                        <div
                            key={`green-${i}`}
                            className="absolute left-[19.61%] w-[77.31%] h-[3%] bg-[#34a853]"
                            style={{ top }}
                        />
                    ))}

                    {/* Red bars (overlay from right) */}
                    {redBars.map((bar, i) => (
                        <div
                            key={`red-${i}`}
                            className="absolute h-[3%] bg-red-500"
                            style={{ left: bar.left, top: bar.top, width: bar.width }}
                        />
                    ))}

                    {/* Long value labels */}
                    {longLabels.map((l, i) => (
                        <p
                            key={`long-${i}`}
                            className="absolute -translate-x-full font-['Poppins',sans-serif] font-semibold leading-[1.4] text-[min(1.1vw,12px)] text-white text-right"
                            style={{ left: l.left, top: l.top }}
                        >
                            {l.value}
                        </p>
                    ))}

                    {/* Short value labels */}
                    {shortLabels.map((l, i) => (
                        <p
                            key={`short-${i}`}
                            className="absolute -translate-x-full font-['Poppins',sans-serif] font-semibold leading-[1.4] text-[min(1.1vw,12px)] text-white text-right"
                            style={{ left: l.left, top: l.top }}
                        >
                            {l.value}
                        </p>
                    ))}

                    {/* X-axis tick labels */}
                    {xAxisTicks.map((tick, i) => (
                        <p
                            key={`tick-${i}`}
                            className="absolute font-['Poppins',sans-serif] font-medium leading-[1.4] text-[min(0.9vw,10.381px)] text-white whitespace-nowrap"
                            style={{ left: tick.left, top: "94.76%" }}
                        >
                            {tick.value}
                        </p>
                    ))}
                </div>
            </div>
        </Section>
    );
}
