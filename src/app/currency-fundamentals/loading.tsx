import Container from "@/components/ui/layout/Container";

import CurrencyFundamentalsPageSkeleton from "./CurrencyFundamentalsPageSkeleton";

export default function Loading() {
    return (
        <Container className="relative">
            <CurrencyFundamentalsPageSkeleton />
        </Container>
    );
}
