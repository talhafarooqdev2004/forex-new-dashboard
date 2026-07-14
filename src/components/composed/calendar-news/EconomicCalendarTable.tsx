"use client";

import { Fragment, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import { useAuth } from "@/components/providers/AuthProvider";
import type { EconomicCalendarRow } from "@/lib/calendarNewsCalendarData";
import { calendarBiasColor, economicCalendarImpactColor } from "@/lib/calendarNewsCalendarData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import { CN_TD_STYLE, CN_TD_WRAP_STYLE, CN_TH_STYLE } from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsCalendarTables.module.scss";

type EconomicCalendarTableProps = {
    rows: EconomicCalendarRow[];
};

export default function EconomicCalendarTable({ rows }: EconomicCalendarTableProps) {
    const { ready, isAdmin } = useAuth();
    const showAdminScores = ready && isAdmin;
    const colCount = showAdminScores ? 11 : 9;
    const scrollRef = useRef<HTMLDivElement>(null);

    // Sync sticky offsets: date banners sit under the column header, and
    // date text stays centered in the visible horizontal viewport.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const syncStickyMetrics = () => {
            el.style.setProperty("--date-sep-viewport-width", `${el.clientWidth}px`);
            // Exact sticky offset under the column header (no upward filler — that
            // made the date banner look taller while stuck).
            const th = el.querySelector("thead th");
            const headerHeight =
                th instanceof HTMLElement ? Math.round(th.getBoundingClientRect().height) : 48;
            el.style.setProperty("--econ-cal-header-height", `${headerHeight}px`);
        };
        syncStickyMetrics();
        const ro = new ResizeObserver(syncStickyMetrics);
        ro.observe(el);
        const thead = el.querySelector("thead");
        if (thead) ro.observe(thead);
        return () => ro.disconnect();
    }, [rows.length, showAdminScores]);

    return (
        <section className={styles.panel} aria-label="Economic Calendar">
            <h2 className={styles.panelTitle}>
                <Calendar className={styles.titleIcon} strokeWidth={2} aria-hidden />
                Economic Calendar
            </h2>
            <div className={`${styles.tableScroll} ${styles.econCalendarScroll}`} ref={scrollRef}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No economic calendar data available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Economic Calendar" style={{ minWidth: showAdminScores ? 920 : 820 }}>
                        <Thead>
                            <Tr>
                                <Th style={CN_TH_STYLE}>Date</Th>
                                <Th style={CN_TH_STYLE}>Time</Th>
                                <Th style={CN_TH_STYLE}>Country</Th>
                                <Th style={CN_TH_STYLE}>Event</Th>
                                <Th style={CN_TH_STYLE}>Impact</Th>
                                <Th style={CN_TH_STYLE}>Actual</Th>
                                <Th style={CN_TH_STYLE}>Forecast</Th>
                                <Th style={CN_TH_STYLE}>Previous</Th>
                                {showAdminScores ? (
                                    <>
                                        <Th style={CN_TH_STYLE}>Trend Score</Th>
                                        <Th style={CN_TH_STYLE}>Evidence Score</Th>
                                    </>
                                ) : null}
                                <Th style={CN_TH_STYLE}>Bias</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row, index) => {
                                const prevKey = index > 0 ? rows[index - 1]!.dateKey : null;
                                const showSeparator = Boolean(row.dateKey) && row.dateKey !== prevKey;
                                return (
                                    <Fragment key={`${row.asset}-${row.dateKey}-${row.time}-${row.event}-${index}`}>
                                        {showSeparator ? (
                                            <Tr className={styles.dateSeparatorRow}>
                                                <Td
                                                    colSpan={colCount}
                                                    className={styles.dateSeparatorCell}
                                                    bgColor="#5c636a"
                                                    color="#ffffff"
                                                    style={{
                                                        padding: 0,
                                                        textAlign: "left",
                                                        borderTop: "none",
                                                        borderBottom: "none",
                                                        borderRight: "none",
                                                    }}
                                                >
                                                    <span className={styles.dateSeparatorLabel}>
                                                        {row.dateSeparatorLabel}
                                                    </span>
                                                </Td>
                                            </Tr>
                                        ) : null}
                                        <Tr>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
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
                                                <span
                                                    className={styles.impactBadge}
                                                    style={{ background: economicCalendarImpactColor(row.impact) }}
                                                >
                                                    {row.impact}
                                                </span>
                                            </Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                                {row.actual}
                                            </Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                                {row.forecast}
                                            </Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                                {row.previous}
                                            </Td>
                                            {showAdminScores ? (
                                                <>
                                                    <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                                        {row.trendScore}
                                                    </Td>
                                                    <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>
                                                        {row.evidenceScore}
                                                    </Td>
                                                </>
                                            ) : null}
                                            <Td style={CN_TD_STYLE}>
                                                <span
                                                    className={`${styles.biasLabel} ${styles.cellThin}`}
                                                    style={{ color: calendarBiasColor(row.bias) }}
                                                >
                                                    {row.bias}
                                                </span>
                                            </Td>
                                        </Tr>
                                    </Fragment>
                                );
                            })}
                        </Tbody>
                    </Table>
                )}
            </div>
        </section>
    );
}
