"use client";

import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import GuageChart from "@/components/chart/GuageChart";
import SeasonalGaugeNeedle from "@/components/chart/SeasonalGaugeNeedle";
import { getCurrencyFlagEmoji } from "@/lib/currencyFlags";
import {
    DARK_GAUGE_ZONES,
    getRotationForScore,
    LIGHT_GAUGE_ZONES,
    SEASONAL_CURRENCY_TREND_MAX,
    SEASONAL_CURRENCY_TREND_MIN,
} from "@/lib/seasonalGauge";

export interface CurrencySeasonalTrendGaugeItem {
    currency: string;
    score: number;
}

interface CurrencySeasonalTrendsProps {
    items?: CurrencySeasonalTrendGaugeItem[];
}

function SeasonalTrends({ children }: PropsWithChildren) {
    return (
        <div className="grid grid-cols-[repeat(auto-fill,110px)] justify-center gap-x-8 gap-y-10 bg-darkGrey rounded-xl px-7 py-8">
            {children}
        </div>
    );
}

function SeasonalTrend({
    currency,
    score,
    gaugeZones,
    isDark,
}: {
    currency: string;
    score: number;
    gaugeZones: Array<{ name: string; minValue: number; maxValue: number; color: string }>;
    isDark: boolean;
}) {
    const rotation = getRotationForScore(score);

    const displayScore = Math.max(SEASONAL_CURRENCY_TREND_MIN, Math.min(SEASONAL_CURRENCY_TREND_MAX, score));

    return (
        <div className="flex w-[148px] max-w-full flex-col items-center gap-5">
            <GuageChart
                style={{ width: "100%" }}
                indicatorStyle={{
                    transition: "0.8s ease-out",
                    rotation,
                }}
                gaugeZones={gaugeZones}
                hideArcLabels
                renderIndicator={({ rotation: rot, transition }) => (
                    <SeasonalGaugeNeedle layout="currencySeasonal" rotationDeg={rot} isDark={isDark} transition={transition} />
                )}
            />

            <span className="text-base font-semibold tabular-nums text-foreground">
                {displayScore >= 0 ? "+" : ""}
                {displayScore.toFixed(1)}
            </span>

            <span className="text-base font-normal flex items-center gap-2.5 text-foreground">
                <span className="text-base leading-none" aria-hidden>
                    {getCurrencyFlagEmoji(currency)}
                </span>
                {currency}
            </span>
        </div>
    );
}

function CurrencySeasonalTrends({ items = [] }: CurrencySeasonalTrendsProps) {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const updateTheme = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
        updateTheme();

        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const gaugeZones = useMemo(() => (isDarkMode ? DARK_GAUGE_ZONES : LIGHT_GAUGE_ZONES), [isDarkMode]);

    const fallbackItems: CurrencySeasonalTrendGaugeItem[] = [
        { currency: "USD", score: 2.6 },
        { currency: "EUR", score: -1.2 },
        { currency: "GBP", score: 1.5 },
        { currency: "JPY", score: -2.1 },
        { currency: "AUD", score: 0.9 },
        { currency: "CAD", score: 1.1 },
        { currency: "CHF", score: -0.8 },
        { currency: "NZD", score: 0.6 },
    ];

    const gauges = items.length > 0 ? items : fallbackItems;

    return (
        <div>
            <h5 className="mb-6">Currency Seasonal Trends</h5>

            <SeasonalTrends>
                {gauges.map((item) => (
                    <SeasonalTrend
                        key={item.currency}
                        currency={item.currency}
                        score={item.score}
                        gaugeZones={gaugeZones}
                        isDark={isDarkMode}
                    />
                ))}
            </SeasonalTrends>
        </div>
    );
}

export default CurrencySeasonalTrends;
