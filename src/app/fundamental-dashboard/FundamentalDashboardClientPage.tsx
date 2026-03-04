"use client";

import {
    CentralBankPoliciesSection,
    CommitmentsofTradersOverview,
    CurrencySeasonality,
    FundamentalCurrencyStrengthIndex,
} from "@/components/composed";
import { Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";

const currencyStrengthData = [
    { currency: "EUR", strength: 100, value: "+100" },
    { currency: "USD", strength: 20, value: "+20" },
    { currency: "GBP", strength: 50, value: "+50" },
    { currency: "JPY", strength: 40, value: "+40" },
    { currency: "CHF", strength: 20, value: "-20" },
    { currency: "CAD", strength: 90, value: "-90" },
    { currency: "AUD", strength: 60, value: "+60" },
    { currency: "NZD", strength: 8, value: "+8" },
    { currency: "MXN", strength: 70, value: "-70" },
    { currency: "CAD", strength: 90, value: "-90" },
    { currency: "AUD", strength: 60, value: "+60" },
    { currency: "NZD", strength: 8, value: "+8" },
    { currency: "MXN", strength: 70, value: "-70" },
];

export default function FundamentalDashboardClientPage() {
    return (
        <Container className="grid grid-cols-2 3xl:grid-cols-3">
            <FundamentalPageSection title="Fundamental Currency Strength Index">
                <FundamentalCurrencyStrengthIndex currencyStrengthData={currencyStrengthData} />
            </FundamentalPageSection>

            <FundamentalPageSection title="Commitments of Traders (COT) Overview">
                <CommitmentsofTradersOverview />
            </FundamentalPageSection>

            <FundamentalPageSection title="Central Bank Policies">
                <CentralBankPoliciesSection />
            </FundamentalPageSection>

            <FundamentalPageSection title="Currency Seasonality (Apr-2024)">
                <CurrencySeasonality />
            </FundamentalPageSection>
        </Container>
    );
};

function FundamentalPageSection({ title, children }: React.PropsWithChildren<{ title: string }>) {
    return (
        <Section className="relative">
            <div>
                <h5>{title}</h5>
            </div>
            <hr className="border-stroke absolute top-[60px] left-0 right-0" />
            {children}
        </Section>
    );
}