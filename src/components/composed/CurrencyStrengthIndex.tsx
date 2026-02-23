import { cn } from "@/lib/utils";

export default function CurrencyStrengthIndex({ currency, value }: { currency: string, value: number }) {
    const isPositive = value > 0;
    const width = `${Math.abs(value) * 10}%`;

    return (
        <div className="flex items-center gap-4">
            <span className="w-10 text-sm font-semibold">{currency}</span>
            <div className="w-full h-7 bg-[#101828]">
                <div
                    className={cn("relative h-full flex items-center", isPositive ? "bg-[#166534]" : "bg-[#991B1B]")}
                    style={{ width }}
                >
                    <span className="absolute bottom-1.5 right-2 text-white text-xs font-arimo">{isPositive ? "+" : ""}{value}</span>
                </div>
            </div>
        </div>
    );
};