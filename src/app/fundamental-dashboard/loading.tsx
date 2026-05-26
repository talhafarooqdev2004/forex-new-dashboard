import Container from "@/components/ui/layout/Container";

import FundamentalDashboardPageSkeleton from "./FundamentalDashboardPageSkeleton";

export default function Loading() {
    return (
        <Container className="flex flex-col gap-8">
            <FundamentalDashboardPageSkeleton />
        </Container>
    );
}
