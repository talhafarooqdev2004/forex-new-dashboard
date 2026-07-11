"use client";

import { Calendar } from "lucide-react";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import type { EconomicCalendarRow } from "@/lib/calendarNewsCalendarData";
import { calendarBiasColor, economicCalendarImpactColor } from "@/lib/calendarNewsCalendarData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import { CN_TD_STYLE, CN_TD_WRAP_STYLE, CN_TH_STYLE } from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsCalendarTables.module.scss";

type EconomicCalendarTableProps = {
    rows: EconomicCalendarRow[];
};

export default function EconomicCalendarTable({ rows }: EconomicCalendarTableProps) {
    return (
        <section className={styles.panel} aria-label="Economic Calendar">
            <h2 className={styles.panelTitle}>
                <Calendar className={styles.titleIcon} strokeWidth={2} aria-hidden />
                Economic Calendar
            </h2>
            <div className={styles.tableScroll}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No economic calendar data available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Economic Calendar" style={{ minWidth: 920 }}>
                        <Thead>
                            <Tr>
                                <Th style={CN_TH_STYLE}>Time</Th>
                                <Th style={CN_TH_STYLE}>Country</Th>
                                <Th style={CN_TH_STYLE}>Event</Th>
                                <Th style={CN_TH_STYLE}>Impact</Th>
                                <Th style={CN_TH_STYLE}>Actual</Th>
                                <Th style={CN_TH_STYLE}>Forecast</Th>
                                <Th style={CN_TH_STYLE}>Previous</Th>
                                <Th style={CN_TH_STYLE}>Trend Score</Th>
                                <Th style={CN_TH_STYLE}>Evidence Score</Th>
                                <Th style={CN_TH_STYLE}>Bias</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row, index) => (
                                <Tr key={`${row.asset}-${index}`}>
                                    <Td style={CN_TD_STYLE} className={styles.tabular}>
                                        {row.time}
                                    </Td>
                                    <Td style={CN_TD_STYLE}>
                                        <span className={styles.countryCell}>
                                            <CalendarNewsAssetIcon asset={row.asset} size={24} />
                                            <span className="sr-only">{row.asset}</span>
                                        </span>
                                    </Td>
                                    <Td style={CN_TD_WRAP_STYLE} className={styles.tdEvent}>
                                        {row.event}
                                    </Td>
                                    <Td style={CN_TD_STYLE}>
                                        <span
                                            className={styles.impactBadge}
                                            style={{ background: economicCalendarImpactColor(row.impact) }}
                                        >
                                            {row.impact}
                                        </span>
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={styles.tabular}>
                                        {row.actual}
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={styles.tabular}>
                                        {row.forecast}
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={styles.tabular}>
                                        {row.previous}
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={styles.tabular}>
                                        {row.trendScore}
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={styles.tabular}>
                                        {row.evidenceScore}
                                    </Td>
                                    <Td style={CN_TD_STYLE}>
                                        <span
                                            className={styles.biasLabel}
                                            style={{ color: calendarBiasColor(row.bias) }}
                                        >
                                            {row.bias}
                                        </span>
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
