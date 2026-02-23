import { cn } from "@/lib/utils";

export default function CurrencySeasonality() {
    return (
        <CurrencySeasonalityIndexes>
            <CurrencySeasonalityIndex currency="EUR" strength={100} value="+100" />
            <CurrencySeasonalityIndex currency="USD" strength={20} value="+20" />
            <CurrencySeasonalityIndex currency="GBP" strength={50} value="+50" />
            <CurrencySeasonalityIndex currency="JPY" strength={40} value="+40" />
            <CurrencySeasonalityIndex currency="CHF" strength={20} value="-20" />
            <CurrencySeasonalityIndex currency="CAD" strength={90} value="-90" />
            <CurrencySeasonalityIndex currency="AUD" strength={60} value="+60" />
            <CurrencySeasonalityIndex currency="NZD" strength={8} value="+8" />
            <CurrencySeasonalityIndex currency="MXN" strength={70} value="-70" />
            <CurrencySeasonalityIndex currency="CAD" strength={90} value="-90" />
            <CurrencySeasonalityIndex currency="AUD" strength={60} value="+60" />
            <CurrencySeasonalityIndex currency="NZD" strength={8} value="+8" />
            <CurrencySeasonalityIndex currency="MXN" strength={70} value="-70" />
            <CurrencySeasonalityIndex currency="CAD" strength={90} value="-90" />
            <CurrencySeasonalityIndex currency="AUD" strength={60} value="+60" />
            <CurrencySeasonalityIndex currency="NZD" strength={8} value="+8" />
            <CurrencySeasonalityIndex currency="MXN" strength={70} value="-70" />
            <CurrencySeasonalityIndex currency="MXN" strength={70} value="-70" />
        </CurrencySeasonalityIndexes>
    );
};


function CurrencySeasonalityIndexes({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-3 mt-8">
            {children}
        </div>
    );
}

function CurrencySeasonalityIndex({ currency, strength, value }: { currency: string, strength: number, value: string }) {
    const isPositive = Number(value) > 0;

    return (
        <div className="flex items-center gap-4">
            <span>{currency}</span>

            <div className={cn("relative rounded-[3px] h-[30px]", isPositive ? "bg-[#00C950]" : "bg-[#FF0000]")} style={{ width: `${strength}%` }}>
                <span className="absolute right-2 top-1/2 -translate-y-1/2">{value}</span>
            </div>
        </div>
    );
};