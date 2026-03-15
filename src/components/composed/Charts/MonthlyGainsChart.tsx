"use client";

import React from "react";

export default function MonthlyGainsChart() {
    // Bar data: [left, top, height, color, label, labelLeft, labelTop, redBg]
    const bars = [
        { left: 108, top: 165, h: 121, color: "#00c663", labelLeft: 96, labelTop: 139, redBg: false },
        { left: 150, top: 126, h: 160, color: "#00c663", labelLeft: 138, labelTop: 100, redBg: false },
        { left: 192, top: 197, h: 89, color: "#00c663", labelLeft: 180, labelTop: 172, redBg: false },
        { left: 234, top: 149, h: 137, color: "#00c663", labelLeft: 222, labelTop: 126, redBg: false },
        { left: 276, top: 177, h: 109, color: "#00c663", labelLeft: 266, labelTop: 152, redBg: false },
        { left: 318, top: 126, h: 160, color: "#fa003f", labelLeft: 306, labelTop: 96, redBg: true },
        { left: 360, top: 197, h: 89, color: "#00c663", labelLeft: 347, labelTop: 172, redBg: false },
        { left: 402, top: 149, h: 137, color: "#00c663", labelLeft: 390, labelTop: 126, redBg: false },
        { left: 444, top: 177, h: 109, color: "#00c663", labelLeft: 432, labelTop: 152, redBg: false },
        { left: 486, top: 126, h: 160, color: "#00c663", labelLeft: 474, labelTop: 100, redBg: false },
        { left: 528, top: 197, h: 89, color: "#00c663", labelLeft: 514, labelTop: 172, redBg: false },
        { left: 570, top: 149, h: 137, color: "#00c663", labelLeft: 558, labelTop: 123, redBg: false },
    ];

    const xLabels = [
        { left: 112, label: "Sep" }, { left: 152, label: "Oct" },
        { left: 193, label: "Nov" }, { left: 233, label: "Dec" },
        { left: 273, label: "Jan" }, { left: 313, label: "Feb" },
        { left: 353, label: "Mar" }, { left: 393, label: "Apr" },
        { left: 433, label: "May" }, { left: 473, label: "Jun" },
        { left: 513, label: "Jul" }, { left: 553, label: "Aug" },
    ];

    const hGridTops = [86, 126, 166, 206, 246, 286];
    const vGridLefts = [82, 122, 162, 202, 242, 282, 322, 362, 402, 442, 482, 522, 562, 605];

    return (
        <div className="bg-darkGrey relative rounded-[12px] h-[350px] w-full horizontal-scroll">
            <div className="relative min-w-[661px] h-full mx-auto">
            {/* Title */}
            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-[37px] not-italic text-[20px] text-foreground top-[22px]">Monthly Gains (Years)</p>

            {/* Horizontal grid lines */}
            {hGridTops.map((top) => (
                <div key={top} className="absolute left-[82px] w-[523px]" style={{ top: `${top}px`, height: 0 }}>
                    <div className="absolute inset-[-1px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 523 1">
                            <line stroke="#6A7282" x2="523" y1="0.5" y2="0.5" />
                        </svg>
                    </div>
                </div>
            ))}

            {/* Vertical grid lines */}
            {vGridLefts.map((left) => (
                <div key={left} className="absolute flex items-center justify-center w-0 top-[86px] h-[200px]" style={{ left: `${left}px` }}>
                    <div className="flex-none rotate-90">
                        <div className="relative w-[200px]" style={{ height: 0 }}>
                            <div className="absolute inset-[-1px_0_0_0]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 200 1">
                                    <line stroke="#6A7282" x2="200" y1="0.5" y2="0.5" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Y-axis labels */}
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[12px] left-[58px] not-italic text-[10px] text-foreground top-[80px]">400</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[12px] left-[58px] not-italic text-[10px] text-foreground top-[120px]">300</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[12px] left-[58px] not-italic text-[10px] text-foreground top-[160px]">200</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[12px] left-[58px] not-italic text-[10px] text-foreground top-[200px]">100</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[12px] left-[58px] not-italic text-[10px] text-foreground top-[238px]">0</p>

            {/* X-axis labels */}
            {xLabels.map(({ left, label }) => (
                <p key={label} className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[12px] not-italic text-[10px] text-foreground top-[294px]" style={{ left: `${left}px` }}>{label}</p>
            ))}

            {/* Bars */}
            {bars.map((bar, i) => (
                <div
                    key={i}
                    className="absolute w-[16px]"
                    style={{ left: `${bar.left}px`, top: `${bar.top}px`, height: `${bar.h}px`, backgroundColor: bar.color }}
                />
            ))}

            {/* Value labels above bars */}
            {bars.map((bar, i) => (
                <div
                    key={i}
                    className="absolute h-[20px] rounded-[2.857px] w-[40px]"
                    style={{
                        left: `${bar.labelLeft}px`,
                        top: `${bar.labelTop}px`,
                        backgroundColor: bar.redBg ? "#e7000b" : "transparent",
                    }}
                >
                    <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14.286px] left-[8.57px] text-[10px] text-foreground top-[1.9px]">$300</p>
                </div>
            ))}
            </div>
        </div>
    );
}
