import type { TradingAlert } from "@/services";
import { pipSize } from "@/lib/technicalLevelsPrice";

const toNum = (v: number | string | null | undefined): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
};

/** Risk distance in pips for a trade (|entry - SL|). */
export function riskPipsOf(t: TradingAlert): number | null {
    const entry = toNum(t.entry_level);
    const sl = toNum(t.stop_loss);
    if (entry === null || sl === null) return null;
    const rp = Math.abs(entry - sl) / pipSize(t.pair ?? "");
    return rp > 0 ? rp : null;
}

/** Reward-to-risk multiple from a pips amount (R = pips / riskPips). */
export function rMultipleFromPips(t: TradingAlert, pips: number | null): number | null {
    const rp = riskPipsOf(t);
    if (rp === null || pips === null) return null;
    return pips / rp;
}

/** Realized reward-to-risk multiple for a closed trade (uses stored pips). */
export function realizedR(t: TradingAlert): number | null {
    return rMultipleFromPips(t, toNum(t.pips));
}

/** Formats an R multiple as a "1:N" ratio (e.g. 1, 2, 3 -> "1:1", "1:2", "1:3"). */
export function formatRR(r: number | null): string {
    if (r === null || !Number.isFinite(r)) return "—";
    const rounded = Math.round(r * 10) / 10;
    const txt = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
    return `1:${txt}`;
}

/** A trade counts toward history/stats once it is closed and has a recorded pips value. */
export function closedTrades(trades: TradingAlert[]): TradingAlert[] {
    return trades.filter((t) => t.status !== "open" && t.pips !== null && t.pips !== undefined);
}

export function activeCount(trades: TradingAlert[]): number {
    return trades.filter((t) => t.status === "open").length;
}

export function tradeDate(t: TradingAlert): Date {
    return new Date(t.date ?? t.created_at);
}

export function pipsOf(t: TradingAlert): number {
    return Number(t.pips ?? 0);
}

export function isWin(t: TradingAlert): boolean {
    if (t.outcome) return t.outcome === "Profit";
    return pipsOf(t) > 0;
}

export function isLoss(t: TradingAlert): boolean {
    if (t.outcome) return t.outcome === "Loss";
    return pipsOf(t) < 0;
}

export function parseRisk(risk: string | null): number | null {
    if (!risk) return null;
    const n = parseFloat(String(risk).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
}

/** Local YYYY-MM-DD key for grouping by calendar day. */
export function dayKey(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export type Summary = {
    netPips: number;
    winRate: number;
    wins: number;
    losses: number;
    profitFactor: number; // Infinity when there are profits but no losses
    avgRR: number | null;
    total: number;
};

export function computeSummary(trades: TradingAlert[]): Summary {
    const closed = closedTrades(trades);
    const netPips = closed.reduce((s, t) => s + pipsOf(t), 0);
    const wins = closed.filter(isWin).length;
    const losses = closed.filter(isLoss).length;
    const decided = wins + losses;
    const grossProfit = closed.filter((t) => pipsOf(t) > 0).reduce((s, t) => s + pipsOf(t), 0);
    const grossLoss = Math.abs(closed.filter((t) => pipsOf(t) < 0).reduce((s, t) => s + pipsOf(t), 0));
    // R:R is the TP level achieved (TP1=1, TP2=2, TP3=3, none=0), averaged across closed trades.
    const rrs = closed.map((t) => Number(t.max_tp_hit ?? 0));

    return {
        netPips,
        winRate: decided > 0 ? (wins / decided) * 100 : 0,
        wins,
        losses,
        profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
        avgRR: rrs.length > 0 ? rrs.reduce((s, v) => s + v, 0) / rrs.length : null,
        total: closed.length,
    };
}

export function profitFactorLabel(pf: number): string {
    if (!Number.isFinite(pf)) return "Perfect";
    if (pf >= 2) return "Excellent";
    if (pf >= 1.5) return "Good";
    if (pf >= 1) return "Break-even+";
    return "Poor";
}

/** Sums pips per calendar day, sorted ascending. */
export function dailyTotals(trades: TradingAlert[]): { date: string; pips: number }[] {
    const map = new Map<string, number>();
    for (const t of closedTrades(trades)) {
        const key = dayKey(tradeDate(t));
        map.set(key, (map.get(key) ?? 0) + pipsOf(t));
    }
    return [...map.entries()].map(([date, pips]) => ({ date, pips })).sort((a, b) => a.date.localeCompare(b.date));
}

export type EquityPoint = { date: string; daily: number; cumulative: number };

/** Cumulative pips equity curve, one point per trading day. */
export function equitySeries(trades: TradingAlert[]): EquityPoint[] {
    let running = 0;
    return dailyTotals(trades).map(({ date, pips }) => {
        running += pips;
        return { date, daily: pips, cumulative: running };
    });
}

export type EquityStats = { bestDay: number | null; worstDay: number | null; avgDaily: number | null; expectancy: number | null };

export function equityStats(trades: TradingAlert[]): EquityStats {
    const days = dailyTotals(trades);
    const closed = closedTrades(trades);
    if (days.length === 0) return { bestDay: null, worstDay: null, avgDaily: null, expectancy: null };
    const totals = days.map((d) => d.pips);
    const net = totals.reduce((s, v) => s + v, 0);
    return {
        bestDay: Math.max(...totals),
        worstDay: Math.min(...totals),
        avgDaily: net / days.length,
        // Expectancy = average pips per trade (= winRate*avgWin − lossRate*avgLoss).
        expectancy: closed.length > 0 ? net / closed.length : null,
    };
}

export type MonthStats = {
    total: number;
    wins: number;
    losses: number;
    winRate: number;
    profitFactor: number;
    avgRR: number | null;
    avgWinPips: number | null;
    avgLossPips: number | null;
    expectancy: number | null;
    netPips: number;
};

function inMonth(t: TradingAlert, year: number, month: number): boolean {
    const d = tradeDate(t);
    return d.getFullYear() === year && d.getMonth() === month;
}

export function monthStats(trades: TradingAlert[], year: number, month: number): MonthStats {
    const closed = closedTrades(trades).filter((t) => inMonth(t, year, month));
    const summary = computeSummary(closed);
    const winPips = closed.filter((t) => pipsOf(t) > 0).map(pipsOf);
    const lossPips = closed.filter((t) => pipsOf(t) < 0).map(pipsOf);
    const net = closed.reduce((s, t) => s + pipsOf(t), 0);
    return {
        total: closed.length,
        wins: summary.wins,
        losses: summary.losses,
        winRate: summary.winRate,
        profitFactor: summary.profitFactor,
        avgRR: summary.avgRR,
        avgWinPips: winPips.length ? winPips.reduce((s, v) => s + v, 0) / winPips.length : null,
        avgLossPips: lossPips.length ? lossPips.reduce((s, v) => s + v, 0) / lossPips.length : null,
        expectancy: closed.length ? net / closed.length : null,
        netPips: net,
    };
}

/** Pips per month (index 0-11) for a given year. */
export function monthlyTotals(trades: TradingAlert[], year: number): number[] {
    const totals = new Array(12).fill(0);
    for (const t of closedTrades(trades)) {
        const d = tradeDate(t);
        if (d.getFullYear() === year) totals[d.getMonth()] += pipsOf(t);
    }
    return totals;
}

/** Pips per year, ascending by year. */
export function yearlyTotals(trades: TradingAlert[]): { year: number; pips: number }[] {
    const map = new Map<number, number>();
    for (const t of closedTrades(trades)) {
        const y = tradeDate(t).getFullYear();
        map.set(y, (map.get(y) ?? 0) + pipsOf(t));
    }
    return [...map.entries()].map(([year, pips]) => ({ year, pips })).sort((a, b) => a.year - b.year);
}

/** Pips per day-of-month for a given year/month (1-based day -> summed pips). */
export function calendarTotals(trades: TradingAlert[], year: number, month: number): Map<number, number> {
    const map = new Map<number, number>();
    for (const t of closedTrades(trades)) {
        const d = tradeDate(t);
        if (d.getFullYear() === year && d.getMonth() === month) {
            map.set(d.getDate(), (map.get(d.getDate()) ?? 0) + pipsOf(t));
        }
    }
    return map;
}

/** Distinct year-months present in closed trades, most recent first. */
export function availableMonths(trades: TradingAlert[]): { year: number; month: number }[] {
    const set = new Set<string>();
    for (const t of closedTrades(trades)) {
        const d = tradeDate(t);
        set.add(`${d.getFullYear()}-${d.getMonth()}`);
    }
    return [...set]
        .map((s) => {
            const [year, month] = s.split("-").map(Number);
            return { year, month };
        })
        .sort((a, b) => b.year - a.year || b.month - a.month);
}

export function availableYears(trades: TradingAlert[]): number[] {
    const set = new Set<number>();
    for (const t of closedTrades(trades)) set.add(tradeDate(t).getFullYear());
    return [...set].sort((a, b) => b - a);
}

/** Builds a symmetric-ish "nice" axis covering 0..values with `count` steps. */
export function niceScale(min: number, max: number, count = 4): { min: number; max: number; ticks: number[] } {
    let lo = Math.min(0, min);
    let hi = Math.max(0, max);
    if (lo === hi) hi = lo + 1;
    const step = niceNum((hi - lo) / count, true);
    lo = Math.floor(lo / step) * step;
    hi = Math.ceil(hi / step) * step;
    const ticks: number[] = [];
    for (let v = hi; v >= lo - 1e-9; v -= step) ticks.push(Math.round(v * 100) / 100);
    return { min: lo, max: hi, ticks };
}

function niceNum(range: number, round: boolean): number {
    if (range <= 0) return 1;
    const exp = Math.floor(Math.log10(range));
    const frac = range / 10 ** exp;
    let nice: number;
    if (round) nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
    else nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
    return nice * 10 ** exp;
}

export function formatPips(value: number, decimals = 1): string {
    return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}`;
}
