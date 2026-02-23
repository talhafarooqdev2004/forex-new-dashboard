"use client";

import {
    CurrencySeasonalTrends,
    SeasonalTrendsPairsAndBias,
    PeriodPicker,
} from "@/components/composed";
import Container from "@/components/ui/layout/Container";
import StrengthIndicatorsBar from "@/components/composed/StrengthIndicatorsBar";

export default function SeasonalTrendsClientPage() {
    const bullishCurrencies = [
        {
            label: "$ USD",
            value: "+1.00",
        },
        {
            label: "£ GBP",
            value: "+3.00",
        },
    ];

    const bearishCurrencies = [
        {
            label: "¥ JPY",
            value: "-7.00",
        },
        {
            label: "€ EUR",
            value: "-2.00",
        },
    ];

    return (
        <Container>
            <PeriodPicker />

            <TopCurrenciesSections>
                <TopCurrenciesSection
                    label="Top Bullish Currency"
                    type="bullish"
                    currencies={bullishCurrencies}
                />
                <TopCurrenciesSection
                    label="Top Bearish Currency"
                    type="bearish"
                    currencies={bearishCurrencies}
                />
            </TopCurrenciesSections>

            <CurrencySeasonalTrends />

            <SeasonalTrendsPairsAndBias />
        </Container>
    );
};

function TopCurrenciesSections({ children }: React.PropsWithChildren) {
    return (
        <div>
            <h5 className="mb-6">Top Bullish & Bearish Currencies</h5>

            <div className="flex items-center gap-6 min-w-0">
                {children}
            </div>
        </div>
    );
}

function TopCurrenciesSection({
    label,
    type,
    currencies
}: {
    label: string,
    type: "bullish" | "bearish",
    currencies:
    { label: string, value: string }[]
}) {
    return (
        <div className="bg-darkGrey rounded-xl px-6 py-8 flex-1">
            <h6 className="mb-4">{label}</h6>

            <StrengthIndicatorsBars>
                {currencies.map((currency) => (
                    <StrengthIndicatorsBar
                        key={currency.label}
                        type={type}
                        currency={currency.label}
                        value={currency.value}
                    />
                ))}
            </StrengthIndicatorsBars>
        </div>
    );
}

function StrengthIndicatorsBars({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-4">
            {children}
        </div>
    );
};
