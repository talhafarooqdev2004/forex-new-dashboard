import { SCOREBOARD_UI } from "@/lib/calendarNewsScoreboardData";

export type EconomicCalendarRow = {
    time: string;
    /** Display date from event timestamp, e.g. "14 JUL 2026". */
    date: string;
    /** ISO calendar day for grouping separators, e.g. "2026-07-14". */
    dateKey: string;
    /** Sort key (ms) for chronological order. */
    sortMs: number;
    /** Investing.com-style separator label, e.g. "Sunday, July 12, 2026". */
    dateSeparatorLabel: string;
    /** Asset key for the country icon (USD…CHF, GOLD, OIL). */
    asset: string;
    /** Source country from the calendar provider, used by the country filter. */
    country: string;
    /** Deterministic display category derived from the provider's event title. */
    category: EconomicCalendarCategory;
    event: string;
    impact: string;
    actual: string;
    forecast: string;
    previous: string;
    trendScore: string;
    evidenceScore: string;
    bias: string;
};

export type EconomicCalendarCategory =
    | "Employment"
    | "Inflation"
    | "Central Banks"
    | "Credit"
    | "Growth"
    | "Consumption"
    | "Trade"
    | "Other";

export type UpcomingHighImpactRow = {
    date: string;
    time: string;
    asset: string;
    event: string;
    impact: string;
    previous: string;
    forecast: string;
    importance: number;
    potentialImpact: string;
};

const ECON_ROW_BASE = {
    time: "14:00",
    date: "21 MAY 2025",
    dateKey: "2025-05-21",
    sortMs: Date.UTC(2025, 4, 21, 14, 0),
    dateSeparatorLabel: "Wednesday, May 21, 2025",
    event: "UK O-Orders (MoM)",
    impact: "High",
    actual: "-1.1",
    forecast: "-0.6",
    previous: "-3.8",
    trendScore: "-2",
    evidenceScore: "-1",
} as const;

/** Static rows — matches design reference (same figures repeated per asset). */
export const STATIC_ECONOMIC_CALENDAR_ROWS: EconomicCalendarRow[] = [
    { ...ECON_ROW_BASE, asset: "USD", country: "United States", category: "Other", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "EUR", country: "Eurozone", category: "Other", bias: "Bullish" },
    { ...ECON_ROW_BASE, asset: "GBP", country: "United Kingdom", category: "Other", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "AUD", country: "Australia", category: "Other", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "JPY", country: "Japan", category: "Other", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "NZD", country: "New Zealand", category: "Other", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "CHF", country: "Switzerland", category: "Other", bias: "Neutral" },
    { ...ECON_ROW_BASE, asset: "GOLD", country: "Gold", category: "Other", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "OIL", country: "Oil", category: "Other", bias: "Bearish" },
];

const UPCOMING_ROW = {
    date: "21 MAY 2025",
    time: "15:00",
    asset: "USD",
    event: "Sap Global US Manufacturing PMI (MAy Plan)",
    impact: "High",
    previous: "50.2",
    forecast: "50.6",
    importance: 5,
    potentialImpact: "USD Volatility",
} as const;

/** Static rows — matches design reference (row repeated ×10). */
export const STATIC_UPCOMING_HIGH_IMPACT_ROWS: UpcomingHighImpactRow[] = Array.from(
    { length: 10 },
    () => ({ ...UPCOMING_ROW }),
);

/** Bullish green / Bearish red / Neutral orange — same as Macro & Catalyst scoreboards. */
export function calendarBiasColor(label: string): string {
    const t = label.trim().toLowerCase();
    if (t.includes("bull")) return SCOREBOARD_UI.green;
    if (t.includes("bear")) return SCOREBOARD_UI.red;
    if (t.includes("neutral")) return SCOREBOARD_UI.orange;
    return SCOREBOARD_UI.muted;
}

/** High = green, Medium = amber, Low = red — same convention as the News Headline table. */
export function economicCalendarImpactColor(impact: string): string {
    const t = impact.trim().toLowerCase();
    if (t === "high") return "#0f9d58";
    if (t === "medium") return SCOREBOARD_UI.orange;
    return "#d93025";
}

/** Investing-style category groups, derived locally because the source feed supplies an event title, not a category. */
export function economicCalendarCategory(event: string): EconomicCalendarCategory {
    const title = event.toLowerCase();
    if (/employment|payroll|nonfarm|nfp|unemployment|jobless|claims|wage|earnings|labor|labour/.test(title)) {
        return "Employment";
    }
    if (/cpi|consumer price|inflation|ppi|producer price|deflator|price index/.test(title)) {
        return "Inflation";
    }
    if (/interest rate|rate decision|central bank|federal reserve|\bfed\b|ecb|boe|boj|rbnz|rba|boc|monetary policy|fomc/.test(title)) {
        return "Central Banks";
    }
    if (/credit|lending|loan|mortgage|money supply|bank lending/.test(title)) return "Credit";
    if (/gdp|gross domestic|industrial production|manufacturing|pmi|business activity|factory/.test(title)) {
        return "Growth";
    }
    if (/retail|consumer confidence|consumer spending|household|sales/.test(title)) return "Consumption";
    if (/trade|exports?|imports?|current account|balance of payments/.test(title)) return "Trade";
    return "Other";
}

/**
 * Economic-table scoring policy: Low does not score; Medium is capped at ±0.5;
 * High is capped at ±1.  This protects the board from source-side score spikes.
 */
export function normalizeEconomicImpactScore(raw: number, impact: string): number {
    const value = Number.isFinite(raw) ? raw : 0;
    const normalizedImpact = impact.trim().toLowerCase();
    if (normalizedImpact === "low") return 0;
    const limit = normalizedImpact === "medium" ? 0.5 : 1;
    return Number(Math.max(-limit, Math.min(limit, value)).toFixed(1));
}

/** Shape returned by `GET /api/v1/public/economic-calendar` (live investing.com scrape). */
export type EconomicCalendarEventDTO = {
    time: string;
    timestamp: string;
    currency: string;
    country: string;
    event: string;
    impact: "Low" | "Medium" | "High";
    actual: string | null;
    forecast: string | null;
    previous: string | null;
    trendScore: number;
    evidenceScore: number;
    bias: "Bullish" | "Bearish" | "Neutral";
};

function formatSignedScore(n: number): string {
    const rounded = Math.abs(n - Math.round(n)) < 1e-9 ? Math.round(n) : Number(n.toFixed(1));
    if (rounded === 0) return "0";
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
}

const MONTHS_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;
const MONTHS_LONG = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
] as const;
const WEEKDAYS_LONG = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

/** Pad "5:25" / "05:25" → "05:25" for lexicographic time order. */
function normalizeTimeForSort(time: string): string {
    const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
    if (!match) return time.trim();
    return `${match[1]!.padStart(2, "0")}:${match[2]}`;
}

/** Wall-clock chronological order: date first, then time (18:30 Sun → 05:25 Mon is correct). */
function compareCalendarRows(
    a: { dateKey: string; time: string; sortMs: number },
    b: { dateKey: string; time: string; sortMs: number },
): number {
    const byDate = a.dateKey.localeCompare(b.dateKey);
    if (byDate !== 0) return byDate;
    const byTime = normalizeTimeForSort(a.time).localeCompare(normalizeTimeForSort(b.time));
    if (byTime !== 0) return byTime;
    return a.sortMs - b.sortMs;
}

/** "2026-07-06 07:00:00" → display + sort fields. Falls back gracefully when unparsable. */
function parseEventTimestamp(timestamp: string): {
    date: string;
    dateKey: string;
    sortMs: number;
    dateSeparatorLabel: string;
} | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(timestamp.trim());
    if (!match) return null;
    const [, year, month, day, hour, minute] = match;
    const monthIdx = Number(month) - 1;
    if (monthIdx < 0 || monthIdx > 11) return null;
    const y = Number(year);
    const d = Number(day);
    // The scraper timestamp is a Dubai wall clock with no offset. Convert explicitly to UTC
    // (Dubai is UTC+04:00 and has no DST) so ordering is identical in UTC, Karachi, and browser TZs.
    const sortMs = Date.UTC(y, monthIdx, d, Number(hour) - 4, Number(minute));
    // Use UTC noon so weekday matches the calendar date label, not local midnight skew.
    const weekday = new Date(Date.UTC(y, monthIdx, d, 12, 0)).getUTCDay();
    return {
        date: `${day} ${MONTHS_ABBR[monthIdx]} ${year}`,
        dateKey: `${year}-${month}-${day}`,
        sortMs,
        dateSeparatorLabel: `${WEEKDAYS_LONG[weekday]}, ${MONTHS_LONG[monthIdx]} ${d}, ${year}`,
    };
}

export function mapEconomicCalendarEvents(events: EconomicCalendarEventDTO[]): EconomicCalendarRow[] {
    return events
        .map((e) => {
            const parsed = parseEventTimestamp(e.timestamp);
            return {
                time: e.time,
                date: parsed?.date ?? "—",
                dateKey: parsed?.dateKey ?? "",
                sortMs: parsed?.sortMs ?? 0,
                dateSeparatorLabel: parsed?.dateSeparatorLabel ?? parsed?.date ?? "—",
                asset: e.currency,
                country: e.country || e.currency,
                category: economicCalendarCategory(e.event),
                event: e.event,
                impact: e.impact,
                actual: e.actual ?? "—",
                forecast: e.forecast ?? "—",
                previous: e.previous ?? "—",
                trendScore: formatSignedScore(normalizeEconomicImpactScore(e.trendScore, e.impact)),
                evidenceScore: formatSignedScore(normalizeEconomicImpactScore(e.evidenceScore, e.impact)),
                bias: e.bias,
            };
        })
        .sort(compareCalendarRows);
}

/** Investing.com importance is 1–3 bulls; the design shows 5 red stars for High-impact rows. */
const IMPACT_TO_IMPORTANCE: Record<EconomicCalendarEventDTO["impact"], number> = {
    High: 5,
    Medium: 3,
    Low: 1,
};

/**
 * Upcoming High Impact table — same Economic Calendar feed, High-impact only,
 * event time ≥ now, sorted soonest-first. No past-event fallback (that made
 * last week's releases look "upcoming" and scramble same-day time order).
 */
export function mapUpcomingHighImpactEvents(
    events: EconomicCalendarEventDTO[],
    now: number = Date.now(),
): UpcomingHighImpactRow[] {
    return events
        .map((e) => ({ event: e, parsed: parseEventTimestamp(e.timestamp) }))
        .filter((x) => x.event.impact === "High" && x.parsed !== null && x.parsed.sortMs >= now)
        .sort((a, b) =>
            compareCalendarRows(
                { dateKey: a.parsed!.dateKey, time: a.event.time, sortMs: a.parsed!.sortMs },
                { dateKey: b.parsed!.dateKey, time: b.event.time, sortMs: b.parsed!.sortMs },
            ),
        )
        .map(({ event, parsed }) => ({
            date: parsed!.date,
            time: event.time,
            asset: event.currency,
            event: event.event,
            impact: event.impact,
            previous: event.previous ?? "—",
            forecast: event.forecast ?? "—",
            importance: IMPACT_TO_IMPORTANCE[event.impact],
            potentialImpact: `${event.currency} Volatility`,
        }));
}
