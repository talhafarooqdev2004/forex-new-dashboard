import HeatMap from "./HeatMap";

export default function SeasonalTrendsPairsAndBias() {
    return (
        <div>
            <h5 className="mb-6">Pair Seasonal Trends & Bias</h5>

            <SeasonalTrendsPairs>
                <SeasonalTrendsPair pair="EURUSD" value={10} />
                <SeasonalTrendsPair pair="GBPUSD" value={-20} />
                <SeasonalTrendsPair pair="USDJPY" value={30} />
                <SeasonalTrendsPair pair="AUDUSD" value={-40} />
                <SeasonalTrendsPair pair="NZDUSD" value={-50} />
                <SeasonalTrendsPair pair="USDCAD" value={60} />
                <SeasonalTrendsPair pair="USDCHF" value={70} />
                <SeasonalTrendsPair pair="USDMXN" value={-80} />
                <SeasonalTrendsPair pair="USDCZK" value={90} />
                <SeasonalTrendsPair pair="USDNOK" value={-100} />
                <SeasonalTrendsPair pair="USDSGD" value={0} />
                <SeasonalTrendsPair pair="USDHKD" value={120} />
                <SeasonalTrendsPair pair="USDSEK" value={130} />
                <SeasonalTrendsPair pair="USDDKK" value={140} />
                <SeasonalTrendsPair pair="USDPLN" value={0} />
                <SeasonalTrendsPair pair="USDSGD" value={-110} />
                <SeasonalTrendsPair pair="USDHKD" value={120} />
                <SeasonalTrendsPair pair="USDSEK" value={0} />
                <SeasonalTrendsPair pair="USDDKK" value={140} />
                <SeasonalTrendsPair pair="USDPLN" value={0} />
                <SeasonalTrendsPair pair="USDSGD" value={110} />
                <SeasonalTrendsPair pair="USDHKD" value={0} />
                <SeasonalTrendsPair pair="USDSEK" value={130} />
                <SeasonalTrendsPair pair="USDDKK" value={140} />
                <SeasonalTrendsPair pair="USDPLN" value={150} />
                <SeasonalTrendsPair pair="USDSGD" value={110} />
                <SeasonalTrendsPair pair="USDHKD" value={120} />
                <SeasonalTrendsPair pair="USDSEK" value={-130} />
                <SeasonalTrendsPair pair="USDDKK" value={140} />
                <SeasonalTrendsPair pair="USDPLN" value={-150} />
                <SeasonalTrendsPair pair="USDSGD" value={110} />
                <SeasonalTrendsPair pair="USDHKD" value={0} />
                <SeasonalTrendsPair pair="USDSEK" value={130} />
                <SeasonalTrendsPair pair="USDDKK" value={140} />
                <SeasonalTrendsPair pair="USDPLN" value={-150} />
                <SeasonalTrendsPair pair="USDPLN" value={-150} />
                <SeasonalTrendsPair pair="USDSGD" value={110} />
                <SeasonalTrendsPair pair="USDHKD" value={10} />
                <SeasonalTrendsPair pair="USDSEK" value={-130} />
                <SeasonalTrendsPair pair="USDDKK" value={140} />
                <SeasonalTrendsPair pair="USDPLN" value={150} />
            </SeasonalTrendsPairs>
        </div>
    );
};

function SeasonalTrendsPairs({ children }: React.PropsWithChildren) {
    return (
        <div className="pr-2 bg-darkGrey scrollable-container rounded-xl">
            <div className="h-[400px] overflow-y-auto grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3 rounded-xl px-5 py-6">
                {children}
            </div>
        </div>
    );
};

function SeasonalTrendsPair({ pair, value }: { pair: string, value: number }) {
    return (
        <HeatMap pair={pair} value={value} />
    );
};
