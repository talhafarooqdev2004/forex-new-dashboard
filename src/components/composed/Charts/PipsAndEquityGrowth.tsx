"use client";

// SVG paths from Create Dashboard Components - exact copy
const PIPS_LINE_PATH =
  "M0.573263 214.251L30.7257 205.23L59.2483 181.174L76.3618 193.202L91.8455 181.174L123.356 164.134C129.966 167.809 144.49 171.15 149.706 155.112C154.921 139.075 167.091 148.43 172.524 155.112L193.984 104.994L220.333 134.063L251.029 104.994L275.205 124.54L295.307 95.9733H326.546L355.883 50.8675L383.591 62.8958L404.236 37.837L433.573 1.25118";
const EQUITY_LINE_PATH =
  "M0.490238 181.377L30.6427 173.753L59.1653 153.424L76.2788 163.588L91.7625 153.424L123.273 139.024C129.883 142.13 144.407 144.953 149.623 131.4C154.838 117.847 167.008 125.753 172.441 131.4L193.901 89.0471L220.25 113.612L250.946 89.0471L275.122 105.565L295.224 81.4235H326.463L355.8 43.306L383.508 53.4707L404.153 32.2942L433.49 1.37666";
const PIPS_AREA_PATH =
  "M30.1524 203.979L0 213H433V0L403.663 36.5858L383.018 61.6446L355.31 49.6164L325.972 94.7222H294.733L274.632 123.289L250.455 103.743L219.76 132.811L193.41 103.743L171.95 153.861C166.518 147.179 154.348 137.824 149.132 153.861C143.917 169.899 129.393 166.558 122.783 162.882L91.2723 179.922L75.7886 191.951L58.675 179.922L30.1524 203.979Z";
const EQUITY_AREA_PATH =
  "M30.1524 172.376L0 180H433V0L403.663 30.9176L383.018 52.094L355.31 41.9293L325.972 80.0469H294.733L274.632 104.188L250.455 87.6704L219.76 112.235L193.41 87.6704L171.95 130.024C166.518 124.377 154.348 116.471 149.132 130.024C143.917 143.577 129.393 140.753 122.783 137.647L91.2723 152.047L75.7886 162.212L58.675 152.047L30.1524 172.376Z";

export default function PipsAndEquityGrowth() {
  return (
    <div className="rounded-[12px] w-full min-w-0 overflow-hidden">
      <div className="w-full min-w-0 horizontal-scroll">
        <div className="relative bg-[#1a1d23] h-[350px] min-w-[557px] overflow-clip rounded-[12px]">

          {/* Y-Axis Labels - exact positions from Frame81 */}
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] not-italic text-[20px] text-white top-[42px]">
            1.30K
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] not-italic text-[20px] text-white top-[83px]">
            1.20K
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] not-italic text-[20px] text-white top-[124px]">
            1.10K
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] not-italic text-[20px] text-white top-[165px]">
            1.00K
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[11px] not-italic text-[20px] text-white top-[239px]">
            600
          </p>

          {/* X-Axis Labels - exact positions from Frame81 */}
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[81px] not-italic text-[20px] text-white top-[263px]">
            Jan
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[148px] not-italic text-[20px] text-white top-[263px]">
            Feb
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[215px] not-italic text-[20px] text-white top-[263px]">
            Mar
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[282px] not-italic text-[20px] text-white top-[263px]">
            Apr
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[349px] not-italic text-[20px] text-white top-[263px]">
            May
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[416px] not-italic text-[20px] text-white top-[263px]">
            Jun
          </p>
          <p className="absolute font-['Inter',sans-serif] font-bold leading-[24px] left-[483px] not-italic text-[20px] text-white top-[263px]">
            Jul
          </p>

          {/* Legend labels - exact from Frame81 */}
          <p className="absolute font-['Inter',sans-serif] font-normal leading-[22px] left-[75px] not-italic text-[16px] text-white top-[305px] tracking-[-0.18px]">
            Pips
          </p>
          <p className="absolute font-['Inter',sans-serif] font-normal leading-[22px] left-[203px] not-italic text-[16px] text-white top-[305px] tracking-[-0.18px]">
            Equity
          </p>

          {/* Top horizontal grid line - 100% exact from Frame81 */}
          <div className="absolute h-0 left-0 top-[0px] w-[581px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 581 1">
                <line stroke="var(--stroke-0, white)" x2="581" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>

          {/* Horizontal dashed grid lines - 100% exact from Frame81 (width 455px) */}
          <div className="absolute h-0 left-[75px] top-[57px] w-[455px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 455 2">
                <line stroke="var(--stroke-0, #9CA3AF)" strokeDasharray="5 5" strokeWidth="2" x2="455" y1="1" y2="1" />
              </svg>
            </div>
          </div>
          <div className="absolute h-0 left-[75px] top-[97px] w-[455px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 455 2">
                <line stroke="var(--stroke-0, #9CA3AF)" strokeDasharray="5 5" strokeWidth="2" x2="455" y1="1" y2="1" />
              </svg>
            </div>
          </div>
          <div className="absolute h-0 left-[75px] top-[137px] w-[455px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 455 2">
                <line stroke="var(--stroke-0, #9CA3AF)" strokeDasharray="5 5" strokeWidth="2" x2="455" y1="1" y2="1" />
              </svg>
            </div>
          </div>
          <div className="absolute h-0 left-[75px] top-[177px] w-[455px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 455 2">
                <line stroke="var(--stroke-0, #9CA3AF)" strokeDasharray="5 5" strokeWidth="2" x2="455" y1="1" y2="1" />
              </svg>
            </div>
          </div>

          {/* Bottom horizontal grid line - solid - 100% exact from Frame81 */}
          <div className="absolute h-0 left-[75px] top-[251px] w-[455px]">
            <div className="absolute inset-[-2px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 455 2">
                <line stroke="var(--stroke-0, #9CA3AF)" strokeWidth="2" x2="455" y1="1" y2="1" />
              </svg>
            </div>
          </div>

          {/* Vertical grid line (Y-axis) - 100% exact from Frame81 */}
          <div className="absolute flex h-[194px] items-center justify-center left-[75px] top-[57px] w-0">
            <div className="-rotate-90 flex-none">
              <div className="h-0 relative w-[194px]">
                <div className="absolute inset-[-2px_0_0_0]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 194 2">
                    <line stroke="var(--stroke-0, #9CA3AF)" strokeWidth="2" x2="194" y1="1" y2="1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Legend circles - exact from Frame81 */}
          <div className="absolute left-[52px] size-[15px] top-[310px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <circle cx="7.5" cy="7.5" fill="#B2E391" r="7.5" />
            </svg>
          </div>
          <div className="absolute left-[184px] size-[15px] top-[310px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
              <circle cx="7.5" cy="7.5" fill="#4384DD" r="7.5" />
            </svg>
          </div>

          {/* Chart area - exact positioning from original (left 101px relative to Frame81, top 108px relative to Frame81) */}
          <div className="absolute left-[101px] top-[40px] h-[213px] w-[433px]">
            {/* Pips area fill - gradient (original: top 437) */}
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 433 213">
              <path fill="url(#pipsGradientPipsAndEquity)" d={PIPS_AREA_PATH} />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="pipsGradientPipsAndEquity" x1="216.5" x2="216.5" y1="107" y2="213">
                  <stop stopColor="#B2E391" />
                  <stop offset="1" stopColor="#627D50" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Equity area fill - gradient (original: top 473, 36px below pips) */}
            <svg className="absolute top-[36px] left-0 block h-[180px] w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 433 180">
              <path fill="url(#equityGradientPipsAndEquity)" d={EQUITY_AREA_PATH} />
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="equityGradientPipsAndEquity" x1="216.5" x2="216.5" y1="90.4225" y2="180">
                  <stop stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Pips line stroke (original: top 435) */}
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 435.134 216.167">
              <path d={PIPS_LINE_PATH} stroke="#B2E391" strokeWidth="4" />
            </svg>

            {/* Equity line stroke (original: top 471, 36px below pips) */}
            <svg className="absolute top-[36px] left-0 block h-[180px] w-full" fill="none" preserveAspectRatio="none" viewBox="0 0 434.941 183.316">
              <path d={EQUITY_LINE_PATH} stroke="#3B82F6" strokeWidth="4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}