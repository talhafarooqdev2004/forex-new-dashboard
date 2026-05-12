"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import { CurrencyStrengthIndexes, CurrencyStrengthIndex } from "@/components/composed/CurrencyStrengthIndex";
import HeatMap from "@/components/composed/HeatMap";
import MarketPulseTmvHistory, { type MarketPulseTmvHistorySnapshot } from "@/components/composed/MarketPulseTmvHistory";
import MarketPulseTimezoneSelect from "@/components/composed/MarketPulseTimezoneSelect";
import TradingViewTechnicalAnalysisWidget from "@/components/composed/TradingViewTechnicalAnalysisWidget";
import TradingViewTickerTape from "@/components/composed/TradingViewTickerTape";
import EdgeTmGauge from "@/components/composed/Guages/EdgeTmGauge";
import Container from "@/components/ui/layout/Container";
import { useTheme } from "@/components/providers/ThemeProvider";
import { apiConfig } from "@/services/api.config";
import { dynamicTableService, type DynamicTable } from "@/services/dynamicTable.service";
import { technicalDashboardTmvTriple } from "@/lib/edgeTechnicalDashboardTmv";
import {
    buildCurrencyStrengthRows,
    buildScoreDashboardPairHeatmapItems,
} from "@/lib/technicalDashboardFromScoreSheet";
import {
    FX_TMV_GAUGE_ZONES_DARK,
    FX_TMV_GAUGE_ZONES_LIGHT,
    buildVolatilityGaugeZones,
} from "@/lib/fxTmvGaugeZones";
import { usePersistedMarketPulseTimezone } from "@/hooks/usePersistedMarketPulseTimezone";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";

import type { TechnicalDashboardInitialWidgetTables } from "@/app/technical-dashboard/technicalDashboardTypes";

const TradingViewAdvancedChart = dynamic(
    () => import("@/components/composed/TradingViewAdvancedChart"),
    {
        ssr: false,
        loading: () => (
            <div
                className="w-full min-h-[520px] h-[min(70vh,720px)] rounded-xl bg-darkGrey"
                aria-hidden
            />
        ),
    },
);

/** Same mutable zone copies as Edge Tools TMV gauges (not frozen `as const` tuples). */
const DARK_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_DARK.map((z) => ({ ...z }));
const LIGHT_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_LIGHT.map((z) => ({ ...z }));
const DARK_VOLATILITY_ZONES = buildVolatilityGaugeZones(FX_TMV_GAUGE_ZONES_DARK).map((z) => ({ ...z }));
const LIGHT_VOLATILITY_ZONES = buildVolatilityGaugeZones(FX_TMV_GAUGE_ZONES_LIGHT).map((z) => ({ ...z }));

/** Same identifier as `/score-dashboard` — Sheet76 (Currency Pair + Net Score in cols 1–2). */
const SCORE_DASHBOARD_TABLE_ID = "score_dashboard_sheet76";
const EDGE_CURRENCY_STRENGTH_INDEX_ID = "edge_currency_strength_index";
const EDGE_TECHNICAL_DASHBOARD_TABLE_ID = "edge_technical_dashboard";
const TMV_HISTORY_META_KEY = "tmv_history";

interface PairTickerProps {
    pair: string;
    price: number;
    change: number;
}

function extractTmvHistorySlots(table: DynamicTable | null): MarketPulseTmvHistorySnapshot[] {
    const history = table?.table_metadata?.[TMV_HISTORY_META_KEY];
    if (!history || typeof history !== "object") return [];
    const slots = (history as { slots?: unknown }).slots;
    if (!Array.isArray(slots)) return [];

    return slots.filter((slot): slot is MarketPulseTmvHistorySnapshot => {
        if (!slot || typeof slot !== "object") return false;
        const s = slot as Partial<MarketPulseTmvHistorySnapshot>;
        return (
            Number.isFinite(s.trend) &&
            Number.isFinite(s.momentum) &&
            Number.isFinite(s.volatility)
        );
    });
}

export default function TechnicalDashboardClientPage({
    initialWidgetTables,
}: {
    pairTickers: PairTickerProps[];
    initialWidgetTables: TechnicalDashboardInitialWidgetTables;
}) {
    const { theme } = useTheme();
    const [htmlHasDarkClass, setHtmlHasDarkClass] = useState(false);

    useLayoutEffect(() => {
        const sync = () => setHtmlHasDarkClass(document.documentElement.classList.contains("dark"));
        sync();
        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const gaugePaletteDark = theme === "dark" || htmlHasDarkClass;
    const tmvGaugeZones = useMemo(
        () => (gaugePaletteDark ? DARK_GAUGE_ZONES : LIGHT_GAUGE_ZONES),
        [gaugePaletteDark],
    );

    const { storedTimezone, effectiveTimezone, setStoredTimezone } = usePersistedMarketPulseTimezone();

    const [scoreHeatmapTable, setScoreHeatmapTable] = useState<DynamicTable | null>(initialWidgetTables.scoreHeatmap);
    const [currencyStrengthTable, setCurrencyStrengthTable] = useState<DynamicTable | null>(
        initialWidgetTables.currencyStrength,
    );
    const [tmvTable, setTmvTable] = useState<DynamicTable | null>(initialWidgetTables.tmv);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const loadWidgetTables = useCallback(async () => {
        try {
            const [scoreRes, edgeRes, tmvRes] = await Promise.all([
                dynamicTableService.getTableByIdentifier(SCORE_DASHBOARD_TABLE_ID),
                dynamicTableService.getTableByIdentifier(EDGE_CURRENCY_STRENGTH_INDEX_ID),
                dynamicTableService.getTableByIdentifier(EDGE_TECHNICAL_DASHBOARD_TABLE_ID),
            ]);
            setScoreHeatmapTable(scoreRes?.data ?? null);
            setCurrencyStrengthTable(edgeRes?.data ?? null);
            setTmvTable(tmvRes?.data ?? null);
        } catch (error) {
            console.error("Failed to load technical dashboard tables:", error);
            setScoreHeatmapTable(null);
            setCurrencyStrengthTable(null);
            setTmvTable(null);
        }
    }, []);

    useEffect(() => {
        const id = window.setTimeout(() => {
            void loadWidgetTables();
        }, 0);
        return () => window.clearTimeout(id);
    }, [loadWidgetTables, refreshTrigger]);

    useDashboardBackendPoll(loadWidgetTables);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const bump = () => setRefreshTrigger((v) => v + 1);

        const handleScoreSnapshot = (payload: { data?: { table?: DynamicTable }; table?: DynamicTable }) => {
            const nextTable = payload?.data?.table ?? payload?.table ?? null;
            if (nextTable?.identifier === SCORE_DASHBOARD_TABLE_ID) {
                setScoreHeatmapTable(nextTable);
            }
            if (nextTable?.identifier === EDGE_TECHNICAL_DASHBOARD_TABLE_ID) {
                setTmvTable(nextTable);
            }
        };

        socket.on("tableUpdate", bump);
        socket.on("tableEditorUpdate", bump);
        socket.on("tableEditorSync", bump);
        socket.on("scoreDashboardSnapshot", handleScoreSnapshot);

        return () => {
            socket.off("tableUpdate", bump);
            socket.off("tableEditorUpdate", bump);
            socket.off("tableEditorSync", bump);
            socket.off("scoreDashboardSnapshot", handleScoreSnapshot);
            socket.disconnect();
        };
    }, []);

    const heatmapItems = useMemo(
        () => buildScoreDashboardPairHeatmapItems(scoreHeatmapTable),
        [scoreHeatmapTable],
    );
    const heatmapSeasonalRange = useMemo(() => {
        if (heatmapItems.length === 0) return undefined;
        let min = heatmapItems[0]!.value;
        let max = heatmapItems[0]!.value;
        for (const item of heatmapItems) {
            if (item.value < min) min = item.value;
            if (item.value > max) max = item.value;
        }
        return { min, max };
    }, [heatmapItems]);
    const currencyStrengthRows = useMemo(
        () => buildCurrencyStrengthRows(currencyStrengthTable),
        [currencyStrengthTable],
    );
    const currencyStrengthRange = useMemo(() => {
        if (currencyStrengthRows.length === 0) return undefined;
        const vals = currencyStrengthRows.map((r) => r.value).filter((v) => Number.isFinite(v));
        if (vals.length === 0) return undefined;
        return { min: Math.min(...vals), max: Math.max(...vals) };
    }, [currencyStrengthRows]);
    const tmvScores = useMemo(() => technicalDashboardTmvTriple(tmvTable), [tmvTable]);
    const tmvHistorySlots = useMemo(() => extractTmvHistorySlots(tmvTable), [tmvTable]);

    return (
        <Container>

            <TradingViewTickerTape />


            <div className="flex flex-col lg:flex-row gap-6 min-w-0">
                <div className="w-full lg:w-[70%] min-w-0 flex-1 lg:flex lg:flex-col lg:min-h-0">
                    <h6 className="font-semibold mb-5 shrink-0">Currency Pair Heatmap</h6>

                    {heatmapItems.length === 0 ? (
                        <p className="mb-3 text-sm text-[rgb(var(--secondary))]">
                            {`No heatmap rows yet. Score Dashboard (${SCORE_DASHBOARD_TABLE_ID} / Sheet76): column 1 = currency pair, column 2 = net score.`}
                        </p>
                    ) : null}

                    {heatmapItems.length > 0 ? (
                        <div className="rounded-xl bg-darkGrey px-5 py-6">
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                                {heatmapItems.map((item, index) => (
                                    <HeatMap
                                        key={`${item.pair}-${index}`}
                                        pair={item.pair}
                                        value={item.value}
                                        scoreScale="seasonal"
                                        seasonalDisplayRange={heatmapSeasonalRange}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="w-full lg:w-[30%] flex-shrink-0 flex flex-col gap-4 min-h-0 lg:self-stretch">
                    <div className="bg-darkGrey rounded-xl px-6 py-4 shrink-0">
                        <h6 className="font-semibold mb-3">Currency Strength Index</h6>

                        <CurrencyStrengthIndexes>
                            {currencyStrengthRows.map((item) => (
                                <CurrencyStrengthIndex
                                    key={item.currency}
                                    currency={item.currency}
                                    value={item.value}
                                    strengthRange={currencyStrengthRange}
                                />
                            ))}
                        </CurrencyStrengthIndexes>

                        {currencyStrengthRows.length === 0 ? (
                            <p className="mt-3 text-center text-xs text-[rgb(var(--secondary))]">
                                No currency strength rows. Use the Edge Tools &quot;Currency Strength Index&quot; table (
                                {EDGE_CURRENCY_STRENGTH_INDEX_ID}): first column = currency, last column = score.
                            </p>
                        ) : null}
                    </div>

                    <div className="bg-darkGrey rounded-xl flex flex-col flex-1 min-h-0 basis-0 overflow-hidden lg:min-h-[420px]">
                        <div
                            className="scrollable-container flex flex-1 min-h-0 justify-center overflow-x-hidden px-4 pb-4 pt-4"
                            aria-label="Technical analysis widget"
                        >
                            <TradingViewTechnicalAnalysisWidget symbol="OANDA:GBPUSD" width={380} height={440} />
                        </div>
                    </div>
                </div>
            </div>

            {/* One `gap-6` rhythm between chart and Market Pulse (same as heatmap row `gap-6`). */}
            <div className="mt-6 flex min-w-0 flex-col gap-6">
                <TradingViewAdvancedChart />

                {/* Heading spans full width; row mirrors Edge TMV + Risk split (45% / 55% at xl). */}
                <div className="flex min-w-0 flex-col gap-6">
                    <div className="relative mb-0 min-h-[40px] w-full shrink-0 px-1">
                        <h6 className="px-2 text-center font-semibold sm:px-28">Market Pulse</h6>
                        <div className="absolute end-0 top-0 z-10">
                            <MarketPulseTimezoneSelect
                                value={storedTimezone}
                                onValueChange={setStoredTimezone}
                                className="items-end"
                            />
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col gap-6 xl:flex-row xl:items-stretch">
                    <div className="flex w-full min-h-0 flex-nowrap gap-4 xl:w-[45%]">
                        <EdgeTmGauge
                            title="Trend"
                            score={tmvScores.trend}
                            gaugeZones={tmvGaugeZones}
                            isDark={gaugePaletteDark}
                        />
                        <EdgeTmGauge
                            title="Momentum"
                            score={tmvScores.momentum}
                            gaugeZones={tmvGaugeZones}
                            isDark={gaugePaletteDark}
                        />
                        <EdgeTmGauge
                            title="Volatility"
                            score={tmvScores.volatility}
                            gaugeZones={gaugePaletteDark ? DARK_VOLATILITY_ZONES : LIGHT_VOLATILITY_ZONES}
                            isDark={gaugePaletteDark}
                            needleMode="volatility"
                        />
                    </div>

                    <div className="flex min-h-0 w-full xl:w-[55%] xl:flex-col">
                        <MarketPulseTmvHistory
                            className="min-h-[280px] w-full flex-1 xl:min-h-0"
                            trend={tmvScores.trend}
                            momentum={tmvScores.momentum}
                            volatility={tmvScores.volatility}
                            timeZone={effectiveTimezone}
                            historySlots={tmvHistorySlots}
                        />
                    </div>
                </div>
                </div>
            </div>
        </Container>
    );
}
