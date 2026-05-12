import { Suspense } from "react";

import CurrencyFundamentalsClientPage from "@/components/features/pages/CurrencyFundamentalsClientPage";
import CurrencyFundamentalsPageSkeleton from "./CurrencyFundamentalsPageSkeleton";
import Container from "@/components/ui/layout/Container";
import { pageSeo } from "@/lib/seo";
import { serverFetchDynamicTablesByIdentifiers } from "@/lib/serverAdminApi";

export const metadata = pageSeo(
    "Currency Fundamentals",
    "Per-currency fundamental factor tables, scores, and macro context for G10 and major crosses.",
    "/currency-fundamentals",
);

const CURRENCIES = ["usd", "gbp", "eur", "cad", "aud", "nzd", "chf", "jpy"] as const;

async function CurrencyFundamentalsWithData() {
    const identifiers = CURRENCIES.map((c) => `currency_fundamentals_${c}`);
    const initialCurrencyTables = await serverFetchDynamicTablesByIdentifiers(identifiers);
    return <CurrencyFundamentalsClientPage initialCurrencyTables={initialCurrencyTables} />;
}

export default function CurrencyFundamentalsPage() {
    return (
        <Suspense
            fallback={
                <Container className="relative">
                    <CurrencyFundamentalsPageSkeleton />
                </Container>
            }
        >
            <CurrencyFundamentalsWithData />
        </Suspense>
    );
}
