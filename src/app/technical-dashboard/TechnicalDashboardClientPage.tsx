"use client";

import styles from "./TechnicalDashboardClientPage.module.scss";

import {
    CurrencyStrengthIndex,
    HeatMap,
    PairTicker,
} from "@/components/composed";
import { AdvanceChart } from "@/components/composed/Charts";
import { MarketPulseGuage } from "@/components/composed/Guages";
import Container from "@/components/ui/layout/Container";

interface PairTickerProps {
    pair: string;
    price: number;
    change: number;
}

export default function TechnicalDashboardClientPage({
    pairTickers,
}: {
    pairTickers: PairTickerProps[];
}) {
    return (
        <Container>
            <PairTickers>
                <LiveMarketTape />

                {pairTickers.map((pairTicker) => (
                    <PairTicker
                        key={pairTicker.pair}
                        pair={pairTicker.pair}
                        price={pairTicker.price}
                        change={pairTicker.change}
                    />
                ))}
            </PairTickers>

            <div className="flex flex-col lg:flex-row items-stretch gap-6 min-w-0">
                <div className="w-full lg:w-[70%] min-w-0 flex-1">
                    <h6 className="font-semibold mb-5">Currency Pair Heatmap</h6>

                    <HeatMaps>
                        <HeatMap pair="EUR/USD" value={0} />
                        <HeatMap pair="GBP/USD" value={50} />
                        <HeatMap pair="USD/JPY" value={40} />
                        <HeatMap pair="USD/CHF" value={30} />
                        <HeatMap pair="USD/CAD" value={20} />
                        <HeatMap pair="USD/MXN" value={10} />
                        <HeatMap pair="USD/BRL" value={5} />
                        <HeatMap pair="USD/ARS" value={0} />
                        <HeatMap pair="USD/ARS" value={-10} />
                        <HeatMap pair="USD/ARS" value={-20} />
                        <HeatMap pair="USD/ARS" value={0} />
                        <HeatMap pair="USD/ARS" value={-40} />
                        <HeatMap pair="USD/ARS" value={-50} />
                        <HeatMap pair="USD/ARS" value={0} />
                        <HeatMap pair="USD/ARS" value={-70} />
                        <HeatMap pair="USD/ARS" value={-80} />
                        <HeatMap pair="USD/ARS" value={-90} />
                        <HeatMap pair="USD/ARS" value={0} />
                        <HeatMap pair="USD/ARS" value={-110} />
                        <HeatMap pair="USD/ARS" value={-120} />
                        <HeatMap pair="USD/ARS" value={0} />
                        <HeatMap pair="USD/ARS" value={-140} />
                        <HeatMap pair="USD/ARS" value={0} />
                        <HeatMap pair="USD/ARS" value={-160} />
                        <HeatMap pair="USD/ARS" value={-170} />
                        <HeatMap pair="USD/ARS" value={-180} />
                        <HeatMap pair="EUR/USD" value={60} />
                        <HeatMap pair="GBP/USD" value={50} />
                    </HeatMaps>
                </div>

                <div className="w-full lg:w-[30%] flex-shrink-0 bg-darkGrey rounded-xl px-6 py-4">
                    <h6 className="font-semibold mb-3">Currency Strength Index <span className="font-normal">(LTF)</span></h6>

                    <CurrencyStrengthIndexes>
                        <CurrencyStrengthIndex currency="EUR" value={7.1} />
                        <CurrencyStrengthIndex currency="USD" value={-5.1} />
                        <CurrencyStrengthIndex currency="GBP" value={3.2} />
                        <CurrencyStrengthIndex currency="JPY" value={10} />
                        <CurrencyStrengthIndex currency="CHF" value={7.4} />
                        <CurrencyStrengthIndex currency="CAD" value={4.5} />
                        <CurrencyStrengthIndex currency="MXN" value={4.6} />
                        <CurrencyStrengthIndex currency="BRL" value={3.7} />
                        <CurrencyStrengthIndex currency="ARS" value={7.8} />
                        <CurrencyStrengthIndex currency="CLP" value={6.9} />
                        <CurrencyStrengthIndex currency="INR" value={2.0} />
                        <CurrencyStrengthIndex currency="RUB" value={3.1} />
                        <CurrencyStrengthIndex currency="TRY" value={9.2} />
                        <CurrencyStrengthIndex currency="ZAR" value={7.3} />
                        <CurrencyStrengthIndex currency="MXN" value={4.4} />
                        <CurrencyStrengthIndex currency="BRL" value={-10} />
                    </CurrencyStrengthIndexes>
                </div>
            </div>

            <AdvanceChart />

            <div className="flex flex-col lg:flex-row gap-8 min-w-0">
                <div className="w-full lg:w-[65%] min-w-0 flex-1">
                    <h6 className="font-semibold mb-5 text-center">Market Pulse</h6>

                    <MarketPulseGuages>
                        <MarketPulseGuage />
                        <MarketPulseGuage />
                        <MarketPulseGuage />
                        <MarketPulseGuage />
                    </MarketPulseGuages>
                </div>

                <div className="w-full lg:w-[35%] flex-shrink-0 mt-0 lg:mt-[48.5px]">
                    <div className={styles.container}>
                        <div className={styles.indicatorbars}>
                            <div className={styles.text}>
                                <b className={styles.trend}>Trend</b>
                            </div>
                            <div className={styles.container2}>
                                <div className={styles.container3} />
                                <div className={styles.container4} />
                                <div className={styles.container5} />
                                <div className={styles.container6} />
                                <div className={styles.container7} />
                                <div className={styles.container8} />
                                <div className={styles.container9} />
                                <div className={styles.container10} />
                                <div className={styles.container11} />
                                <div className={styles.container12} />
                                <div className={styles.container13} />
                                <div className={styles.container14} />
                                <div className={styles.container15} />
                                <div className={styles.container16} />
                                <div className={styles.container17} />
                                <div className={styles.container18} />
                                <div className={styles.container19} />
                                <div className={styles.container20} />
                                <div className={styles.container21} />
                                <div className={styles.container22} />
                                <div className={styles.container23} />
                                <div className={styles.container24} />
                            </div>
                        </div>
                        <div className={styles.indicatorbars2}>
                            <div className={styles.text}>
                                <b className={styles.trend}>Momentum</b>
                            </div>
                            <div className={styles.container2}>
                                <div className={styles.container26} />
                                <div className={styles.container27} />
                                <div className={styles.container28} />
                                <div className={styles.container29} />
                                <div className={styles.container30} />
                                <div className={styles.container31} />
                                <div className={styles.container32} />
                                <div className={styles.container33} />
                                <div className={styles.container34} />
                                <div className={styles.container35} />
                                <div className={styles.container36} />
                                <div className={styles.container37} />
                                <div className={styles.container38} />
                                <div className={styles.container39} />
                                <div className={styles.container40} />
                                <div className={styles.container41} />
                                <div className={styles.container42} />
                                <div className={styles.container43} />
                                <div className={styles.container44} />
                                <div className={styles.container45} />
                                <div className={styles.container46} />
                                <div className={styles.container47} />
                            </div>
                        </div>
                        <div className={styles.indicatorbars3}>
                            <div className={styles.text}>
                                <b className={styles.trend}>Volatility</b>
                            </div>
                            <div className={styles.container2}>
                                <div className={styles.container49} />
                                <div className={styles.container50} />
                                <div className={styles.container51} />
                                <div className={styles.container29} />
                                <div className={styles.container53} />
                                <div className={styles.container54} />
                                <div className={styles.container55} />
                                <div className={styles.container56} />
                                <div className={styles.container57} />
                                <div className={styles.container58} />
                                <div className={styles.container59} />
                                <div className={styles.container60} />
                                <div className={styles.container61} />
                                <div className={styles.container62} />
                                <div className={styles.container63} />
                                <div className={styles.container64} />
                                <div className={styles.container65} />
                                <div className={styles.container66} />
                                <div className={styles.container67} />
                                <div className={styles.container68} />
                                <div className={styles.container69} />
                                <div className={styles.container70} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

function PairTickers({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-4 lg:gap-6 flex-wrap min-w-0">
            {children}
        </div>
    );
};

function LiveMarketTape() {
    return (
        <div className="ticker">
            <span className="text-secondary">Live Market Tape</span>
        </div>
    );
};

function HeatMaps({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
            {children}
        </div>
    );
};

function CurrencyStrengthIndexes({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-4">
            {children}
        </div>
    );
};

function MarketPulseGuages({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-wrap gap-6">
            {children}
        </div>
    );
};