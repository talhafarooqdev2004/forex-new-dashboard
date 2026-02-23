import Image from "next/image";

export default function CurrencySeasonalTrends() {
    return (
        <div>
            <h5 className="mb-6">Currency Seasonal Trends</h5>

            <SeasonalTrends>
                <SeasonalTrend>USD</SeasonalTrend>
                <SeasonalTrend>EUR</SeasonalTrend>
                <SeasonalTrend>GBP</SeasonalTrend>
                <SeasonalTrend>JPY</SeasonalTrend>
                <SeasonalTrend>AUD</SeasonalTrend>
                <SeasonalTrend>CAD</SeasonalTrend>
                <SeasonalTrend>CHF</SeasonalTrend>
                <SeasonalTrend>NZD</SeasonalTrend>
            </SeasonalTrends>
        </div>
    );
};

function SeasonalTrends({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-wrap items-center gap-3 bg-darkGrey rounded-xl px-7 py-6">
            {children}
        </div>
    );
};

function SeasonalTrend({ children }: React.PropsWithChildren) {
    return (
        <div className="flex-1 flex flex-col items-center">
            <Image
                src="/images/temporary/guage.svg"
                alt="Guage"
                width={135}
                height={100}
            />

            <span className="text-base -ml-2.5 -mt-6">
                {children}
            </span>
        </div>
    );
};