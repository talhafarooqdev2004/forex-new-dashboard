"use client";

import MacroScoreboardTable from "./MacroScoreboardTable";
import MarketCatalystScoreboardTable from "./MarketCatalystScoreboardTable";
import type { CatalystScoreboardRow, MacroScoreboardRow } from "@/lib/calendarNewsScoreboardData";

import styles from "./CalendarNewsScoreboards.module.scss";

type CalendarNewsScoreboardsProps = {
    macroRows: MacroScoreboardRow[];
    catalystRows: CatalystScoreboardRow[];
    /** Bumped on live socket refresh so admin catalyst factors stay in sync. */
    refreshKey?: number;
};

export default function CalendarNewsScoreboards({
    macroRows,
    catalystRows,
    refreshKey = 0,
}: CalendarNewsScoreboardsProps) {
    return (
        <div className={styles.scoreboardsRow}>
            <MacroScoreboardTable rows={macroRows} />
            <MarketCatalystScoreboardTable rows={catalystRows} refreshKey={refreshKey} />
        </div>
    );
}
