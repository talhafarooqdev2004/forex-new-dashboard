"use client";

import {
    CentralBankPoliciesSection,
    CommitmentsofTradersOverview,
    CurrencySeasonality,
    FundamentalCurrencyStrengthIndex,
} from "@/components/composed";
import { Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";

export default function FundamentalDashboardClientPage() {
    return (
        <Container className="grid grid-cols-2 3xl:grid-cols-3 gap-6">
            <FundamentalPageSection title="Fundamental Currency Strength Index">
                <FundamentalCurrencyStrengthIndex />
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