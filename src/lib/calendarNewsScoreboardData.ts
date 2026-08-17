import { normalizeEconomicImpactScore, type EconomicCalendarEventDTO } from "@/lib/calendarNewsCalendarData";
import { scoreCurrencyHealthEvent } from "@/lib/currencyHealthScore";

export const SCOREBOARD_UI = {
    green: "#00c076",
    red: "#f84960",
    orange: "#f0b90b",
    header: "#848e9c",
    row: "rgb(var(--dark-grey))",
    rowAlt: "rgb(255 255 255 / 0.04)",
    border: "rgb(var(--stroke) / 0.35)",
    muted: "rgb(255 255 255 / 0.45)",
} as const;

/** Impact-bar squares — vivid fills over a light-grey empty state, per design. */
export const IMPACT_BAR_UI = {
    green: "#22c55e",
    red: "#ef4444",
    empty: "#d9d9d9",
    segments: 10,
} as const;

/**
 * Live market day key: Asia/Dubai, window 01:00 → next 01:00 (same as news / Currency Health).
 * Example: 13 Jul 22:00 Dubai → day `2026-07-13`; 14 Jul 00:30 → still `2026-07-13`;
 * 14 Jul 01:00 → `2026-07-14`.
 */
export function marketDayKey(date: Date = new Date()): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Dubai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hourCycle: "h23",
    }).formatToParts(date);

    const num = (type: Intl.DateTimeFormatPartTypes) =>
        Number(parts.find((p) => p.type === type)?.value ?? NaN);

    let year = num("year");
    let month = num("month");
    let day = num("day");
    const hour = num("hour");
    if (![year, month, day, hour].every((n) => Number.isFinite(n))) {
        return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai" }).format(date);
    }

    if (hour < 1) {
        const civil = new Date(Date.UTC(year, month - 1, day));
        civil.setUTCDate(civil.getUTCDate() - 1);
        year = civil.getUTCFullYear();
        month = civil.getUTCMonth() + 1;
        day = civil.getUTCDate();
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Assign a Dubai wall-clock calendar timestamp (`YYYY-MM-DD HH:mm:ss`) to the
 * 01:00→01:00 market day. Used so Macro Scoreboard only scores today's releases.
 */
export function marketDayKeyFromDubaiTimestamp(timestamp: string): string | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?/.exec(timestamp.trim());
    if (!match) return null;

    let year = Number(match[1]);
    let month = Number(match[2]);
    let day = Number(match[3]);
    const hour = Number(match[4]);
    if (![year, month, day, hour].every((n) => Number.isFinite(n))) return null;

    if (hour < 1) {
        const civil = new Date(Date.UTC(year, month - 1, day));
        civil.setUTCDate(civil.getUTCDate() - 1);
        year = civil.getUTCFullYear();
        month = civil.getUTCMonth() + 1;
        day = civil.getUTCDate();
    }

    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Keep only Economic Calendar rows that belong to the live UAE market day. */
export function filterEconomicEventsForLiveMarketDay(
    events: EconomicCalendarEventDTO[],
    now: Date = new Date(),
): EconomicCalendarEventDTO[] {
    const liveDay = marketDayKey(now);
    return events.filter((event) => marketDayKeyFromDubaiTimestamp(event.timestamp) === liveDay);
}

export type MacroScoreboardRow = {
    currency: string;
    bias: string;
    macroScore: number;
    trend: "up" | "down" | "flat";
    comment: string;
    /** The specific economic release currently driving this currency's macro score. */
    factor: MacroFactor | null;
};

export type MacroFactor = {
    event: string;
    country: string;
    timestamp: string;
    impact: EconomicCalendarEventDTO["impact"];
    actual: string | null;
    forecast: string | null;
    previous: string | null;
    score: number;
};

export type CatalystScoreboardRow = {
    currency: string;
    bullishCatalysts: number;
    bearishCatalysts: number;
    /** Design colors the bearish count green on some rows, red on others. */
    bearishTone: "green" | "red";
    catalystScore: number;
    impactFilled: number;
    impactTone: "green" | "red";
    bias: string;
};

export function biasTextColor(label: string): string {
    const t = label.trim().toLowerCase();
    if (t.includes("neutral bull") || t.includes("volatile") || t.includes("neutral bear")) {
        return SCOREBOARD_UI.orange;
    }
    if (t.includes("bear")) return SCOREBOARD_UI.red;
    if (t.includes("bull")) return SCOREBOARD_UI.green;
    if (t === "neutral" || t.includes("neutral to")) return SCOREBOARD_UI.orange;
    return SCOREBOARD_UI.muted;
}

export function scoreTextColor(score: number | null): string {
    if (score === null) return SCOREBOARD_UI.muted;
    if (Math.abs(score) < 0.05) return SCOREBOARD_UI.green;
    return score > 0 ? SCOREBOARD_UI.green : SCOREBOARD_UI.red;
}

/** Static Macro Scoreboard rows — matches design reference (incl. "GPY" label). */
export const STATIC_MACRO_SCOREBOARD_ROWS: MacroScoreboardRow[] = [
    { currency: "USD", bias: "Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "EUR", bias: "Bearish", macroScore: -6.5, trend: "down", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "GPY", bias: "Mild Bearish", macroScore: -6.5, trend: "down", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "AUD", bias: "Strong Bearish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "JPY", bias: "Mild Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "NZD", bias: "Mild Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "CHF", bias: "Neutral Bullish", macroScore: 6.5, trend: "flat", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "GOLD", bias: "Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
    { currency: "OIL", bias: "Volatile Neutral", macroScore: 6.5, trend: "flat", comment: "Hawkish Fed, Strong data & inflation support USD", factor: null },
];

/** Rows are built for these 8 majors only — Economic Calendar has no Gold/Oil coverage. */
const MACRO_SCOREBOARD_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF"] as const;

function buildTopDriverComment(top: EconomicCalendarEventDTO, healthScore: number): string {
    if (!top.forecast) {
        return `${top.event} released (${top.actual})`;
    }
    const verb = healthScore > 0 ? "beat forecast" : healthScore < 0 ? "missed forecast" : "mixed / in line";
    return `${top.event} ${verb} (${top.actual} vs ${top.forecast})`;
}

/** Highest |health| contribution drives the comment; ties keep the first max. */
function pickTopDriver(
    scored: { event: EconomicCalendarEventDTO; health: number }[],
): { event: EconomicCalendarEventDTO; health: number } {
    return scored.reduce((best, cur) => (Math.abs(cur.health) > Math.abs(best.health) ? cur : best));
}

type ScoredMacroRelease = { event: EconomicCalendarEventDTO; health: number };

function scoreMacroRelease(event: EconomicCalendarEventDTO): number {
    const raw = scoreCurrencyHealthEvent({
        event: event.event,
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
    });
    return normalizeEconomicImpactScore(raw, event.impact);
}

/**
 * Score released events using the Daily Market impact policy: Low = 0;
 * Medium is capped at ±0.5; High is capped at ±1. The cap applies after
 * the underlying economic-direction calculation, so a medium-impact GDP
 * surprise cannot contribute a full ±1.
 */
export function scoreReleasedMacroEvents(events: EconomicCalendarEventDTO[]): ScoredMacroRelease[] {
    const out: ScoredMacroRelease[] = [];
    for (const event of events) {
        if (event.impact === "Low") continue;
        if (event.actual === null) continue;
        out.push({ event, health: scoreMacroRelease(event) });
    }
    return out;
}

/**
 * Macro Scoreboard from Economic Calendar — Currency Health Board (doc §§5–17):
 *   Only releases inside the live UAE market day (01:00→01:00 Asia/Dubai).
 *   Low events contribute zero; Medium contributions are capped at ±0.5;
 *   High contributions are capped at ±1.
 *   Primary = GDP, headline CPI rate, unemployment rate, policy-rate decision only.
 *   + only when improves vs previous AND beats forecast; − only when worsens AND misses; else 0.
 */
export function buildMacroScoreboardRowsFromEconomicCalendar(
    events: EconomicCalendarEventDTO[],
    now: Date = new Date(),
): MacroScoreboardRow[] {
    const dayEvents = filterEconomicEventsForLiveMarketDay(events, now);

    return MACRO_SCOREBOARD_CURRENCIES.map((currency) => {
        const released = dayEvents.filter(
            (e) =>
                e.currency === currency &&
                e.actual !== null &&
                (e.impact === "High" || e.impact === "Medium"),
        );

        if (released.length === 0) {
            return {
                currency,
                bias: "Neutral",
                macroScore: 0,
                trend: "flat",
                comment: "Neutral - Insufficient Economic Data",
                factor: null,
            };
        }

        const scored = scoreReleasedMacroEvents(released);

        const netSum = scored.reduce((sum, s) => sum + s.health, 0);
        const macroScore = Number(netSum.toFixed(1));
        const { bias, trend } = macroBiasAndTrendFromScore(macroScore);
        const top = pickTopDriver(scored);

        return {
            currency,
            bias,
            macroScore,
            trend,
            comment: buildTopDriverComment(top.event, top.health),
            factor: {
                event: top.event.event,
                country: top.event.country,
                timestamp: top.event.timestamp,
                impact: top.event.impact,
                actual: top.event.actual,
                forecast: top.event.forecast,
                previous: top.event.previous,
                score: top.health,
            },
        };
    });
}

/**
 * Doc §20 Currency Health Bias — applied to the raw Macro Score.
 * above +1 Bullish; +0.5..+1 Mild Bullish; -0.49..+0.49 Neutral;
 * -1..-0.5 Mild Bearish; below -1 Bearish.
 */
function macroBiasAndTrendFromScore(score: number): {
    bias: string;
    trend: MacroScoreboardRow["trend"];
} {
    if (score > 1) return { bias: "Bullish", trend: "up" };
    if (score >= 0.5) return { bias: "Mild Bullish", trend: "up" };
    if (score > -0.5) return { bias: "Neutral", trend: "flat" };
    if (score >= -1) return { bias: "Mild Bearish", trend: "down" };
    return { bias: "Bearish", trend: "down" };
}

/** Per-asset aggregates from `GET /api/v1/public/market-catalyst` (live Groq-classified news). */
export type CatalystBoardDTO = {
    asset: string;
    bullishCount: number;
    bearishCount: number;
    driverScore: number;
};

/** Validated FFE Catalyst contract: eight currencies plus GOLD and OIL. */
const CATALYST_ASSET_ORDER = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "GOLD", "OIL"] as const;

/** Exact FFE Catalyst Driver Score bias bands. Opposing drivers remain in the counts and net score. */
export function catalystBias(driverScore: number, bullishCount: number, bearishCount: number): string {
    if (bullishCount === 0 && bearishCount === 0) return "Neutral";
    if (driverScore >= 1.5) return "Strong Bullish";
    if (driverScore >= 0.5) return "Bullish";
    if (driverScore >= 0.25) return "Mild Bullish";
    if (driverScore <= -1.5) return "Strong Bearish";
    if (driverScore <= -0.5) return "Bearish";
    if (driverScore <= -0.25) return "Mild Bearish";
    return "Neutral";
}

/** Raw driver score (unbounded sum of impacts) → -10..+10 for the heatmap (doc §30). */
export function normalizeDriverScore(driverScore: number): number {
    const clamped = Math.max(-5, Math.min(5, driverScore));
    return Number((clamped * 2).toFixed(1));
}

/** Map the live per-currency board to the eight FFE Catalyst rows. */
export function buildCatalystScoreboardRows(board: CatalystBoardDTO[]): CatalystScoreboardRow[] {
    const byAsset = new Map(board.map((b) => [b.asset, b]));

    return CATALYST_ASSET_ORDER.map((asset) => {
        const b = byAsset.get(asset) ?? { asset, bullishCount: 0, bearishCount: 0, driverScore: 0 };
        const filled = Math.min(10, Math.round(Math.abs(b.driverScore) * 2));

        return {
            currency: asset,
            bullishCatalysts: b.bullishCount,
            bearishCatalysts: b.bearishCount,
            bearishTone: "red" as const,
            catalystScore: b.driverScore,
            impactFilled: filled,
            impactTone: b.driverScore >= 0 ? ("green" as const) : ("red" as const),
            bias: catalystBias(b.driverScore, b.bullishCount, b.bearishCount),
        };
    });
}

/** Static Market Catalyst Scoreboard rows — impact bar fills copied per-row from design. */
export const STATIC_CATALYST_SCOREBOARD_ROWS: CatalystScoreboardRow[] = [
    { currency: "USD", bullishCatalysts: 5, bearishCatalysts: 2, bearishTone: "green", catalystScore: 1.2, impactFilled: 6, impactTone: "green", bias: "Bullish" },
    { currency: "EUR", bullishCatalysts: 5, bearishCatalysts: 3, bearishTone: "red", catalystScore: -1.2, impactFilled: 3, impactTone: "red", bias: "Neutral to Bearish" },
    { currency: "GPY", bullishCatalysts: 5, bearishCatalysts: 2, bearishTone: "green", catalystScore: 0, impactFilled: 0, impactTone: "green", bias: "Neutral" },
    { currency: "AUD", bullishCatalysts: 5, bearishCatalysts: 4, bearishTone: "red", catalystScore: -1.2, impactFilled: 7, impactTone: "red", bias: "Strong Bearish" },
    { currency: "JPY", bullishCatalysts: 5, bearishCatalysts: 3, bearishTone: "red", catalystScore: 1.2, impactFilled: 3, impactTone: "green", bias: "Bearish" },
    { currency: "NZD", bullishCatalysts: 5, bearishCatalysts: 2, bearishTone: "red", catalystScore: 1.2, impactFilled: 6, impactTone: "green", bias: "Mild Bullish" },
    { currency: "CHF", bullishCatalysts: 5, bearishCatalysts: 2, bearishTone: "red", catalystScore: -1.2, impactFilled: 4, impactTone: "green", bias: "Mild Bullish" },
    { currency: "GOLD", bullishCatalysts: 5, bearishCatalysts: 2, bearishTone: "red", catalystScore: -1.2, impactFilled: 6, impactTone: "red", bias: "Neutral" },
    { currency: "OIL", bullishCatalysts: 5, bearishCatalysts: 2, bearishTone: "red", catalystScore: -1.2, impactFilled: 3, impactTone: "green", bias: "Mild Bullish" },
];
