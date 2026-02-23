import TechnicalDashboardClientPage from "./TechnicalDashboardClientPage";

const pairTickers = [
    {
        pair: "EUR/USD",
        price: 1.1045,
        change: -0.15,
    },

    {
        pair: "GBP/USD",
        price: 1.2693,
        change: -0.12,
    },
    {
        pair: "USD/JPY",
        price: 1.2345,
        change: -0.15,
    },
    {
        pair: "USD/CHF",
        price: 0.9124,
        change: 0.08,
    },
];

export default async function TechnicalDashboardPage() {
    return <TechnicalDashboardClientPage pairTickers={pairTickers} />;
};