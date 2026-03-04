import { BiasIcon } from "..";

const pairs = [
    { rank: 1, pair: "USD/JPY", score: 0.99, bias: "Bullish" },
    { rank: 2, pair: "CAD/CHF", score: 0.24, bias: "Neutral" },
    { rank: 3, pair: "EUR/JPY", score: 0.10, bias: "Bullish" },
    { rank: 4, pair: "CAD/JPY", score: -0.16, bias: "Neutral" },
    { rank: 5, pair: "USD/CAD", score: -0.50, bias: "Bearish" },
    { rank: 6, pair: "JPY/CHF", score: -0.13, bias: "Bearish" },
    { rank: 7, pair: "EUR/EUR", score: -0.40, bias: "Bearish" },
    { rank: 8, pair: "NZD/CHF", score: -0.40, bias: "Bearish" },
    { rank: 9, pair: "GBP/USD", score: 0.62, bias: "Bullish" },
    { rank: 10, pair: "AUD/USD", score: 0.31, bias: "Neutral" },
    { rank: 11, pair: "EUR/GBP", score: -0.22, bias: "Bearish" },
    { rank: 12, pair: "USD/CHF", score: -0.67, bias: "Bearish" },
    { rank: 13, pair: "NZD/USD", score: 0.48, bias: "Bullish" },
];

export default function COTPairBiasTable() {
    return (
        <>
            <h5 className="text-center mb-3">Pair Bias</h5>

            <Pairs>
                {pairs.map(pair => (
                    <Pair
                        key={pair.rank}
                        rank={pair.rank}
                        pair={pair.pair}
                        score={pair.score}
                        bias={pair.bias}
                    />
                ))}
            </Pairs>
        </>
    );
};

function Pairs({ children }: React.PropsWithChildren) {
    return (
        <div className="horizontal-scroll">
            <table className="mt-8 w-full border-collapse text-sm text-center min-w-[400px]">
                <thead>
                    <tr className="whitespace-nowrap">
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Rank
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Pair
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Score
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Bias
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
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

function Pair({
    rank,
    pair,
    score,
    bias
}: {
    rank: number;
    pair: string;
    score: number;
    bias: string;
}) {

    const biasColor =
        bias === "Bullish"
            ? "bg-greenDark"
            : bias === "Bearish"
                ? "bg-red-600"
                : "bg-yellow-400 text-black";

    return (
        <tr>
            <td className="border-t border-charcoal px-4 py-3 font-semibold">
                {rank}
            </td>

            <td className="border-t border-charcoal px-4 py-3 font-semibold">
                {pair}
            </td>

            <td className="border-t border-charcoal px-4 py-3">
                {score.toFixed(2)}
            </td>

            <td className="border-t border-charcoal px-4 py-3">
                <div className={`rounded-[4px] px-2 py-1 w-20 mx-auto ${biasColor}`}>
                    {bias}
                </div>
            </td>

            <td className="border-t border-charcoal px-4 py-3">
                <div className="flex justify-center">
                    <BiasIcon sentiment={bias} />
                </div>
            </td>
        </tr>
    );
}