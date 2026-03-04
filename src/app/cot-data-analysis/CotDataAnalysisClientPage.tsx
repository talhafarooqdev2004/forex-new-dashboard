import { Icon } from "@/components/composed";
import { COTNonComLongVsShort, COTWeeklyChangeNetPositions } from "@/components/composed/Charts";
import { COTPairBiasTable, FundamentalOutlookTable } from "@/components/composed/tables";
import { LabelSection, Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";

export default function CotDataAnalysisClientPage() {

    return (
        <Container>
            <div className="flex gap-6 min-w-0">
                <div className="flex flex-col gap-6 min-w-0 flex-1">
                    <Section>
                        <div className="flex items-center gap-2">
                            <h5 className="font-normal text-">Overall Sentiment for April:</h5>

                            <div className="flex items-center gap-1">
                                <h5 className="text-[#05DF72]">RISK-ON</h5>
                                <svg xmlns="http://www.w3.org/2000/svg" width="23" height="23" viewBox="0 0 23 23" fill="none">
                                    <path d="M6.66602 6.66602H16.1883V16.1883" stroke="#05DF72" strokeWidth="1.90446" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M6.66602 16.1883L16.1883 6.66602" stroke="#05DF72" strokeWidth="1.90446" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        <p className="mt-3">
                            Traders are favoring riskier currencies and assets. This typically results in a bullish bias for USD, EUR, GBP, and AUD, and a bearish bias for JPY, CHF, and NZD.
                        </p>
                    </Section>

                    <div className="flex flex-wrap gap-6">
                        <LabelSection
                            label="Bullish Sentiment"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                <path d="M22.7861 7.30078L13.9354 16.1515L8.72913 10.9452L1.96094 17.7134" stroke="#05DF72" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M16.5391 7.30078L22.7866 7.30078L22.7866 13.5483" stroke="#05DF72" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>}
                            padding={false}
                            className="flex-1"
                        >
                            <div>
                                <div className="py-3">
                                    <div className="flex items-center justify-between px-6">
                                        <span className="font-semibold">EUR</span>

                                        <div className="flex items-center gap-3">
                                            <span className="text-secondary">+208K</span>

                                            <div className="flex items-center gap-2">
                                                <Icon name="profit-icon.svg" width={11} height={11} />
                                                <span className="text-[#05DF72]">+10K</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-solid border-stroke py-3">
                                    <div className="flex items-center justify-between px-6">
                                        <span className="font-semibold">EUR</span>

                                        <div className="flex items-center gap-3">
                                            <span className="text-secondary">+208K</span>

                                            <div className="flex items-center gap-2">
                                                <Icon name="profit-icon.svg" width={11} height={11} />
                                                <span className="text-[#05DF72]">+10K</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </LabelSection>
                        <LabelSection label="Bearish Sentiment" icon={<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                            <path d="M22.7861 17.6895L13.9354 8.83875L8.72913 14.045L1.96094 7.27686" stroke="#FF0000" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16.5391 17.6895H22.7866V11.4419" stroke="#FF0000" strokeWidth="2.08252" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>} padding={false} className="flex-1">
                            <div>
                                <div className="py-3">
                                    <div className="flex items-center justify-between px-6">
                                        <span className="font-semibold">EUR</span>

                                        <div className="flex items-center gap-3">
                                            <span className="text-secondary">+208K</span>

                                            <div className="flex items-center gap-2">
                                                <Icon name="profit-icon.svg" width={11} height={11} />
                                                <span className="text-[#05DF72]">+10K</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-solid border-stroke py-3">
                                    <div className="flex items-center justify-between px-6">
                                        <span className="font-semibold">EUR</span>

                                        <div className="flex items-center gap-3">
                                            <span className="text-secondary">+208K</span>

                                            <div className="flex items-center gap-2">
                                                <Icon name="profit-icon.svg" width={11} height={11} />
                                                <span className="text-[#05DF72]">+10K</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </LabelSection>
                    </div>

                    <Section padding={false}>
                        <FundamentalOutlookTable />
                    </Section>
                </div>

                <Section className="min-w-0">
                    <COTPairBiasTable />
                </Section>
            </div>

            <COTNonComLongVsShort />

            <COTWeeklyChangeNetPositions />
        </Container>
    );
};