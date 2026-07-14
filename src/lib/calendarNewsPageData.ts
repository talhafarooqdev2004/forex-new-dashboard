import { normalizeDriverScore } from "@/lib/calendarNewsScoreboardData";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

export type MarketSentimentSummary = {
    bullish: number;
    neutral: number;
    bearish: number;
    overallLabel: "BULLISH" | "BEARISH" | "NEUTRAL";
    gaugeScore: number;
};

/** Doc §27–§29 Geopolitical Risk Watch (0.00–1.00). */
export type GeopoliticalRiskWatch = {
    score: number;
    band: "Low Risk" | "Watch" | "Elevated" | "High Risk";
    explanation: string;
    eventCount: number;
};

export type MarketHeatmapTile = {
    symbol: string;
    value: number;
    label: string;
};

export type RiskModeDisplay = {
    /** Live sheet / API score on −100…100. */
    rawScore: number;
    /** Bar pointer position 0…100 (mapped from rawScore). */
    pointerPct: number;
    /** @deprecated use pointerPct — kept for older call sites */
    score0100: number;
    headerBias: "Risk-On" | "Risk-Off" | "Neutral";
    intensity: string;
    direction: string;
    accentColor: string;
};

/**
 * Calendar & News Risk Mode zones on −100…100:
 * red &lt; −35, yellow −35…65, green 65…100.
 *
 * Visual bar is 7 equal segments (3 red | 1 yellow | 3 green). Pointer maps
 * into those fixed regions by score — bar widths never change with the score.
 */
export const RISK_MODE_BAR_ZONES = {
    min: -100,
    max: 100,
    /** Red / Risk-Off: [min, redMax) */
    redMax: -35,
    /** Yellow / Neutral: [redMax, yellowMax) */
    yellowMax: 65,
    /** Green / Risk-On: [yellowMax, max] */
    greenMax: 100,
    /** Equal-width segment layout: 3 red + 1 yellow + 3 green. */
    redSegments: 3,
    yellowSegments: 1,
    greenSegments: 3,
    totalSegments: 7,
} as const;

/**
 * Map −100…100 score → 0…100 pointer % on the equal 7-bar track:
 * −100…−35 → red third, −35…65 → yellow bar, 65…100 → green third.
 */
export function riskModeScoreToPointerPct(rawScore: number): number {
    const { min, max, redMax, yellowMax, redSegments, yellowSegments, totalSegments } = RISK_MODE_BAR_ZONES;
    const s = Math.max(min, Math.min(max, rawScore));
    const redEndPct = (redSegments / totalSegments) * 100;
    const yellowEndPct = ((redSegments + yellowSegments) / totalSegments) * 100;

    if (s < redMax) {
        // Risk-Off: spread −100…−35 across the 3 red bars
        const t = (s - min) / (redMax - min);
        return t * redEndPct;
    }
    if (s < yellowMax) {
        // Neutral: spread −35…65 across the yellow bar
        const t = (s - redMax) / (yellowMax - redMax);
        return redEndPct + t * (yellowEndPct - redEndPct);
    }
    // Risk-On: spread 65…100 across the 3 green bars
    const t = (s - yellowMax) / (max - yellowMax);
    return yellowEndPct + t * (100 - yellowEndPct);
}

export function buildRiskModeDisplayFromScore(rawInput: number): RiskModeDisplay {
    const rawScore = Math.max(
        RISK_MODE_BAR_ZONES.min,
        Math.min(RISK_MODE_BAR_ZONES.max, Number.isFinite(rawInput) ? rawInput : 0),
    );
    const pointerPct = riskModeScoreToPointerPct(rawScore);

    let headerBias: RiskModeDisplay["headerBias"] = "Neutral";
    let accentColor = "#ffd600";
    let direction = "NEUTRAL";

    if (rawScore < RISK_MODE_BAR_ZONES.redMax) {
        headerBias = "Risk-Off";
        accentColor = "#ff1744";
        direction = "RISK-OFF";
    } else if (rawScore >= RISK_MODE_BAR_ZONES.yellowMax) {
        headerBias = "Risk-On";
        accentColor = "#00c853";
        direction = "RISK-ON";
    }

    return {
        rawScore,
        pointerPct,
        score0100: pointerPct,
        headerBias,
        intensity: "",
        direction,
        accentColor,
    };
}

/**
 * Same technical/gauge signal colors + light pink / light green bands.
 * Mild Bearish = pink, Neutral Bearish = light pink; greens mirror on the bull side.
 */
export const CALENDAR_NEWS_HEATMAP_COLORS = {
    strongBullish: GAUGE_SIGNAL_COLORS.strongBuy,
    bullish: GAUGE_SIGNAL_COLORS.buy,
    mildBullish: GAUGE_SIGNAL_COLORS.weakBuy,
    neutralBullish: "#9AE6B0",
    /** Gauge / technical Neutral yellow */
    neutral: GAUGE_SIGNAL_COLORS.neutral,
    neutralBearish: "#FFC1C1",
    mildBearish: GAUGE_SIGNAL_COLORS.weakSell,
    bearish: GAUGE_SIGNAL_COLORS.sell,
    strongBearish: GAUGE_SIGNAL_COLORS.strongSell,
    placeholder: "rgb(255 255 255 / 0.07)",
} as const;

/**
 * Score → label (`heatmapLabelFromValue`) → fixed color.
 * Each label always gets the same color (other tiles do not shift Neutral to orange).
 */
export function heatmapTileBackgroundFromLabel(label: string): string {
    const t = label.trim().toLowerCase();
    if (t === "—" || t === "n/a" || t === "") return CALENDAR_NEWS_HEATMAP_COLORS.placeholder;

    if (t.includes("neutral bull")) return CALENDAR_NEWS_HEATMAP_COLORS.neutralBullish;
    if (t.includes("neutral bear")) return CALENDAR_NEWS_HEATMAP_COLORS.neutralBearish;
    if (t.includes("mild bear")) return CALENDAR_NEWS_HEATMAP_COLORS.mildBearish;
    if (t.includes("mild bull")) return CALENDAR_NEWS_HEATMAP_COLORS.mildBullish;
    if (t.includes("strong bear")) return CALENDAR_NEWS_HEATMAP_COLORS.strongBearish;
    if (t.includes("strong bull")) return CALENDAR_NEWS_HEATMAP_COLORS.strongBullish;

    if (t === "neutral" || t === "volatile neutral" || t.includes("volatile")) {
        return CALENDAR_NEWS_HEATMAP_COLORS.neutral;
    }

    if (t.includes("bear")) return CALENDAR_NEWS_HEATMAP_COLORS.bearish;
    if (t.includes("bull")) return CALENDAR_NEWS_HEATMAP_COLORS.bullish;

    return CALENDAR_NEWS_HEATMAP_COLORS.neutral;
}

/** Static Market Sentiment summary — matches design reference. */
export const STATIC_MARKET_SENTIMENT_SUMMARY: MarketSentimentSummary = {
    bullish: 38,
    neutral: 42,
    bearish: 42,
    overallLabel: "NEUTRAL",
    gaugeScore: 0,
};

/** Fallback when live geopolitical headlines are unavailable. */
export const STATIC_GEOPOLITICAL_RISK_WATCH: GeopoliticalRiskWatch = {
    score: 0.22,
    band: "Low Risk",
    explanation: "De-escalation dominates. Hormuz traffic continues and US-Iran talks remain active.",
    eventCount: 0,
};

/** Static Risk Mode — live Calendar & News uses `buildRiskModeDisplayFromScore`. */
export const STATIC_RISK_MODE_DISPLAY: RiskModeDisplay = buildRiskModeDisplayFromScore(0);

/** Static Market Heatmap tiles — matches design reference. */
export const STATIC_MARKET_HEATMAP_TILES: MarketHeatmapTile[] = [
    { symbol: "USD", value: 6.5, label: "Bullish" },
    { symbol: "EUR", value: -5.5, label: "Bearish" },
    { symbol: "GBP", value: 2.5, label: "Mild Bearish" },
    { symbol: "JPY", value: 3.5, label: "Mild Bullish" },
    { symbol: "AUD", value: -7.0, label: "Strong Bearish" },
    { symbol: "NZD", value: 2.5, label: "Mild Bullish" },
    { symbol: "CAD", value: 1.0, label: "Neutral Bullish" },
    { symbol: "CHF", value: 1.0, label: "Neutral Bullish" },
    { symbol: "GOLD", value: 5.0, label: "Bullish" },
    { symbol: "OIL (WTI)", value: 0.5, label: "Volatile Neutral" },
];

/** Heatmap tile order: 8 currency tiles, then GOLD + OIL (WTI) as the wide commodity row. */
const HEATMAP_CURRENCY_SLOTS = ["USD", "EUR", "GBP", "JPY", "AUD", "NZD", "CAD", "CHF"] as const;

/** Consistent bias vocabulary from a normalized -10..+10 score (doc §31). */
export function heatmapLabelFromValue(value: number): string {
    if (value >= 5) return "Strong Bullish";
    if (value >= 2) return "Mild Bullish";
    if (value >= 0.5) return "Neutral Bullish";
    if (value > -0.5) return "Neutral";
    if (value > -2) return "Neutral Bearish";
    if (value > -5) return "Mild Bearish";
    return "Strong Bearish";
}

/** Raw Currency Health sum → -10..+10 so the documented 60/40 blend compares equal scales. */
export function normalizeMacroScore(macroScore: number): number {
    const clamped = Math.max(-5, Math.min(5, Number.isFinite(macroScore) ? macroScore : 0));
    return Number((clamped * 2).toFixed(1));
}

/**
 * Final Heatmap (doc §30/§32): currencies = Macro (Currency Health) 60% + Driver (Catalyst) 40%,
 * both on the -10..+10 scale. Gold/Oil have no macro coverage, so they use the driver score alone.
 */
export function buildMarketHeatmapTilesFromBoards(
    macroRows: { currency: string; macroScore: number }[],
    catalystBoard: { asset: string; driverScore: number }[],
): MarketHeatmapTile[] {
    const macroByCurrency = new Map(macroRows.map((r) => [r.currency, normalizeMacroScore(r.macroScore)]));
    const driverByAsset = new Map(catalystBoard.map((b) => [b.asset, normalizeDriverScore(b.driverScore)]));

    const currencyTiles: MarketHeatmapTile[] = HEATMAP_CURRENCY_SLOTS.map((currency) => {
        const macro = macroByCurrency.get(currency) ?? 0;
        const driver = driverByAsset.get(currency) ?? 0;
        const value = Number((macro * 0.6 + driver * 0.4).toFixed(1));
        return { symbol: currency, value, label: heatmapLabelFromValue(value) };
    });

    const goldValue = driverByAsset.get("GOLD") ?? 0;
    const oilValue = driverByAsset.get("OIL") ?? 0;

    return [
        ...currencyTiles,
        { symbol: "GOLD", value: goldValue, label: heatmapLabelFromValue(goldValue) },
        { symbol: "OIL (WTI)", value: oilValue, label: heatmapLabelFromValue(oilValue) },
    ];
}
