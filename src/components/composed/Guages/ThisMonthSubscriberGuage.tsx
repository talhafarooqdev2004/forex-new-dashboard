import svgPaths from "@/lib/svg-paths-admin-charts";

// This Month Subscriber - Responsive version
export default function ThisMonthSubscriberGuage() {
    return (
        <div className="bg-darkGrey rounded-[12px] overflow-hidden w-full min-w-0 min-h-[251px] relative flex flex-col md:flex-row flex-wrap items-start justify-center gap-8 text-foreground">
            {/* Left side stats */}
            <div className="flex flex-col gap-6 w-full md:w-auto">
                {/* 122 Paid  20% */}
                <div className="flex items-center gap-[8px]">
                    <p className="font-['Inter',sans-serif] font-normal text-[16px] leading-[24px]">
                        122 Paid
                    </p>
                    <p className="font-['Inter',sans-serif] font-normal text-[16px] leading-[24px] text-[#00d492]">
                        20%
                    </p>
                </div>

                {/* Middle divider line */}
                <div className="w-full md:w-[110px] h-[1px] bg-stroke" />

                {/* 120 Paid  Free */}
                <div className="flex items-center gap-[24px]">
                    <p className="font-['Inter',sans-serif] font-normal text-[16px] leading-[24px]">
                        120 Paid
                    </p>
                    <p className="font-['Inter',sans-serif] font-normal text-[16px] leading-[24px] text-[#00bcff]">
                        Free
                    </p>
                </div>
            </div>

            {/* Right side - Donut/Pie chart */}
            <div className="relative w-[164px] h-[164px] flex-shrink-0">
                {/* Pie Chart using Figma SVG paths */}
                <div className="relative w-full h-full overflow-hidden">
                    {/* Green section (63%) */}
                    <div className="absolute" style={{ inset: "3.13% 3.13% 21.56% 3.13%" }}>
                        <div className="absolute" style={{ inset: "-0.69% -0.56% -0.97% -0.56%" }}>
                            <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 155.458 125.565">
                                <path d={svgPaths.p1dc8dc00} fill="#4ADE80" stroke="white" strokeWidth="1.70833" />
                            </svg>
                        </div>
                    </div>

                    {/* Red section (bottom left) */}
                    <div className="absolute" style={{ inset: "71.05% 32.94% 3.12% 15.36%" }}>
                        <div className="absolute" style={{ inset: "-2.85% -1.3% -2.02% -1.42%" }}>
                            <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 87.1146 44.4109">
                                <path d={svgPaths.p30cbabc0} fill="#FF0000" stroke="white" strokeWidth="1.70833" />
                            </svg>
                        </div>
                    </div>

                    {/* Red section (right) */}
                    <div className="absolute" style={{ inset: "52.72% 3.3% 8% 63.87%" }}>
                        <div className="absolute" style={{ inset: "-1.44% -1.72% -1.78% -2.13%" }}>
                            <svg className="block w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 55.9049 66.4908">
                                <path d={svgPaths.p25e25d00} fill="#FF0000" stroke="white" strokeWidth="1.70833" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="font-['Arial',sans-serif] font-bold text-[34px] leading-[34px] tracking-[-0.27px]">
                        63%
                    </p>
                    <p className="font-['Arial',sans-serif] font-bold text-[14px] leading-[20px] text-secondary tracking-[-0.27px]">
                        839
                    </p>
                </div>
            </div>
        </div>
    );
}
