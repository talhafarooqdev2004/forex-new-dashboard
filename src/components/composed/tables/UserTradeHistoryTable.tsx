"use client";

import React from "react";

// Trade History table - 100% copy from Create Dashboard Components (Frame54 + Frame57)
const trades = [
  { pair: "EUR/USD", direction: "Buy", directionColor: "rgba(0,201,80,0.8)", entry: "1.1123", tp: "1.1123", result: "+45 Pips", resultColor: "#00c663" },
  { pair: "GBP/JPY", direction: "Sell", directionColor: "red", entry: "1.1123", tp: "1.1123", result: "+70 Pips", resultColor: "#00c663" },
  { pair: "AUD/USD", direction: "Buy", directionColor: "rgba(0,201,80,0.8)", entry: "1.1123", tp: "1.1123", result: "-70 Pips", resultColor: "#fa003f" },
];

export default function UserTradeHistoryTable() {
  return (
    <div className="bg-darkGrey rounded-[12px] w-full overflow-hidden text-foreground">
      {/* Header + Table with horizontal scroll - same pattern as TradeHistoryTable */}
      <div className="w-full min-w-0">
        <div className="min-w-[540px]">
          {/* Header - exact from Frame54 */}
          <div className="relative rounded-tl-[12px] rounded-tr-[12px] shrink-0 w-full">
            <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none rounded-tl-[13px] rounded-tr-[13px]" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex font-['Inter',sans-serif] font-bold gap-[10px] items-center justify-center leading-[24px] not-italic mb-3 relative w-full">
                <p className="relative shrink-0 text-[20px]">Trade History</p>
                <p className="decoration-solid relative shrink-0 text-[12px] underline">www.tadehistor.com</p>
              </div>
            </div>
          </div>

          {/* Table - exact grid structure from Frame57 */}
          <div className="bg-transparent grid grid-cols-[120px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] grid-rows-[40px_fit-content(100%)_fit-content(100%)_fit-content(100%)] min-h-[160px] relative rounded-bl-[12px] rounded-br-[12px] shrink-0 w-full">
            {/* Row 1 - Header */}
            <div className="bg-transparent col-1 row-1 content-stretch flex h-[40px] items-center justify-center justify-self-start p-[10px] relative self-start shrink-0 w-[120px]">
              <div aria-hidden="true" className="absolute border-stroke border-b border-l border-solid border-t inset-[-1px_0_-1px_-1px] pointer-events-none" />
              <p className="capitalize font-['Arimo',sans-serif] font-bold leading-[15px] relative shrink-0 text-[14px] text-foreground tracking-[-0.5px]">Pair</p>
            </div>
            <div className="bg-transparent col-2 row-1 h-[39px] justify-self-stretch relative self-start shrink-0">
              <div aria-hidden="true" className="absolute border-stroke border-b border-r border-solid border-t inset-[-1px_-1px_-1px_0] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full"><div className="size-full" /></div>
            </div>
            <div className="bg-transparent col-3 row-1 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="capitalize font-['Arimo',sans-serif] font-bold leading-[15px] relative shrink-0 text-[14px] text-foreground tracking-[-0.5px]">Entry</p>
              </div>
            </div>
            <div className="bg-transparent col-4 row-1 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="capitalize font-['Arimo',sans-serif] font-bold leading-[15px] relative shrink-0 text-[14px] text-foreground tracking-[-0.5px]">Tp</p>
              </div>
            </div>
            <div className="bg-transparent col-5 row-1 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="capitalize font-['Arimo',sans-serif] font-bold leading-[15px] relative shrink-0 text-[14px] text-foreground tracking-[-0.5px]">Tp</p>
              </div>
            </div>
            <div className="bg-transparent col-6 row-1 h-[39px] justify-self-stretch relative self-start shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full"><div className="size-full" /></div>
            </div>

            {/* Row 2 - EUR/USD */}
            <div className="bg-transparent col-1 row-2 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border-stroke border-b border-l border-solid border-t inset-[-1px_0_-1px_-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-foreground tracking-[-0.16px]">{trades[0].pair}</p>
              </div>
            </div>
            <div className="bg-transparent col-2 row-2 justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border-stroke border-b border-r border-solid border-t inset-[-1px_-1px_-1px_0] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] tracking-[-0.16px]" style={{ color: trades[0].directionColor }}>{trades[0].direction}</p>
              </div>
            </div>
            <div className="bg-transparent col-3 row-2 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[0].entry}</p>
              </div>
            </div>
            <div className="bg-transparent col-4 row-2 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[0].tp}</p>
              </div>
            </div>
            <div className="bg-transparent col-5 row-2 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[0].tp}</p>
              </div>
            </div>
            <div className="bg-transparent col-6 row-2 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] tracking-[-0.12px]" style={{ color: trades[0].resultColor }}>{trades[0].result}</p>
              </div>
            </div>

            {/* Row 3 - GBP/JPY */}
            <div className="bg-transparent col-1 row-3 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border-stroke border-b border-l border-solid border-t inset-[-1px_0_-1px_-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-foreground tracking-[-0.16px]">{trades[1].pair}</p>
              </div>
            </div>
            <div className="bg-transparent col-2 row-3 justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border-stroke border-b border-r border-solid border-t inset-[-1px_-1px_-1px_0] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] tracking-[-0.16px]" style={{ color: trades[1].directionColor }}>{trades[1].direction}</p>
              </div>
            </div>
            <div className="bg-transparent col-3 row-3 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[1].entry}</p>
              </div>
            </div>
            <div className="bg-transparent col-4 row-3 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[1].tp}</p>
              </div>
            </div>
            <div className="bg-transparent col-5 row-3 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[1].tp}</p>
              </div>
            </div>
            <div className="bg-transparent col-6 row-3 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] tracking-[-0.12px]" style={{ color: trades[1].resultColor }}>{trades[1].result}</p>
              </div>
            </div>

            {/* Row 4 - AUD/USD */}
            <div className="bg-transparent col-1 row-4 h-[40px] justify-self-stretch relative shrink-0 rounded-bl-[12px]">
              <div aria-hidden="true" className="absolute border-stroke border-b border-l border-solid border-t inset-[-1px_0_-1px_-1px] pointer-events-none rounded-bl-[13px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] text-foreground tracking-[-0.16px]">{trades[2].pair}</p>
              </div>
            </div>
            <div className="bg-transparent col-2 row-4 justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border-stroke border-b border-r border-solid border-t inset-[-1px_-1px_-1px_0] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[14px] tracking-[-0.16px]" style={{ color: trades[2].directionColor }}>{trades[2].direction}</p>
              </div>
            </div>
            <div className="bg-transparent col-3 row-4 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[2].entry}</p>
              </div>
            </div>
            <div className="bg-transparent col-4 row-4 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[2].tp}</p>
              </div>
            </div>
            <div className="bg-transparent col-5 row-4 h-[40px] justify-self-stretch relative shrink-0">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] text-foreground tracking-[-0.12px]">{trades[2].tp}</p>
              </div>
            </div>
            <div className="bg-transparent col-6 row-4 h-[40px] justify-self-stretch relative shrink-0 rounded-br-[12px]">
              <div aria-hidden="true" className="absolute border border-stroke border-solid inset-[-1px] pointer-events-none rounded-br-[13px]" />
              <div className="flex flex-row items-center justify-center size-full">
                <p className="font-['Inter',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[12px] tracking-[-0.12px]" style={{ color: trades[2].resultColor }}>{trades[2].result}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
