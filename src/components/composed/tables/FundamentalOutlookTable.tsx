"use client";

import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useState } from "react";

import BiasIcon from "../BiasIcon";
import {
    buildForexPositioningFromCurrencyPairSentimentTable,
    type ForexPositioningRow,
} from "@/lib/cotDataAnalysisFromTables";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { dynamicTableService } from "@/services/dynamicTable.service";

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";

type FundamentalOutlookTableProps = {
    refreshTrigger?: number;
};

export default function FundamentalOutlookTable({ refreshTrigger = 0 }: FundamentalOutlookTableProps) {
    const [rows, setRows] = useState<ForexPositioningRow[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await dynamicTableService.getTableByIdentifier(CURRENCY_PAIR_SENTIMENT_ID);
            if (res?.data) {
                setRows(buildForexPositioningFromCurrencyPairSentimentTable(res.data));
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
            <h5 className="mb-5 pt-7 text-center">Current Forex Positioning</h5>

            {loading ? (
                <p className="py-6 text-center text-sm text-secondary">Loading positioning…</p>
            ) : rows.length === 0 ? (
                <p className="py-6 text-center text-sm text-secondary">
                    Sync &quot;Currency Pair Sentiment&quot; from Google Sheets. Symbols = 5th-to-last column (currency
                    names); then Change Position, Current, Previous, and Sentiment on the last four columns.
                </p>
            ) : (
                <Outlooks>
                    {rows.map((outlook, index) => (
                        <Outlook
                            key={`${index}-${outlook.symbol}-${outlook.currentDisplay}`}
                            rowIndex={index}
                            symbol={outlook.symbol}
                            previous={outlook.previousDisplay}
                            current={outlook.currentDisplay}
                            changePosition={outlook.changePositionDisplay}
                            sentiment={outlook.sentiment}
                            isLast={index === rows.length - 1}
                        />
                    ))}
                </Outlooks>
            )}
        </>
    );
}

function Outlooks({ children }: PropsWithChildren) {
    return (
        <div className="horizontal-scroll w-full min-w-0 overflow-hidden px-1">
            <table className="w-full min-w-[600px] border-collapse text-center text-sm [&_tbody_tr:last-child_td]:border-b-0">
                <thead>
                    <tr className="whitespace-nowrap">
                        <th className="border-t-2 border-b-2 border-r-2 border-charcoal border-l-0 px-5 py-3.5">
                            Symbols
                        </th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-5 py-3.5">
                            Previous
                        </th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-5 py-3.5">
                            Current
                        </th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-5 py-3.5">
                            Change Position
                        </th>
                        <th className="border-t-2 border-b-2 border-l-2 border-charcoal border-r-0 px-5 py-3.5">
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

/** Upward trend (left → right), green — bullish */
const SPARKLINE_UP_D =
    "M0 20L7.27273 16L14.5455 18.4L21.8182 13.6L29.0909 12L36.3636 10.4L43.6364 8L50.9091 5.6L58.1818 7.2L65.4545 4L72.7273 2.4L80 0";

/** Downward trend — bearish */
const SPARKLINE_DOWN_D =
    "M0 0L7.27273 4L14.5455 1.6L21.8182 6.4L29.0909 8L36.3636 9.6L43.6364 12L50.9091 14.4L58.1818 12.8L65.4545 16L72.7273 17.6L80 20";

function outlookCellClass(extra: string, isLast: boolean) {
    return `border-2 border-charcoal px-5 py-3.5 ${isLast ? "border-b-0" : ""} ${extra}`.trim();
}

function sentimentAccent(sentiment: ForexPositioningRow["sentiment"]): {
    color: string;
    textColor: string;
    sparkPath: string;
} {
    if (sentiment === "Bullish") {
        return {
            color: GAUGE_SIGNAL_COLORS.buy,
            textColor: "#ffffff",
            sparkPath: SPARKLINE_UP_D,
        };
    }
    if (sentiment === "Bearish") {
        return {
            color: GAUGE_SIGNAL_COLORS.sell,
            textColor: "#ffffff",
            sparkPath: SPARKLINE_DOWN_D,
        };
    }
    return {
        color: GAUGE_SIGNAL_COLORS.neutral,
        textColor: "#000000",
        sparkPath: SPARKLINE_UP_D,
    };
}

function Outlook({
    rowIndex,
    symbol,
    previous,
    current,
    changePosition,
    sentiment,
    isLast = false,
}: {
    rowIndex: number;
    symbol: string;
    previous: string;
    current: string;
    changePosition: string;
    sentiment: ForexPositioningRow["sentiment"];
    isLast?: boolean;
}) {
    const clipId = `cot-forex-pos-spark-${rowIndex}`;
    const { color: signalColor, textColor, sparkPath } = sentimentAccent(sentiment);

    return (
        <tr>
            <td className={outlookCellClass("border-l-0 whitespace-nowrap font-semibold", isLast)}>
                <div className="flex items-center justify-center gap-[10px] flex-nowrap min-w-0">
                    <span className="whitespace-nowrap shrink-0">{symbol}</span>
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

            <td className={outlookCellClass("", isLast)}>
                {previous}
            </td>

            <td className={outlookCellClass("", isLast)}>
                {current}
            </td>

            <td className={outlookCellClass("", isLast)}>
                {changePosition}
            </td>

            <td className={outlookCellClass("border-r-0", isLast)}>
                <div className="flex items-center justify-center gap-2.5">
                    <div
                        className="w-20 rounded-[4px] px-2.5 py-1.5 text-center"
                        style={{ backgroundColor: signalColor, color: textColor }}
                    >
                        {sentiment}
                    </div>
                    <BiasIcon sentiment={sentiment} />
                </div>
            </td>
        </tr>
    );
}
