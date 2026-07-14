/**
 * Currency Health Board / Macro Score (doc §§5–17).
 *
 * Primary (±1 / 0) — only these four:
 *   GDP / official growth, headline CPI, official unemployment rate, policy-rate decision.
 * Secondary (±0.5 / 0) — every other economic indicator (PMI, retail, NFP, PPI, claims, …).
 *
 * Positive: improves vs previous AND beats forecast (and is supportive for the currency).
 * Negative: worsens vs previous AND misses forecast.
 * Mixed / in-line / missing figures → 0.
 *
 * Macro Score = Σ primary + Σ secondary (doc §16).
 */

export type HealthFactorClass = "primary" | "secondary";

export type HealthDirection = "higher_better" | "lower_better";

export type CurrencyHealthEventInput = {
    event: string;
    actual: string | null;
    forecast: string | null;
    previous: string | null;
};

const GDP_TRACKER_RE =
    /\b(gdpnow|gdp now|niesr|tracker|tracking estimate|nowcast|flash estimate)\b/i;
const INFLATION_RE =
    /\b(cpi|consumer price|headline inflation|inflation rate|ppi|producer price)\b/i;
const HAWKISH_POLICY_RE =
    /\b(hawkish|tighten(?:ing)?|rate hike|higher rates?|restrictive policy)\b/i;
const DOVISH_POLICY_RE =
    /\b(dovish|eas(?:e|ing)|rate cut|lower rates?|accommodative policy)\b/i;

function parseFigure(raw: string | null | undefined): number | null {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (!trimmed || trimmed === "—" || trimmed === "-") return null;

    const match = /^(-?[\d,.]+)\s*(K|M|B|%)?$/i.exec(trimmed);
    if (!match) return null;

    const num = Number.parseFloat(match[1]!.replace(/,/g, ""));
    if (!Number.isFinite(num)) return null;

    const suffix = match[2]?.toUpperCase();
    if (suffix === "K") return num * 1e3;
    if (suffix === "M") return num * 1e6;
    if (suffix === "B") return num * 1e9;
    return num;
}

function normalizeEventName(event: string): string {
    return event.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Doc §6 / §17 — only these four are Primary; everything else is Secondary. */
export function classifyHealthFactor(eventName: string): HealthFactorClass {
    const e = normalizeEventName(eventName);

    // Core CPI / Core inflation → Secondary (doc §9 supporting only; §12 list).
    if (/\bcore\b/.test(e) && (/\bcpi\b/.test(e) || /inflation/.test(e))) {
        return "secondary";
    }

    // GDP trackers / nowcasts are Secondary, not the official growth release.
    if ((/\bgdp\b/.test(e) || /gross domestic product/.test(e)) && GDP_TRACKER_RE.test(e)) {
        return "secondary";
    }
    if (/\bgdp\b/.test(e) || /gross domestic product/.test(e)) return "primary";

    // Headline CPI / official headline consumer inflation (not PPI, not core).
    if (
        (/\bcpi\b/.test(e) || /consumer price/.test(e) || /headline inflation/.test(e) || /\binflation rate\b/.test(e)) &&
        !/\bppi\b/.test(e) &&
        !/producer/.test(e)
    ) {
        return "primary";
    }

    // Official unemployment rate only — NFP / claims / employment change stay Secondary (doc §10/§12).
    if (
        /unemployment rate/.test(e) ||
        (/unemployment/.test(e) && !/claim/.test(e) && !/insurance/.test(e) && !/benefit/.test(e))
    ) {
        if (/employment change|nonfarm|nfp|payroll|adp|jobless|claimant|wage|average earnings/.test(e)) {
            return "secondary";
        }
        return "primary";
    }

    // Official policy-rate decision (doc §11).
    if (
        /interest rate decision|rate decision|cash rate|bank rate|fed funds|federal funds|refi rate|refinance rate|deposit facility|ocr\b|policy rate|overnight rate/.test(
            e,
        ) ||
        (/\brate\b/.test(e) && /decision|announcement|sets|hike|cut/.test(e) && !/bond|yield|swap/.test(e))
    ) {
        return "primary";
    }

    return "secondary";
}

/** Doc §14 — economic meaning, not raw numeric increase. */
export function healthDirectionForEvent(eventName: string): HealthDirection {
    const e = normalizeEventName(eventName);

    // Lower is normally positive (doc §14).
    if (
        /unemployment rate/.test(e) ||
        (/unemployment/.test(e) && !/employment change|payroll|nfp|adp/.test(e)) ||
        /jobless claims|initial claims|continuing claims|claimant count/.test(e) ||
        /government borrowing|budget deficit|fiscal deficit/.test(e) ||
        /\btrade deficit\b/.test(e) ||
        /\bcurrent account deficit\b/.test(e)
    ) {
        return "lower_better";
    }

    // Trade surplus / signed trade balance: larger surplus (higher) is positive (doc §14).
    // Absolute "trade deficit" handled above as lower_better.
    return "higher_better";
}

function magnitude(factor: HealthFactorClass): number {
    return factor === "primary" ? 1 : 0.5;
}

/**
 * Doc §9 — inflation uses the same beat+improve / miss+worsen gate as other factors.
 * Default FX interpretation: higher headline CPI → tighter-policy support for the currency.
 * Explicit dovish/hawkish wording in the event label can veto a conflicting print.
 */
function inflationPolicySign(eventName: string): 1 | -1 | 0 | null {
    if (!INFLATION_RE.test(eventName)) return null;
    if (HAWKISH_POLICY_RE.test(eventName)) return 1;
    if (DOVISH_POLICY_RE.test(eventName)) return -1;
    return 0; // no explicit wording → use numeric direction (higher = currency-supportive)
}

/**
 * Single-release Currency Health contribution (doc §§7/13).
 * Returns +mag, -mag, or 0.
 */
export function scoreCurrencyHealthEvent(input: CurrencyHealthEventInput): number {
    const actual = parseFigure(input.actual);
    const forecast = parseFigure(input.forecast);
    const previous = parseFigure(input.previous);

    // Doc §13: missing previous/forecast → 0; in-line prints → 0.
    if (actual === null || forecast === null || previous === null) return 0;
    if (actual === forecast || actual === previous) return 0;

    const factor = classifyHealthFactor(input.event);
    const direction = healthDirectionForEvent(input.event);
    const mag = magnitude(factor);

    const beatForecast = direction === "higher_better" ? actual > forecast : actual < forecast;
    const missForecast = direction === "higher_better" ? actual < forecast : actual > forecast;
    const improvedPrev = direction === "higher_better" ? actual > previous : actual < previous;
    const worsenedPrev = direction === "higher_better" ? actual < previous : actual > previous;

    // Mixed: beat but worsened, or miss but improved → 0 (doc §§7/13).
    if ((beatForecast && worsenedPrev) || (missForecast && improvedPrev)) return 0;

    const policy = inflationPolicySign(input.event);

    if (beatForecast && improvedPrev) {
        // Explicit dovish label conflicts with a “hot” inflation print → 0.
        if (policy === -1) return 0;
        return mag;
    }
    if (missForecast && worsenedPrev) {
        // Explicit hawkish label conflicts with a “cool” inflation print → 0.
        if (policy === 1) return 0;
        return -mag;
    }
    return 0;
}

/** Doc §16 — Currency Health Score = Σ primary + Σ secondary. */
export function sumCurrencyHealthScore(events: CurrencyHealthEventInput[]): number {
    let sum = 0;
    for (const e of events) {
        sum += scoreCurrencyHealthEvent(e);
    }
    return Number(sum.toFixed(1));
}
