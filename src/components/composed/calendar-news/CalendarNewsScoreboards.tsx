"use client";

import MacroScoreboardTable from "./MacroScoreboardTable";
import MarketCatalystScoreboardTable from "./MarketCatalystScoreboardTable";
import type { CatalystScoreboardRow, MacroScoreboardRow } from "@/lib/calendarNewsScoreboardData";

import styles from "./CalendarNewsScoreboards.module.scss";

type CalendarNewsScoreboardsProps = {
    macroRows: MacroScoreboardRow[];
    catalystRows: CatalystScoreboardRow[];
};

export default function CalendarNewsScoreboards({ macroRows, catalystRows }: CalendarNewsScoreboardsProps) {
    return (
        <div className={styles.scoreboardsRow}>
            <MacroScoreboardTable rows={macroRows} />
            <MarketCatalystScoreboardTable rows={catalystRows} />
        </div>
    );
}
