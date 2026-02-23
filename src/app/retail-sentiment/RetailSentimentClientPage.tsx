"use client";

import { RetailSentimentChart } from "@/components/composed/Charts";
import Container from "@/components/ui/layout/Container";
import { Section } from "@/components/ui/layout";

export default function RetailSentimentClientPage() {
    return (
        <Container>
            <Section className="w-fit mx-auto">
                <RetailSentimentChart />
            </Section>
        </Container>
    );
};
