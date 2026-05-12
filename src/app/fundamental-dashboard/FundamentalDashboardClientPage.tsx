"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

import CentralBankPoliciesSection from "@/components/composed/CentralBankPoliciesSection";
import CommitmentsofTradersOverview from "@/components/composed/CommitmentsofTradersOverview";
import CurrencySeasonality from "@/components/composed/CurrencySeasonality";
import EconomicPulseMeter from "@/components/composed/EconomicPulseMeter";
import FundamentalCurrencyStrengthIndex from "@/components/composed/FundamentalCurrencyStrengthIndex";
import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
    buildCentralBankPolicyRows,
    buildCotOverviewRows,
    buildCurrencySeasonalityRows,
    buildEconomicPulseRows,
    buildFundamentalStrengthRows,
    parseFundamentalsNewPulseSheetGrid,
    parseRiskModeSheetValue,
    type EconomicPulseSheetByCurrency,
} from "@/lib/fundamentalDashboardData";
import Section from "@/components/ui/layout/Section";
import Container from "@/components/ui/layout/Container";
import { apiConfig } from "@/services/api.config";
import { dynamicTableService, type DynamicTable } from "@/services/dynamicTable.service";
import { googleSheetsService } from "@/services/googleSheets.service";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";
const COT_RAW_DATA_ID = "cot_raw_data";
const FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID = "fundamental_currency_strength_index";
const CURRENCY_SEASONALITY_ID = "currency_seasonality";
const CENTRAL_BANK_POLICIES_ID = "central_bank_policies";

const FUNDAMENTAL_DASHBOARD_TABLES = [
    {
        identifier: FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID,
        name: "Fundamental Currency Strength Index",
        displayName: "Fundamental Currency Strength Index",
    },
] as const;

type FundamentalTableIdentifier = (typeof FUNDAMENTAL_DASHBOARD_TABLES)[number]["identifier"];

const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

const FUNDAMENTALS_NEW_SHEET_ID = "Fundamentals New";
const FUNDAMENTALS_NEW_PULSE_RANGE = "A180:G187";

export type FundamentalDashboardInitialTables = {
    pairSentiment: DynamicTable | null;
    cotRaw: DynamicTable | null;
    fundamentalStrength: DynamicTable | null;
    currencySeasonality: DynamicTable | null;
    centralBankPolicies: DynamicTable | null;
};

export default function FundamentalDashboardClientPage({
    initialTables,
    initialRiskModeScore,
    initialEconomicPulseScores,
}: {
    initialTables: FundamentalDashboardInitialTables;
    initialRiskModeScore: number;
    initialEconomicPulseScores: EconomicPulseSheetByCurrency;
}) {
    const { theme } = useTheme();
    const { isAdmin } = useAuth();
    const [htmlHasDarkClass, setHtmlHasDarkClass] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedTable, setSelectedTable] = useState<FundamentalTableIdentifier>(FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID);
    const [showEditor, setShowEditor] = useState(false);

    const [pairSentiment, setPairSentiment] = useState<DynamicTable | null>(initialTables.pairSentiment);
    const [cotRaw, setCotRaw] = useState<DynamicTable | null>(initialTables.cotRaw);
    const [fundamentalStrength, setFundamentalStrength] = useState<DynamicTable | null>(initialTables.fundamentalStrength);
    const [currencySeasonalityTable, setCurrencySeasonalityTable] = useState<DynamicTable | null>(
        initialTables.currencySeasonality,
    );
    const [centralBankPoliciesTable, setCentralBankPoliciesTable] = useState<DynamicTable | null>(
        initialTables.centralBankPolicies,
    );
    const [riskModeScore, setRiskModeScore] = useState(initialRiskModeScore);
    const [economicPulseScores, setEconomicPulseScores] = useState<EconomicPulseSheetByCurrency>(initialEconomicPulseScores);

    useLayoutEffect(() => {
        const sync = () => setHtmlHasDarkClass(document.documentElement.classList.contains("dark"));
        sync();
        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    const gaugeDark = theme === "dark" || htmlHasDarkClass;

    const loadRiskModeScore = useCallback(async () => {
        try {
            const value = await googleSheetsService.getCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL);
            setRiskModeScore(parseRiskModeSheetValue(value));
        } catch {
            setRiskModeScore(0);
        }
    }, []);

    const loadTables = useCallback(async () => {
        try {
            const [sentRes, cotRes, fundRes, seasRes, centralBankRes, pulseValues] = await Promise.all([
                dynamicTableService.getTableByIdentifier(CURRENCY_PAIR_SENTIMENT_ID),
                dynamicTableService.getTableByIdentifier(COT_RAW_DATA_ID),
                dynamicTableService.getTableByIdentifier(FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID),
                dynamicTableService.getTableByIdentifier(CURRENCY_SEASONALITY_ID),
                dynamicTableService.getTableByIdentifier(CENTRAL_BANK_POLICIES_ID),
                googleSheetsService.getRange(FUNDAMENTALS_NEW_SHEET_ID, FUNDAMENTALS_NEW_PULSE_RANGE).catch(() => null),
            ]);

            setPairSentiment(sentRes?.data ?? null);
            setCotRaw(cotRes?.data ?? null);
            setFundamentalStrength(fundRes?.data ?? null);
            setCurrencySeasonalityTable(seasRes?.data ?? null);
            setCentralBankPoliciesTable(centralBankRes?.data ?? null);
            if (pulseValues && Array.isArray(pulseValues)) {
                setEconomicPulseScores(parseFundamentalsNewPulseSheetGrid(pulseValues));
            }
        } catch (e) {
            console.error("Failed to load fundamental dashboard tables:", e);
            setPairSentiment(null);
            setCotRaw(null);
            setFundamentalStrength(null);
            setCurrencySeasonalityTable(null);
            setCentralBankPoliciesTable(null);
        }
    }, []);

    useEffect(() => {
        void loadTables();
    }, [loadTables, refreshTrigger]);

    const pollFundamentalBackend = useCallback(async () => {
        await Promise.all([loadTables(), loadRiskModeScore()]);
    }, [loadTables, loadRiskModeScore]);

    useDashboardBackendPoll(pollFundamentalBackend);

    useEffect(() => {
        void loadRiskModeScore();
    }, [loadRiskModeScore]);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const onRisk = () => {
            void loadRiskModeScore();
        };

        const bump = () => setRefreshTrigger((v) => v + 1);

        socket.on("tableUpdate", bump);
        socket.on("tableEditorUpdate", bump);
        socket.on("tableEditorSync", bump);
        socket.on("riskModeScoreUpdate", onRisk);

        return () => {
            socket.off("tableUpdate", bump);
            socket.off("tableEditorUpdate", bump);
            socket.off("tableEditorSync", bump);
            socket.off("riskModeScoreUpdate", onRisk);
            socket.disconnect();
        };
    }, [loadRiskModeScore]);

    const cotRows = useMemo(() => buildCotOverviewRows(pairSentiment, cotRaw), [pairSentiment, cotRaw]);
    const strengthRows = useMemo(() => buildFundamentalStrengthRows(fundamentalStrength), [fundamentalStrength]);
    const seasonalityRows = useMemo(() => buildCurrencySeasonalityRows(currencySeasonalityTable), [currencySeasonalityTable]);
    const economicPulseRows = useMemo(() => buildEconomicPulseRows(economicPulseScores), [economicPulseScores]);
    const centralBankPolicyRows = useMemo(() => buildCentralBankPolicyRows(centralBankPoliciesTable), [centralBankPoliciesTable]);
    const selectedTableConfig = useMemo(
        () => FUNDAMENTAL_DASHBOARD_TABLES.find((t) => t.identifier === selectedTable) ?? FUNDAMENTAL_DASHBOARD_TABLES[0],
        [selectedTable],
    );

    const selectedTableExists = useMemo(() => {
        if (selectedTable === FUNDAMENTAL_CURRENCY_STRENGTH_INDEX_ID) return Boolean(fundamentalStrength);
        return false;
    }, [fundamentalStrength, selectedTable]);

    const handleTableSave = useCallback(async () => {
        setRefreshTrigger((c) => c + 1);
        setShowEditor(false);
    }, []);

    const handleTableSelect = useCallback((identifier: string) => {
        setSelectedTable(identifier as FundamentalTableIdentifier);
        setShowEditor(true);
    }, []);

    return (
        <Container className="flex flex-col gap-8">
            <div className="grid grid-cols-2 items-stretch gap-8 3xl:grid-cols-3">
                <FundamentalPageSection title="Fundamental Currency Strength Index" alignStart sectionClassName="pb-[30px]">
                    <FundamentalCurrencyStrengthIndex strengthRows={strengthRows} riskModeScore={riskModeScore} isDark={gaugeDark} />
                </FundamentalPageSection>

                <FundamentalPageSection title="Commitments of Traders (COT) Overview" sectionClassName="pb-[30px]">
                    <CommitmentsofTradersOverview rows={cotRows} />
                </FundamentalPageSection>

                <FundamentalPageSection title="Central Bank Policies">
                    <CentralBankPoliciesSection rows={centralBankPolicyRows} isDark={gaugeDark} />
                </FundamentalPageSection>

                <div className="flex h-full w-full min-w-0 flex-col gap-8">
                    <FundamentalPageSection title="Currency Seasonality" alignStart>
                        <CurrencySeasonality rows={seasonalityRows} />
                    </FundamentalPageSection>
                    <FundamentalPageSection title="Economic Pulse Meter" alignStart>
                        <EconomicPulseMeter rows={economicPulseRows} />
                    </FundamentalPageSection>
                </div>
            </div>

            {isAdmin ? (
                <section className="space-y-4 rounded-xl bg-darkGrey p-4">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">Fundamental dashboard table editor</p>
                        <button
                            type="button"
                            onClick={() => setShowEditor((current) => !current)}
                            className="rounded-lg bg-[rgb(var(--electric-blue))] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {showEditor ? "Hide editor" : selectedTableExists ? "Edit table" : "Create table"}
                        </button>
                    </div>

                    {showEditor ? (
                        <AdminTableEditor
                            tableIdentifier={selectedTable}
                            tableName={selectedTableConfig.name}
                            onSave={handleTableSave}
                            showTableSelector
                            availableTables={[...FUNDAMENTAL_DASHBOARD_TABLES]}
                            onTableSelect={handleTableSelect}
                        />
                    ) : null}
                </section>
            ) : null}

            <section className="space-y-6">
                {isAdmin
                    ? FUNDAMENTAL_DASHBOARD_TABLES.map((table) => (
                          <section key={table.identifier} className="overflow-hidden rounded-xl bg-darkGrey">
                              <DynamicTableDisplay
                                  tableIdentifier={table.identifier}
                                  refreshTrigger={refreshTrigger}
                                  initialTable={fundamentalStrength}
                              />
                          </section>
                      ))
                    : null}
            </section>
        </Container>
    );
}

function FundamentalPageSection({
    title,
    children,
    alignStart,
    sectionClassName,
}: React.PropsWithChildren<{ title: string; alignStart?: boolean; sectionClassName?: string }>) {
    const alignmentClass = alignStart ? "text-left" : "";

    return (
        <Section
            hasFlex={false}
            className={`relative flex h-full w-full flex-col ${alignmentClass} ${sectionClassName ?? ""}`}
        >
            <div className={alignStart ? "w-full text-left" : undefined}>
                <h5 className={alignStart ? "text-left" : undefined}>{title}</h5>
            </div>
            <hr className="border-stroke absolute top-[60px] left-0 right-0" />
            <div className={alignStart ? "h-full w-full text-left" : "h-full"}>{children}</div>
        </Section>
    );
}
