import { svgPaths } from "../svgPaths";

export default function RelativeDrawdownAnalysisChart() {
    return (
        <div className="bg-darkGrey relative rounded-[12px] h-[398px] w-full max-w-[886px] horizontal-scroll">
            <div className="relative min-w-[886px] h-full">
            {/* Grid lines - single SVG overlay */}
            <svg className="absolute left-[30px] top-[80px]" width="792" height="226" fill="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="0.5" x2="792" y2="0.5" stroke="#6A7282" />
                <line x1="0" y1="35.5" x2="792" y2="35.5" stroke="#6A7282" />
                <line x1="0" y1="70.5" x2="792" y2="70.5" stroke="#6A7282" />
                <line x1="0" y1="105.5" x2="792" y2="105.5" stroke="#6A7282" />
                <line x1="0" y1="140.5" x2="792" y2="140.5" stroke="#6A7282" />
                <line x1="0" y1="175.5" x2="792" y2="175.5" stroke="#6A7282" />
                <line x1="0" y1="225.5" x2="792" y2="225.5" stroke="#6A7282" />
                {/* Vertical grid lines - 25 lines spaced 33px */}
                {Array.from({ length: 25 }, (_, i) => (
                    <line key={i} x1={i * 33} y1="0" x2={i * 33} y2="225" stroke="#6A7282" />
                ))}
            </svg>

            {/* Peak line and area */}
            <div className="absolute h-[169.438px] left-[45px] top-[87.56px] w-[777.5px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 777.5 169.438">
                    <path d={svgPaths.p1c862680} fill="url(#paint0_linear_1_1079)" />
                    <defs>
                        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_1079" x1="419" x2="419" y1="0.4375" y2="169.438">
                            <stop stopColor="#222D3E" />
                            <stop offset="1" stopColor="#1F293A" stopOpacity="0.2" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Peak line (blue) */}
            <div className="absolute h-[113.937px] left-[45px] top-[87.56px] w-[777.5px]">
                <div className="absolute inset-[-1.76%_0_-1.75%_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 777.832 117.937">
                        <path d={svgPaths.p1ffcac00} stroke="#3B82F6" strokeWidth="4" />
                    </svg>
                </div>
            </div>

            {/* Drawdown line (red) */}
            <div className="absolute flex h-[44.654px] items-center justify-center left-[52px] top-[258.35px] w-[768.5px]">
                <div className="-scale-y-100 flex-none rotate-180">
                    <div className="h-[44.654px] relative w-[768.5px]">
                        <div className="absolute inset-[-4.48%_0]">
                            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 768.832 48.6535">
                                <path d={svgPaths.p349b39e0} stroke="#FA003F" strokeWidth="4" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Red area under drawdown */}
            <div className="absolute h-[49px] left-[55px] top-[254.5px] w-[767px]">
                <div className="absolute inset-[-1.02%_0_-1.11%_0]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 768 50.0437">
                        <path d={svgPaths.p1910a200} fill="url(#paint0_linear_1_1198)" opacity="0.2" stroke="url(#paint1_linear_1_1198)" />
                        <defs>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_1198" x1="143.5" x2="143.5" y1="1" y2="50">
                                <stop stopColor="#FF0000" />
                                <stop offset="1" stopColor="#FF0000" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient gradientUnits="userSpaceOnUse" id="paint1_linear_1_1198" x1="384.5" x2="384.5" y1="9" y2="1">
                                <stop stopOpacity="0" />
                                <stop offset="1" stopColor="#FF0000" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
            </div>

            {/* Data points */}
            <div className="absolute left-[56px] size-[8px] top-[197px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[101px] size-[8px] top-[195px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[139px] size-[8px] top-[193px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[172px] size-[8px] top-[192px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[212px] size-[8px] top-[190px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[252px] size-[8px] top-[188.29px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[289px] size-[8px] top-[187px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[346px] size-[8px] top-[183.19px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[394px] size-[8px] top-[180.19px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[454px] size-[8px] top-[174.1px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[518px] size-[8px] top-[166px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>
            <div className="absolute left-[579px] size-[8px] top-[154.19px]">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" fill="#00FF7F" r="4" />
                </svg>
            </div>

            {/* Text labels */}
            <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[24px] left-[30px] not-italic text-[20px] text-foreground top-[24px]">Relative Drawdown Analysis</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[785px] not-italic text-[16px] text-foreground top-[36px]">Peak</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[32px] not-italic text-[16px] text-foreground top-[347px]">DEC 28, 2024</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[424px] not-italic text-[16px] text-foreground top-[347px]">Balance</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[329px] not-italic text-[16px] text-foreground top-[255px]">Relative Drawdown</p>
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[543px] not-italic text-[14px] text-foreground top-[263px]">Tough</p>
            <div className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[648px] not-italic text-[14px] text-foreground top-[259px] whitespace-nowrap">
                <p className="mb-0">-0.920(-$550)</p>
                <p>{`          10%`}</p>
            </div>

            {/* Y-axis labels */}
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[72px]">3500</p>
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[107px]">3500</p>
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[142px]">3500</p>
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[177px]">3500</p>
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[212px]">3500</p>
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[247px]">3500</p>
            <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[862px] not-italic text-[12.568px] text-right text-foreground top-[296px]">3500</p>

            {/* X-axis month labels */}
            <div className="absolute flex h-[11.49px] items-center justify-center left-[49px] top-[179px] w-[16.886px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Jan</p>
                </div>
            </div>
            <div className="absolute flex h-[11.49px] items-center justify-center left-[94px] top-[177px] w-[16.886px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Feb</p>
                </div>
            </div>
            <div className="absolute flex h-[11.586px] items-center justify-center left-[132px] top-[174.9px] w-[17.882px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Mar</p>
                </div>
            </div>
            <div className="absolute flex h-[11.49px] items-center justify-center left-[165px] top-[174px] w-[16.886px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Apr</p>
                </div>
            </div>
            <div className="absolute flex h-[11.778px] items-center justify-center left-[205px] top-[171.71px] w-[19.872px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">May</p>
                </div>
            </div>
            <div className="absolute flex h-[11.49px] items-center justify-center left-[245px] top-[170.29px] w-[16.886px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Jun</p>
                </div>
            </div>
            <div className="absolute flex h-[11.682px] items-center justify-center left-[282px] top-[168.81px] w-[18.877px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">July</p>
                </div>
            </div>
            <div className="absolute flex h-[11.682px] items-center justify-center left-[339px] top-[165px] w-[18.877px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Aug</p>
                </div>
            </div>
            <div className="absolute flex h-[11.586px] items-center justify-center left-[387px] top-[162.1px] w-[17.882px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Sep</p>
                </div>
            </div>
            <div className="absolute flex h-[11.49px] items-center justify-center left-[447px] top-[156.1px] w-[16.886px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Oct</p>
                </div>
            </div>
            <div className="absolute flex h-[11.682px] items-center justify-center left-[511px] top-[147.81px] w-[18.877px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Nov</p>
                </div>
            </div>
            <div className="absolute flex h-[11.586px] items-center justify-center left-[572px] top-[136.1px] w-[17.882px]">
                <div className="flex-none rotate-[-5.51deg]">
                    <p className="font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic relative text-[9px] text-foreground">Dec</p>
                </div>
            </div>

            {/* X-axis "Dec 12" date labels */}
            {[147, 180, 213, 246, 279, 312, 345, 378, 411, 444, 477, 510, 543, 576, 609, 642, 675, 708, 741, 774].map((left) => (
                <p key={left} className={`absolute font-['Inter:Medium',sans-serif] font-medium leading-[10px] not-italic text-[9px] text-foreground top-[314px]`} style={{ left: `${left}px` }}>Dec 12</p>
            ))}
            </div>
        </div>
    );
}
