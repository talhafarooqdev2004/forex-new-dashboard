import { BiasIcon } from "..";

const outlooks = [
    { rank: 1, currency: "EUR", position: "+280K", prev: "+2.8 (+1%)", sentiment: "Bullish" },
    { rank: 2, currency: "GBP", position: "+280K", prev: "+2.8 (+1%)", sentiment: "Neutral" },
    { rank: 3, currency: "GBP", position: "+17K", prev: "+2.8 (+1%)", sentiment: "Bullish" },
    { rank: 4, currency: "CAD", position: "-14K", prev: "+2.8 (+1%)", sentiment: "Bearish" },
    { rank: 5, currency: "GBP", position: "-11K", prev: "+2.8 (+1%)", sentiment: "Bearish" },
    { rank: 6, currency: "CAD", position: "-40K", prev: "+2.8 (+1%)", sentiment: "Bearish" },
    { rank: 7, currency: "EUR", position: "-149K", prev: "+2.8 (+1%)", sentiment: "Bearish" },
    { rank: 8, currency: "GBP", position: "-16K", prev: "+2.8 (+1%)", sentiment: "Bearish" },
    { rank: 9, currency: "EUR", position: "+300K", prev: "+3.1 (+1.2%)", sentiment: "Bullish" },
    { rank: 10, currency: "AUD", position: "0K", prev: "+2.5 (+0.8%)", sentiment: "Bullish" },
    { rank: 11, currency: "GBP", position: "-22K", prev: "+1.9 (+0.7%)", sentiment: "Bearish" },
    { rank: 12, currency: "CAD", position: "+150K", prev: "+3.6 (+1.5%)", sentiment: "Bullish" },
    { rank: 13, currency: "EUR", position: "-5K", prev: "+2.0 (+0.5%)", sentiment: "Bearish" },
];

export default function FundamentalOutlookTable() {
    return (
        <>
            <h5 className="text-center pt-6 mb-4">JPY Fundamental Outlook</h5>

            <Outlooks>
                {outlooks.map(outlook => (
                    <Outlook
                        key={outlook.rank}
                        rank={outlook.rank}
                        currency={outlook.currency}
                        position={outlook.position}
                        prev={outlook.prev}
                        sentiment={outlook.sentiment}
                    />
                ))}
            </Outlooks>
        </>
    );
};

function Outlooks({ children }: React.PropsWithChildren) {
    return (
        <div className="horizontal-scroll">
            <table className="w-full border-collapse border border-charcoal text-sm text-center min-w-[600px]">
                <thead>
                    <tr className="whitespace-nowrap">
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Rank
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Currency
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Position
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
                            Prev
                        </th>
                        <th className="border-t border-b border-charcoal px-4 py-3">
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
};

function Outlook({
    rank,
    currency,
    position,
    prev,
    sentiment
}: {
    rank: number;
    currency: string;
    position: string;
    prev: string;
    sentiment: string;
}) {
    const biasColor =
        sentiment === "Bullish"
            ? "bg-greenDark"
            : sentiment === "Bearish"
                ? "bg-red-600"
                : "bg-yellow-400 text-black";

    return (
        <tr>
            <td className="border border-charcoal px-4 py-3 font-semibold">
                {rank}
            </td>

            <td className="border border-charcoal px-4 py-3 font-semibold">
                <div className="flex items-center justify-center gap-[10px]">
                    {currency}
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="20" viewBox="0 0 80 20" fill="none">
                        <g clipPath="url(#clip0_59_10765)">
                            <path opacity="0.8" d="M0 20L7.27273 16L14.5455 18.4L21.8182 13.6L29.0909 12L36.3636 10.4L43.6364 8L50.9091 5.6L58.1818 7.2L65.4545 4L72.7273 2.4L80 0" stroke="#4ADE80" strokeWidth="1.5" />
                        </g>
                        <defs>
                            <clipPath id="clip0_59_10765">
                                <rect width="80" height="20" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                </div>
            </td>

            <td className="border border-charcoal px-4 py-3">
                {position}
            </td>

            <td className="border border-charcoal px-4 py-3">
                {prev}
            </td>

            <td className="border border-charcoal px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                    <div className={`rounded-[4px] px-2 py-1 w-20 text-center ${biasColor}`}>
                        {sentiment}
                    </div>
                    <BiasIcon sentiment={sentiment} />
                </div>
            </td>
        </tr>
    );
};