import { cn } from "@/lib/utils";

function CurrencyStrengthIndexes({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-3">
            {children}
        </div>
    );
}

type CurrencyStrengthIndexProps = {
    currency: string;
    value: number | string;
    strength?: number;
};

function CurrencyStrengthIndex({ currency, strength, value }: CurrencyStrengthIndexProps) {
    const numValue = Number(value);
    const isPositive = numValue > 0;
    // When strength not provided, derive from value (scale -10 to +10 → 0% to 100%)
    const barWidth = strength ?? Math.max(0, Math.min(100, ((numValue + 10) / 20) * 100));

    return (
        <div className="flex items-center gap-4">
            <span>{currency}</span>

            <div className="h-[30px] bg-[#1E2939] rounded-[3px] flex w-full">
                <div className={cn("relative rounded-[3px]", isPositive ? "bg-[#00C950]" : "bg-[#FF0000]")} style={{ width: `${barWidth}%` }}>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2">{value}</span>
                </div>
            </div>
        </div>
    );
}

export { CurrencyStrengthIndexes, CurrencyStrengthIndex };