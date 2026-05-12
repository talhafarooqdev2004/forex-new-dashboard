"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";

import Icon from "@/components/composed/Icon";
import RiskModeSheetGauge from "@/components/composed/RiskModeSheetGauge";
import COTNonComLongVsShort from "@/components/composed/Charts/COTNonComLongVsShort";
import COTWeeklyChangeNetPositions from "@/components/composed/Charts/COTWeeklyChangeNetPositions";
import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import COTPairBiasTable from "@/components/composed/tables/COTPairBiasTable";
import FundamentalOutlookTable from "@/components/composed/tables/FundamentalOutlookTable";
import {
    buildCurrencyPairSentimentLists,
    buildPairBiasRowsFromCotTable,
    COT_OVERALL_RISK_BIAS_CELL,
    COT_OVERALL_RISK_SCORE_FALLBACK_CELL,
    COT_OVERALL_RISK_SCORE_PRIMARY_CELL,
    COT_OVERALL_SHEET_TAB,
    formatCotOverallRiskScoreDisplay,
    mapCotOverallRiskScoreToGauge0100,
    resolveCotOverallRiskScoreCells,
} from "@/lib/cotDataAnalysisFromTables";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { dynamicTableService, type DynamicTable } from "@/services/dynamicTable.service";
import { googleSheetsService } from "@/services/googleSheets.service";
import { apiConfig } from "@/services/api.config";
import LabelSection from "@/components/ui/layout/LabelSection";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";
import Section from "@/components/ui/layout/Section";
import Container from "@/components/ui/layout/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    COT_APP_CONFIG_MARKET_COMMENTARY_KEY,
    COT_APP_CONFIG_SENTIMENT_MONTH_KEY,
    COT_DEFAULT_MARKET_COMMENTARY,
    putAdminAppConfig,
} from "@/lib/cotPageAppConfig";

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";
const COT_SENTIMENT_NET_SCORE_ID = "cot_sentiment_net_score";
const COT_RAW_DATA_ID = "cot_raw_data";

const COT_TABLE_UPDATE_IDS = new Set<string>([
    CURRENCY_PAIR_SENTIMENT_ID,
    COT_SENTIMENT_NET_SCORE_ID,
    COT_RAW_DATA_ID,
]);

const COT_DASHBOARD_TABLES = [
    {
        identifier: CURRENCY_PAIR_SENTIMENT_ID,
        name: "Currency Pair Sentiment",
        displayName: "Currency Pair Sentiment",
    },
    {
        identifier: COT_SENTIMENT_NET_SCORE_ID,
        name: "COT Sentiment & Net Score",
        displayName: "COT Sentiment & Net Score",
    },
    {
        identifier: COT_RAW_DATA_ID,
        name: "COT Raw Data",
        displayName: "COT Raw Data",
    },
] as const;

function formatCotOverallBiasDisplay(raw: string): string {
    const s = raw.trim();
    if (!s) return "—";
    return s.toUpperCase().replace(/\s+/g, " ");
}

/** Align with Risk Mode semantics: ON → buy/green, OFF → sell/red, else neutral. */
function cotOverallBiasAccent(biasRaw: string): { color: string; showUpArrow: boolean } {
    const b = biasRaw.trim();
    if (!b) return { color: GAUGE_SIGNAL_COLORS.neutral, showUpArrow: true };
    const upper = b.toUpperCase();
    if (/\bOFF\b|\bRISK\s*[- ]?\s*OFF\b|BEARISH/i.test(b)) {
        return { color: GAUGE_SIGNAL_COLORS.sell, showUpArrow: false };
    }
    if (/\bRISK\s*[- ]?\s*ON\b|\bON\b|BULLISH/i.test(upper) && !/\bOFF\b/i.test(b)) {
        return { color: GAUGE_SIGNAL_COLORS.buy, showUpArrow: true };
    }
    return { color: GAUGE_SIGNAL_COLORS.neutral, showUpArrow: true };
}

function pickMarketCommentary(raw: string | null | undefined): string {
    const t = raw?.trim();
    return t && t.length > 0 ? t : COT_DEFAULT_MARKET_COMMENTARY;
}

function pickSentimentMonth(raw: string | null | undefined, calendarMonth: string): string {
    const t = raw?.trim();
    return t && t.length > 0 ? t : calendarMonth;
}

export default function CotDataAnalysisClientPage({
    initialPairSentiment,
    initialCotSentimentNet,
    initialTableExists,
    initialCotOverallRiskScore = 0,
    initialCotOverallRiskBias = "",
    initialCotMarketCommentary = null,
    initialCotSentimentMonthLabel = null,
}: {
    initialPairSentiment: DynamicTable | null;
    initialCotSentimentNet: DynamicTable | null;
    initialTableExists: Record<string, boolean>;
    initialCotOverallRiskScore?: number;
    initialCotOverallRiskBias?: string;
    initialCotMarketCommentary?: string | null;
    initialCotSentimentMonthLabel?: string | null;
}) {
    const { isAdmin, token, ready } = useAuth();
    const [selectedTable, setSelectedTable] = useState<string>(COT_DASHBOARD_TABLES[0].identifier);
    const [tableExists, setTableExists] = useState<Record<string, boolean>>(initialTableExists);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showEditor, setShowEditor] = useState(false);
    const [isLoadingTables, setIsLoadingTables] = useState(false);

    const checkTables = useCallback(async () => {
        try {
            setIsLoadingTables(true);
            const responses = await Promise.all(
                COT_DASHBOARD_TABLES.map(async (table) => {
                    try {
                        const response = await dynamicTableService.getTableByIdentifier(table.identifier);
                        return { identifier: table.identifier, exists: Boolean(response?.data) };
                    } catch {
                        return { identifier: table.identifier, exists: false };
                    }
                }),
            );
            setTableExists(
                responses.reduce<Record<string, boolean>>((acc, row) => {
                    acc[row.identifier] = row.exists;
                    return acc;
                }, {}),
            );
        } finally {
            setIsLoadingTables(false);
        }
    }, []);

    useEffect(() => {
        void checkTables();
    }, [checkTables]);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const onTableUpdate = (payload: { type?: string; data?: { identifier?: string } }) => {
            if (payload?.type !== "TABLE_UPDATE") return;
            const id = payload.data?.identifier;
            if (!id || !COT_TABLE_UPDATE_IDS.has(id)) return;
            setRefreshTrigger((c) => c + 1);
            void checkTables();
        };

        socket.on("tableUpdate", onTableUpdate);
        return () => {
            socket.off("tableUpdate", onTableUpdate);
            socket.disconnect();
        };
    }, [checkTables]);

    const selectedTableConfig = useMemo(
        () => COT_DASHBOARD_TABLES.find((t) => t.identifier === selectedTable) ?? COT_DASHBOARD_TABLES[0],
        [selectedTable],
    );

    const selectedTableExists = tableExists[selectedTable] ?? false;

    const handleTableSave = useCallback(async () => {
        setRefreshTrigger((c) => c + 1);
        await checkTables();
        setTableExists((current) => ({ ...current, [selectedTable]: true }));
        setShowEditor(false);
    }, [checkTables, selectedTable]);

    const handleTableSelection = useCallback((identifier: string) => {
        setSelectedTable(identifier);
        setShowEditor(true);
    }, []);

    const [pairSentimentWidgetTable, setPairSentimentWidgetTable] = useState<DynamicTable | null>(initialPairSentiment);
    const [cotNetWidgetTable, setCotNetWidgetTable] = useState<DynamicTable | null>(initialCotSentimentNet);
    const [cotOverallRiskScore, setCotOverallRiskScore] = useState(() => initialCotOverallRiskScore);
    const [cotOverallRiskBias, setCotOverallRiskBias] = useState(() => initialCotOverallRiskBias);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const calendarMonthDefault = useMemo(
        () => new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date()),
        [],
    );

    const [commentaryText, setCommentaryText] = useState(() => pickMarketCommentary(initialCotMarketCommentary));
    const [monthLabelText, setMonthLabelText] = useState(() =>
        pickSentimentMonth(initialCotSentimentMonthLabel, calendarMonthDefault),
    );
    const [editingCommentary, setEditingCommentary] = useState(false);
    const [draftCommentary, setDraftCommentary] = useState("");
    const commentaryRef = useRef<HTMLTextAreaElement | null>(null);
    const [editingMonth, setEditingMonth] = useState(false);
    const [draftMonth, setDraftMonth] = useState("");
    const monthInputRef = useRef<HTMLInputElement | null>(null);
    const skipCommentaryBlurSave = useRef(false);
    const skipMonthBlurSave = useRef(false);

    useEffect(() => {
        setCommentaryText(pickMarketCommentary(initialCotMarketCommentary));
    }, [initialCotMarketCommentary]);

    useEffect(() => {
        setMonthLabelText(pickSentimentMonth(initialCotSentimentMonthLabel, calendarMonthDefault));
    }, [initialCotSentimentMonthLabel, calendarMonthDefault]);

    useLayoutEffect(() => {
        if (editingCommentary) commentaryRef.current?.focus();
    }, [editingCommentary]);

    useLayoutEffect(() => {
        if (!editingMonth) return;
        const el = monthInputRef.current;
        if (el) {
            el.focus();
            el.select();
        }
    }, [editingMonth]);

    const commitCommentary = useCallback(async () => {
        if (skipCommentaryBlurSave.current) {
            skipCommentaryBlurSave.current = false;
            return;
        }
        if (!editingCommentary) return;
        setEditingCommentary(false);
        if (!isAdmin || !token) return;
        const nextTrim = draftCommentary.trim();
        const prev = commentaryText;
        const displayNext = pickMarketCommentary(nextTrim || null);
        setCommentaryText(displayNext);
        const ok = await putAdminAppConfig(COT_APP_CONFIG_MARKET_COMMENTARY_KEY, nextTrim, token);
        if (!ok) {
            setCommentaryText(prev);
            toast.error("Could not save commentary");
        }
    }, [editingCommentary, isAdmin, token, draftCommentary, commentaryText]);

    const commitMonth = useCallback(async () => {
        if (skipMonthBlurSave.current) {
            skipMonthBlurSave.current = false;
            return;
        }
        if (!editingMonth) return;
        setEditingMonth(false);
        if (!isAdmin || !token) return;
        const nextTrim = draftMonth.trim();
        const prev = monthLabelText;
        const displayNext = pickSentimentMonth(nextTrim || null, calendarMonthDefault);
        setMonthLabelText(displayNext);
        const ok = await putAdminAppConfig(COT_APP_CONFIG_SENTIMENT_MONTH_KEY, nextTrim, token);
        if (!ok) {
            setMonthLabelText(prev);
            toast.error("Could not save month label");
        }
    }, [editingMonth, isAdmin, token, draftMonth, monthLabelText, calendarMonthDefault]);

    useEffect(() => {
        const updateTheme = () => setIsDarkMode(document.documentElement.classList.contains("dark"));
        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const bullishCurrencies = useMemo(() => {
        if (!pairSentimentWidgetTable) return [];
        return buildCurrencyPairSentimentLists(pairSentimentWidgetTable).bullish;
    }, [pairSentimentWidgetTable]);

    const bearishCurrencies = useMemo(() => {
        if (!pairSentimentWidgetTable) return [];
        return buildCurrencyPairSentimentLists(pairSentimentWidgetTable).bearish;
    }, [pairSentimentWidgetTable]);

    const pairBiasRows = useMemo(() => {
        if (!cotNetWidgetTable) return [];
        return buildPairBiasRowsFromCotTable(cotNetWidgetTable);
    }, [cotNetWidgetTable]);

    const biasDisplay = useMemo(() => formatCotOverallBiasDisplay(cotOverallRiskBias), [cotOverallRiskBias]);
    const biasAccent = useMemo(() => cotOverallBiasAccent(cotOverallRiskBias), [cotOverallRiskBias]);

    const loadCotWidgets = useCallback(async () => {
        try {
            const [pairSentimentResponse, cotSentimentResponse] = await Promise.all([
                dynamicTableService.getTableByIdentifier(CURRENCY_PAIR_SENTIMENT_ID),
                dynamicTableService.getTableByIdentifier(COT_SENTIMENT_NET_SCORE_ID),
            ]);

            setPairSentimentWidgetTable(pairSentimentResponse?.data ?? null);
            setCotNetWidgetTable(cotSentimentResponse?.data ?? null);
        } catch (error) {
            console.error("Failed to load COT dashboard tables:", error);
            setPairSentimentWidgetTable(null);
            setCotNetWidgetTable(null);
        }

        try {
            const [riskScoreRaw, riskScoreFallbackRaw, riskBiasRaw] = await Promise.all([
                googleSheetsService.getCell(COT_OVERALL_SHEET_TAB, COT_OVERALL_RISK_SCORE_PRIMARY_CELL),
                googleSheetsService.getCell(COT_OVERALL_SHEET_TAB, COT_OVERALL_RISK_SCORE_FALLBACK_CELL),
                googleSheetsService.getCell(COT_OVERALL_SHEET_TAB, COT_OVERALL_RISK_BIAS_CELL),
            ]);
            setCotOverallRiskScore(resolveCotOverallRiskScoreCells(riskScoreRaw, riskScoreFallbackRaw));
            setCotOverallRiskBias(
                riskBiasRaw === null || riskBiasRaw === undefined ? "" : String(riskBiasRaw).trim(),
            );
        } catch (error) {
            console.warn("[COT] Failed to refresh overall sentiment cells from sheet:", error);
        }
    }, []);

    useEffect(() => {
        void loadCotWidgets();
    }, [loadCotWidgets, refreshTrigger]);

    const pollCotBackend = useCallback(async () => {
        await Promise.all([checkTables(), loadCotWidgets()]);
    }, [checkTables, loadCotWidgets]);

    useDashboardBackendPoll(pollCotBackend);

    return (
        <Container>
            <div className="flex min-w-0 flex-row items-stretch gap-6">
                <div className="flex min-w-0 flex-[60_1_0%] flex-col gap-6 self-stretch">
                    <Section className="flex min-h-[min(42vh,440px)] flex-1 flex-col">
                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            {/* Header row — same line as design reference */}
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="font-normal text-foreground text-base sm:text-lg">
                                    Overall Sentiment for
                                    {editingMonth && isAdmin && ready && token ? (
                                        <input
                                            ref={monthInputRef}
                                            type="text"
                                            className="ml-1 inline-block min-w-[6rem] max-w-[14rem] align-baseline rounded border border-stroke bg-background py-0.5 pl-1.5 pr-1.5 text-base font-normal text-foreground sm:text-lg"
                                            value={draftMonth}
                                            onChange={(e) => setDraftMonth(e.target.value)}
                                            onBlur={() => void commitMonth()}
                                            onKeyDown={(e) => {
                                                if (e.key === "Escape") {
                                                    skipMonthBlurSave.current = true;
                                                    setEditingMonth(false);
                                                    setDraftMonth(monthLabelText);
                                                }
                                                if (e.key === "Enter") {
                                                    (e.target as HTMLInputElement).blur();
                                                }
                                            }}
                                            aria-label="Overall sentiment month or date label"
                                        />
                                    ) : (
                                        <>
                                            {" "}
                                            <span
                                                className={
                                                    isAdmin && ready && token
                                                        ? "text-base sm:text-lg cursor-text rounded-sm px-0.5 hover:bg-white/5"
                                                        : "text-base sm:text-lg"
                                                }
                                                onDoubleClick={() => {
                                                    if (!ready || !isAdmin || !token) return;
                                                    setDraftMonth(monthLabelText);
                                                    setEditingMonth(true);
                                                }}
                                            >
                                                {monthLabelText}
                                            </span>
                                        </>
                                    )}
                                    <span className="text-base sm:text-lg">:</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <span
                                        className="text-base font-semibold sm:text-lg"
                                        style={{ color: biasAccent.color }}
                                    >
                                        {biasDisplay}
                                    </span>
                                    {biasAccent.showUpArrow ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="23"
                                            height="23"
                                            viewBox="0 0 23 23"
                                            fill="none"
                                            aria-hidden
                                        >
                                            <path
                                                d="M6.66602 6.66602H16.1883V16.1883"
                                                stroke={biasAccent.color}
                                                strokeWidth="1.90446"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M6.66602 16.1883L16.1883 6.66602"
                                                stroke={biasAccent.color}
                                                strokeWidth="1.90446"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="23"
                                            height="23"
                                            viewBox="0 0 23 23"
                                            fill="none"
                                            aria-hidden
                                        >
                                            <path
                                                d="M16.1883 16.1883H6.66602V6.66602"
                                                stroke={biasAccent.color}
                                                strokeWidth="1.90446"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M16.1883 6.66602L6.66602 16.1883"
                                                stroke={biasAccent.color}
                                                strokeWidth="1.90446"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </span>
                            </div>

                            {editingCommentary && isAdmin && ready && token ? (
                                <textarea
                                    ref={commentaryRef}
                                    className="mt-1 max-w-3xl w-full rounded-md border border-stroke bg-background px-2 py-1.5 text-sm leading-snug text-foreground"
                                    rows={4}
                                    value={draftCommentary}
                                    onChange={(e) => setDraftCommentary(e.target.value)}
                                    onBlur={() => void commitCommentary()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            skipCommentaryBlurSave.current = true;
                                            setEditingCommentary(false);
                                            setDraftCommentary(commentaryText);
                                        }
                                    }}
                                    aria-label="Market commentary"
                                />
                            ) : (
                                <p
                                    className={`mt-1 max-w-3xl text-sm leading-snug text-[rgb(var(--secondary))] ${isAdmin && ready && token ? "cursor-text select-text rounded-sm" : ""
                                        }`}
                                    onDoubleClick={() => {
                                        if (!ready || !isAdmin || !token) return;
                                        setDraftCommentary(commentaryText);
                                        setEditingCommentary(true);
                                    }}
                                >
                                    {commentaryText}
                                </p>
                            )}

                            <div className="mt-3 flex flex-1 flex-col items-center justify-center border-t border-solid border-stroke/60 pt-4">
                                <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                                    <span className="text-3xl font-bold tabular-nums leading-none text-foreground">
                                        {formatCotOverallRiskScoreDisplay(cotOverallRiskScore)}
                                    </span>
                                    <RiskModeSheetGauge
                                        riskModeScore={mapCotOverallRiskScoreToGauge0100(cotOverallRiskScore)}
                                        isDark={isDarkMode}
                                        className="flex w-[min(100%,220px)] max-w-[260px] shrink-0 justify-center"
                                    />
                                </div>
                            </div>
                        </div>
                    </Section>

                    <div className="flex flex-wrap gap-6">
                        <LabelSection
                            label="Bullish Sentiment"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                    <path
                                        d="M22.7861 7.30078L13.9354 16.1515L8.72913 10.9452L1.96094 17.7134"
                                        stroke={GAUGE_SIGNAL_COLORS.buy}
                                        strokeWidth="2.08252"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M16.5391 7.30078L22.7866 7.30078L22.7866 13.5483"
                                        stroke={GAUGE_SIGNAL_COLORS.buy}
                                        strokeWidth="2.08252"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            }
                            padding={false}
                            className="flex-1"
                        >
                            <div>
                                {bullishCurrencies.length === 0 ? (
                                    <div className="px-6 py-4 text-sm text-secondary">
                                        No bullish rows (positive values in the last column of Currency Pair Sentiment).
                                    </div>
                                ) : (
                                    bullishCurrencies.map((row, index) => (
                                        <div
                                            key={`bull-${row.currency}-${index}`}
                                            className={`py-3 ${index > 0 ? "border-t border-solid border-stroke" : ""}`}
                                        >
                                            <div className="flex items-center justify-between px-6">
                                                <span className="text-base font-semibold sm:text-lg">{row.currency}</span>
                                                <div className="flex items-center gap-2">
                                                    <Icon name="profit-icon.svg" width={11} height={11} />
                                                    <span style={{ color: GAUGE_SIGNAL_COLORS.buy }}>{row.valueDisplay}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </LabelSection>
                        <LabelSection
                            label="Bearish Sentiment"
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                                    <path
                                        d="M22.7861 17.6895L13.9354 8.83875L8.72913 14.045L1.96094 7.27686"
                                        stroke={GAUGE_SIGNAL_COLORS.sell}
                                        strokeWidth="2.08252"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M16.5391 17.6895H22.7866V11.4419"
                                        stroke={GAUGE_SIGNAL_COLORS.sell}
                                        strokeWidth="2.08252"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            }
                            padding={false}
                            className="flex-1"
                        >
                            <div>
                                {bearishCurrencies.length === 0 ? (
                                    <div className="px-6 py-4 text-sm text-secondary">
                                        No bearish rows (negative values in the last column of Currency Pair Sentiment).
                                    </div>
                                ) : (
                                    bearishCurrencies.map((row, index) => (
                                        <div
                                            key={`bear-${row.currency}-${index}`}
                                            className={`py-3 ${index > 0 ? "border-t border-solid border-stroke" : ""}`}
                                        >
                                            <div className="flex items-center justify-between px-6">
                                                <span className="text-base font-semibold sm:text-lg">{row.currency}</span>
                                                <div className="flex items-center gap-2">
                                                    <Icon name="loss-icon.svg" width={11} height={11} />
                                                    <span style={{ color: GAUGE_SIGNAL_COLORS.sell }}>{row.valueDisplay}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </LabelSection>
                    </div>

                    <Section hasFlex={false} padding={false}>
                        <FundamentalOutlookTable refreshTrigger={refreshTrigger} />
                    </Section>
                </div>

                <Section hasFlex={false} padding={false} className="min-w-0 flex-[40_1_0%] self-stretch">
                    <COTPairBiasTable rows={pairBiasRows} />
                </Section>
            </div>

            <COTNonComLongVsShort refreshTrigger={refreshTrigger} />

            <COTWeeklyChangeNetPositions refreshTrigger={refreshTrigger} />

            {isAdmin ? (
                <section className="mt-10 space-y-4">
                    <div className="flex flex-col gap-4 rounded-xl bg-darkGrey p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">
                                COT data table editor
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowEditor((current) => !current)}
                            disabled={isLoadingTables}
                            className="rounded-lg bg-[rgb(var(--electric-blue))] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {showEditor ? "Hide editor" : selectedTableExists ? "Edit table" : "Create table"}
                        </button>
                    </div>

                    {showEditor ? (
                        <section>
                            <AdminTableEditor
                                tableIdentifier={selectedTable}
                                tableName={selectedTableConfig.name}
                                onSave={handleTableSave}
                                showTableSelector
                                availableTables={[...COT_DASHBOARD_TABLES]}
                                onTableSelect={handleTableSelection}
                            />
                        </section>
                    ) : null}
                </section>
            ) : null}

            <section className="mt-8 space-y-6">
                {COT_DASHBOARD_TABLES.map((table) => {
                    if (
                        (table.identifier === CURRENCY_PAIR_SENTIMENT_ID ||
                            table.identifier === COT_SENTIMENT_NET_SCORE_ID) &&
                        !isAdmin
                    ) {
                        return null;
                    }
                    return (
                        <section
                            key={table.identifier}
                            className={`space-y-4 rounded-xl bg-darkGrey ${table.identifier === COT_SENTIMENT_NET_SCORE_ID ? "w-fit" : ""}`}
                        >
                            <DynamicTableDisplay tableIdentifier={table.identifier} refreshTrigger={refreshTrigger} />
                        </section>
                    );
                })}
            </section>
        </Container>
    );
}