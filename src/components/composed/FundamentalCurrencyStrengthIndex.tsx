import { cn } from "@/lib/utils";
import Image from "next/image";

export default function FundamentalCurrencyStrengthIndex() {
    return (
        <div className="flex flex-col gap-4">
            <CurrencyStrengthIndexes>
                <CurrencyStrengthIndex currency="EUR" strength={100} value="+100" />
                <CurrencyStrengthIndex currency="USD" strength={20} value="+20" />
                <CurrencyStrengthIndex currency="GBP" strength={50} value="+50" />
                <CurrencyStrengthIndex currency="JPY" strength={40} value="+40" />
                <CurrencyStrengthIndex currency="CHF" strength={20} value="-20" />
                <CurrencyStrengthIndex currency="CAD" strength={90} value="-90" />
                <CurrencyStrengthIndex currency="AUD" strength={60} value="+60" />
                <CurrencyStrengthIndex currency="NZD" strength={8} value="+8" />
                <CurrencyStrengthIndex currency="MXN" strength={70} value="-70" />
                <CurrencyStrengthIndex currency="CAD" strength={90} value="-90" />
                <CurrencyStrengthIndex currency="AUD" strength={60} value="+60" />
                <CurrencyStrengthIndex currency="NZD" strength={8} value="+8" />
                <CurrencyStrengthIndex currency="MXN" strength={70} value="-70" />
            </CurrencyStrengthIndexes>

            <div className="flex justify-between h-24">
                <h6 className="self-end">Risk Mode</h6>

                <Image
                    src="/images/temporary/guage.svg"
                    alt="Guage"
                    width={150}
                    height={100}
                    className="self-start"
                />
            </div>
        </div>
    );
};

function CurrencyStrengthIndexes({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-3 mt-8">
            {children}
        </div>
    );
}

function CurrencyStrengthIndex({ currency, strength, value }: { currency: string, strength: number, value: string }) {
    const isPositive = Number(value) > 0;

    return (
        <div className="flex items-center gap-4">
            <span>{currency}</span>

            <div className="h-[30px] bg-[#1E2939] rounded-[3px] flex w-full">
                <div className={cn("relative rounded-[3px]", isPositive ? "bg-[#00C950]" : "bg-[#FF0000]")} style={{ width: `${strength}%` }}>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2">{value}</span>
                </div>
            </div>
        </div>
    );
};