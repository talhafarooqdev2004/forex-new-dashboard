"use client";

import type { PropsWithChildren } from "react";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

function StrengthIndicatorsBar({
    type,
    currency,
    value,
    score = 0,
}: {
    type: "bullish" | "bearish",
    currency: string,
    value: string,
    score?: number,
}) {
    // Hardcoded scale: max score 2 over 10 bars (each bar = 0.2).
    const normalizedUnits = Math.max(0, Math.min(10, Math.abs(score) / 0.2));

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-base">{currency}</span>
                <span
                    className="text-base font-semibold"
                    style={{ color: type === "bullish" ? GAUGE_SIGNAL_COLORS.buy : GAUGE_SIGNAL_COLORS.sell }}
                >
                    {value} %
                </span>
            </div>

            <StrengthIndicators>
                {Array.from({ length: 10 }, (_, idx) => (
                    <StrengthIndicator
                        key={idx}
                        type={type}
                        fillPercent={Math.max(0, Math.min(100, (normalizedUnits - idx) * 100))}
                    />
                ))}
            </StrengthIndicators>
        </div>
    );
}

function StrengthIndicators({ children }: PropsWithChildren) {
    return (
        <div className="flex items-center gap-1">
            {children}
        </div>
    );
}

function StrengthIndicator({ type, fillPercent }: { type: "bullish" | "bearish", fillPercent: number }) {
    return (
        <div className="h-2 rounded-2xl flex-1 bg-currencyStrengthIndexBackground overflow-hidden">
            <div
                className="h-full rounded-2xl"
                style={{
                    width: `${fillPercent}%`,
                    backgroundColor: type === "bullish" ? GAUGE_SIGNAL_COLORS.buy : GAUGE_SIGNAL_COLORS.sell,
                }}
            />
        </div>
    );
}

export default StrengthIndicatorsBar;