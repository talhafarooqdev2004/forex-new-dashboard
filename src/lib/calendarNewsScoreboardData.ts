import type { EconomicCalendarEventDTO } from "@/lib/calendarNewsCalendarData";
import { classifyHealthFactor, scoreCurrencyHealthEvent } from "@/lib/currencyHealthScore";

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

export type MacroScoreboardRow = {
    currency: string;
    bias: string;
    macroScore: number;
    trend: "up" | "down" | "flat";
    comment: string;
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
    { currency: "USD", bias: "Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "EUR", bias: "Bearish", macroScore: -6.5, trend: "down", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "GPY", bias: "Mild Bearish", macroScore: -6.5, trend: "down", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "AUD", bias: "Strong Bearish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "JPY", bias: "Mild Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "NZD", bias: "Mild Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "CHF", bias: "Neutral Bullish", macroScore: 6.5, trend: "flat", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "GOLD", bias: "Bullish", macroScore: 6.5, trend: "up", comment: "Hawkish Fed, Strong data & inflation support USD" },
    { currency: "OIL", bias: "Volatile Neutral", macroScore: 6.5, trend: "flat", comment: "Hawkish Fed, Strong data & inflation support USD" },
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

function normalizedEventName(event: string): string {
    return event.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function macroReleaseFamily(event: string): string {
    const e = normalizedEventName(event);
    if (/\b(gdp|gdpnow|gross domestic product)\b/.test(e)) return "gdp";
    if (/\b(cpi|consumer price|headline inflation|inflation rate)\b/.test(e)) return "cpi";
    if (/\b(ppi|producer price)\b/.test(e)) return "ppi";
    if (
        /\b(interest rate decision|rate decision|cash rate|bank rate|fed funds|federal funds|refi rate|refinance rate|deposit facility|ocr|policy rate|overnight rate)\b/.test(
            e,
        )
    ) {
        return "policy-rate";
    }
    if (/\bunemployment rate\b/.test(e)) return "unemployment";
    // Doc §15 — labour headline vs subcomponents (not unemployment rate).
    if (
        /\b(nonfarm|nfp|payroll|employment change|adp employment|adp nonfarm)\b/.test(e) &&
        !/\bunemployment\b/.test(e)
    ) {
        return "employment";
    }
    if (/\b(pmi|purchasing managers)\b/.test(e)) return "pmi";
    if (/\bretail sales\b/.test(e)) return "retail";
    if (/\b(industrial production|manufacturing production|factory output)\b/.test(e)) {
        return "industrial";
    }
    if (/\b(trade balance|trade surplus|trade deficit|current account)\b/.test(e)) {
        return "trade";
    }
    // Exact-name grouping still prevents duplicate rows without merging unrelated secondary data.
    return `event:${e}`;
}

function principalRank(event: EconomicCalendarEventDTO, family: string): number {
    const e = normalizedEventName(event.event);
    if (family === "gdp") {
        if (/\b(gdpnow|gdp now|niesr|tracker|tracking estimate|forecast|projection|estimate)\b/.test(e)) {
            return 100;
        }
        if (/\b(qoq|q q|quarter on quarter)\b/.test(e)) return 0;
        if (/\b(yoy|y y|year on year)\b/.test(e)) return 1;
        if (/\b(mom|m m|month on month|3m 3m)\b/.test(e)) return 2;
        return 3;
    }
    if (family === "cpi" || family === "ppi") {
        return /\bcore\b/.test(e) ? 10 : 0;
    }
    if (family === "employment") {
        if (/\b(adp)\b/.test(e)) return 5;
        if (/\b(private|ex farm|excluding)\b/.test(e)) return 3;
        if (/\b(nonfarm|nfp|payroll)\b/.test(e)) return 0;
        return 2;
    }
    if (family === "pmi") {
        if (/\bcomposite\b/.test(e)) return 0;
        if (/\bmanufacturing\b/.test(e)) return 1;
        if (/\bservices\b/.test(e)) return 2;
        return 3;
    }
    if (family === "retail") {
        if (/\b(ex auto|excluding auto|core|control)\b/.test(e)) return 5;
        return 0;
    }
    if (family === "industrial") {
        if (/\bmanufacturing\b/.test(e)) return 2;
        return 0;
    }
    return classifyHealthFactor(event.event) === "primary" ? 0 : 10;
}

function releaseDateKey(event: EconomicCalendarEventDTO): string {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(event.timestamp);
    return match?.[1] ?? event.timestamp ?? "unknown-date";
}

function scoreMacroRelease(event: EconomicCalendarEventDTO): number {
    return scoreCurrencyHealthEvent({
        event: event.event,
        actual: event.actual,
        forecast: event.forecast,
        previous: event.previous,
    });
}

/**
 * One contribution per currency/date/release family. GDP QoQ/YoY/components are one
 * release; headline CPI is principal and core CPI can only veto a conflicting signal.
 */
export function scoreReleasedMacroEvents(events: EconomicCalendarEventDTO[]): ScoredMacroRelease[] {
    const groups = new Map<string, EconomicCalendarEventDTO[]>();
    for (const event of events) {
        const family = macroReleaseFamily(event.event);
        const key = `${event.currency}|${releaseDateKey(event)}|${family}`;
        const group = groups.get(key);
        if (group) group.push(event);
        else groups.set(key, [event]);
    }

    const out: ScoredMacroRelease[] = [];
    for (const group of groups.values()) {
        const family = macroReleaseFamily(group[0]!.event);
        const ranked = [...group].sort((a, b) => principalRank(a, family) - principalRank(b, family));
        const principal = ranked[0]!;
        let health = scoreMacroRelease(principal);

        // Doc §9/§15 — headline vs core conflict on same CPI/PPI release → 0 unless clearly aligned.
        if ((family === "cpi" || family === "ppi") && health !== 0) {
            const supportingScores = ranked.slice(1).map(scoreMacroRelease).filter((score) => score !== 0);
            if (supportingScores.some((score) => Math.sign(score) !== Math.sign(health))) health = 0;
        }

        out.push({ event: principal, health });
    }
    return out;
}

/**
 * Macro Scoreboard from Economic Calendar — Currency Health Board (doc §§5–17):
 *   Macro Score = Σ Primary (±1/0) + Σ Secondary (±0.5/0) for released events.
 *   Primary = GDP, headline CPI, unemployment rate, policy-rate decision only.
 *   + only when improves vs previous AND beats forecast; − only when worsens AND misses; else 0.
 *   Same-day GDP/CPI family variants count once (principal release).
 */
export function buildMacroScoreboardRowsFromEconomicCalendar(events: EconomicCalendarEventDTO[]): MacroScoreboardRow[] {
    return MACRO_SCOREBOARD_CURRENCIES.map((currency) => {
        const released = events.filter((e) => e.currency === currency && e.actual !== null);

        if (released.length === 0) {
            return {
                currency,
                bias: "Neutral",
                macroScore: 0,
                trend: "flat",
                comment: "Neutral - Insufficient Economic Data",
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

/** Catalyst table asset order (doc §1). */
const CATALYST_ASSET_ORDER = ["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD", "GOLD", "OIL"] as const;

/** Driver Bias from the net driver score + counts (doc §23/§24 — conflicting drivers → Mixed). */
function catalystBias(driverScore: number, bullishCount: number, bearishCount: number): string {
    if (bullishCount === 0 && bearishCount === 0) return "Neutral";
    if (bullishCount > 0 && bearishCount > 0 && Math.abs(driverScore) < 0.75) return "Mixed";
    if (driverScore >= 1.5) return "Bullish";
    if (driverScore >= 0.5) return "Mild Bullish";
    if (driverScore <= -1.5) return "Bearish";
    if (driverScore <= -0.5) return "Mild Bearish";
    return "Neutral";
}

/** Raw driver score (unbounded sum of impacts) → -10..+10 for the heatmap (doc §30). */
export function normalizeDriverScore(driverScore: number): number {
    const clamped = Math.max(-5, Math.min(5, driverScore));
    return Number((clamped * 2).toFixed(1));
}

/** Map the live per-asset board to display rows; always returns all 10 assets in board order. */
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
