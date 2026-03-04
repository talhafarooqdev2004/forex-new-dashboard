"use client";

import { useState, useEffect } from 'react';
import styles from './FxAnalyzerPro.module.scss';
import { Row, Col } from '@/components/layout';
import Dropdown from '@/components/ui/Dropdown';
import GuageChart from '@/components/chart/GuageChart';
import FxAnalyzerGauge from '@/components/chart/FxAnalyzerGauge';
import Container from '@/components/ui/layout/Container';
import { PrimaryCard, PrimaryCards } from '@/components/composed';
import { cn } from '@/lib/utils';

const txt = (s: React.CSSProperties) => s;

const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'NZD', 'CHF'];
const shortDarkBgColor = 'rgb(255, 119, 130)';
const longDarkBgColor = 'rgba(137, 243, 54, 0.843)';

// Default gauge zones for demo (no API)
const DEFAULT_GAUGE_ZONES = [
    { name: 'Strong Sell', minValue: -100, maxValue: -60, color: 'rgb(255, 119, 130)', rotation: -166 },
    { name: 'Sell', minValue: -60, maxValue: -20, color: 'rgba(255, 119, 130, 0.575)', rotation: -144 },
    { name: 'Weak Sell', minValue: -20, maxValue: -5, color: 'rgba(255, 119, 130, 0.365)', rotation: -120 },
    { name: 'Neutral', minValue: -5, maxValue: 5, color: '#FFFF00', rotation: -88 },
    { name: 'Weak Buy', minValue: 5, maxValue: 20, color: 'rgba(137, 243, 54, 0.365)', rotation: -55 },
    { name: 'Buy', minValue: 20, maxValue: 60, color: 'rgba(137, 243, 54, 0.575)', rotation: -27.5 },
    { name: 'Strong Buy', minValue: 60, maxValue: 100, color: 'rgba(137, 243, 54, 0.843)', rotation: -3.5 },
];

interface TechnicalTrendData {
    timeFrame: string;
    trend: string;
    momentum: string;
    volatility: string;
}

interface COTPositionData {
    currency: string;
    nonCommercial: { long: number | null; short: number | null };
    commercial: { long: number | null; short: number | null };
}

interface RetailPositionData {
    long: number | null;
    short: number | null;
}

interface CurrencyStrengthData {
    currency: string;
    score: number | null;
}

interface TechnicalLevelsData {
    currentPrice: string | null;
    pivot: string | null;
    s1: string | null;
    s2: string | null;
    s3: string | null;
    r1: string | null;
    r2: string | null;
    r3: string | null;
}

interface PairData {
    pair: string;
    netScore: number | null;
    netBias: string | null;
    trendScore: number | null;
    momentumScore: number | null;
    volatilityScore: number | null;
    fundamentalScore: number | null;
    seasonalScore: number | null;
    cotScore: number | null;
    sentimentScore: number | null;
    riskMeter: number | null;
    technicalTrends: TechnicalTrendData[];
    cotPositions: COTPositionData | null;
    quoteCurrencyCotPositions: COTPositionData | null;
    retailPositions: RetailPositionData | null;
    technicalLevels: TechnicalLevelsData | null;
}

// Static demo data - same for all pairs (for client demonstration)
const DEMO_PAIR_DATA: PairData = {
    pair: 'EURUSD',
    netScore: 35,
    netBias: 'Buy',
    trendScore: 42,
    momentumScore: 28,
    volatilityScore: -15,
    fundamentalScore: 55,
    seasonalScore: 20,
    cotScore: -10,
    sentimentScore: 38,
    riskMeter: 25,
    technicalTrends: [
        { timeFrame: '1Hr', trend: 'Bullish', momentum: 'Moderate', volatility: 'Low' },
        { timeFrame: '4Hr', trend: 'Strong Bullish', momentum: 'High', volatility: 'Moderate' },
        { timeFrame: 'Daily', trend: 'Bullish', momentum: 'Moderate', volatility: 'Low' },
    ],
    cotPositions: {
        currency: 'EUR',
        nonCommercial: { long: 65, short: 35 },
        commercial: { long: 45, short: 55 },
    },
    quoteCurrencyCotPositions: {
        currency: 'USD',
        nonCommercial: { long: 40, short: 60 },
        commercial: { long: 55, short: 45 },
    },
    retailPositions: { long: 72, short: 28 },
    technicalLevels: {
        currentPrice: '1.0845',
        pivot: '1.0820',
        s1: '1.0785',
        s2: '1.0740',
        s3: '1.0695',
        r1: '1.0865',
        r2: '1.0910',
        r3: '1.0955',
    },
};

// Build currency pairs map - all pairs show same demo data
const PAIR_NAMES: Record<string, string[]> = {
    USD: ['USDCAD', 'USDCHF', 'USDJPY', 'USDMXN', 'USDAUD'],
    GBP: ['GBPUSD', 'GBPJPY', 'GBPAUD', 'GBPCAD', 'GBPCHF'],
    EUR: ['EURUSD', 'EURGBP', 'EURJPY', 'EURCHF', 'EURAUD'],
    AUD: ['AUDUSD', 'AUDJPY', 'AUDNZD', 'AUDCAD', 'AUDCHF'],
    CAD: ['USDCAD', 'CADJPY', 'CADCHF', 'AUDCAD', 'GBPCAD'],
    NZD: ['NZDUSD', 'NZDJPY', 'AUDNZD', 'NZDCAD', 'NZDCHF'],
    CHF: ['USDCHF', 'EURCHF', 'GBPCHF', 'CHFJPY', 'AUDCHF'],
};

const parseAndClampNetBias = (value: string | number | null): number => {
    if (value === null || value === undefined) return 0;
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value);
    return isNaN(numValue) ? 0 : Math.max(-100, Math.min(100, numValue));
};

const getRotationForValue = (value: number): number => {
    const clampedValue = Math.max(-100, Math.min(100, value));
    if (clampedValue <= -60) return -166;
    if (clampedValue <= -20) return -144;
    if (clampedValue <= -5) return -120;
    if (clampedValue < 5) return -88;
    if (clampedValue < 20) return -55;
    if (clampedValue < 60) return -27.5;
    return -3.5;
};

type GaugeIndicatorStyle = React.CSSProperties & {
    wrapperTransform?: string;
    needleTransform?: string;
    rotation?: number;
};

const getGaugeIndicatorStyle = (
    value: string | number | null,
    size: string = "80px"
): GaugeIndicatorStyle => {
    const rotation = getRotationForValue(parseAndClampNetBias(value));
    return {
        wrapperTransform: `translate(0%, 20%)`,
        needleTransform: `rotate(${rotation}deg)`,
        transformOrigin: `8.4% 93.4%`,
        transition: '0.8s ease-out',
        rotation,
        width: size,
        height: size,
    };
};

const getNetBiasGaugeIndicatorStyle = (
    value: string | number | null,
    gaugeWidth: string = "280px"
): GaugeIndicatorStyle => {
    const rotation = getRotationForValue(parseAndClampNetBias(value));
    return {
        wrapperTransform: `translate(0%, 30%)`,
        needleTransform: `rotate(${rotation}deg)`,
        transformOrigin: `8.4% 93.4%`,
        transition: '0.8s ease-out',
        rotation,
        width: '80px',
        height: '80px',
    };
};

const getBiasText = (value: string | number | null): string => {
    const netBias = parseAndClampNetBias(value);
    if (netBias <= -60) return 'Strong sell';
    if (netBias <= -20) return 'Sell';
    if (netBias <= -5) return 'Weak sell';
    if (netBias < 5) return 'Neutral';
    if (netBias < 20) return 'Weak buy';
    if (netBias < 60) return 'Buy';
    return 'Strong buy';
};

const getBiasColor = (value: string | number | null): string => {
    const netBias = parseAndClampNetBias(value);
    if (netBias <= -60) return 'rgb(255, 119, 130)';
    if (netBias <= -20) return 'rgba(255, 119, 130, 0.575)';
    if (netBias <= -5) return 'rgba(255, 119, 130, 0)';
    if (netBias < 5) return '#FFFF00';
    if (netBias < 20) return 'rgba(137, 243, 54, 0.843)';
    if (netBias < 60) return 'rgba(137, 243, 54, 0.575)';
    return 'rgba(137, 243, 54, 0.843)';
};

const getSentimentalBias = (score1: string | number | null, score2: string | number | null): string => {
    const value1 = parseAndClampNetBias(score1);
    const value2 = parseAndClampNetBias(score2);
    if (value1 > 0 && value2 > 0) return 'Bullish';
    if (value1 < 0 && value2 < 0) return 'Bearish';
    return 'Neutral';
};

const getSentimentalBiasColor = (bias: string): string => {
    switch (bias) {
        case 'Bullish': return longDarkBgColor;
        case 'Bearish': return shortDarkBgColor;
        case 'Neutral': return '#FFFF00';
        default: return '#EAEAEA';
    }
};

// Default currency strength zones (from forex-admin useCurrencyStrengthConfigurations)
const CURRENCY_STRENGTH_ZONES = [
    { name: 'Light Red', minValue: -10, maxValue: -5, color: '#F67280' },
    { name: 'Dark Red', minValue: -5, maxValue: 0, color: '#E53935' },
    { name: 'Light Green', minValue: 0, maxValue: 5, color: '#AEF803' },
    { name: 'Dark Green', minValue: 5, maxValue: 10, color: '#2ecc71' },
];

const getCurrencyStrengthColor = (value: number): string => {
    const clamped = Math.max(-10, Math.min(10, value));
    const zone = CURRENCY_STRENGTH_ZONES.find(z => clamped >= z.minValue && clamped <= z.maxValue);
    return zone?.color ?? '#e0e0e0';
};

// Get fill percentage, color, and cursor position for Currency Strength Index (from forex-admin)
// Scores range from -10 to +10
const getCurrencyStrengthStyle = (score: number | null): { fillPercent: number; color: string; cursorPercent: number } => {
    if (score === null || score === undefined || isNaN(score)) {
        return { fillPercent: 0, color: '#e0e0e0', cursorPercent: 50 };
    }
    let normalizedScore: number;
    if (score >= -10 && score <= 10) {
        normalizedScore = score;
    } else if (score >= 0 && score <= 100) {
        normalizedScore = ((score - 50) / 50) * 10;
    } else {
        normalizedScore = Math.max(-10, Math.min(10, score));
    }
    const absValue = Math.abs(normalizedScore);
    const fillPercent = (absValue / 10) * 100;
    const cursorPercent = fillPercent;
    const color = getCurrencyStrengthColor(normalizedScore);
    return { fillPercent, color, cursorPercent };
};

const cell = (text: React.ReactNode, style?: React.CSSProperties, isLastColumn?: boolean) => (
    <td className="py-3 px-4 border-b border-white/5" style={{
        textAlign: 'center' as const,
        ...style,
    }}>{text}</td>
);

const extractBaseCurrency = (pair: string): string => pair.length >= 3 ? pair.substring(0, 3) : pair;

export default function FXAnalyzerProClient() {
    const [selectedPair, setSelectedPair] = useState<PairData | null>(null);

    // Build pairs with demo data - all pairs use same DEMO_PAIR_DATA
    const currencyPairs: Record<string, PairData[]> = {};
    CURRENCIES.forEach((currency) => {
        const pairNames = PAIR_NAMES[currency] || [];
        currencyPairs[currency] = pairNames.map((pairName) => ({
            ...DEMO_PAIR_DATA,
            pair: pairName,
        }));
    });

    const handlePairClick = (pair: PairData) => {
        setSelectedPair({ ...DEMO_PAIR_DATA, pair: pair.pair });
    };

    // Auto-select first pair on mount
    useEffect(() => {
        if (!selectedPair) {
            const firstCurrency = CURRENCIES.find((c) => PAIR_NAMES[c]?.length > 0);
            const firstPairName = firstCurrency && PAIR_NAMES[firstCurrency]?.[0];
            if (firstPairName) {
                setSelectedPair({ ...DEMO_PAIR_DATA, pair: firstPairName });
            }
        }
    }, []);

    const displayPair = selectedPair;

    return (
        <Container>
            <div className={styles.fxAnalyzerPro__pageContainer}>
                <div className={styles.fxAnalyzerPro__dropdownSection}>
                    {CURRENCIES.map((currency) => {
                        const pairs = currencyPairs[currency] || [];
                        const pairNames = pairs.map((p) => p.pair);
                        return (
                            <Dropdown
                                key={currency}
                                btnLabel={currency}
                                menus={pairNames}
                                onMenuItemClick={(pairName) => {
                                    const pair = pairs.find((p) => p.pair === pairName);
                                    if (pair) handlePairClick(pair);
                                }}
                            />
                        );
                    })}
                </div>
                <div className={styles.fxAnalyzerPro__contentSection}>
                    {displayPair ? (
                        <>
                            <div className={styles.fxAnalyzerPro__sentimentPanel} style={{ borderRight: "none", borderRadius: "16px" }}>
                                <Row className="text-[20px] font-bold" style={{ border: "none", borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}>
                                    <Col>
                                        <span className='text-white text-xl'>{displayPair.pair}</span>
                                    </Col>
                                </Row>
                                <Row className="text-[20px] font-bold text-black" style={{ backgroundColor: "#FFFF00", border: "none" }}>
                                    <Col>{displayPair.netBias || getBiasText(displayPair.netScore)}</Col>
                                </Row>

                                <div className="flex flex-col gap-5 p-5 items-center">
                                    <div className="text-center">
                                        <GuageChart
                                            style={{ width: "280px" }}
                                            indicatorStyle={getNetBiasGaugeIndicatorStyle(displayPair.netScore, "280px")}
                                            labelType="netBias"
                                            gaugeZones={DEFAULT_GAUGE_ZONES}
                                        />
                                        <h1 className="mt-2.5 text-[15px] font-semibold text-white">Net Bias</h1>
                                    </div>

                                    <div className="grid grid-cols-2 gap-5 w-full">
                                        <FxAnalyzerGauge score={displayPair.fundamentalScore} label="Fundamental" gaugeZones={DEFAULT_GAUGE_ZONES} getGaugeIndicatorStyleDynamic={getGaugeIndicatorStyle} GuageChart={GuageChart} />
                                        <FxAnalyzerGauge score={displayPair.trendScore} label="Trend" gaugeZones={DEFAULT_GAUGE_ZONES} getGaugeIndicatorStyleDynamic={getGaugeIndicatorStyle} GuageChart={GuageChart} />
                                        <FxAnalyzerGauge score={displayPair.momentumScore} label="Momentum" gaugeZones={DEFAULT_GAUGE_ZONES} getGaugeIndicatorStyleDynamic={getGaugeIndicatorStyle} GuageChart={GuageChart} />
                                        <FxAnalyzerGauge score={displayPair.sentimentScore} label="Sentiment" gaugeZones={DEFAULT_GAUGE_ZONES} getGaugeIndicatorStyleDynamic={getGaugeIndicatorStyle} GuageChart={GuageChart} />
                                    </div>
                                </div>

                                <div className="mt-2.5 overflow-x-auto w-full">
                                    <table className="w-full border-collapse overflow-x-auto" style={{ fontSize: 16 }}>
                                        <tbody>
                                            <tr className="border-b border-white/5 bg-[#1A1D23]">
                                                {cell("Fundamental score", { width: 350, fontSize: "14px", fontWeight: 500, color: "white", textAlign: "left", paddingLeft: "24px", whiteSpace: "nowrap" })}
                                                {cell(displayPair.fundamentalScore != null ? displayPair.fundamentalScore.toString() : "N/A", { width: 200, textAlign: "center", color: "white", fontWeight: 500, fontSize: "14px" })}
                                                {cell(<span className="font-medium" style={{ color: getSentimentalBiasColor(getBiasText(displayPair.fundamentalScore)) }}>{displayPair.fundamentalScore != null ? getBiasText(displayPair.fundamentalScore) : "N/A"}</span>, { width: 250, background: "transparent", textAlign: "right" as const, paddingRight: "24px", fontSize: "14px" }, true)}
                                            </tr>
                                            <tr className="border-b border-white/5 bg-[#1A1D23]">
                                                {cell("Seasonality", { width: 350, fontSize: "14px", fontWeight: 500, color: "white", textAlign: "left", paddingLeft: "24px", whiteSpace: "nowrap" })}
                                                {cell(displayPair.seasonalScore != null ? displayPair.seasonalScore.toString() : "N/A", { width: 200, textAlign: "center", color: "white", fontWeight: 500, fontSize: "14px" })}
                                                {cell(<span className="font-medium" style={{ color: getSentimentalBiasColor(getSentimentalBias(displayPair.seasonalScore, displayPair.momentumScore)) }}>{getSentimentalBias(displayPair.seasonalScore, displayPair.momentumScore)}</span>, { width: 250, background: "transparent", textAlign: "right" as const, paddingRight: "24px", fontSize: "14px" }, true)}
                                            </tr>
                                            <tr className="border-b border-white/5 bg-[#1A1D23]">
                                                {cell("Cot score", { width: 350, fontSize: "14px", fontWeight: 500, color: "white", textAlign: "left", paddingLeft: "24px", whiteSpace: "nowrap" })}
                                                {cell(displayPair.cotScore != null ? displayPair.cotScore.toString() : "N/A", { width: 200, textAlign: "center", color: "white", fontWeight: 500, fontSize: "14px" })}
                                                {cell(<span className="font-medium" style={{ color: getSentimentalBiasColor(getSentimentalBias(displayPair.cotScore, displayPair.momentumScore)) }}>{getSentimentalBias(displayPair.cotScore, displayPair.momentumScore)}</span>, { width: 250, background: "transparent", textAlign: "right" as const, paddingRight: "24px", fontSize: "14px" }, true)}
                                            </tr>
                                            <tr className="border-b border-white/5 bg-[#1A1D23]">
                                                {cell("Trend score", { width: 350, fontSize: "14px", fontWeight: 500, color: "white", textAlign: "left", paddingLeft: "24px", whiteSpace: "nowrap" })}
                                                {cell(displayPair.trendScore != null ? displayPair.trendScore.toString() : "N/A", { width: 200, textAlign: "center", color: "white", fontWeight: 500, fontSize: "14px" })}
                                                {cell(<span className="font-medium" style={{ color: getSentimentalBiasColor(getBiasText(displayPair.trendScore)) }}>{displayPair.trendScore != null ? getBiasText(displayPair.trendScore) : "N/A"}</span>, { width: 250, background: "transparent", textAlign: "right" as const, paddingRight: "24px", fontSize: "14px" }, true)}
                                            </tr>
                                            <tr className="border-b border-white/5 bg-[#1A1D23]">
                                                {cell("Sentiment score", { width: 350, fontSize: "14px", fontWeight: 500, color: "white", textAlign: "left", paddingLeft: "24px", whiteSpace: "nowrap" })}
                                                {cell(displayPair.sentimentScore != null ? displayPair.sentimentScore.toString() : "N/A", { width: 200, textAlign: "center", color: "white", fontWeight: 500, fontSize: "14px" })}
                                                {cell(<span className="font-medium" style={{ color: getSentimentalBiasColor(getBiasText(displayPair.sentimentScore)) }}>{displayPair.sentimentScore != null ? getBiasText(displayPair.sentimentScore) : "N/A"}</span>, { width: 250, background: "transparent", textAlign: "right" as const, paddingRight: "24px", fontSize: "14px" }, true)}
                                            </tr>
                                            <tr className="bg-[#1A1D23] rounded-b-2xl">
                                                {cell("Risk mode", { width: 350, fontSize: "14px", fontWeight: 500, color: "white", textAlign: "left", paddingLeft: "24px", whiteSpace: "nowrap", borderBottom: "none" })}
                                                {cell(displayPair.riskMeter != null ? displayPair.riskMeter.toString() : "N/A", { width: 200, textAlign: "center", color: "white", fontWeight: 500, fontSize: "14px", borderBottom: "none" })}
                                                {cell(<span className="font-medium" style={{ color: displayPair.riskMeter != null ? (displayPair.riskMeter > 0 ? "#25b73c" : displayPair.riskMeter < 0 ? shortDarkBgColor : "#FFFF00") : "white" }}>{displayPair.riskMeter != null ? (displayPair.riskMeter > 0 ? "Risk On" : displayPair.riskMeter < 0 ? "Risk Off" : "Neutral") : "N/A"}</span>, { width: 250, background: "transparent", textAlign: "right" as const, paddingRight: "24px", fontSize: "14px", borderBottom: "none" }, true)}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className={cn(styles.fxAnalyzerPro__fundamentalsPanel)}>
                                <PrimaryCard>
                                    <div className="grid grid-cols-2 gap-4 pb-2">
                                        <div className="bg-[#1A1D23] rounded-xl overflow-hidden">
                                            <div className="text-center font-semibold mb-3 text-[15px] text-white">Non comm Positions</div>
                                            <div className="grid gap-4">
                                                {displayPair.cotPositions && (
                                                    <>
                                                        <div className="flex gap-2 items-center">
                                                            <div className="w-[34px] font-semibold text-[15px] text-white">{extractBaseCurrency(displayPair.pair)}</div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between mb-1.5 text-[11px] font-semibold">
                                                                    <span className="text-white">{displayPair.cotPositions.nonCommercial.short}%</span>
                                                                    <span className="text-white">{displayPair.cotPositions.nonCommercial.long}%</span>
                                                                </div>
                                                                <div className="w-full h-[8px] rounded-full overflow-hidden bg-[#2C303A] flex">
                                                                    <div style={{ width: `${displayPair.cotPositions.nonCommercial.short}%`, height: '100%', background: shortDarkBgColor }} />
                                                                    <div style={{ width: `${displayPair.cotPositions.nonCommercial.long}%`, height: '100%', background: longDarkBgColor }} />
                                                                </div>
                                                                <div className="flex justify-between mt-1 text-[12px] font-semibold">
                                                                    <span style={{ color: shortDarkBgColor }}>Short</span>
                                                                    <span style={{ color: longDarkBgColor }}>Long</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {displayPair.quoteCurrencyCotPositions && (
                                                            <div className="flex gap-2 items-center mt-2">
                                                                <div className="w-[34px] font-semibold text-[15px] text-white">{displayPair.pair.length >= 6 ? displayPair.pair.substring(3, 6) : ''}</div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between mb-1.5 text-[11px] font-semibold">
                                                                        <span className="text-white">{displayPair.quoteCurrencyCotPositions.nonCommercial.short}%</span>
                                                                        <span className="text-white">{displayPair.quoteCurrencyCotPositions.nonCommercial.long}%</span>
                                                                    </div>
                                                                    <div className="w-full h-[8px] rounded-full overflow-hidden bg-[#2C303A] flex">
                                                                        <div style={{ width: `${displayPair.quoteCurrencyCotPositions.nonCommercial.short}%`, height: '100%', background: shortDarkBgColor }} />
                                                                        <div style={{ width: `${displayPair.quoteCurrencyCotPositions.nonCommercial.long}%`, height: '100%', background: longDarkBgColor }} />
                                                                    </div>
                                                                    <div className="flex justify-between mt-1 text-[12px] font-semibold">
                                                                        <span style={{ color: shortDarkBgColor }}>Short</span>
                                                                        <span style={{ color: longDarkBgColor }}>Long</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-[#1A1D23] rounded-xl overflow-hidden">
                                            <div className="text-center font-semibold mb-3 text-[15px] text-white">Comm Positions</div>
                                            <div className="grid gap-4">
                                                {displayPair.cotPositions && (
                                                    <>
                                                        <div className="flex gap-2 items-center">
                                                            <div className="w-[34px] font-semibold text-[15px] text-white">{extractBaseCurrency(displayPair.pair)}</div>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between mb-1.5 text-[11px] font-semibold">
                                                                    <span className="text-white">{displayPair.cotPositions.commercial.short}%</span>
                                                                    <span className="text-white">{displayPair.cotPositions.commercial.long}%</span>
                                                                </div>
                                                                <div className="w-full h-[8px] rounded-full overflow-hidden bg-[#2C303A] flex">
                                                                    <div style={{ width: `${displayPair.cotPositions.commercial.short}%`, height: '100%', background: shortDarkBgColor }} />
                                                                    <div style={{ width: `${displayPair.cotPositions.commercial.long}%`, height: '100%', background: longDarkBgColor }} />
                                                                </div>
                                                                <div className="flex justify-between mt-1 text-[12px] font-semibold">
                                                                    <span style={{ color: shortDarkBgColor }}>Short</span>
                                                                    <span style={{ color: longDarkBgColor }}>Long</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {displayPair.quoteCurrencyCotPositions && (
                                                            <div className="flex gap-2 items-center mt-2">
                                                                <div className="w-[34px] font-semibold text-[15px] text-white">{displayPair.pair.length >= 6 ? displayPair.pair.substring(3, 6) : ''}</div>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between mb-1.5 text-[11px] font-semibold">
                                                                        <span className="text-white">{displayPair.quoteCurrencyCotPositions.commercial.short}%</span>
                                                                        <span className="text-white">{displayPair.quoteCurrencyCotPositions.commercial.long}%</span>
                                                                    </div>
                                                                    <div className="w-full h-[8px] rounded-full overflow-hidden bg-[#2C303A] flex">
                                                                        <div style={{ width: `${displayPair.quoteCurrencyCotPositions.commercial.short}%`, height: '100%', background: shortDarkBgColor }} />
                                                                        <div style={{ width: `${displayPair.quoteCurrencyCotPositions.commercial.long}%`, height: '100%', background: longDarkBgColor }} />
                                                                    </div>
                                                                    <div className="flex justify-between mt-1 text-[12px] font-semibold">
                                                                        <span style={{ color: shortDarkBgColor }}>Short</span>
                                                                        <span style={{ color: longDarkBgColor }}>Long</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="relative flex items-center justify-center mb-2.5 text-[12px] font-medium text-white/70">
                                            {displayPair.retailPositions && (
                                                <>
                                                    <span className="absolute left-0.5 text-white text-[10px] font-semibold">{displayPair.retailPositions.long}%</span>
                                                    <span className="text-white">Retail Positions</span>
                                                    <span className="absolute right-0.5 text-white text-[10px] font-semibold">{displayPair.retailPositions.short}%</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="w-full">
                                            <div className="relative w-full h-3 rounded-full overflow-visible flex">
                                                <div className="relative w-full h-full rounded-full overflow-hidden flex bg-white/10">
                                                    {displayPair.retailPositions?.long != null && (
                                                        <div style={{ width: `${displayPair.retailPositions.long}%`, height: '100%', background: shortDarkBgColor }} />
                                                    )}
                                                    {displayPair.retailPositions?.short != null && (
                                                        <div style={{ width: `${displayPair.retailPositions.short}%`, height: '100%', background: longDarkBgColor }} />
                                                    )}
                                                </div>
                                                {displayPair.retailPositions?.long != null && (
                                                    <div className="absolute top-1/2 -translate-y-1/2 w-[13px] h-[13px] rounded-full bg-white border-2 border-[#1A1D23] z-10" style={{ left: `calc(${displayPair.retailPositions.long}% - 6px)` }} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </PrimaryCard>

                                <PrimaryCard className="mt-3.5">
                                    <div className="text-center font-semibold mb-3 text-[18px] text-white">Currency strength index</div>
                                    {(() => {
                                        const baseCurrency = extractBaseCurrency(displayPair.pair);
                                        const quoteCurrency = displayPair.pair.length >= 6 ? displayPair.pair.substring(3, 6) : null;
                                        const currenciesToShow = quoteCurrency ? [baseCurrency, quoteCurrency] : [baseCurrency];
                                        // Static demo: base +1.0, quote -1.0 (same for all pairs)
                                        const demoStrength: Record<string, number> = { [baseCurrency]: 1.0, ...(quoteCurrency ? { [quoteCurrency]: -1.0 } : {}) };
                                        return (
                                            <>
                                                {currenciesToShow.map((currency, i) => {
                                                    const rawScore = demoStrength[currency] ?? null;
                                                    const { fillPercent, color, cursorPercent } = getCurrencyStrengthStyle(rawScore);
                                                    const displayValue = rawScore !== null ? rawScore : 'N/A';
                                                    return (
                                                        <div key={`${currency}-${i}`} className="flex items-center gap-4" style={{ marginBottom: i === 0 ? "18px" : "0" }}>
                                                            <div className="w-[34px] font-semibold text-[15px] text-white">{currency}</div>
                                                            <div className="relative flex-1 h-5 flex items-center">
                                                                <div className="relative w-full h-3 rounded-full overflow-hidden bg-[#2C303A]">
                                                                    {fillPercent > 0 && (
                                                                        <div
                                                                            className="absolute left-0 top-0 h-full rounded-full transition-[width] duration-300"
                                                                            style={{ width: `${fillPercent}%`, background: color }}
                                                                        />
                                                                    )}
                                                                </div>
                                                                {typeof cursorPercent === 'number' && !isNaN(cursorPercent) && (
                                                                    <>
                                                                        <div
                                                                            className="absolute top-1/2 -translate-y-1/2 w-[13px] h-[13px] rounded-full border-2 border-white z-10 transition-[left] duration-300"
                                                                            style={{ left: `${cursorPercent}%`, transform: 'translate(-50%, -50%)', background: '#333' }}
                                                                        />
                                                                        <div
                                                                            className="absolute left-0 top-0 -translate-y-full text-white font-semibold text-[11px] whitespace-nowrap pointer-events-none z-[1000]"
                                                                            style={{ left: `${cursorPercent}%`, transform: `translate(${rawScore !== null && rawScore > 0 ? '-50%' : '-80%'}, -100%)` }}
                                                                        >
                                                                            {displayValue}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}
                                </PrimaryCard>

                                <div className="mt-3.5">
                                    <div className="text-center font-semibold bg-[#1A1D23] py-2.5 text-[15px] text-white rounded-t-xl mb-1">Technical Trends</div>
                                    <table className="w-full border-collapse text-[14px]">
                                        <thead>
                                            <tr className="border-b border-white/5 bg-[#1A1D23]">
                                                {['Trade Frame', 'Trend', 'Momentum', '0.873684'].map((h, i) => (
                                                    <th key={i} className="py-3 px-3 text-center text-white font-medium">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(displayPair.technicalTrends?.length ? displayPair.technicalTrends : [
                                                { timeFrame: '1H', trend: 'N/A', momentum: 'N/A', volatility: 'N/A' },
                                                { timeFrame: '2H', trend: 'N/A', momentum: 'N/A', volatility: 'N/A' },
                                                { timeFrame: 'Daily', trend: 'N/A', momentum: 'N/A', volatility: 'N/A' },
                                            ]).map((r: TechnicalTrendData, i: number) => {
                                                const rowData = [r.timeFrame, r.trend, r.momentum, r.volatility];
                                                return (
                                                    <tr key={i} className="border-b border-white/5 bg-[#1A1D23]">
                                                        {rowData.map((c: string, j: number) => {
                                                            let textColor = "white";
                                                            const cellValue = c?.toString().toLowerCase().trim();
                                                            if (j > 0) {
                                                                if (cellValue === "neutral" || cellValue === "non volatile" || cellValue === "moderate") { textColor = "#FFFF00"; }
                                                                else if (cellValue === "bullish" || cellValue === "strong bullish") { textColor = "white"; }
                                                                else if (cellValue === "bearish" || cellValue === "strong bearish") { textColor = "white"; }
                                                                else if (cellValue === "high" || cellValue === "volatile") { textColor = "white"; }
                                                                else if (cellValue === "low") { textColor = "white"; }
                                                            }
                                                            return (
                                                                <td key={j} className="text-center text-white py-3 px-3" style={{ color: textColor, fontWeight: j === 0 ? 500 : "normal", fontSize: j > 2 ? "13px" : "inherit" }}>{c}</td>
                                                            );
                                                        })}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-[18px]">
                                    <div className="text-center font-semibold bg-[#1A1D23] py-2.5 text-[15px] text-white rounded-t-xl mb-1">Technical Levels</div>
                                    <table className="w-full border-collapse text-[14px]">
                                        <tbody>
                                            {(() => {
                                                const levels = displayPair.technicalLevels;
                                                const rows = levels ? [
                                                    ['Current Price', levels.currentPrice || 'N/A', 'Pivot Level', levels.pivot || 'N/A'],
                                                    ['S1', levels.s1 || 'N/A', 'R1', levels.r1 || 'N/A'],
                                                    ['S2', levels.s2 || 'N/A', 'R2', levels.r2 || 'N/A'],
                                                    ['S3', levels.s3 || 'N/A', 'R3', levels.r3 || 'N/A'],
                                                ] : [
                                                    ['Current Price', 'N/A', 'Pivot Level', 'N/A'],
                                                    ['S1', 'N/A', 'R1', 'N/A'],
                                                    ['S2', 'N/A', 'R2', 'N/A'],
                                                    ['S3', 'N/A', 'R3', 'N/A'],
                                                ];
                                                return rows.map((r, i) => (
                                                    <tr key={i} className="border-b border-white/5 bg-[#1A1D23]">
                                                        <td className="py-3 px-4 w-[140px] text-white text-left font-medium">{r[0]}</td>
                                                        <td className="py-3 px-4 text-center text-white">{r[1]}</td>
                                                        <td className="py-3 px-4 w-[120px] text-white text-center font-medium">{r[2]}</td>
                                                        <td className="py-3 px-4 text-center text-white">{r[3]}</td>
                                                    </tr>
                                                ));
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className={styles.fxAnalyzerPro__sentimentPanel}>
                            <div className="p-12 text-center text-[#6b7280] text-[15px]">
                                Select a currency pair to view analysis
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};