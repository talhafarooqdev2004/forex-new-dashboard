import { SCOREBOARD_UI } from "@/lib/calendarNewsScoreboardData";

export type EconomicCalendarRow = {
    time: string;
    /** Asset key for the country icon (USD…CHF, GOLD, OIL). */
    asset: string;
    event: string;
    impact: string;
    actual: string;
    forecast: string;
    previous: string;
    trendScore: string;
    evidenceScore: string;
    bias: string;
};

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
    { ...ECON_ROW_BASE, asset: "USD", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "EUR", bias: "Bullish" },
    { ...ECON_ROW_BASE, asset: "GBP", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "AUD", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "JPY", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "NZD", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "CHF", bias: "Neutral" },
    { ...ECON_ROW_BASE, asset: "GOLD", bias: "Bearish" },
    { ...ECON_ROW_BASE, asset: "OIL", bias: "Bearish" },
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

function formatSignedInt(n: number): string {
    if (n === 0) return "0";
    return n > 0 ? `+${n}` : `${n}`;
}

export function mapEconomicCalendarEvents(events: EconomicCalendarEventDTO[]): EconomicCalendarRow[] {
    return events.map((e) => ({
        time: e.time,
        asset: e.currency,
        event: e.event,
        impact: e.impact,
        actual: e.actual ?? "—",
        forecast: e.forecast ?? "—",
        previous: e.previous ?? "—",
        trendScore: formatSignedInt(e.trendScore),
        evidenceScore: formatSignedInt(e.evidenceScore),
        bias: e.bias,
    }));
}

const MONTHS_ABBR = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"] as const;

/** "2026-07-06 07:00:00" → { date: "06 JUL 2026", ms }. Falls back gracefully when unparsable. */
function parseEventTimestamp(timestamp: string): { date: string; ms: number } | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(timestamp.trim());
    if (!match) return null;
    const [, year, month, day, hour, minute] = match;
    const monthIdx = Number(month) - 1;
    if (monthIdx < 0 || monthIdx > 11) return null;
    const ms = new Date(
        Number(year),
        monthIdx,
        Number(day),
        Number(hour),
        Number(minute),
    ).getTime();
    return { date: `${day} ${MONTHS_ABBR[monthIdx]} ${year}`, ms };
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
        .filter((x) => x.event.impact === "High" && x.parsed !== null && x.parsed.ms >= now)
        .sort((a, b) => a.parsed!.ms - b.parsed!.ms)
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
