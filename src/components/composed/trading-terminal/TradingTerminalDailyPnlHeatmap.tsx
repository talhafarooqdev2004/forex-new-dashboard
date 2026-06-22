"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EyeOff, Loader2, Settings2 } from "lucide-react";
import {
    Button,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import { useAuth } from "@/components/providers/AuthProvider";
import { cn } from "@/lib/utils";
import {
    calendarDayKey,
    hiddenDaysSet,
    type DailyPnlCalendarSettings,
} from "@/lib/dailyPnlCalendarSettings";
import type { TradingAlert, TradePartialClose } from "@/services";
import { dailyPnlCalendarSettingsService } from "@/services";
import { availableMonths, calendarTotals } from "@/lib/tradingTerminalStats";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const GREEN = "#05df72";
const RED = "#fa003f";

type DayCell = { day: number; pnl?: number } | null;

function isNoDataCell(pnl?: number): boolean {
    return pnl === undefined || pnl === 0;
}

function tradeCellStyle(pnl: number): { backgroundColor: string; color: string; borderColor: string } {
    if (pnl > 0) return { backgroundColor: GREEN, color: "#000000", borderColor: GREEN };
    return { backgroundColor: RED, color: "#000000", borderColor: RED };
}

function formatCellLabel(day: number, pnl?: number): string {
    if (pnl === undefined || pnl === 0) return String(day);
    return `${day} (${pnl > 0 ? "+" : ""}${Math.round(pnl)})`;
}

function formatHiddenDayLabel(dateKey: string): string {
    const [y, m, d] = dateKey.split("-").map(Number);
    if (!y || !m || !d) return dateKey;
    return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

/** Mon-first weekday index for a date. */
function monFirst(weekday: number): number {
    return (weekday + 6) % 7;
}

function HiddenDaysPanel({
    settings,
    saving,
    onClose,
    onShowDay,
}: {
    settings: DailyPnlCalendarSettings;
    saving: boolean;
    onClose: () => void;
    onShowDay: (dateKey: string) => void;
}) {
    return (
        <div className="absolute right-0 top-full mt-1 z-20 w-[min(100vw-2rem,280px)] rounded-lg border border-stroke bg-darkGrey shadow-lg p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-foreground">Hidden calendar days</p>
                <button
                    type="button"
                    className="text-[10px] text-secondary hover:text-foreground"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
            <p className="text-[10px] text-secondary mb-2 leading-snug">
                Click a profit/loss day on the calendar to hide it from all users. Trade data is unchanged in reports.
            </p>
            {settings.hiddenDays.length === 0 ? (
                <p className="text-[10px] text-secondary py-2">No days hidden.</p>
            ) : (
                <ul className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                    {settings.hiddenDays.map((dateKey) => (
                        <li
                            key={dateKey}
                            className="flex items-center justify-between gap-2 text-[10px] rounded px-2 py-1 bg-chartInnerBg dark:bg-[#2A2E37]"
                        >
                            <span className="text-foreground truncate">{formatHiddenDayLabel(dateKey)}</span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-[10px] shrink-0"
                                disabled={saving}
                                onClick={() => onShowDay(dateKey)}
                            >
                                Show
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function TradingTerminalDailyPnlHeatmap({
    trades,
    partials = [],
}: {
    trades: TradingAlert[];
    partials?: TradePartialClose[];
}) {
    const { isAdmin } = useAuth();
    const months = useMemo(() => availableMonths(trades, partials), [trades, partials]);
    const now = new Date();
    const options = months.length > 0 ? months : [{ year: now.getFullYear(), month: now.getMonth() }];
    const [selected, setSelected] = useState<string>(`${options[0].year}-${options[0].month}`);
    const [calendarSettings, setCalendarSettings] = useState<DailyPnlCalendarSettings>({ hiddenDays: [] });
    const [saving, setSaving] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);
    const [toggleError, setToggleError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        dailyPnlCalendarSettingsService
            .getSettings()
            .then((s) => {
                if (active) setCalendarSettings(s);
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, []);

    const hidden = useMemo(() => hiddenDaysSet(calendarSettings), [calendarSettings]);

    const selectedKey = options.some((o) => `${o.year}-${o.month}` === selected)
        ? selected
        : `${options[0].year}-${options[0].month}`;

    const [year, month] = selectedKey.split("-").map(Number);
    const totals = useMemo(() => calendarTotals(trades, year, month, partials), [trades, year, month, partials]);

    const grid = useMemo<DayCell[]>(() => {
        const firstOffset = monFirst(new Date(year, month, 1).getDay());
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const cells: DayCell[] = [];
        for (let i = 0; i < firstOffset; i++) cells.push(null);
        for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, pnl: totals.get(d) });
        while (cells.length % 7 !== 0) cells.push(null);
        return cells;
    }, [year, month, totals]);

    const persistHidden = useCallback(async (dateKey: string, hide: boolean) => {
        setSaving(true);
        setToggleError(null);
        const prev = calendarSettings;
        const optimistic = new Set(prev.hiddenDays);
        if (hide) optimistic.add(dateKey);
        else optimistic.delete(dateKey);
        setCalendarSettings({ hiddenDays: [...optimistic].sort() });
        try {
            const next = await dailyPnlCalendarSettingsService.toggleHiddenDay(dateKey, hide);
            setCalendarSettings(next);
        } catch (err) {
            setCalendarSettings(prev);
            setToggleError(err instanceof Error ? err.message : "Failed to update calendar visibility");
        } finally {
            setSaving(false);
        }
    }, [calendarSettings]);

    const handleDayClick = useCallback(
        (cell: { day: number; pnl?: number }) => {
            if (!isAdmin || saving) return;
            const dateKey = calendarDayKey(year, month, cell.day);
            const isHidden = hidden.has(dateKey);
            const hasPnl = cell.pnl !== undefined && cell.pnl !== 0;
            if (!isHidden && !hasPnl) return;
            void persistHidden(dateKey, !isHidden);
        },
        [hidden, isAdmin, month, persistHidden, saving, year],
    );

    return (
        <div className="bg-darkGrey rounded-[12px] h-full flex flex-col min-w-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-solid border-stroke flex items-center justify-between gap-2 shrink-0 min-h-[52px]">
                <h6 className="font-semibold text-sm leading-tight whitespace-nowrap min-w-0 truncate">
                    Daily PnL Heatmap (Pips)
                </h6>
                <div className="flex items-center gap-1 shrink-0">
                    {isAdmin ? (
                        <div className="relative">
                            <button
                                type="button"
                                className="p-1 rounded text-foreground/80 hover:text-foreground hover:bg-chartInnerBg"
                                aria-label="Manage hidden calendar days"
                                onClick={() => setPanelOpen((o) => !o)}
                            >
                                <Settings2 className="w-4 h-4" />
                            </button>
                            {panelOpen ? (
                                <HiddenDaysPanel
                                    settings={calendarSettings}
                                    saving={saving}
                                    onClose={() => setPanelOpen(false)}
                                    onShowDay={(dateKey) => void persistHidden(dateKey, false)}
                                />
                            ) : null}
                        </div>
                    ) : null}
                    <Select value={selectedKey} onValueChange={setSelected}>
                        <SelectTrigger className="w-[92px] h-7 text-[10px] px-2 shrink-0 [&>span]:truncate">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((o) => (
                                <SelectItem key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
                                    {MONTH_NAMES[o.month]} {o.year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="px-3 py-3 flex-1 flex flex-col min-h-0 overflow-hidden">
                {toggleError ? (
                    <p className="text-[9px] mb-1 shrink-0" style={{ color: RED }}>
                        {toggleError}
                    </p>
                ) : null}

                <div className="grid grid-cols-7 gap-1 mb-1.5 shrink-0">
                    {WEEKDAYS.map((day) => (
                        <div key={day} className="text-center text-[10px] text-secondary py-0.5">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1 flex-1 min-h-0 auto-rows-fr">
                    {grid.map((cell, index) => {
                        if (!cell) return <div key={`empty-${index}`} />;
                        const dateKey = calendarDayKey(year, month, cell.day);
                        const isHidden = hidden.has(dateKey);
                        const displayPnl = isHidden ? undefined : cell.pnl;
                        const noData = isNoDataCell(displayPnl);
                        const canToggle =
                            isAdmin && (isHidden || (cell.pnl !== undefined && cell.pnl !== 0));
                        return (
                            <div
                                key={`${cell.day}-${index}`}
                                role={canToggle ? "button" : undefined}
                                tabIndex={canToggle ? 0 : undefined}
                                title={
                                    canToggle
                                        ? isHidden
                                            ? "Show profit/loss on calendar"
                                            : "Hide profit/loss from calendar"
                                        : undefined
                                }
                                onClick={canToggle ? () => handleDayClick(cell) : undefined}
                                onKeyDown={
                                    canToggle
                                        ? (e) => {
                                              if (e.key === "Enter" || e.key === " ") {
                                                  e.preventDefault();
                                                  handleDayClick(cell);
                                              }
                                          }
                                        : undefined
                                }
                                className={cn(
                                    "rounded-[4px] min-h-[28px] flex items-center justify-center text-[9px] font-medium px-0.5 text-center leading-tight border relative",
                                    noData &&
                                        "bg-chartInnerBg border-stroke text-foreground dark:bg-[#2A2E37] dark:border-[#2A2E37] dark:text-white",
                                    canToggle && "cursor-pointer hover:ring-1 hover:ring-foreground/30",
                                    isHidden && isAdmin && "border-dashed",
                                )}
                                style={noData ? undefined : tradeCellStyle(displayPnl!)}
                            >
                                {formatCellLabel(cell.day, displayPnl)}
                                {isHidden && isAdmin ? (
                                    <EyeOff className="absolute top-0.5 right-0.5 w-2.5 h-2.5 text-secondary" aria-hidden />
                                ) : null}
                                {saving && canToggle ? (
                                    <Loader2 className="absolute bottom-0.5 right-0.5 w-2 h-2 animate-spin text-secondary" />
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                <div className="flex items-center justify-center gap-4 mt-2 pt-1 shrink-0">
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: GREEN }} />
                        Profit
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary whitespace-nowrap">
                        <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 bg-chartInnerBg border border-stroke dark:bg-[#2A2E37] dark:border-[#2A2E37]"
                        />
                        No Data
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-secondary whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: RED }} />
                        Loss
                    </div>
                </div>
            </div>
        </div>
    );
}
