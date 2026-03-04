import svgPaths from "@/lib/svg-paths-admin-charts";

// Revenue Growth Chart: 300px wide, Revenue (blue) line only, Jan-Mar - 100% exact copy from Create Subscriber Growth Chart (SubscriberGrowthChart2)
export default function RevenueGrowthChart() {
    return (
        <div className="rounded-[12px] w-full min-w-0 overflow-hidden">
            <div className="w-full min-w-0 horizontal-scroll">
                <div className="relative bg-[#1a1d23] h-[370px] min-w-[300px] overflow-clip rounded-[12px]">
                    {/* Y-axis labels */}
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-white top-[42px]">
                        1.30K
                    </p>
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-white top-[83px]">
                        1.20K
                    </p>
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-white top-[124px]">
                        80k
                    </p>
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-white top-[165px]">
                        30k
                    </p>
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] text-[20px] text-white top-[239px]">
                        600
                    </p>
                    {/* X-axis labels */}
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[81px] text-[20px] text-white top-[263px]">
                        Jan
                    </p>
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[148px] text-[20px] text-white top-[263px]">
                        Feb
                    </p>
                    <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[215px] text-[20px] text-white top-[263px]">
                        Mar
                    </p>

                    {/* Dashed horizontal grid lines */}
                    {[57, 97, 137, 177].map((top) => (
                        <div key={top} className="absolute h-0 left-[75px] w-[207px]" style={{ top }}>
                            <div className="absolute inset-[-2px_0_0_0]">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 207 2">
                                    <line stroke="#9CA3AF" strokeDasharray="5 5" strokeWidth="2" x2="207" y1="1" y2="1" />
                                </svg>
                            </div>
                        </div>
                    ))}
                    {/* Bottom x-axis line */}
                    <div className="absolute h-0 left-[75px] top-[251px] w-[207px]">
                        <div className="absolute inset-[-2px_0_0_0]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 207 2">
                                <line stroke="#9CA3AF" strokeWidth="2" x2="207" y1="1" y2="1" />
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
                    {/* Blue area fill */}
                    <div className="absolute h-[213px] left-[97px] top-[30px] w-[185px]">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 185 213">
                            <path d={svgPaths.pf461200} fill="url(#paint_blue_area_2)" />
                            <defs>
                                <linearGradient gradientUnits="userSpaceOnUse" id="paint_blue_area_2" x1="92.5" x2="92.5" y1="107" y2="213">
                                    <stop stopColor="#3B82F6" />
                                    <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {/* Blue line stroke */}
                    <div className="absolute h-[213px] left-[97px] top-[28px] w-[185px]">
                        <div className="absolute inset-[-0.3%_-1.02%_-0.77%_-0.62%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 188.039 215.286">
                                <path d={svgPaths.p6f59680} stroke="#3B82F6" strokeWidth="4" />
                            </svg>
                        </div>
                    </div>
                    {/* Legend: Revenue */}
                    <div className="absolute left-[52px] size-[15px] top-[310px]">
                        <svg className="absolute block size-full" fill="none" viewBox="0 0 15 15">
                            <circle cx="7.5" cy="7.5" fill="#4384DD" r="7.5" />
                        </svg>
                    </div>
                    <p className="absolute font-['Inter',sans-serif] font-normal leading-[22px] left-[75px] text-[16px] text-white top-[305px] tracking-[-0.18px]">
                        Revenue
                    </p>
                </div>
            </div>
        </div>
    );
}
