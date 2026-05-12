"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useState } from "react";

import BiasIcon from "../BiasIcon";
import {
    buildForexPositioningFromCotRawTable,
    type ForexPositioningRow,
} from "@/lib/cotDataAnalysisFromTables";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { dynamicTableService } from "@/services/dynamicTable.service";

const COT_RAW_DATA_IDENTIFIER = "cot_raw_data";

type FundamentalOutlookTableProps = {
    refreshTrigger?: number;
};

export default function FundamentalOutlookTable({ refreshTrigger = 0 }: FundamentalOutlookTableProps) {
    const [rows, setRows] = useState<ForexPositioningRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await dynamicTableService.getTableByIdentifier(COT_RAW_DATA_IDENTIFIER);
            if (res?.data) {
                setRows(buildForexPositioningFromCotRawTable(res.data));
            } else {
                setRows([]);
            }
        } catch {
            setRows([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load, refreshTrigger]);

    return (
        <>
            <h5 className="text-center pt-6 mb-4">Current Forex Positioning</h5>

            {loading ? (
                <p className="py-6 text-center text-sm text-secondary">Loading positioning…</p>
            ) : rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-secondary">
                    Add a &quot;COT Raw Data&quot; table: Currency (1st), long (2nd), … (4th) short leg, optional 5th for Prev
                    when only five columns, and a 6th column for Prev when present: Position = 2nd − 4th; if 6+ columns,
                    Prev = Position + 6th when 6th is negative, Prev = Position − 6th when 6th is positive (empty 6th → Prev =
                    Position). Legacy 3 columns: Position = 2nd, Prev = 2nd − 3rd. Only non-zero net positions are shown
                    (Bullish / Bearish).
                </p>
            ) : (
                <Outlooks>
                    {rows.map((outlook, index) => (
                        <Outlook
                            key={`${index}-${outlook.currency}-${outlook.positionDisplay}`}
                            rowIndex={index}
                            rank={outlook.rank}
                            currency={outlook.currency}
                            position={outlook.positionDisplay}
                            prev={outlook.prevDisplay}
                            sentiment={outlook.sentiment}
                        />
                    ))}
                </Outlooks>
            )}
        </>
    );
}

function Outlooks({ children }: PropsWithChildren) {
    return (
        <div className="horizontal-scroll w-full min-w-0">
            <table className="w-full border-collapse text-sm text-center min-w-[600px]">
                <thead>
                    <tr className="whitespace-nowrap">
                        <th className="border-t-2 border-b-2 border-r-2 border-charcoal border-l-0 px-4 py-3">
                            Rank
                        </th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-3">
                            Currency
                        </th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-3">
                            Position
                        </th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-3">
                            Prev
                        </th>
                        <th className="border-t-2 border-b-2 border-l-2 border-charcoal border-r-0 px-4 py-3">
                            Sentiment
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    );
}

/** Upward trend (left → right), green — bullish / positive position */
const SPARKLINE_UP_D =
    "M0 20L7.27273 16L14.5455 18.4L21.8182 13.6L29.0909 12L36.3636 10.4L43.6364 8L50.9091 5.6L58.1818 7.2L65.4545 4L72.7273 2.4L80 0";

/** Downward trend: same X as up path, Y mirrored in 0…20 — bearish / negative position */
const SPARKLINE_DOWN_D =
    "M0 0L7.27273 4L14.5455 1.6L21.8182 6.4L29.0909 8L36.3636 9.6L43.6364 12L50.9091 14.4L58.1818 12.8L65.4545 16L72.7273 17.6L80 20";

function Outlook({
    rowIndex,
    rank,
    currency,
    position,
    prev,
    sentiment,
}: {
    rowIndex: number;
    rank: number;
    currency: string;
    position: string;
    prev: string;
    sentiment: "Bullish" | "Bearish";
}) {
    const isBullish = sentiment === "Bullish";
    const clipId = `cot-forex-pos-spark-${rowIndex}`;
    const signalColor = isBullish ? GAUGE_SIGNAL_COLORS.buy : GAUGE_SIGNAL_COLORS.sell;
    const sparkPath = isBullish ? SPARKLINE_UP_D : SPARKLINE_DOWN_D;

    return (
        <tr>
            <td className="border-2 border-charcoal border-l-0 px-4 py-3 font-semibold">
                {rank}
            </td>

            <td className="border-2 border-charcoal px-4 py-3 font-semibold whitespace-nowrap">
                <div className="flex items-center justify-center gap-[10px] flex-nowrap min-w-0">
                    <span className="whitespace-nowrap shrink-0">{currency}</span>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="20"
                        viewBox="0 0 80 20"
                        fill="none"
                        className="shrink-0"
                        aria-hidden
                    >
                        <g clipPath={`url(#${clipId})`}>
                            <path d={sparkPath} stroke={signalColor} strokeWidth="1.5" opacity={0.9} />
                        </g>
                        <defs>
                            <clipPath id={clipId}>
                                <rect width="80" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </td>

            <td className="border-2 border-charcoal px-4 py-3">
                {position}
            </td>

            <td className="border-2 border-charcoal px-4 py-3">
                {prev}
            </td>

            <td className="border-2 border-charcoal border-r-0 px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                    <div className="rounded-[4px] px-2 py-1 w-20 text-center text-white" style={{ backgroundColor: signalColor }}>
                        {sentiment}
                    </div>
                    <BiasIcon sentiment={sentiment} />
                </div>
            </td>
        </tr>
    );
}
