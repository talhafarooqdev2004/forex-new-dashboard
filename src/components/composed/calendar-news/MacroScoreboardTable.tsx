"use client";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import type { MacroScoreboardRow } from "@/lib/calendarNewsScoreboardData";
import { SCOREBOARD_UI, biasTextColor, scoreTextColor } from "@/lib/calendarNewsScoreboardData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import {
    CN_TD_STYLE,
    CN_TD_WRAP_STYLE,
    CN_TH_STYLE,
} from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsScoreboards.module.scss";

type MacroScoreboardTableProps = {
    rows: MacroScoreboardRow[];
};

export default function MacroScoreboardTable({ rows }: MacroScoreboardTableProps) {
    return (
        <section className={styles.panel} aria-label="Macro Scoreboard">
            <h2 className={styles.panelTitle}>Macro Scoreboard</h2>
            <div className={styles.tableScroll}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No macro scoreboard data available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Macro Scoreboard" style={{ minWidth: 620 }}>
                        <Thead>
                            <Tr>
                                <Th style={CN_TH_STYLE}>Currency</Th>
                                <Th style={CN_TH_STYLE}>Current Bias</Th>
                                <Th style={{ ...CN_TH_STYLE, whiteSpace: "normal" }}>
                                    Macro Score
                                    <br />
                                    (+10 TO -10)
                                </Th>
                                <Th style={CN_TH_STYLE}>Trend</Th>
                                <Th style={CN_TH_STYLE}>Comment</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row) => (
                                <Tr key={row.currency}>
                                    <Td className={styles.tdCentered} style={CN_TD_STYLE}>
                                        <span className={styles.assetCell}>
                                            <CalendarNewsAssetIcon asset={row.currency} size={26} />
                                            <span>{row.currency}</span>
                                        </span>
                                    </Td>
                                    <Td className={styles.tdCentered} style={CN_TD_STYLE}>
                                        <div className={styles.cellCenter}>
                                            <span className={styles.biasLabel} style={{ color: biasTextColor(row.bias) }}>
                                                {row.bias}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className={styles.tdCentered} style={CN_TD_STYLE}>
                                        <div className={styles.cellCenter}>
                                            <span
                                                className={styles.tabular}
                                                style={{ color: scoreTextColor(row.macroScore) }}
                                            >
                                                {formatSignedScore(row.macroScore)}
                                            </span>
                                        </div>
                                    </Td>
                                    <Td className={styles.tdCentered} style={CN_TD_STYLE}>
                                        <div className={styles.cellCenter}>
                                            <TrendIcon trend={row.trend} />
                                        </div>
                                    </Td>
                                    <Td style={CN_TD_WRAP_STYLE} className={styles.tdComment}>
                                        {row.comment}
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

function TrendIcon({ trend }: { trend: MacroScoreboardRow["trend"] }) {
    if (trend === "up") {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M12 5L12 19M12 5L6 11M12 5L18 11"
                    stroke={SCOREBOARD_UI.green}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    if (trend === "down") {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                    d="M12 19L12 5M12 19L6 13M12 19L18 13"
                    stroke={SCOREBOARD_UI.red}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
                d="M5 12H19M19 12L14 7M19 12L14 17"
                stroke={SCOREBOARD_UI.orange}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
