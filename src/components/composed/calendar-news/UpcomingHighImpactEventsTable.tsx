"use client";

import { Calendar } from "lucide-react";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import type { UpcomingHighImpactRow } from "@/lib/calendarNewsCalendarData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import { CN_TD_STYLE, CN_TD_WRAP_STYLE, CN_TH_STYLE } from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsCalendarTables.module.scss";

type UpcomingHighImpactEventsTableProps = {
    rows: UpcomingHighImpactRow[];
};

export default function UpcomingHighImpactEventsTable({ rows }: UpcomingHighImpactEventsTableProps) {
    return (
        <section className={styles.panel} aria-label="Upcoming High Impact Data and Events">
            <h2 className={styles.panelTitle}>
                <Calendar className={styles.titleIcon} strokeWidth={2} aria-hidden />
                Upcoming High Impact Data &amp; Events
            </h2>
            <div className={`${styles.tableScroll} ${styles.econCalendarScroll}`}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No upcoming high-impact events right now</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Upcoming High Impact Data and Events" style={{ minWidth: 920 }}>
                        <Thead>
                            <Tr>
                                <Th style={CN_TH_STYLE}>Date</Th>
                                <Th style={CN_TH_STYLE}>Time</Th>
                                <Th style={CN_TH_STYLE}>Country</Th>
                                <Th style={CN_TH_STYLE}>Event</Th>
                                <Th style={CN_TH_STYLE}>Impact</Th>
                                <Th style={CN_TH_STYLE}>Previous</Th>
                                <Th style={CN_TH_STYLE}>Forecast</Th>
                                <Th style={CN_TH_STYLE}>Importance</Th>
                                <Th style={CN_TH_STYLE}>Potential Impact</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row, index) => (
                                <Tr key={`${row.date}-${index}`}>
                                    <Td style={CN_TD_STYLE} className={`${styles.tdDate} ${styles.cellThin}`}>
                                        {row.date}
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
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
                                        <span className={styles.impactBadge}>{row.impact}</span>
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                        {row.previous}
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                        {row.forecast}
                                    </Td>
                                    <Td style={CN_TD_STYLE}>
                                        <ImportanceStars count={row.importance} />
                                    </Td>
                                    <Td style={CN_TD_STYLE} className={`${styles.tdPotential} ${styles.cellThin}`}>
                                        {row.potentialImpact}
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

function ImportanceStars({ count }: { count: number }) {
    const filled = Math.max(0, Math.min(5, count));
    return (
        <span className={styles.stars} aria-label={`${filled} of 5 stars`}>
            {"★".repeat(filled)}
            <span className={styles.starEmpty}>{"★".repeat(5 - filled)}</span>
        </span>
    );
}
