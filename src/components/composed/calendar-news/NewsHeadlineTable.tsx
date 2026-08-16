"use client";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import type { NewsHeadlineRow } from "@/lib/calendarNewsHeadlinesData";
import {
    STATIC_NEWS_HEADLINE_ROWS,
    formatNewsScore,
    newsImpactTextColor,
    newsScoreTextColor,
} from "@/lib/calendarNewsHeadlinesData";
import { SCOREBOARD_UI } from "@/lib/calendarNewsScoreboardData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import { CN_TD_STYLE, CN_TD_WRAP_STYLE, CN_TH_STYLE } from "./calendarNewsAdminTableStyles";

import styles from "./NewsHeadlineTable.module.scss";

type NewsHeadlineTableProps = {
    rows?: NewsHeadlineRow[];
};

export default function NewsHeadlineTable({ rows = STATIC_NEWS_HEADLINE_ROWS }: NewsHeadlineTableProps) {
    return (
        <section className={styles.panel} aria-label="News Headline">
            <h2 className={styles.panelTitle}>News Headline</h2>
            <div className={styles.tableScroll}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No news headlines available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="News Headline" style={{ minWidth: 1160 }}>
                        <Thead>
                            <Tr>
                                <Th style={{ ...CN_TH_STYLE, width: 48 }}>#</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 116 }}>Time</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 130 }}>Source</Th>
                                <Th style={CN_TH_STYLE}>News</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 110 }}>Asset</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 100 }}>Impact</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 90 }}>Bias</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 90 }}>Score</Th>
                                <Th style={CN_TH_STYLE}>Summary</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row, index) => (
                                <Tr key={`${row.news}-${index}`}>
                                    <Td style={CN_TD_STYLE} className={styles.tdIndex}>
                                        {index + 1}
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 116 }} className={styles.tdTime}>
                                        <time dateTime={row.publishedAt ?? undefined}>
                                            {formatHeadlineTime(row.publishedAt)}
                                        </time>
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 130 }} className={styles.tdSource}>
                                        {row.source?.trim() || "Unknown source"}
                                    </Td>
                                    <Td style={CN_TD_WRAP_STYLE} className={styles.tdNews}>
                                        {row.news}
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 110 }}>
                                        <span className={styles.assetCell}>
                                            <CalendarNewsAssetIcon asset={row.assetCode ?? row.asset} size={22} />
                                            <span>{row.asset}</span>
                                        </span>
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 100 }}>
                                        <span
                                            className={styles.impactLabel}
                                            style={{ color: newsImpactTextColor(row.impact) }}
                                        >
                                            {row.impact}
                                        </span>
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 90 }}>
                                        <span className={styles.biasCell}>
                                            <BiasIcon bias={row.bias} />
                                        </span>
                                    </Td>
                                    <Td style={{ ...CN_TD_STYLE, minWidth: 90 }}>
                                        <span
                                            className={styles.scoreLabel}
                                            style={{ color: newsScoreTextColor(Number(row.score) || 0) }}
                                        >
                                            {formatNewsScore(Number(row.score) || 0)}
                                        </span>
                                    </Td>
                                    <Td style={CN_TD_WRAP_STYLE} className={styles.tdSummary}>
                                        {row.summary}
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

function formatHeadlineTime(value: string | null): string {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Dubai",
    });
}

function BiasIcon({ bias }: { bias: NewsHeadlineRow["bias"] }) {
    if (bias === "down") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    if (bias === "flat") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
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
