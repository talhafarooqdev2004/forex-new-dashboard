import { cn } from "@/lib/utils";

export default function PairTicker({
    pair,
    price,
    change
}: {
    pair: string;
    price: number;
    change: number;
}) {
    const isPositive = change > 0;

    return (
        <div className="ticker">
            <span className="text-secondary">{pair}</span>
            <span className="text-foreground">{price}</span>
            <span
                className={cn(
                    isPositive ? "text-green" : "text-sell",
                )}
            >
                {isPositive ? "+" : ""}{change}%
            </span>
        </div>
    );
};