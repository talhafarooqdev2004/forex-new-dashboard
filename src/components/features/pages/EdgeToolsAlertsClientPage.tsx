import { CurrencyStrengthIndex, CurrencyStrengthIndexes } from "@/components/composed";
import {
    DirectionDriveIndex,
    SentimentDriveIndex,
    TrendAlignmentScoreChart,
} from "@/components/composed/Charts";
import { Textarea } from "@/components/ui";
import { Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";
import Image from "next/image";

const currencyStrengthData = [
    { currency: "EUR", strength: 100, value: "-100" },
    { currency: "USD", strength: 20, value: "+20" },
    { currency: "GBP", strength: 50, value: "+50" },
    { currency: "GBP", strength: 50, value: "-50" },
];

export default function EdgeToolsAlertsClientPage() {
    return (
        <Container>
            <div className="flex gap-6">
                <Guages>
                    <Guage title="Trend" score={8} />
                    <Guage title="Momentum" score={8} />
                    <Guage title="Volatility" score={8} />
                </Guages>

                <Section className="w-[55%]">
                    <h5 className="text-left">Market Summary</h5>
                </Section>
            </div>

            <div className="flex gap-6 min-w-0">
                <div className="flex-1 min-w-0">
                    <DirectionDriveIndex />
                </div>
                <div className="flex-1 min-w-0">
                    <SentimentDriveIndex />
                </div>
            </div>

            <Textarea variant="dark" rows={3} placeholder="Text" />

            <div className="flex gap-6">
                <Section className="flex-1 flex items-center justify-center gap-3">
                    <h5>Risk Mode</h5>
                    <Image
                        src="/images/temporary/guage.svg"
                        alt="Guage"
                        width={180}
                        height={100}
                        className="ml-4"
                    />
                </Section>
                <Section className="flex-1">
                    <Textarea variant="dark" rows={9} placeholder="Text" />
                </Section>
            </div>

            <div className="flex gap-6">
                <Section className="flex-1">
                    <h5 className="mb-3">
                        Currency Strength Index
                        <span className="text-lg">(LTF)</span>
                    </h5>

                    <CurrencyStrengthIndexes>
                        {currencyStrengthData.map((item, idx) => (
                            <CurrencyStrengthIndex
                                key={idx}
                                currency={item.currency}
                                strength={item.strength}
                                value={item.value}
                            />
                        ))}
                    </CurrencyStrengthIndexes>
                </Section>
                <Section className="flex-1">
                    <Textarea variant="dark" rows={9} placeholder="Text" />
                </Section>
            </div>

            <div className="flex gap-6">
                <Section className="flex-1">

                </Section>
                <Section className="flex-1">

                </Section>
                <Section className="flex-1">

                </Section>
            </div>

            <TrendAlignmentScoreChart />
        </Container>
    );
};

function Guages({ children }: React.PropsWithChildren) {
    return (
        <div className="flex gap-4 w-[45%]">
            {children}
        </div>
    );
};

function Guage({ title, score }: { title: string, score: number }) {
    return (
        <div className="bg-darkGrey rounded-xl flex-1">
            <h5 className="text-center border-b border-stroke p-3">{title}</h5>

            <div className="flex flex-col items-center gap-2 justify-center p-3">
                <Image
                    src="/images/temporary/guage.svg"
                    alt="Guage"
                    width={135}
                    height={100}
                    className="ml-4"
                />
                <span className="text-primary font-semibold text-lg -mt-12">{score}</span>
                <span className="text-primary font-semibold text-lg -mt-2">Score</span>
            </div>
        </div>
    );
};