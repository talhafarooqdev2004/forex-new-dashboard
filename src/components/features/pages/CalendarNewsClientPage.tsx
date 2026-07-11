"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import GeopoliticalRiskWatchCard from "@/components/composed/calendar-news/GeopoliticalRiskWatchCard";
import MarketHeatmapCard from "@/components/composed/calendar-news/MarketHeatmapCard";
import RiskModeCard from "@/components/composed/calendar-news/RiskModeCard";
import CalendarNewsCalendarSection from "@/components/composed/calendar-news/CalendarNewsCalendarSection";
import CalendarNewsScoreboards from "@/components/composed/calendar-news/CalendarNewsScoreboards";
import AdminNewsHeadlineSection from "@/components/composed/calendar-news/AdminNewsHeadlineSection";
import Container from "@/components/ui/layout/Container";
import type { EconomicCalendarRow, UpcomingHighImpactRow } from "@/lib/calendarNewsCalendarData";
import { fetchCalendarNewsLiveBundle } from "@/lib/calendarNewsLiveFetch";
import {
    STATIC_GEOPOLITICAL_RISK_WATCH,
    STATIC_RISK_MODE_DISPLAY,
    buildRiskModeDisplayFromScore,
    type GeopoliticalRiskWatch,
    type MarketHeatmapTile,
    type RiskModeDisplay,
} from "@/lib/calendarNewsPageData";
import { parseRiskModeSheetValueSigned } from "@/lib/fundamentalDashboardData";
import type { CatalystScoreboardRow, MacroScoreboardRow } from "@/lib/calendarNewsScoreboardData";
import { apiConfig } from "@/services/api.config";
import { googleSheetsService } from "@/services/googleSheets.service";

const RISK_MODE_SCORE_SHEET_ID = "RISK ON/OFF 12";
const RISK_MODE_SCORE_CELL = "B13";

type CalendarNewsClientPageProps = {
    economicCalendarRows: EconomicCalendarRow[];
    upcomingHighImpactRows: UpcomingHighImpactRow[];
    macroScoreboardRows: MacroScoreboardRow[];
    catalystScoreboardRows: CatalystScoreboardRow[];
    heatmapTiles: MarketHeatmapTile[];
    initialRiskMode?: RiskModeDisplay;
    initialGeopoliticalRisk?: GeopoliticalRiskWatch;
};

export default function CalendarNewsClientPage({
    economicCalendarRows: initialEconomic,
    upcomingHighImpactRows: initialUpcoming,
    macroScoreboardRows: initialMacro,
    catalystScoreboardRows: initialCatalyst,
    heatmapTiles: initialHeatmap,
    initialRiskMode = STATIC_RISK_MODE_DISPLAY,
    initialGeopoliticalRisk = STATIC_GEOPOLITICAL_RISK_WATCH,
}: CalendarNewsClientPageProps) {
    const mountedRef = useRef(false);
    const [economicCalendarRows, setEconomicCalendarRows] = useState(initialEconomic);
    const [upcomingHighImpactRows, setUpcomingHighImpactRows] = useState(initialUpcoming);
    const [macroScoreboardRows, setMacroScoreboardRows] = useState(initialMacro);
    const [catalystScoreboardRows, setCatalystScoreboardRows] = useState(initialCatalyst);
    const [heatmapTiles, setHeatmapTiles] = useState(initialHeatmap);
    const [riskMode, setRiskMode] = useState<RiskModeDisplay>(
        () => initialRiskMode ?? STATIC_RISK_MODE_DISPLAY,
    );
    const [geopoliticalRisk, setGeopoliticalRisk] = useState<GeopoliticalRiskWatch>(
        () => initialGeopoliticalRisk ?? STATIC_GEOPOLITICAL_RISK_WATCH,
    );
    const [newsRefreshKey, setNewsRefreshKey] = useState(0);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const refreshLive = useCallback(async () => {
        const bundle = await fetchCalendarNewsLiveBundle();
        if (!bundle || !mountedRef.current) return;
        setEconomicCalendarRows(bundle.economicCalendarRows);
        setUpcomingHighImpactRows(bundle.upcomingHighImpactRows);
        setMacroScoreboardRows(bundle.macroScoreboardRows);
        setCatalystScoreboardRows(bundle.catalystScoreboardRows);
        setHeatmapTiles(bundle.heatmapTiles);
        if (bundle.geopoliticalRisk) {
            setGeopoliticalRisk(bundle.geopoliticalRisk);
        }
        setNewsRefreshKey((k) => k + 1);
    }, []);

    const refreshRiskMode = useCallback(async () => {
        try {
            const value = await googleSheetsService.getCell(RISK_MODE_SCORE_SHEET_ID, RISK_MODE_SCORE_CELL);
            if (!mountedRef.current) return;
            setRiskMode(buildRiskModeDisplayFromScore(parseRiskModeSheetValueSigned(value)));
        } catch (error) {
            console.error("Failed to load risk mode score:", error);
        }
    }, []);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        socket.on("calendarNewsUpdate", () => {
            void refreshLive();
        });
        socket.on("riskModeScoreUpdate", () => {
            void refreshRiskMode();
        });

        return () => {
            socket.off("calendarNewsUpdate");
            socket.off("riskModeScoreUpdate");
            socket.disconnect();
        };
    }, [refreshLive, refreshRiskMode]);

    return (
        <Container>
            <div className="grid items-stretch gap-4 lg:grid-cols-3">
                <GeopoliticalRiskWatchCard watch={geopoliticalRisk} />
                <RiskModeCard riskMode={riskMode} />
                <MarketHeatmapCard tiles={heatmapTiles} />
            </div>
            <CalendarNewsScoreboards macroRows={macroScoreboardRows} catalystRows={catalystScoreboardRows} />
            <div className="mt-4">
                <CalendarNewsCalendarSection
                    economicCalendarRows={economicCalendarRows}
                    upcomingHighImpactRows={upcomingHighImpactRows}
                />
            </div>
            <div className="mt-4">
                <AdminNewsHeadlineSection refreshKey={newsRefreshKey} />
            </div>
        </Container>
    );
}
