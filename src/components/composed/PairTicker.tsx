"use client";

import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

function PairTicker({
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
                style={{ color: isPositive ? GAUGE_SIGNAL_COLORS.buy : GAUGE_SIGNAL_COLORS.sell }}
            >
                {isPositive ? "+" : ""}{change}%
            </span>
        </div>
    );
}

export default PairTicker;