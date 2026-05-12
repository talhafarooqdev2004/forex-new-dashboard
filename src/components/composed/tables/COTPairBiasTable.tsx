import BiasIcon from "../BiasIcon";

import type { CotPairBiasRow } from "@/lib/cotDataAnalysisFromTables";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

type COTPairBiasTableProps = {
    rows: CotPairBiasRow[];
};

export default function COTPairBiasTable({ rows }: COTPairBiasTableProps) {
    return (
        <>
            <h5 className="text-center pt-6 mb-4">Pair Bias</h5>

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
                        />
                    ))}
                </Pairs>
            )}
        </>
    );
}

function Pairs({ children }: React.PropsWithChildren) {
    return (
        <div className="horizontal-scroll w-full min-w-0">
            <table className="w-full min-w-[400px] border-collapse text-center text-sm">
                <thead>
                    <tr className="whitespace-nowrap">
                        <th className="border-t-2 border-b-2 border-r-2 border-charcoal border-l-0 px-4 py-3">Rank</th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-3">Pair</th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-3">Score</th>
                        <th className="border-t-2 border-b-2 border-x-2 border-charcoal px-4 py-3">Bias</th>
                        <th className="border-t-2 border-b-2 border-l-2 border-charcoal border-r-0 px-4 py-3" />
                    </tr>
                </thead>

                <tbody>{children}</tbody>
            </table>
        </div>
    );
}

function Pair({ rank, pair, score, bias }: { rank: number; pair: string; score: number; bias: string }) {
    const biasStyle =
        bias === "Bullish"
            ? { backgroundColor: GAUGE_SIGNAL_COLORS.buy, color: "#ffffff" }
            : bias === "Bearish"
                ? { backgroundColor: GAUGE_SIGNAL_COLORS.sell, color: "#ffffff" }
                : { backgroundColor: GAUGE_SIGNAL_COLORS.neutral, color: "#000000" };

    return (
        <tr>
            <td className="border-2 border-charcoal border-l-0 px-4 py-3 font-semibold">{rank}</td>

            <td className="border-2 border-charcoal px-4 py-3 font-semibold">{pair}</td>

            <td className="border-2 border-charcoal px-4 py-3">{score.toFixed(2)}</td>

            <td className="border-2 border-charcoal px-4 py-3">
                <div className="mx-auto w-20 rounded-[4px] px-2 py-1" style={biasStyle}>{bias}</div>
            </td>

            <td className="border-2 border-charcoal border-r-0 px-4 py-3">
                <div className="flex justify-center">
                    <BiasIcon sentiment={bias} />
                </div>
            </td>
        </tr>
    );
}
