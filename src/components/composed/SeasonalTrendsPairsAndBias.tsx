"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import HeatMap from "./HeatMap";

export interface SeasonalPairBiasItem {
    pair: string;
    value: number;
}

interface SeasonalTrendsPairsAndBiasProps {
    items?: SeasonalPairBiasItem[];
    /** When set, replaces the default “Pair Seasonal Trends & Bias” heading. */
    title?: string;
    titleClassName?: string;
    /**
     * When true, an empty `items` array shows nothing instead of demo placeholder pairs
     * (used on Technical Dashboard with live Score Dashboard data).
     */
    disableFallback?: boolean;
    /** Shown when `disableFallback` and there are no items. */
    emptyContent?: ReactNode;
}

export default function SeasonalTrendsPairsAndBias({
    items = [],
    title = "Pair Seasonal Trends & Bias",
    titleClassName,
    disableFallback = false,
    emptyContent,
}: SeasonalTrendsPairsAndBiasProps) {
    const fallbackItems: SeasonalPairBiasItem[] = [
        { pair: "EURUSD", value: 1.2 },
        { pair: "GBPUSD", value: 0.9 },
        { pair: "USDJPY", value: -0.7 },
        { pair: "AUDUSD", value: -1.4 },
    ];

    const pairs = items.length > 0 ? items : disableFallback ? [] : fallbackItems;

    const seasonalDisplayRange =
        pairs.length > 0
            ? pairs.reduce(
                  (acc, item) => ({
                      min: Math.min(acc.min, item.value),
                      max: Math.max(acc.max, item.value),
                  }),
                  { min: pairs[0]!.value, max: pairs[0]!.value },
              )
            : undefined;

    return (
        <div>
            <h5 className={cn("mb-6", titleClassName)}>{title}</h5>

            {pairs.length === 0 ? (
                emptyContent ?? (
                    <div className="rounded-xl bg-darkGrey px-5 py-8 text-center text-sm text-[rgb(var(--secondary))]">
                        No pair heatmap data yet. Add rows to the Score Dashboard table (column 1 = pair, column 2 =
                        score).
                    </div>
                )
            ) : (
                <div className="rounded-xl bg-darkGrey px-5 py-6">
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                        {pairs.map((item) => (
                            <SeasonalTrendsPair
                                key={`${item.pair}-${item.value}`}
                                pair={item.pair}
                                value={item.value}
                                seasonalDisplayRange={seasonalDisplayRange}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function SeasonalTrendsPair({
    pair,
    value,
    seasonalDisplayRange,
}: {
    pair: string;
    value: number;
    seasonalDisplayRange?: { min: number; max: number };
}) {
    return (
        <HeatMap pair={pair} value={value} scoreScale="seasonal" seasonalDisplayRange={seasonalDisplayRange} />
    );
}
