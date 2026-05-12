import type { DynamicTable, TableColumn, TableRow } from "@/services/dynamicTable.service";

import { getCentralBankFlagEmoji, getCurrencyFlagEmoji } from "@/lib/currencyFlags";
import { FX_TMV_GAUGE_ZONES_DARK, FX_TMV_GAUGE_ZONES_LIGHT } from "@/lib/fxTmvGaugeZones";

const CURRENCY_CODES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "NZD", "MXN", "NOK", "SEK", "DKK", "PLN", "SGD", "HKD", "CZK"];

const EXCLUDED_ASSETS = new Set(
    ["gold", "crude oil", "silver", "nasdaq 100", "natural gas", "wheat srw", "corn", "cotton", "sugar"].map((s) => s.toLowerCase()),
);

const MONTH_ALIASES: string[][] = [
    ["january", "jan", "jan."],
    ["february", "feb", "feb."],
    ["march", "mar", "mar."],
    ["april", "apr", "apr."],
    ["may"],
    ["june", "jun", "jun."],
    ["july", "jul", "jul."],
    ["august", "aug", "aug."],
    ["september", "sep", "sept", "sep.", "sept."],
    ["october", "oct", "oct."],
    ["november", "nov", "nov."],
    ["december", "dec", "dec."],
];

export type CotOverviewRow = {
    id: string;
    symbolLabel: string;
    flagEmoji: string;
    changeInNcommDisplay: string;
    positionChangeDisplay: string;
    cotNetIndexPercent: number | null;
    cotNetIndexDisplay: string;
};

export type StrengthRow = { currency: string; score: number };

export type SeasonalityRow = { label: string; score: number };

export type CentralBankPolicyRow = {
    id: string;
    centralBank: string;
    flagEmoji: string;
    currentRate: string;
    lastChange: string;
    stance: string;
    stanceScore: number;
};

function getSortedColumns(table: DynamicTable): TableColumn[] {
    return [...(table.columns ?? [])].sort((a, b) => a.column_index - b.column_index);
}

function getSortedRows(table: DynamicTable): TableRow[] {
    return [...(table.rows ?? [])].sort((a, b) => a.row_index - b.row_index);
}

function getCellValue(row: TableRow, columnId: number): string | null {
    const cell = row.cells?.find((item) => item.table_column_id === columnId);
    return cell?.value?.toString().trim() ?? null;
}

function centralBankDisplayName(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/\(([^()]+)\)\s*$/);
    if (match?.[1]) return match[1].trim().toUpperCase();

    const normalized = trimmed.toLowerCase().replace(/[.,]/g, "").replace(/\s+/g, " ");
    const knownNames: Record<string, string> = {
        "federal reserve": "FED",
        "federal reserve system": "FED",
        "european central bank": "ECB",
        "bank of england": "BOE",
        "swiss national bank": "SNB",
        "reserve bank of australia": "RBA",
        "bank of canada": "BOC",
        "reserve bank of new zealand": "RBNZ",
        "bank of japan": "BOJ",
        "bank of the russian federation": "CBR",
        "central bank of the russian federation": "CBR",
        "bank of russia": "CBR",
        "people's bank of china": "PBOC",
        "peoples bank of china": "PBOC",
    };

    return knownNames[normalized] ?? trimmed;
}

/** Numeric stance used by Central Bank Policies gauges (−2.5…+2.5, TMV arc). Exported for FX Analyzer / other UIs. */
export function centralBankStanceScore(value: string): number {
    const normalized = value.trim().toLowerCase().replace(/[._-]/g, " ").replace(/\s+/g, " ");
    if (!normalized) return 0;
    if (normalized.includes("neutral") || normalized.includes("flat")) return 0;

    const isStrong = normalized.includes("strong") || normalized.includes("very");
    const isWeak = normalized.includes("weak") || normalized.includes("slight") || normalized.includes("mild");
    const isDovish = normalized.includes("dov");
    const isHawkish = normalized.includes("hawk") || normalized.includes("haw");

    if (isDovish && isHawkish) return 0;
    if (isDovish) return isStrong ? -2.5 : isWeak ? -0.5 : -1.5;
    if (isHawkish) return isStrong ? 2.5 : isWeak ? 0.5 : 1.5;
    return 0;
}

/** Map central-bank row label (e.g. FED, ECB, or ISO code from parentheses) → ISO currency. */
const CENTRAL_BANK_CODE_TO_CURRENCY: Record<string, string> = {
    FED: "USD",
    ECB: "EUR",
    BOE: "GBP",
    SNB: "CHF",
    RBA: "AUD",
    BOC: "CAD",
    RBNZ: "NZD",
    BOJ: "JPY",
    CBR: "RUB",
    PBOC: "CNY",
};

function resolveCurrencyForCentralBankRow(centralBankDisplay: string): string | null {
    const u = centralBankDisplay.trim().toUpperCase();
    if (/^[A-Z]{3}$/.test(u) && CURRENCY_CODES.includes(u)) return u;
    return CENTRAL_BANK_CODE_TO_CURRENCY[u] ?? null;
}

/** When policy row is missing, show the usual bank ticker (FED, ECB, …) for a currency. */
export function defaultCentralBankDisplayCodeForCurrency(currency: string): string {
    const c = currency.trim().toUpperCase();
    for (const [code, cur] of Object.entries(CENTRAL_BANK_CODE_TO_CURRENCY)) {
        if (cur === c) return code;
    }
    return c;
}

/**
 * Latest central-bank policy stance per ISO currency, from the same sheet as Fundamental Dashboard
 * “Central Bank Policies” (identifier `central_bank_policies`).
 */
export function buildCentralBankStanceByCurrency(
    table: DynamicTable | null,
): Record<string, { centralBank: string; stance: string; stanceScore: number }> {
    const rows = buildCentralBankPolicyRows(table);
    const byCurrency: Record<string, { centralBank: string; stance: string; stanceScore: number }> = {};
    for (const row of rows) {
        const currency = resolveCurrencyForCentralBankRow(row.centralBank);
        if (!currency) continue;
        byCurrency[currency] = {
            centralBank: row.centralBank,
            stance: row.stance,
            stanceScore: row.stanceScore,
        };
    }
    return byCurrency;
}

/** Light-mode text for neutral-ish TMV labels on white cards (gauges keep #FFFF00). */
export const FX_ANALYZER_TABLE_NEUTRAL_TEXT_LIGHT = "#b45309";

/** Text color for stance string — hawkish greens, dovish reds; neutral uses gauge yellow in dark, readable amber on light cards. */
export function centralBankStanceLabelColor(stance: string, isDark: boolean): string {
    const score = centralBankStanceScore(stance);
    const zones = isDark ? FX_TMV_GAUGE_ZONES_DARK : FX_TMV_GAUGE_ZONES_LIGHT;
    if (score < 0) return zones[1]!.color;
    if (score > 0) return zones[5]!.color;
    if (!isDark) return FX_ANALYZER_TABLE_NEUTRAL_TEXT_LIGHT;
    return zones[3]!.color;
}

function parseNumeric(value: string | null | undefined): number | null {
    if (value == null || value === "") return null;
    const normalized = value
        .toString()
        .replace(/[\u2212\u2012\u2013\u2014]/g, "-")
        .replace(/[^0-9.-]/g, "");
    const n = Number.parseFloat(normalized);
    return Number.isFinite(n) ? n : null;
}

function parsePercent0to100(raw: string | null): number | null {
    if (raw == null || raw.trim() === "") return null;
    const n = Number.parseFloat(raw.trim().replace(/,/g, "").replace(/%/g, ""));
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, n));
}

function normalizeAssetLabel(text: string): string {
    return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function isExcludedCotAsset(name: string): boolean {
    return EXCLUDED_ASSETS.has(normalizeAssetLabel(name));
}

function extractCodesFromText(text: string): string[] {
    const upper = text.toUpperCase();
    return [...new Set(CURRENCY_CODES.filter((code) => upper.includes(code)))];
}

function symbolKeyFromSentimentName(name: string): string {
    const codes = extractCodesFromText(name);
    if (codes.length === 1) return codes[0]!;
    const t = name.trim().toUpperCase();
    if (t.length >= 3 && /^[A-Z]{3}$/.test(t.slice(0, 3))) return t.slice(0, 3);
    return t.slice(0, 8) || "?";
}

function findCotNetIndexForName(cotRaw: DynamicTable, sentimentName: string): { percent: number | null; display: string } {
    const cols = getSortedColumns(cotRaw);
    if (cols.length < 2) return { percent: null, display: "N/A" };

    const currencyCol = cols[0]!;
    const netCol = cols[cols.length - 1]!;
    const codes = extractCodesFromText(sentimentName);
    const normalizedName = sentimentName.trim().toUpperCase();

    for (const row of getSortedRows(cotRaw)) {
        const curRaw = getCellValue(row, currencyCol.id);
        if (!curRaw) continue;
        const cur = curRaw.toUpperCase().trim();
        const match =
            codes.some((c) => cur === c || cur.includes(c)) ||
            (normalizedName.length >= 3 && cur.includes(normalizedName.slice(0, 3))) ||
            cur === normalizedName;

        if (!match) continue;

        const rawNet = getCellValue(row, netCol.id);
        const pct = parsePercent0to100(rawNet);
        const display = rawNet?.includes("%") ? rawNet : pct !== null ? `${Math.round(pct)}%` : rawNet ?? "N/A";
        return { percent: pct, display };
    }

    return { percent: null, display: "N/A" };
}

/**
 * Currency Pair Sentiment: col 0 = position change display, second-to-last = name/symbol, last = change in N.comm.
 * COT Raw Data: last column = net index 0–100% (matched by first column / currency codes).
 */
export function buildCotOverviewRows(sentiment: DynamicTable | null, cotRaw: DynamicTable | null): CotOverviewRow[] {
    if (!sentiment?.columns?.length) return [];

    const cols = getSortedColumns(sentiment);
    if (cols.length < 3) return [];

    const firstCol = cols[0]!;
    const nameCol = cols[cols.length - 2]!;
    const ncommCol = cols[cols.length - 1]!;

    const out: CotOverviewRow[] = [];

    for (const row of getSortedRows(sentiment)) {
        const nameRaw = getCellValue(row, nameCol.id);
        if (!nameRaw || isExcludedCotAsset(nameRaw)) continue;

        const positionChange = getCellValue(row, firstCol.id) ?? "—";
        const ncommRaw = getCellValue(row, ncommCol.id) ?? "—";

        const key = symbolKeyFromSentimentName(nameRaw);
        const flag = getCurrencyFlagEmoji(key);

        const { percent, display } = cotRaw ? findCotNetIndexForName(cotRaw, nameRaw) : { percent: null, display: "N/A" };

        out.push({
            id: `${row.id}-${nameRaw}`,
            symbolLabel: nameRaw.trim(),
            flagEmoji: flag,
            changeInNcommDisplay: ncommRaw,
            positionChangeDisplay: positionChange,
            cotNetIndexPercent: percent,
            cotNetIndexDisplay: display,
        });
    }

    return out;
}

/** 20 segments × 5% each; filled count = ceil(pct / 5), capped at 20. */
export function cotNetIndexFilledSegments(percent: number | null): number {
    if (percent === null || Number.isNaN(percent)) return 0;
    const clamped = Math.max(0, Math.min(100, percent));
    if (clamped <= 0) return 0;
    return Math.min(20, Math.ceil(clamped / 5));
}

/** Fundamental Currency Strength Index: first column = label, last column = score; sort high → low. */
export function buildFundamentalStrengthRows(table: DynamicTable | null): StrengthRow[] {
    if (!table?.columns?.length) return [];
    const cols = getSortedColumns(table);
    if (cols.length < 2) return [];

    const first = cols[0]!;
    const last = cols[cols.length - 1]!;
    const rows: StrengthRow[] = [];

    for (const row of getSortedRows(table)) {
        const currency = getCellValue(row, first.id);
        const score = parseNumeric(getCellValue(row, last.id));
        if (!currency || score === null) continue;
        rows.push({ currency: currency.trim(), score: Math.max(-5, Math.min(5, score)) });
    }

    rows.sort((a, b) => b.score - a.score);
    return rows;
}

function normalizeMonthHeader(h: string): string {
    return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function getCurrentMonthColumn(table: DynamicTable): TableColumn | null {
    const monthIndex = new Date().getMonth();
    const aliases = MONTH_ALIASES[monthIndex];
    const sortedColumns = getSortedColumns(table);
    const monthColumns = sortedColumns.filter((c) => c.column_index > 0);

    const matched = monthColumns.find((column) => {
        const normalized = normalizeMonthHeader(column.header ?? "");
        return aliases.some((alias) => normalized === alias || normalized.startsWith(alias));
    });
    if (matched) return matched;
    return monthColumns[monthIndex] ?? null;
}

/** Currency Seasonality: col 0 = asset label; current calendar month column = score (-5…+5). */
export function buildCurrencySeasonalityRows(table: DynamicTable | null): SeasonalityRow[] {
    if (!table?.columns?.length) return [];
    const firstCol = getSortedColumns(table)[0];
    const monthCol = getCurrentMonthColumn(table);
    if (!firstCol || !monthCol) return [];

    const rows: SeasonalityRow[] = [];
    for (const row of getSortedRows(table)) {
        const label = getCellValue(row, firstCol.id);
        const raw = getCellValue(row, monthCol.id);
        if (!label) continue;
        const score = parseNumeric(raw);
        if (score === null) continue;
        rows.push({ label: label.trim(), score: Math.max(-5, Math.min(5, score)) });
    }
    rows.sort((a, b) => b.score - a.score);
    return rows;
}

/** Display order for Economic Pulse Meter (design reference). */
const ECONOMIC_PULSE_CURRENCIES = ["USD", "EUR", "GBP", "AUD", "NZD", "CAD", "CHF", "JPY"] as const;

export type EconomicPulseRow = {
    currency: string;
    flagEmoji: string;
    /** 0–100 along bar; uses same piecewise scale as printed ticks (evenly spaced labels). */
    bluePct: number;
    /** 0–100 along bar; uses same piecewise scale as printed ticks (evenly spaced labels). */
    greenPct: number;
};

/** Tick values under the bar — labels are evenly spaced; marker math must follow these anchors. */
export const ECONOMIC_PULSE_SCALE_ANCHORS = [-10, -6, -2, 0, 2, 6, 10] as const;

/** Per-currency scores from Google Sheet tab "Fundamentals New" (Macroshift / Divergence). */
export type EconomicPulseSheetByCurrency = Record<string, { macroshift: number | null; divergence: number | null }>;

/**
 * Parse "Fundamentals New" grid where column A = bank (FED, ECB, …), F = Macroshift, G = Divergence.
 * Expect a range that includes columns A through G (e.g. `A180:G187`).
 */
export function parseFundamentalsNewPulseSheetGrid(grid: unknown[][] | null | undefined): EconomicPulseSheetByCurrency {
    const out: EconomicPulseSheetByCurrency = {};
    if (!grid?.length) return out;
    for (const row of grid) {
        if (!Array.isArray(row) || row.length < 6) continue;
        const bankLabel = String(row[0] ?? "").trim();
        if (!bankLabel) continue;
        const display = centralBankDisplayName(bankLabel);
        const currency = resolveCurrencyForCentralBankRow(display);
        if (!currency) continue;
        const macroRaw = row.length > 5 ? parseNumeric(String(row[5])) : null;
        const divRaw = row.length > 6 ? parseNumeric(String(row[6])) : null;
        out[currency] = {
            macroshift: macroRaw !== null ? Math.max(-10, Math.min(10, macroRaw)) : null,
            divergence: divRaw !== null ? Math.max(-10, Math.min(10, divRaw)) : null,
        };
    }
    return out;
}

/**
 * Map a score in [-10, 10] to horizontal % on the pulse bar.
 * Labels (−10, −6, −2, 0, +2, +6, +10) are evenly spaced visually, so we interpolate
 * piecewise between those values (not linear in raw score across the full width).
 * Example: −1 is halfway between −2 and 0 → halfway between their tick positions (~41.67%).
 */
export function economicPulseScoreToBarPct(score: number | null | undefined): number {
    if (score === null || score === undefined || Number.isNaN(score)) return 50;
    const s = Math.max(-10, Math.min(10, score));
    const anchors = ECONOMIC_PULSE_SCALE_ANCHORS;
    const n = anchors.length - 1;
    for (let i = 0; i < n; i++) {
        const v0 = anchors[i]!;
        const v1 = anchors[i + 1]!;
        if (s < v0 || s > v1) continue;
        const p0 = (i / n) * 100;
        const p1 = ((i + 1) / n) * 100;
        if (v1 === v0) return p0;
        const t = (s - v0) / (v1 - v0);
        return p0 + t * (p1 - p0);
    }
    return s >= anchors[anchors.length - 1]! ? 100 : 0;
}

/**
 * Economic Pulse Meter: blue = Macroshift score, green = Divergence score (−10…+10 from sheet).
 * Missing currency or null score → markers at neutral (50%).
 */
export function buildEconomicPulseRows(scores: EconomicPulseSheetByCurrency | null | undefined): EconomicPulseRow[] {
    const map = scores ?? {};
    return ECONOMIC_PULSE_CURRENCIES.map((code) => ({
        currency: code,
        flagEmoji: getCurrencyFlagEmoji(code),
        bluePct: economicPulseScoreToBarPct(map[code]?.macroshift ?? null),
        greenPct: economicPulseScoreToBarPct(map[code]?.divergence ?? null),
    }));
}

/**
 * Central Bank policies: col0 = central bank, col1 = current rate, col2 = next meeting, col3 = last change.
 */
export function buildCentralBankPolicyRows(table: DynamicTable | null): CentralBankPolicyRow[] {
    if (!table?.columns?.length) return [];
    const cols = getSortedColumns(table);
    if (cols.length < 5) return [];

    const c0 = cols[0]!;
    const c1 = cols[1]!;
    const c3 = cols[3]!;
    const c4 = cols[4]!;

    const out: CentralBankPolicyRow[] = [];
    for (const row of getSortedRows(table)) {
        const centralBank = getCellValue(row, c0.id);
        if (!centralBank) continue;
        const displayName = centralBankDisplayName(centralBank);
        const stance = getCellValue(row, c4.id) ?? "Neutral";

        out.push({
            id: String(row.id),
            centralBank: displayName,
            flagEmoji: getCentralBankFlagEmoji(displayName),
            currentRate: getCellValue(row, c1.id) ?? "—",
            lastChange: getCellValue(row, c3.id) ?? "—",
            stance,
            stanceScore: centralBankStanceScore(stance),
        });
    }

    return out;
}

/** Parses the Risk On/Off sheet cell (0–100) used by the fundamental dashboard gauge. */
export function parseRiskModeSheetValue(value: unknown): number {
    const n = Number.parseFloat(String(value ?? "").replace(/[^0-9.-]/g, ""));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, n));
}
