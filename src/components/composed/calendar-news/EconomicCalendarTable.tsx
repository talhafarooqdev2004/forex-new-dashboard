"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, RotateCcw } from "lucide-react";

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

type FilterOption = { value: string; label: string };

function dubaiDateKey(date: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
}

function dubaiMinutes(date: Date = new Date()): number {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dubai",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);
    const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((item) => item.type === type)?.value ?? NaN);
    const hour = value("hour");
    const minute = value("minute");
    return Number.isFinite(hour) && Number.isFinite(minute) ? hour * 60 + minute : 0;
}

function minutesFromTime(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
    if (!match) return null;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return null;
    return hour * 60 + minute;
}

/** The closest already-released row, otherwise the first upcoming row for today. */
function currentSlotRowIndex(rows: EconomicCalendarRow[], today: string, nowMinutes: number): number | null {
    const todayRows = rows
        .map((row, index) => ({ row, index, minutes: minutesFromTime(row.time) }))
        .filter((item): item is { row: EconomicCalendarRow; index: number; minutes: number } =>
            item.row.dateKey === today && item.minutes !== null,
        );
    if (todayRows.length === 0) return null;

    const released = todayRows.filter((item) => item.minutes <= nowMinutes);
    if (released.length > 0) return released[released.length - 1]!.index;
    return todayRows[0]!.index;
}

function toggle(set: Set<string>, value: string): Set<string> {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
}

function filterLabel(label: string, selected: Set<string>): string {
    if (selected.size === 0) return `All ${label}`;
    if (selected.size === 1) return [...selected][0]!;
    return `${selected.size} ${label.toLowerCase()} selected`;
}

function MultiSelectFilter({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: FilterOption[];
    selected: Set<string>;
    onChange: (next: Set<string>) => void;
}) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const closeOnOutsideClick = (event: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", closeOnOutsideClick);
        return () => document.removeEventListener("mousedown", closeOnOutsideClick);
    }, []);

    return (
        <div className={styles.filterControl} ref={rootRef}>
            <button
                type="button"
                className={styles.filterButton}
                aria-expanded={open}
                onClick={() => setOpen((value) => !value)}
            >
                <span className={styles.filterButtonLabel}>{filterLabel(label, selected)}</span>
                <ChevronDown size={16} aria-hidden />
            </button>
            {open ? (
                <div className={styles.filterMenu} role="group" aria-label={`${label} filters`}>
                    <div className={styles.filterMenuActions}>
                        <button type="button" onClick={() => onChange(new Set(options.map((option) => option.value)))}>
                            Select all
                        </button>
                        <button type="button" onClick={() => onChange(new Set())}>Clear</button>
                    </div>
                    <div className={styles.filterOptions}>
                        {options.map((option) => (
                            <label className={styles.filterOption} key={option.value}>
                                <input
                                    type="checkbox"
                                    checked={selected.has(option.value)}
                                    onChange={() => onChange(toggle(selected, option.value))}
                                />
                                <span>{option.label}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default function EconomicCalendarTable({ rows }: EconomicCalendarTableProps) {
    const { ready, isAdmin } = useAuth();
    const showAdminScores = ready && isAdmin;
    const colCount = showAdminScores ? 11 : 9;
    const scrollRef = useRef<HTMLDivElement>(null);
    const today = useMemo(() => dubaiDateKey(), []);
    const [countries, setCountries] = useState<Set<string>>(new Set());
    const [categories, setCategories] = useState<Set<string>>(new Set());
    const [impacts, setImpacts] = useState<Set<string>>(new Set());

    const countryOptions = useMemo<FilterOption[]>(() => {
        const byCountry = new Map<string, string>();
        for (const row of rows) byCountry.set(row.country || row.asset, row.asset);
        return [...byCountry.entries()]
            .map(([country, asset]) => ({ value: country, label: `${country} (${asset})` }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [rows]);
    const categoryOptions = useMemo<FilterOption[]>(
        () => [...new Set(rows.map((row) => row.category))].sort().map((value) => ({ value, label: value })),
        [rows],
    );
    const impactOptions = useMemo<FilterOption[]>(
        () => ["High", "Medium", "Low"].filter((value) => rows.some((row) => row.impact === value)).map((value) => ({ value, label: value })),
        [rows],
    );
    const filteredRows = useMemo(
        () => rows.filter((row) =>
            row.dateKey === today &&
            (countries.size === 0 || countries.has(row.country || row.asset)) &&
            (categories.size === 0 || categories.has(row.category)) &&
            (impacts.size === 0 || impacts.has(row.impact)),
        ),
        [rows, today, countries, categories, impacts],
    );
    const currentIndex = useMemo(
        () => currentSlotRowIndex(filteredRows, today, dubaiMinutes()),
        [filteredRows, today],
    );

    // Sync sticky offsets, then focus the current Dubai time slot without taking away manual scroll control.
    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        const syncStickyMetrics = () => {
            el.style.setProperty("--date-sep-viewport-width", `${el.clientWidth}px`);
            const th = el.querySelector("thead th");
            const headerHeight = th instanceof HTMLElement ? Math.round(th.getBoundingClientRect().height) : 48;
            el.style.setProperty("--econ-cal-header-height", `${headerHeight}px`);
        };
        syncStickyMetrics();
        const ro = new ResizeObserver(syncStickyMetrics);
        ro.observe(el);
        const thead = el.querySelector("thead");
        if (thead) ro.observe(thead);
        return () => ro.disconnect();
    }, [filteredRows.length, showAdminScores]);

    useEffect(() => {
        if (currentIndex === null) return;
        const frame = window.requestAnimationFrame(() => {
            const container = scrollRef.current;
            const target = container?.querySelector<HTMLElement>(`[data-calendar-row-index="${currentIndex}"]`);
            if (!container || !target) return;
            const headerHeight = Number.parseFloat(getComputedStyle(container).getPropertyValue("--econ-cal-header-height")) || 48;
            container.scrollTop = Math.max(0, target.offsetTop - headerHeight - 8);
        });
        return () => window.cancelAnimationFrame(frame);
    }, [today, currentIndex, filteredRows.length]);

    const resetFilters = () => {
        setCountries(new Set());
        setCategories(new Set());
        setImpacts(new Set());
    };

    return (
        <section className={styles.panel} aria-label="Economic Calendar">
            <h2 className={styles.panelTitle}>
                <Calendar className={styles.titleIcon} strokeWidth={2} aria-hidden />
                Economic Calendar
            </h2>
            <div className={styles.calendarToolbar}>
                <div className={styles.filterControls}>
                    <MultiSelectFilter label="Countries" options={countryOptions} selected={countries} onChange={setCountries} />
                    <MultiSelectFilter label="Categories" options={categoryOptions} selected={categories} onChange={setCategories} />
                    <MultiSelectFilter label="Importance" options={impactOptions} selected={impacts} onChange={setImpacts} />
                    {(countries.size || categories.size || impacts.size) ? (
                        <button type="button" className={styles.resetFilters} onClick={resetFilters}>
                            <RotateCcw size={14} aria-hidden /> Reset
                        </button>
                    ) : null}
                </div>
            </div>
            <div className={`${styles.tableScroll} ${styles.econCalendarScroll}`} ref={scrollRef}>
                {filteredRows.length === 0 ? (
                    <div className={styles.emptyState}>No economic calendar events match the selected date and filters</div>
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
                                {showAdminScores ? <><Th style={CN_TH_STYLE}>Trend Score</Th><Th style={CN_TH_STYLE}>Evidence Score</Th></> : null}
                                <Th style={CN_TH_STYLE}>Bias</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {filteredRows.map((row, index) => {
                                const prevKey = index > 0 ? filteredRows[index - 1]!.dateKey : null;
                                const showSeparator = Boolean(row.dateKey) && row.dateKey !== prevKey;
                                return (
                                    <Fragment key={`${row.asset}-${row.dateKey}-${row.time}-${row.event}-${index}`}>
                                        {showSeparator ? (
                                            <Tr className={styles.dateSeparatorRow}>
                                                <Td colSpan={colCount} className={styles.dateSeparatorCell} bgColor="#5c636a" color="#ffffff" style={{ padding: 0, textAlign: "left", borderTop: "none", borderBottom: "none", borderRight: "none" }}>
                                                    <span className={styles.dateSeparatorLabel}>{row.dateSeparatorLabel}</span>
                                                </Td>
                                            </Tr>
                                        ) : null}
                                        <Tr data-calendar-row-index={index} className={index === currentIndex ? styles.currentTimeRow : undefined}>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.date}</Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.time}</Td>
                                            <Td style={CN_TD_STYLE} title={row.country}>
                                                <span className={styles.countryCell}>
                                                    <CalendarNewsAssetIcon asset={row.asset} size={24} />
                                                    <span className={styles.currencyCode}>{row.asset}</span>
                                                    <span className="sr-only">{row.country} ({row.asset})</span>
                                                </span>
                                            </Td>
                                            <Td style={CN_TD_WRAP_STYLE} className={styles.tdEvent}>{row.event}</Td>
                                            <Td style={CN_TD_STYLE}><span className={styles.impactBadge} style={{ background: economicCalendarImpactColor(row.impact) }}>{row.impact}</span></Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.actual}</Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.forecast}</Td>
                                            <Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.previous}</Td>
                                            {showAdminScores ? <><Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.trendScore}</Td><Td style={CN_TD_STYLE} className={`${styles.tabular} ${styles.cellThin}`}>{row.evidenceScore}</Td></> : null}
                                            <Td style={CN_TD_STYLE}><span className={`${styles.biasLabel} ${styles.cellThin}`} style={{ color: calendarBiasColor(row.bias) }}>{row.bias}</span></Td>
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
