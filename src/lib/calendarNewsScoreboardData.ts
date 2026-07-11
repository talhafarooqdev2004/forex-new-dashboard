import type { EconomicCalendarEventDTO } from "@/lib/calendarNewsCalendarData";

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

/** High-impact releases move the score more than a minor speech or low-tier print. */
function impactWeight(impact: EconomicCalendarEventDTO["impact"]): number {
    if (impact === "High") return 3;
    if (impact === "Medium") return 2;
    return 1;
}

function buildTopDriverComment(top: EconomicCalendarEventDTO): string {
    if (!top.forecast) {
        return `${top.event} released (${top.actual})`;
    }
    const verb = top.evidenceScore > 0 ? "beat forecast" : top.evidenceScore < 0 ? "missed forecast" : "in line with forecast";
    return `${top.event} ${verb} (${top.actual} vs ${top.forecast})`;
}

/** Highest-impact event drives the comment; ties broken by the larger trend+evidence swing. */
function pickTopDriver(events: EconomicCalendarEventDTO[]): EconomicCalendarEventDTO {
    return events.reduce((best, e) => {
        const bestWeight = impactWeight(best.impact);
        const eWeight = impactWeight(e.impact);
        if (eWeight !== bestWeight) return eWeight > bestWeight ? e : best;
        const bestMag = Math.abs(best.trendScore + best.evidenceScore);
        const eMag = Math.abs(e.trendScore + e.evidenceScore);
        return eMag > bestMag ? e : best;
    });
}

/**
 * Macro Scoreboard from Economic Calendar (client rule):
 *   per event net = trendScore + evidenceScore
 *   Macro Score   = sum of those nets for the currency (clamped to -10..+10)
 *
 * Bias + Trend follow that score so the three columns stay consistent.
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
                comment: "No high-impact data released this week",
            };
        }

        let netSum = 0;
        for (const e of released) {
            netSum += e.trendScore + e.evidenceScore;
        }

        const macroScore = Number(Math.max(-10, Math.min(10, netSum)).toFixed(1));
        const { bias, trend } = macroBiasAndTrendFromScore(macroScore);

        return {
            currency,
            bias,
            macroScore,
            trend,
            comment: buildTopDriverComment(pickTopDriver(released)),
        };
    });
}

/**
 * Doc §20 Currency Health Bias — applied to the raw Macro Score
 * (sum of trend+evidence nets), not a separately scaled display.
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
