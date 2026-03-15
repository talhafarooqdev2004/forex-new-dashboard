import svgPaths from "@/lib/svg-paths-admin-charts";

// Subscriber Growth Chart: 450px wide, Free (green) + Paid (blue) lines, Jan-May - 100% exact copy from Create Subscriber Growth Chart
export default function SubscriberGrowthChart() {
    return (
        <div className="rounded-[12px] w-full min-w-0 overflow-hidden">
            <div className="w-full min-w-0 horizontal-scroll bg-darkGrey rounded-[12px]">
                <div className="relative h-[370px] min-w-[450px] overflow-clip rounded-[12px] text-foreground">
            {/* Y-axis labels */}
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-foreground top-[42px]">
                1.30K
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-foreground top-[83px]">
                1.20K
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-foreground top-[124px]">
                1.10K
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-foreground top-[165px]">
                1.00K
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-foreground top-[239px]">
                600
            </p>
            {/* X-axis labels */}
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[81px] text-[20px] text-foreground top-[263px]">
                Jan
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[148px] text-[20px] text-foreground top-[263px]">
                Feb
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[215px] text-[20px] text-foreground top-[263px]">
                Mar
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[282px] text-[20px] text-foreground top-[263px]">
                Apr
            </p>
            <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[349px] text-[20px] text-foreground top-[263px]">
                May
            </p>

            {/* Dashed horizontal grid lines */}
            {[57, 97, 137, 177].map((top) => (
                <div key={top} className="absolute h-0 left-[75px] w-[341px]" style={{ top }}>
                    <div className="absolute inset-[-2px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 341 2">
                            <line stroke="#9CA3AF" strokeDasharray="5 5" strokeWidth="2" x2="341" y1="1" y2="1" />
                        </svg>
                    </div>
                </div>
            ))}
            {/* Bottom x-axis line */}
            <div className="absolute h-0 left-[75px] top-[251px] w-[341px]">
                <div className="absolute inset-[-2px_0_0_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 341 2">
                        <line stroke="#9CA3AF" strokeWidth="2" x2="341" y1="1" y2="1" />
                    </svg>
                </div>
            </div>
            {/* Vertical y-axis line */}
            <div className="absolute flex h-[194px] items-center justify-center left-[75px] top-[57px] w-0">
                <div className="-rotate-90 flex-none">
                    <div className="h-0 relative w-[194px]">
                        <div className="absolute inset-[-2px_0_0_0]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 194 2">
                                <line stroke="#9CA3AF" strokeWidth="2" x2="194" y1="1" y2="1" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            {/* Green area fill */}
            <div className="absolute h-[213px] left-[97px] top-[30px] w-[319px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 319 213">
                    <path d={svgPaths.p183e2600} fill="url(#paint_green_area)" />
                    <defs>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint_green_area" x1="159.5" x2="159.5" y1="107" y2="213">
                            <stop stopColor="#B2E391" />
                            <stop offset="1" stopColor="#627D50" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            {/* Blue area fill */}
            <div className="absolute h-[180px] left-[97px] top-[66px] w-[319px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 319 180">
                    <path d={svgPaths.p2816f800} fill="url(#paint_blue_area)" />
                    <defs>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint_blue_area" x1="159.5" x2="159.5" y1="90.4225" y2="180">
                            <stop stopColor="#3B82F6" />
                            <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
            {/* Green line stroke */}
            <div className="absolute h-[213px] left-[97px] top-[28px] w-[319px]">
                <div className="absolute inset-[-0.48%_-0.54%_-0.87%_-0.24%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 321.474 215.87">
                        <path d={svgPaths.p7ca4500} stroke="#B2E391" strokeWidth="4" />
                    </svg>
                </div>
            </div>
            {/* Blue line stroke */}
            <div className="absolute h-[180px] left-[97px] top-[64px] w-[319px]">
                <div className="absolute inset-[-0.64%_-0.51%_-1.05%_-0.2%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 321.288 183.038">
                        <path d={svgPaths.p11edbd00} stroke="#3B82F6" strokeWidth="4" />
                    </svg>
                </div>
            </div>
            {/* Legend: Free */}
            <div className="absolute left-[52px] size-[15px] top-[310px]">
                <svg className="absolute block size-full" fill="none" viewBox="0 0 15 15">
                    <circle cx="7.5" cy="7.5" fill="#B2E391" r="7.5" />
                </svg>
            </div>
            <p className="absolute font-['Inter',sans-serif] font-normal leading-[22px] left-[75px] text-[16px] text-foreground top-[305px] tracking-[-0.18px]">
                Free
            </p>
            {/* Legend: Paid */}
            <div className="absolute left-[184px] size-[15px] top-[310px]">
                <svg className="absolute block size-full" fill="none" viewBox="0 0 15 15">
                    <circle cx="7.5" cy="7.5" fill="#4384DD" r="7.5" />
                </svg>
            </div>
            <p className="absolute font-['Inter',sans-serif] font-normal leading-[22px] left-[203px] text-[16px] text-foreground top-[305px] tracking-[-0.18px]">
                Paid
            </p>
                </div>
            </div>
        </div>
    );
}
