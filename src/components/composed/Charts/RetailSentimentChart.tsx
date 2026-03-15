const sentimentData = [
  { pair: "USD/CAD", long: 22, shortLabel: "79%" },
  { pair: "USD/CHF", long: 23, shortLabel: null },
  { pair: "USD/JPY", long: 23, shortLabel: null },
  { pair: "GBP/USD", long: 28, shortLabel: "70%" },
  { pair: "EUR/USD", long: 23, shortLabel: null },
  { pair: "EUR/JPY", long: 23, shortLabel: null },
  { pair: "AUD/USD", long: 23, shortLabel: "60%" },
  { pair: "AUD/USD", long: 23, shortLabel: null },
  { pair: "AUD/USD", long: 23, shortLabel: null },
  { pair: "CAD/JPY", long: 22, shortLabel: "27%" },
  { pair: "NZD/USD", long: 23, shortLabel: null },
];

function BarRow({
  pair,
  longPct,
  shortLabel,
}: {
  pair: string;
  longPct: number;
  shortLabel: string | null;
}) {
  const shortPct = 100 - longPct;
  const isCADJPY = pair === "CAD/JPY" && shortLabel === "27%";

  return (
    <div className="relative h-[32px] w-full flex items-center">
      {/* Currency pair label */}
      <div className="w-[80px] shrink-0 flex items-center">
        <p className="font-['Inter',sans-serif] font-normal text-[12px] text-foreground tracking-[-0.12px] leading-[16px]">
          {pair}
        </p>
      </div>

      {/* Spacer */}
      <div className="w-[16px] shrink-0" />

      {/* Bar container */}
      <div className="flex-1 h-[32px] flex relative">
        {/* Blue bar (Long %) */}
        <div
          className="h-full bg-[#155dfc] relative flex items-center"
          style={{ width: `${longPct}%` }}
        >
          <p className="absolute left-1/2 -translate-x-1/2 font-['Arimo',sans-serif] font-normal text-[12px] text-white leading-[16px]">
            {longPct}%
          </p>
          {isCADJPY && (
            <p className="absolute right-[16px] font-['Arimo',sans-serif] font-normal text-[12px] text-white leading-[16px]">
              {shortLabel}
            </p>
          )}
        </div>

        {/* Red bar (Short %) */}
        <div
          className="h-full bg-[#e7000b] relative flex items-center"
          style={{ width: `${shortPct}%` }}
        >
          {shortLabel && !isCADJPY && (
            <p className="absolute right-[10px] font-['Arimo',sans-serif] font-bold text-[14px] text-white leading-[20px] text-right">
              {shortLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RetailSentimentChart() {
  return (
    <div className="bg-darkGrey rounded-[12px] w-[748px] h-[615px] relative overflow-hidden">
      {/* Title */}
      <p className="absolute top-[34px] left-1/2 -translate-x-1/2 font-['Inter',sans-serif] font-bold text-[20px] text-foreground leading-[24px] whitespace-nowrap">
        Retail Sentiment Long %&nbsp;&nbsp;VS Short %
      </p>

      {/* Legend */}
      <div className="absolute top-[77px] left-1/2 -translate-x-1/2 flex items-center gap-[16px]">
        {/* Long % legend */}
        <div className="flex items-center gap-[8px]">
          <div className="w-[12px] h-[8px] rounded-[4px] bg-[#155dfc]" />
          <p className="font-['Inter',sans-serif] font-bold text-[12px] text-foreground leading-[16px] tracking-[-0.12px]">
            Long %
          </p>
        </div>
        {/* Short % legend */}
        <div className="flex items-center gap-[8px]">
          <div className="w-[12px] h-[8px] rounded-[4px] bg-[#e7000b]" />
          <p className="font-['Inter',sans-serif] font-bold text-[12px] text-foreground leading-[16px] tracking-[-0.12px]">
            Short %
          </p>
        </div>
      </div>

      {/* Bar chart area */}
      <div className="absolute top-[116px] left-1/2 -translate-x-1/2 w-[627px] flex flex-col gap-[12px]">
        {sentimentData.map((item, index) => (
          <BarRow
            key={`${item.pair}-${index}`}
            pair={item.pair}
            longPct={item.long}
            shortLabel={item.shortLabel}
          />
        ))}
      </div>
    </div>
  );
}
