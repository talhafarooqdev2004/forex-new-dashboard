import BiasIcon from "../BiasIcon";

import type { CotPairBiasRow } from "@/lib/cotDataAnalysisFromTables";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

type COTPairBiasTableProps = {
    rows: CotPairBiasRow[];
};

export default function COTPairBiasTable({ rows }: COTPairBiasTableProps) {
    return (
        <>
            <h5 className="mb-3 pt-5 text-center">Pair Bias</h5>

            {rows.length === 0 ? (
                <p className="text-center text-sm text-secondary pb-6">
                    No data yet. Add rows to the &quot;COT Sentiment &amp; Net Score&quot; table.
                </p>
            ) : (
                <Pairs>
                    {rows.map((pair, index) => (
                        <Pair
                            key={`${pair.pair}-${index}`}
                            rank={index + 1}
                            pair={pair.pair}
                            score={pair.score}
                            bias={pair.bias}
                            isLast={index === rows.length - 1}
                        />
                    ))}
                </Pairs>
            )}
        </>
    );
}

function Pairs({ children }: React.PropsWithChildren) {
    return (
        <div className="horizontal-scroll w-full min-w-0 overflow-hidden">
            <table className="w-full min-w-[400px] border-collapse text-center text-sm [&_tbody_tr:last-child_td]:border-b-0">
                <thead>
                    <tr className="whitespace-nowrap">
                        <th className="border-t-2 border-b-2 border-r-2 border-charcoal border-l-0 px-4 py-2.5">Rank</th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-2.5">Pair</th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-2.5">Score</th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-2.5">Bias</th>
                        <th className="border-t-2 border-b-2 border-l-2 border-charcoal border-r-0 px-4 py-2.5" />
                    </tr>
                </thead>

                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function pairCellClass(extra: string, isLast: boolean) {
    return `border-2 border-charcoal px-4 py-[13.4px] ${isLast ? "border-b-0" : ""} ${extra}`.trim();
}

function Pair({
    rank,
    pair,
    score,
    bias,
    isLast = false,
}: {
    rank: number;
    pair: string;
    score: number;
    bias: string;
    isLast?: boolean;
}) {
    const biasStyle =
        bias === "Bullish"
            ? { backgroundColor: GAUGE_SIGNAL_COLORS.buy, color: "#ffffff" }
            : bias === "Bearish"
                ? { backgroundColor: GAUGE_SIGNAL_COLORS.sell, color: "#ffffff" }
                : { backgroundColor: GAUGE_SIGNAL_COLORS.neutral, color: "#000000" };

    return (
        <tr>
            <td className={pairCellClass("border-l-0 font-semibold", isLast)}>{rank}</td>

            <td className={pairCellClass("font-semibold", isLast)}>{pair}</td>

            <td className={pairCellClass("", isLast)}>{score.toFixed(2)}</td>

            <td className={pairCellClass("", isLast)}>
                <div className="mx-auto w-20 rounded-[4px] px-2 py-0.5" style={biasStyle}>{bias}</div>
            </td>

            <td className={pairCellClass("border-r-0", isLast)}>
                <div className="flex justify-center">
                    <BiasIcon sentiment={bias} />
                </div>
            </td>
        </tr>
    );
}
