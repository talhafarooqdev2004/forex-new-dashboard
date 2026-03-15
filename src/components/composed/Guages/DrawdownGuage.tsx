import { svgPaths } from "../svgPaths";

export interface DrawdownGuageProps {
    type?: "daily" | "total";
}

export default function DrawdownGuage({ type = "daily" }: DrawdownGuageProps) {
    if (type === "daily") {
        return (
            <div className="relative rounded-[12px] h-[199px] w-[214px]">
                <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[22.427px] left-[calc(50%-13.25px)] text-[#00c950] text-[18.689px] top-[96.66px]">100$</p>

                <div className="absolute left-[52.1px] size-[116.495px] top-[67.38px]">
                    <div className="absolute bottom-1/2 left-0 right-0 top-0">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 116.495 58.2475">
                            <g>
                                <mask fill="white" id="path-1-inside-1_daily">
                                    <path d={svgPaths.p29773000} />
                                </mask>
                                <path d={svgPaths.p29773000} mask="url(#path-1-inside-1_daily)" stroke="#05871A" strokeWidth="32.3943" />
                            </g>
                        </svg>
                    </div>
                </div>

                <div className="absolute flex items-center justify-center left-[48.72px] size-[123.247px] top-[64px]">
                    <div className="flex-none rotate-[-86.57deg]">
                        <div className="relative size-[116.495px]">
                            <div className="absolute bottom-1/2 left-[46.75%] right-0 top-0">
                                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62.0338 58.2475">
                                    <g>
                                        <mask fill="white" id="path-2-inside-2_daily">
                                            <path d={svgPaths.p23c15900} />
                                        </mask>
                                        <path d={svgPaths.p23c15900} mask="url(#path-2-inside-2_daily)" stroke="#FF0000" strokeWidth="32.3943" />
                                    </g>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18.778px] left-[calc(50%-38px)] not-italic text-[10px] text-foreground top-[147.1px] tracking-[-0.1536px]">Daily Drawdown</p>
                <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14.702px] left-[39.97px] text-[8.351px] text-foreground top-[126.04px]">Drawdown</p>
                <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14.702px] left-[150.4px] text-[8.351px] text-foreground top-[126.04px]">Buffer</p>
            </div>
        );
    }

    return (
        <div className="relative rounded-[12px] h-[199px] w-[214px]">
            <p className="absolute font-['Arimo:Bold',sans-serif] font-bold leading-[22.427px] left-[calc(50%-13.25px)] text-[#00c950] text-[18.689px] top-[96.66px]">100$</p>

            <div className="absolute left-[52.1px] size-[116.495px] top-[67.38px]">
                <div className="absolute bottom-1/2 left-0 right-0 top-0">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 116.495 58.2475">
                        <g>
                            <mask fill="white" id="path-1-inside-1_total">
                                <path d={svgPaths.p17db5280} />
                            </mask>
                            <path d={svgPaths.p17db5280} mask="url(#path-1-inside-1_total)" stroke="#05871A" strokeWidth="32.3943" />
                        </g>
                    </svg>
                </div>
            </div>

            <div className="absolute flex items-center justify-center left-[48.72px] size-[123.247px] top-[64px]">
                <div className="flex-none rotate-[-86.57deg]">
                    <div className="relative size-[116.495px]">
                        <div className="absolute bottom-1/2 left-[46.75%] right-0 top-0">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 62.0338 58.2475">
                                <g>
                                    <mask fill="white" id="path-2-inside-2_total">
                                        <path d={svgPaths.p1490e80} />
                                    </mask>
                                    <path d={svgPaths.p1490e80} mask="url(#path-2-inside-2_total)" stroke="#FF0000" strokeWidth="32.3943" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18.778px] left-[calc(50%-38px)] not-italic text-[10px] text-foreground top-[147.1px] tracking-[-0.1536px]">Total Drawdown</p>
            <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14.702px] left-[39.97px] text-[8.351px] text-foreground top-[126.04px]">Drawdown</p>
            <p className="absolute font-['Arimo:Regular',sans-serif] font-normal leading-[14.702px] left-[150.4px] text-[8.351px] text-foreground top-[126.04px]">Buffer</p>
        </div>
    );
}
