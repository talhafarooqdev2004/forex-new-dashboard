import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';

interface HistoryTrade {
  id: string;
  date: string;
  symbol: string;
  direction: 'Buy' | 'Sell';
  tradeType: string;
  entryPrice: string;
  sl: string;
  tp1: string;
  tp2: string;
  tp3: string;
  status: string;
  statusColor: string;
  result: string;
  resultColor: string;
}

const historyTrades: HistoryTrade[] = [
  {
    id: '1',
    date: '04222024',
    symbol: 'EUR/USD',
    direction: 'Buy',
    tradeType: 'Swing',
    entryPrice: '0.85%',
    sl: '0.65%',
    tp1: '0.85%',
    tp2: '0.33%',
    tp3: '0.33%',
    status: 'Closed',
    statusColor: 'rgba(0,201,80,0.8)',
    result: '+30.0 +780/120',
    resultColor: '#05df72',
  },
  {
    id: '2',
    date: '04222024',
    symbol: 'EUR/USD',
    direction: 'Buy',
    tradeType: 'Swing',
    entryPrice: '0.85%',
    sl: '0.65%',
    tp1: '0.85%',
    tp2: '0.33%',
    tp3: '0.33%',
    status: 'Closed',
    statusColor: 'rgba(0,201,80,0.8)',
    result: '+30.0 +780/120',
    resultColor: '#05df72',
  },
  {
    id: '3',
    date: '04222024',
    symbol: 'EUR/USD',
    direction: 'Buy',
    tradeType: 'Swing',
    entryPrice: '0.85%',
    sl: '0.65%',
    tp1: '0.85%',
    tp2: '0.33%',
    tp3: '0.33%',
    status: 'Closed',
    statusColor: 'rgba(0,201,80,0.8)',
    result: '+30.0 +780/120',
    resultColor: '#05df72',
  },
  {
    id: '4',
    date: '04222024',
    symbol: 'EUR/USD',
    direction: 'Sell',
    tradeType: 'Swing',
    entryPrice: '0.85%',
    sl: '0.65%',
    tp1: '0.85%',
    tp2: '0.33%',
    tp3: '0.33%',
    status: 'Closed',
    statusColor: 'rgba(0,201,80,0.8)',
    result: '+30.0 +780/120',
    resultColor: '#05df72',
  },
  {
    id: '5',
    date: '04222024',
    symbol: 'EUR/USD',
    direction: 'Sell',
    tradeType: 'Swing',
    entryPrice: '0.85%',
    sl: '0',
    tp1: '0.85%',
    tp2: '0.33%',
    tp3: '0.33%',
    status: 'Closed',
    statusColor: 'rgba(0,201,80,0.8)',
    result: '+30.0 +780/120',
    resultColor: '#05df72',
  },
  {
    id: '6',
    date: '04222024',
    symbol: 'EUR/USD',
    direction: 'Sell',
    tradeType: 'Swing',
    entryPrice: '0.85%',
    sl: '0.65%',
    tp1: '0.85%',
    tp2: '0.33%',
    tp3: '0.33%',
    status: 'SL',
    statusColor: '#fa003f',
    result: '-40.0',
    resultColor: '#fa003f',
  },
];

const headers = ['Date', 'Symbol', 'Direction', 'Trade Type', 'Entry Price', 'Sl', 'Tp1', 'Tp2', 'Tp3', 'Status', 'Result'];

function DirectionBadge({ direction }: { direction: 'Buy' | 'Sell' }) {
  if (direction === 'Buy') {
    return (
      <div className="inline-flex items-center justify-between px-[8.8px] py-[0.8px] rounded-[4px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] w-[81px]">
        <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-[#05df72]">Buy</span>
        <ChevronDown className="w-[10px] h-[10px] text-[#4A5565]" />
      </div>
    );
  }
  return (
    <div className="inline-flex items-center justify-between px-[8.8px] py-[0.8px] rounded-[4px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] w-[81px]">
      <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-[#ff6467]">Sell</span>
      <ChevronDown className="w-[10px] h-[10px] text-[#4A5565]" />
    </div>
  );
}

function TradeTypeBadge({ type }: { type: string }) {
  return (
    <div className="inline-flex items-center justify-between px-[8.8px] py-[0.8px] rounded-[4px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] w-[81px]">
      <span className="font-['Arimo',sans-serif] text-[10px] leading-[15px] text-white">{type}</span>
      <ChevronDown className="w-[10px] h-[10px] text-[#4A5565]" />
    </div>
  );
}

export default function TradeHistoryTable() {
  return (
    <div className="bg-[#1a1d23] rounded-[12px] w-full overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-center py-4 border-b border-[#121417]">
        <h2 className="font-['Inter',sans-serif] font-bold text-[20px] leading-[24px] text-white">Trade History</h2>
      </div>

      {/* Table */}
      <div className="w-full min-w-0 horizontal-scroll">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-[10px] py-[10px] text-center font-['Arimo',sans-serif] font-bold text-[14px] leading-[15px] text-white tracking-[-0.5px] capitalize bg-[#1a1d23] border border-[#121417]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {historyTrades.map((trade) => (
              <tr key={trade.id}>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.date}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.symbol}
                </td>
                <td className="px-[10px] py-[10px] text-center bg-[#1a1d23] border border-[#121417]">
                  <DirectionBadge direction={trade.direction} />
                </td>
                <td className="px-[10px] py-[10px] text-center bg-[#1a1d23] border border-[#121417]">
                  <TradeTypeBadge type={trade.tradeType} />
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.entryPrice}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.sl}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.tp1}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.tp2}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] text-white tracking-[-0.16px] bg-[#1a1d23] border border-[#121417]">
                  {trade.tp3}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[14px] leading-[20px] bg-[#1a1d23] border border-[#121417]" style={{ color: trade.statusColor }}>
                  {trade.status}
                </td>
                <td className="px-[10px] py-[10px] text-center font-['Inter',sans-serif] text-[12px] leading-[16px] tracking-[-0.12px] bg-[#1a1d23] border border-[#121417]" style={{ color: trade.resultColor }}>
                  {trade.result}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination + Summary Row */}
      <div className="w-full min-w-0">
        <div className="flex items-center min-w-[1100px]">
          <div className="flex-1 flex items-center justify-center gap-4 py-2 bg-[#1a1d23] rounded-bl-[12px]">
            <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-white">Page 1</span>
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-[14px] h-[14px] text-white cursor-pointer" />
              <span className="bg-[rgba(255,255,255,0.06)] rounded-[4px] px-2 py-[1px] font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-white">1</span>
              <span className="font-['Arimo',sans-serif] font-bold text-[10px] leading-[15px] text-[#4a5565]">of 1</span>
              <ChevronRight className="w-[14px] h-[14px] text-white cursor-pointer" />
            </div>
            <div className="flex items-center gap-1 pl-4 border-l border-[rgba(255,255,255,0.1)]">
              <ChevronsLeft className="w-[14px] h-[14px] text-white cursor-pointer" />
              <ChevronsRight className="w-[14px] h-[14px] text-white cursor-pointer" />
            </div>
          </div>
          <div className="flex items-center justify-center px-4 py-2 bg-[#1a1d23] border-l border-[#121417]">
            <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] text-[#fa003f] tracking-[-0.16px]">20,000</span>
          </div>
          <div className="w-[96px] py-2 bg-[#1a1d23] border-l border-[#121417] rounded-br-[12px]" />
        </div>
      </div>
    </div>
  );
}
