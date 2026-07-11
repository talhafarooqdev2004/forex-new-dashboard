"use client";

import type { EconomicCalendarRow, UpcomingHighImpactRow } from "@/lib/calendarNewsCalendarData";

import EconomicCalendarTable from "./EconomicCalendarTable";
import UpcomingHighImpactEventsTable from "./UpcomingHighImpactEventsTable";

import styles from "./CalendarNewsCalendarTables.module.scss";

type CalendarNewsCalendarSectionProps = {
    economicCalendarRows: EconomicCalendarRow[];
    upcomingHighImpactRows: UpcomingHighImpactRow[];
};

export default function CalendarNewsCalendarSection({
    economicCalendarRows,
    upcomingHighImpactRows,
}: CalendarNewsCalendarSectionProps) {
    return (
        <div className={styles.tablesRow}>
            <EconomicCalendarTable rows={economicCalendarRows} />
            <UpcomingHighImpactEventsTable rows={upcomingHighImpactRows} />
        </div>
    );
}
