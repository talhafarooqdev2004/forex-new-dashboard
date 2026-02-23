import React from "react";
import { svgPaths } from "../svgPaths";

export interface TradeResultGuageProps {
    label: string;
    profitValue: string | number;
    lossValue: string | number;
}

export default function TradeResultGuage({ label, profitValue, lossValue }: TradeResultGuageProps) {
    return (
        <div className="bg-[#1a1d23] rounded-[12px] h-[350px] w-full flex flex-col items-center justify-center gap-12 overflow-clip">
            <div className="relative w-[140px] h-[140px] flex items-center justify-center">
                {/* Surface */}
                <div className="absolute inset-0 overflow-clip">
                    {/* green main arc */}
                    <div className="absolute inset-[7.03%_9.38%_7.03%_3.13%]">
                        <div className="absolute inset-[-0.45%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 123.593 121.362">
                                <path d={svgPaths.p3d0dd070} fill="#22C55E" stroke="white" strokeWidth="1.09335" />
                            </svg>
                        </div>
                    </div>
                    {/* red small wedge */}
                    <div className="absolute inset-[50.96%_9.4%_37.98%_73.6%]">
                        <div className="absolute inset-[-3.65%_-2.38%_-4.36%_-2.86%]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 25.0375 16.7212">
                                <path d={svgPaths.p3c8ae00} fill="#EF4444" stroke="white" strokeWidth="1.09335" />
                            </svg>
                        </div>
                    </div>
                </div>
                {/* Numbers */}
                <div className="flex flex-col gap-[2px] items-center justify-center relative z-10 text-center">
                    <p className="font-['Arimo:Bold',sans-serif] font-bold text-[#05df72] text-[13.611px] leading-tight">{profitValue}</p>
                    <p className="font-['Arimo:Regular',sans-serif] font-normal text-[#ff6467] text-[13.611px] leading-tight">{lossValue}</p>
                </div>
            </div>

            {/* Label */}
            <p className="font-['Inter:Medium',sans-serif] font-medium text-[12px] text-white tracking-[-0.18px]">{label}</p>
        </div>
    );
}
