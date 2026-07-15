"use client";

import { useEffect, useMemo, useState } from "react";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
    mapCatalystFactors,
    type CatalystFactorRow,
    type MarketDriverNewsDTO,
} from "@/lib/calendarNewsHeadlinesData";
import type { CatalystScoreboardRow } from "@/lib/calendarNewsScoreboardData";
import { IMPACT_BAR_UI, SCOREBOARD_UI, biasTextColor, scoreTextColor } from "@/lib/calendarNewsScoreboardData";
import { apiConfig } from "@/services/api.config";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import MarketCatalystFactorsDialog from "./MarketCatalystFactorsDialog";
import {
    CN_TD_STYLE,
    CN_TH_STYLE,
} from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsScoreboards.module.scss";

type ApiEnvelope =
    | { success?: boolean; data?: MarketDriverNewsDTO[] }
    | { success?: boolean; data?: { dayKey?: string; rows?: MarketDriverNewsDTO[] } };

type MarketCatalystScoreboardTableProps = {
    rows: CatalystScoreboardRow[];
    /** Bumped on live socket refresh so admin factors stay in sync. */
    refreshKey?: number;
    /** UAE day key for historical analysis; omit for live today. */
    dayKey?: string;
};

function extractRows(json: ApiEnvelope): MarketDriverNewsDTO[] | null {
    if (!json.success || json.data === undefined) return null;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.data.rows)) return json.data.rows;
    return null;
}

export default function MarketCatalystScoreboardTable({
    rows,
    refreshKey = 0,
    dayKey,
}: MarketCatalystScoreboardTableProps) {
    const { ready, isAdmin, token } = useAuth();
    const showFactorsColumn = ready && isAdmin;
    const [factors, setFactors] = useState<CatalystFactorRow[] | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

    useEffect(() => {
        if (!ready || !isAdmin || !token) {
            setFactors(null);
            return;
        }

        let cancelled = false;
        void (async () => {
            try {
                const qs = dayKey ? `?day=${encodeURIComponent(dayKey)}` : "";
                const res = await fetch(`${apiConfig.baseURL}/api/v1/admin/market-driver-news${qs}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    cache: "no-store",
                });
                if (!res.ok) return;
                const json = (await res.json()) as ApiEnvelope;
                const data = extractRows(json);
                if (cancelled || !data) return;
                setFactors(mapCatalystFactors(data));
            } catch {
                /* non-fatal: factors column stays empty if fetch fails */
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [ready, isAdmin, token, refreshKey, dayKey]);

    const selectedRow = useMemo(
        () => (selectedCurrency ? rows.find((r) => r.currency === selectedCurrency) ?? null : null),
        [rows, selectedCurrency],
    );

    const selectedFactors = useMemo(() => {
        if (!selectedCurrency || !factors) return [];
        return factors.filter((f) => f.asset === selectedCurrency);
    }, [factors, selectedCurrency]);

    const minWidth = showFactorsColumn ? 820 : 720;

    return (
        <section className={styles.panel} aria-label="Market Catalyst">
            <h2 className={styles.panelTitle}>Market Catalyst</h2>
            <div className={`${styles.tableScroll} ${styles.scoreboardStickyScroll}`}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No catalyst scoreboard data available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Market Catalyst" style={{ minWidth }}>
                        <Thead>
                            <Tr>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal", minWidth: 110 }}>Currency</Th>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal" }}>
                                    Bullish
                                    <br />
                                    Catalysts
                                </Th>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal" }}>
                                    Bearish
                                    <br />
                                    Catalysts
                                </Th>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal", minWidth: 100 }}>
                                    Catalysts
                                    <br />
                                    Score
                                </Th>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal", minWidth: 160 }}>Impact Bar</Th>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal", minWidth: 110 }}>Bias</Th>
                                {showFactorsColumn ? (
                                    <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal", minWidth: 100 }}>
                                        Factors
                                    </Th>
                                ) : null}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row) => (
                                <Tr key={row.currency}>
                                    <Td className={styles.cellThin} style={{ ...CN_TD_STYLE, minWidth: 110 }}>
                                        <span className={styles.assetCell}>
                                            <CalendarNewsAssetIcon asset={row.currency} size={26} />
                                            <span>{row.currency}</span>
                                        </span>
                                    </Td>
                                    <Td className={styles.cellThin} style={CN_TD_STYLE}>
                                        <span
                                            className={`${styles.tabular} ${styles.cellThin}`}
                                            style={{ color: SCOREBOARD_UI.green }}
                                        >
                                            {row.bullishCatalysts}
                                        </span>
                                    </Td>
                                    <Td className={styles.cellThin} style={CN_TD_STYLE}>
                                        <span
                                            className={`${styles.tabular} ${styles.cellThin}`}
                                            style={{
                                                color:
                                                    row.bearishTone === "green"
                                                        ? SCOREBOARD_UI.green
                                                        : SCOREBOARD_UI.red,
                                            }}
                                        >
                                            {row.bearishCatalysts}
                                        </span>
                                    </Td>
                                    <Td className={styles.cellThin} style={{ ...CN_TD_STYLE, minWidth: 100 }}>
                                        <span
                                            className={`${styles.tabular} ${styles.cellThin}`}
                                            style={{ color: scoreTextColor(row.catalystScore) }}
                                        >
                                            {formatSignedScore(row.catalystScore)}
                                        </span>
                                    </Td>
                                    <Td className={styles.cellThin} style={{ ...CN_TD_STYLE, minWidth: 160 }}>
                                        <ImpactBar filled={row.impactFilled} tone={row.impactTone} />
                                    </Td>
                                    <Td
                                        className={`${styles.tdCentered} ${styles.cellThin}`}
                                        style={{ ...CN_TD_STYLE, minWidth: 110 }}
                                    >
                                        <div className={styles.cellCenter}>
                                            <span
                                                className={`${styles.biasLabel} ${styles.cellThin}`}
                                                style={{ color: biasTextColor(row.bias) }}
                                            >
                                                {row.bias}
                                            </span>
                                        </div>
                                    </Td>
                                    {showFactorsColumn ? (
                                        <Td
                                            className={`${styles.tdCentered} ${styles.cellThin}`}
                                            style={{ ...CN_TD_STYLE, minWidth: 100 }}
                                        >
                                            <div className={styles.cellCenter}>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className={styles.viewFactorsBtn}
                                                    disabled={
                                                        row.bullishCatalysts + row.bearishCatalysts === 0 &&
                                                        !(factors ?? []).some((f) => f.asset === row.currency)
                                                    }
                                                    title={`View news factors for ${row.currency}`}
                                                    onClick={() => setSelectedCurrency(row.currency)}
                                                >
                                                    View
                                                </Button>
                                            </div>
                                        </Td>
                                    ) : null}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </div>

            {showFactorsColumn && selectedRow ? (
                <MarketCatalystFactorsDialog
                    open={Boolean(selectedCurrency)}
                    onOpenChange={(open) => {
                        if (!open) setSelectedCurrency(null);
                    }}
                    currency={selectedRow.currency}
                    bullishCount={selectedRow.bullishCatalysts}
                    bearishCount={selectedRow.bearishCatalysts}
                    factors={selectedFactors}
                />
            ) : null}
        </section>
    );
}

function formatSignedScore(score: number): string {
    const rounded = Math.abs(score - Math.round(score)) < 1e-6 ? Math.round(score) : Number(score.toFixed(1));
    if (rounded === 0) return "0.0";
    return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function ImpactBar({ filled, tone }: { filled: number; tone: CatalystScoreboardRow["impactTone"] }) {
    const fillColor = tone === "green" ? IMPACT_BAR_UI.green : IMPACT_BAR_UI.red;

    return (
        <div className={styles.impactBar} role="presentation">
            {Array.from({ length: IMPACT_BAR_UI.segments }, (_, i) => (
                <span
                    key={i}
                    className={styles.impactSegment}
                    style={{ backgroundColor: i < filled ? fillColor : IMPACT_BAR_UI.empty }}
                />
            ))}
        </div>
    );
}
