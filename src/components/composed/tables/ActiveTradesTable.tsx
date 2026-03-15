import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ActiveTrade {
  id: string;
  symbol: string;
  hasDropdown?: boolean;
  direction: 'Buy' | 'Sell';
  type: string;
  entryPrice: string;
  sl: string;
  tp1: string;
  tp2: string;
  tp3: string;
  tp3Color?: string;
  timeFrame: string;
}

const trades: ActiveTrade[] = [
  {
    id: '1',
    symbol: 'EUR/USD',
    direction: 'Buy',
    type: 'Swing',
    entryPrice: '1.1854',
    sl: '1.1840',
    tp1: '1.2000',
    tp2: '1.2200',
    tp3: '1.2200',
    tp3Color: '#05df72',
    timeFrame: '1h 12 min',
  },
  {
    id: '2',
    symbol: 'GBP/USD',
    hasDropdown: true,
    direction: 'Buy',
    type: 'Scalping',
    entryPrice: '1.2445',
    sl: '1.2430',
    tp1: '',
    tp2: '',
    tp3: '1.2850',
    tp3Color: '#05df72',
    timeFrame: '52 min',
  },
  {
    id: '3',
    symbol: 'XAU/USD',
    hasDropdown: true,
    direction: 'Buy',
    type: 'Swing',
    entryPrice: '2250.00',
    sl: '2245.00',
    tp1: '2306.00',
    tp2: '2360.00',
    tp3: '2400.00',
    tp3Color: '#05df72',
    timeFrame: '3h 17 min',
  },
];

const headers = ['Symbol', 'Direction', 'Type', 'Entry Price', 'Sl', 'Tp1', 'Tp2', 'Tp3', 'Time Frame', ''];

export default function ActiveTradesTable() {
  return (
    <div className="bg-darkGrey rounded-[12px] w-full border border-stroke overflow-hidden text-foreground">
      {/* Header */}
      <div className="flex items-center justify-center py-3 border-b border-stroke">
        <h2 className="font-['Inter',sans-serif] font-bold text-[20px] leading-[24px]">Active Trades</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-stroke/10">
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-[10px] text-left font-['Arimo',sans-serif] font-bold text-[14px] leading-[15px] tracking-[-0.5px] capitalize border-r border-stroke last:border-r-0"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-b border-stroke/50">
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[14px] leading-[16px]">{trade.symbol}</span>
                  {trade.hasDropdown && (
                    <span className="ml-1 text-[12px] inline-block rotate-180">&#9650;</span>
                  )}
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="inline-block px-2 py-[1px] rounded-[4px] bg-[rgba(0,201,80,0.2)] border border-[rgba(0,201,80,0.3)] font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-[#05df72]">
                    {trade.direction}
                  </span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[12px] leading-[16px]">{trade.type}</span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[12px] leading-[16px]">{trade.entryPrice}</span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[12px] leading-[16px]">{trade.sl}</span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[12px] leading-[16px]">{trade.tp1}</span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[12px] leading-[16px]">{trade.tp2}</span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span
                    className="font-['Arimo',sans-serif] font-bold text-[12px] leading-[16px]"
                    style={{ color: trade.tp3Color ?? 'inherit' }}
                  >
                    {trade.tp3}
                  </span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <span className="font-['Arima',sans-serif] text-[12px] leading-[16px]">{trade.timeFrame}</span>
                </td>
                <td className="px-4 py-[14px] border-l border-b border-t border-stroke">
                  <ChevronRight className="w-[14px] h-[14px]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 py-2 bg-stroke/10">
        <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px]">Page 1</span>
        <div className="flex items-center gap-2">
          <ChevronLeft className="w-[14px] h-[14px] cursor-pointer" />
          <span className="bg-stroke/20 rounded-[4px] px-2 py-[1px] font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px]">1</span>
          <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-secondary">of 1</span>
          <ChevronRight className="w-[14px] h-[14px] cursor-pointer" />
        </div>
        <div className="flex items-center gap-1 pl-4 border-l border-stroke">
          <ChevronsLeft className="w-[14px] h-[14px] cursor-pointer" />
          <ChevronsRight className="w-[14px] h-[14px] cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
