import { Button } from "@/components/ui";
import { LabelSection, Section } from "@/components/ui/layout";
import Container from "@/components/ui/layout/Container";
import { DisciplineTrackerGuage } from "@/components/composed/Guages";
import { UserTradeHistoryTable } from "@/components/composed/tables";
import { PipsAndEquityGrowth } from "@/components/composed/Charts";
import { PrimaryCard, PrimaryCards } from "@/components/composed";

export default function UserDashboardClientPage() {
    return (
        <Container>
            <div className="flex justify-between items-center">
                <h5>User Dashboard</h5>

                <div className="flex items-center gap-7">
                    <div className="flex items-center gap-4 border-r border-solid border-[#9CA3AF] pr-4">
                        <span className="text-[#62748E]">Plan:</span>
                        <span className="text-white">Silver/Gold/Platinum</span>
                    </div>

                    <div className="flex items-center gap-4 border-r border-solid border-[#9CA3AF] pr-4">
                        <span className="text-[#62748E]">Status:</span>
                        <span className="text-[#00D492]">Active</span>
                    </div>

                    <div className="flex items-center gap-4 border-r border-solid border-[#9CA3AF] pr-4">
                        <span className="text-[#62748E]">Renewal:</span>
                        <span>Feb 28, 2026</span>
                    </div>

                    <span className="text-[#00D492]">Enabled</span>
                </div>
            </div>

            <PrimaryCards className="mt-4">
                <PrimaryCard className="flex flex-col gap-2 w-full">
                    <span>Total Trades</span>
                    <span className="font-semibold text-xl">152</span>
                </PrimaryCard>

                <PrimaryCard className="flex flex-col gap-2 w-full">
                    <span>Win Rate</span>
                    <span className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="7" viewBox="0 0 8 7" fill="none">
                            <path d="M3.89648 0L7.7936 6.75H-0.000629902L3.89648 0Z" fill="#05DF72" />
                        </svg>
                        <span className="font-semibold text-xl text-greenDark">68%</span>
                    </span>
                </PrimaryCard>

                <PrimaryCard className="flex flex-col gap-2 w-full">
                    <span>Total Pips</span>
                    <span className="font-semibold text-xl">+1450.00</span>
                </PrimaryCard>

                <PrimaryCard className="flex-2 flex flex-col gap-2 w-full">
                    <span>Monthly Growth</span>
                    <div className="flex items-center gap-10">
                        <span className="font-semibold text-xl text-greenDark">$50000</span>
                        <span className="text-xl text-sell">-3.5%</span>
                    </div>
                </PrimaryCard>
            </PrimaryCards>

            <div className="flex flex-col lg:flex-row items-stretch gap-4 min-w-0">
                <LabelSection
                    label="Pips & Equity Growth"
                    padding={false}
                    className="w-full min-w-0"
                >
                    <PipsAndEquityGrowth />
                </LabelSection>

                <div className="flex flex-col gap-4 flex-1 w-full min-w-0">
                    <Section className="flex-1 min-w-0 overflow-hidden">
                        <UserTradeHistoryTable />
                    </Section>

                    <div className="flex gap-4">
                        <LabelSection label="Milestone Badges">
                            <MileStoneBadges />
                        </LabelSection>

                        <LabelSection label="Recent Alerts">
                            <RecentAlerts />
                        </LabelSection>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <LabelSection label="Package History" padding={false}>
                    <PackageHistory />
                </LabelSection>

                <LabelSection label="Discipline Tracker" padding={false}>
                    <DisciplineTrackerGuage />
                </LabelSection>

                <LabelSection label="Active Trades" padding={false}>
                    <ActiveTrades />
                </LabelSection>

                <LabelSection label="Activity Log" padding={false}>
                    <ActivityLog />
                </LabelSection>
            </div>
        </Container>
    );
};

function MileStoneBadges() {
    return (
        <>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(70px,1fr))] items-center justify-center gap-6 whitespace-nowrap">
                <div className="flex flex-col items-center gap-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M6 9H4.5C3.83696 9 3.20107 8.73661 2.73223 8.26777C2.26339 7.79893 2 7.16304 2 6.5C2 5.83696 2.26339 5.20107 2.73223 4.73223C3.20107 4.26339 3.83696 4 4.5 4H6" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18 9H19.5C20.163 9 20.7989 8.73661 21.2678 8.26777C21.7366 7.79893 22 7.16304 22 6.5C22 5.83696 21.7366 5.20107 21.2678 4.73223C20.7989 4.26339 20.163 4 19.5 4H18" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 22H20" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 14.6602V17.0002C10 17.5502 9.53 17.9802 9.03 18.2102C7.85 18.7502 7 20.2402 7 22.0002" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 14.6602V17.0002C14 17.5502 14.47 17.9802 14.97 18.2102C16.15 18.7502 17 20.2402 17 22.0002" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18 2H6V9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9V2Z" stroke="#00D492" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div className="flex flex-col items-center">
                        <span className="text-[#F1F5F9]">1000 Pips</span>
                        <span className="text-[#FFFFFF]/60">Corne Nigd</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">
                        <path d="M2.00341 13.0026C1.81418 13.0032 1.62864 12.9502 1.46836 12.8496C1.30809 12.749 1.17964 12.605 1.09796 12.4343C1.01628 12.2636 0.984703 12.0732 1.00691 11.8853C1.02912 11.6973 1.10419 11.5196 1.22341 11.3726L11.1234 1.1726C11.1977 1.08689 11.2989 1.02896 11.4104 1.00834C11.5219 0.987714 11.6371 1.00562 11.7371 1.05911C11.8371 1.1126 11.916 1.1985 11.9607 1.30271C12.0055 1.40692 12.0135 1.52325 11.9834 1.6326L10.0634 7.6526C10.0068 7.80413 9.98778 7.96712 10.008 8.12761C10.0282 8.2881 10.0871 8.44129 10.1795 8.57403C10.2719 8.70678 10.3952 8.81512 10.5387 8.88976C10.6822 8.96441 10.8417 9.00313 11.0034 9.0026H18.0034C18.1926 9.00196 18.3782 9.05502 18.5385 9.15563C18.6987 9.25623 18.8272 9.40025 18.9089 9.57095C18.9905 9.74165 19.0221 9.93202 18.9999 10.1199C18.9777 10.3079 18.9026 10.4856 18.7834 10.6326L8.88341 20.8326C8.80915 20.9183 8.70795 20.9762 8.59643 20.9969C8.48491 21.0175 8.36969 20.9996 8.26968 20.9461C8.16967 20.8926 8.09083 20.8067 8.04607 20.7025C8.00132 20.5983 7.99333 20.482 8.02341 20.3726L9.94341 14.3526C10 14.2011 10.019 14.0381 9.99882 13.8776C9.9786 13.7171 9.91975 13.5639 9.82732 13.4312C9.73489 13.2984 9.61164 13.1901 9.46813 13.1154C9.32463 13.0408 9.16516 13.0021 9.00341 13.0026H2.00341Z" stroke="#51A2FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div className="flex flex-col items-center">
                        <span className="text-[#F1F5F9]">Trade Ninja</span>
                        <span className="text-[#FFFFFF]/60">Completed</span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M20 13.0004C20 18.0004 16.5 20.5005 12.34 21.9505C12.1222 22.0243 11.8855 22.0207 11.67 21.9405C7.5 20.5005 4 18.0004 4 13.0004V6.00045C4 5.73523 4.10536 5.48088 4.29289 5.29334C4.48043 5.10581 4.73478 5.00045 5 5.00045C7 5.00045 9.5 3.80045 11.24 2.28045C11.4519 2.09945 11.7214 2 12 2C12.2786 2 12.5481 2.09945 12.76 2.28045C14.51 3.81045 17 5.00045 19 5.00045C19.2652 5.00045 19.5196 5.10581 19.7071 5.29334C19.8946 5.48088 20 5.73523 20 6.00045V13.0004Z" stroke="#00BCFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M9 12L11 14L15 10" stroke="#00BCFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div className="flex flex-col items-center">
                        <span className="text-[#F1F5F9]">Journal Ace</span>
                        <span className="text-[#FFFFFF]/60">80% Complete</span>
                    </div>
                </div>
            </div>
        </>
    );
};

function RecentAlerts() {
    return (
        <>
            <div className="flex flex-col gap-5">
                <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M22 17L13.5 8.5L8.5 13.5L2 7" stroke="#FF2056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 17H22V11" stroke="#FF2056" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                    <div className="flex flex-col gap-1">
                        <span className="font-semibold">USD/JPY Sell Alert</span>
                        <span>Strong Sell Signal</span>
                    </div>

                    <span className="text-[10px] text-[#00BCFF]">View Signals</span>
                </div>

                <div className="flex items-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z" fill="#00D492" fillOpacity="0.2" />
                        <g opacity="0.999227">
                            <path d="M6 10C6 7.79086 7.79086 6 10 6C12.2091 6 14 7.79086 14 10C14 12.2091 12.2091 14 10 14C7.79086 14 6 12.2091 6 10Z" fill="#00D492" />
                        </g>
                    </svg>

                    <span>Jan 30, 2026</span>
                </div>
            </div>

            <div className="absolute bottom-2 right-2">
                <Button variant="primary" size="primary">
                    View Signals
                </Button>
            </div>
        </>
    );
};

function PackageHistory() {
    return (
        <>
            <div className="flex flex-col gap-2 px-6 pb-6 border-b border-solid border-stroke">
                <div className="flex items-center gap-3">
                    <span className="text-xl">Silver Plan</span>
                    <span className="text-[#00C663] font-xl">Avtive</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xl">Renewal:</span>
                    <span>Feb 26,2026</span>
                </div>
            </div>

            <div className="mt-3 px-6 py-2">
                <span className="text-xl">Pro Membership</span>
            </div>
        </>
    );
}

function ActiveTrades() {
    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="border-b border-solid border-stroke pb-4 flex justify-between items-center px-6">
                    <span>EUR/USD</span>
                    <span className="text-[#00C663]">Buy</span>
                    <span className="text-[#00C663]">+40 Pips</span>
                </div>

                <div className="border-b border-solid border-stroke pb-4 flex justify-between items-center px-6">
                    <span>GBP/JPY</span>
                    <span className="text-[#FA003F]">Buy</span>
                    <span className="text-[#FA003F]">-40 Pips</span>
                </div>

                <div className="border-b border-solid border-stroke pb-4 flex justify-between items-center px-6">
                    <span>AUD/USD</span>
                    <span className="text-[#00C663]">Buy</span>
                    <span className="text-[#00C663]">+40 Pips</span>
                </div>
            </div>
        </>
    );
};

function ActivityLog() {
    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="border-b border-solid border-stroke pb-4 flex items-center gap-1 px-6">
                    <span>Last Login:</span>
                    <span>Today 8:35pm</span>
                </div>

                <div className="border-b border-solid border-stroke pb-4 flex items-center gap-1 px-6">
                    <span>Journal Entries Added:</span>
                    <span>832</span>
                </div>

                <div className="border-b border-solid border-stroke pb-4 flex items-center gap-1 px-6">
                    <span>Alerts Received:</span>
                    <span>2</span>
                </div>
            </div>

            <div className="absolute bottom-2 right-2">
                <Button variant="primary" size="primary">
                    View All
                </Button>
            </div>
        </>
    );
};