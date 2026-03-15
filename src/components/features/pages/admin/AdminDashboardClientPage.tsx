import {
    PrimaryCard,
    PrimaryCards,
    SvgIcon,
} from "@/components/composed";
import {
    RevenueGrowthChart,
    SubscriberGrowthChart,
    TopCountriesChart,
} from "@/components/composed/Charts";
import { ThisMonthSubscriberGuage } from "@/components/composed/Guages";
import { LabelSection, Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";

export default function AdminDashboardClientPage() {
    return (
        <Container>
            <h5>Admin Dashboard</h5>

            <PrimaryCards className="mt-4">
                <PrimaryCard className="flex flex-col gap-2">
                    <span>Total Subscribers</span>
                    <div className="flex items-center gap-2">
                        <SvgIcon icon="user" />
                        <span className="font-semibold text-xl">152</span>
                    </div>
                </PrimaryCard>

                <PrimaryCard className="flex flex-col gap-2">
                    <span>Active Subscriber</span>
                    <div className="flex items-center gap-2">
                        <SvgIcon icon="user" />
                        <div className="flex items-center gap-2">
                            <SvgIcon icon="revenue-growth" />
                            <span className="font-semibold text-xl text-greenDark">68%</span>
                        </div>
                    </div>
                </PrimaryCard>

                <PrimaryCard className="flex flex-col gap-2">
                    <span>Inactive Subscribers</span>
                    <div className="flex items-center gap-2">
                        <SvgIcon icon="inactive-subscribers" />
                        <span className="font-semibold text-xl">+1450.00</span>
                    </div>
                </PrimaryCard>

                <PrimaryCard className="flex-2 flex flex-col gap-2">
                    <span>New Subscriber This Month</span>
                    <div className="flex items-center gap-2">
                        <SvgIcon icon="user" />
                        <span className="font-semibold text-xl text-greenDark">378</span>
                        <span className="text-xs text-greenDark">+134</span>
                        <span>Paid</span>
                    </div>
                </PrimaryCard>
            </PrimaryCards>

            <PrimaryCards className="mt-2">
                <PrimaryCard className="flex flex-col items-center gap-2">
                    <span>Total Revenue</span>
                    <div className="flex items-center gap-2">
                        <SvgIcon icon="dollar-sign" />
                        <span className="font-semibold text-xl">1,389</span>
                    </div>
                </PrimaryCard>

                <PrimaryCard className="flex flex-col items-center gap-2">
                    <span>Revenue This Month</span>
                    <div className="flex items-center gap-2">
                        <SvgIcon icon="dollar-sign" />
                        <span className="font-semibold text-xl">1,389</span>
                    </div>
                </PrimaryCard>

                <PrimaryCard className="flex flex-col items-center gap-2">
                    <span>Website Visitor</span>
                    <span className="font-semibold text-xl">1,389</span>
                </PrimaryCard>
            </PrimaryCards>

            <div className="flex flex-col lg:flex-row gap-4 mt-4 min-w-0">
                <div className="w-full lg:w-[40%] flex min-w-0">
                    <LabelSection label="Subscriber Growth" padding={false} className="w-full min-w-0 overflow-hidden">
                        <SubscriberGrowthChart />
                    </LabelSection>
                </div>

                <div className="w-full lg:w-[30%] flex min-w-0">
                    <LabelSection label="Revenue Growth" padding={false} className="w-full min-w-0 overflow-hidden">
                        <RevenueGrowthChart />
                    </LabelSection>
                </div>

                <div className="w-full lg:w-[30%] flex min-w-0">
                    <LabelSection label="Top Countries">
                        <TopCountriesChart />
                    </LabelSection>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 mt-4">
                <div className="flex flex-col gap-4 w-full lg:w-[70%]">
                    <Section>
                        <TotalRevenueSection />
                    </Section>

                    <div className="flex flex-col sm:flex-row gap-4 flex-1">
                        <LabelSection label="Total Subscribers">
                            <TotalSubscriberSection />
                        </LabelSection>

                        <LabelSection label="Current Month Subscribers">
                            <CurrentMonthSubscriberSection />
                        </LabelSection>
                    </div>
                </div>

                <div className="w-full lg:w-[30%] flex flex-col">
                    <LabelSection label="This Month Subscriber">
                        <ThisMonthSubscriberGuage />
                    </LabelSection>
                </div>
            </div>
        </Container>
    );
};

function TotalRevenueSection() {
    return (
        <div className="flex flex-col gap-6 justify-between font-semibold h-full">
            <div className="flex items-center justify-between">
                <span className="text-xl">Total Revenue</span>
                <span className="text-xl">$54,970</span>
            </div>
            <div className="rounded-xl bg-currencyStrengthIndexBackground h-[11px]">
                <div className="w-1/2 h-full bg-greenDark rounded-xl"></div>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-xl">This Month</span>
                <span className="text-xl">123,00</span>
            </div>
        </div>
    );
};


function TotalSubscriberSection() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span>Free</span>
                <span>569</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Paid</span>
                <span>600</span>
            </div>
        </div>
    );
};

function CurrentMonthSubscriberSection() {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span>Free</span>
                <span>456</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Paid</span>
                <span>230</span>
            </div>
        </div>
    );
};