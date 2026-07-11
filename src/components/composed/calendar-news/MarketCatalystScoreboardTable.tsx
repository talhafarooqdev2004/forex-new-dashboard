"use client";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import type { CatalystScoreboardRow } from "@/lib/calendarNewsScoreboardData";
import { IMPACT_BAR_UI, SCOREBOARD_UI, biasTextColor, scoreTextColor } from "@/lib/calendarNewsScoreboardData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import {
    CN_TD_STYLE,
    CN_TH_STYLE,
} from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsScoreboards.module.scss";

type MarketCatalystScoreboardTableProps = {
    rows: CatalystScoreboardRow[];
};

export default function MarketCatalystScoreboardTable({ rows }: MarketCatalystScoreboardTableProps) {
    return (
        <section className={styles.panel} aria-label="Market Catalyst">
            <h2 className={styles.panelTitle}>Market Catalyst</h2>
            <div className={styles.tableScroll}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No catalyst scoreboard data available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Market Catalyst" style={{ minWidth: 720 }}>
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
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row) => (
                                <Tr key={row.currency}>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 110 }}>
                                        <span className={styles.assetCell}>
                                            <CalendarNewsAssetIcon asset={row.currency} size={26} />
                                            <span>{row.currency}</span>
                                        </span>
                                    </Td>
                                    <Td style={CN_TD_STYLE}>
                                        <span className={styles.tabular} style={{ color: SCOREBOARD_UI.green }}>
                                            {row.bullishCatalysts}
                                        </span>
                                    </Td>
                                    <Td style={CN_TD_STYLE}>
                                        <span
                                            className={styles.tabular}
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
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 100 }}>
                                        <span
                                            className={styles.tabular}
                                            style={{ color: scoreTextColor(row.catalystScore) }}
                                        >
                                            {formatSignedScore(row.catalystScore)}
                                        </span>
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 160 }}>
                                        <ImpactBar filled={row.impactFilled} tone={row.impactTone} />
                                    </Td>
                                    <Td className={styles.tdCentered} style={{ ...CN_TD_STYLE, minWidth: 110 }}>
                                        <div className={styles.cellCenter}>
                                            <span className={styles.biasLabel} style={{ color: biasTextColor(row.bias) }}>
                                                {row.bias}
                                            </span>
                                        </div>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </div>
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
