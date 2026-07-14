import { SCOREBOARD_UI } from "@/lib/calendarNewsScoreboardData";

export type NewsHeadlineRow = {
    news: string;
    asset: string;
    assetCode: string | null;
    impact: "High" | "Medium" | "Low";
    bias: "up" | "down" | "flat";
    score: number;
    summary: string;
};

const NEWS_TEXT = "Canada: Energy-driven CPI rise supports BoC hold - RBC";
const SUMMARY_TEXT = "Energy CPI supports BoC hawkish stance";

/** Static placeholder rows — replace with live data when backend is wired. */
export const STATIC_NEWS_HEADLINE_ROWS: NewsHeadlineRow[] = [
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "Medium", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "Low", bias: "up", score: -1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "High", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "Low", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "Medium", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "High", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, asset: "CAD", assetCode: "CAD", impact: "Low", bias: "up", score: -1, summary: SUMMARY_TEXT },
];

export function newsImpactTextColor(impact: NewsHeadlineRow["impact"]): string {
    if (impact === "High") return SCOREBOARD_UI.green;
    if (impact === "Medium") return SCOREBOARD_UI.orange;
    return SCOREBOARD_UI.red;
}

export function newsScoreTextColor(score: number): string {
    if (score > 0) return SCOREBOARD_UI.green;
    if (score < 0) return SCOREBOARD_UI.red;
    // Match flat/neutral bias arrow — always visible in dark & light.
    return SCOREBOARD_UI.orange;
}

export function formatNewsScore(score: number): string {
    const n = Number(score);
    if (!Number.isFinite(n) || Math.abs(n) < 1e-9) return "0";
    if (n > 0) return `+${n}`;
    return String(n);
}

/** Shape from `GET /api/v1/admin/market-driver-news` (admin-only, live Groq-classified drivers). */
export type MarketDriverNewsDTO = {
    id: string;
    headline: string;
    source: string | null;
    category: string;
    impact: "High" | "Medium" | "Low";
    summary: string | null;
    assets: { asset: string; bias: string; score: number }[];
    publishedAt: string | null;
    createdAt: string;
};

/**
 * Doc §22 + UI Impact column: High = strong (±1), Medium = mild (±0.5), Low = 0.
 * Sign from bias/score. Keeps the headline table consistent even if a stored row predates the fix.
 */
function alignDisplayScore(
    impact: NewsHeadlineRow["impact"],
    biasRaw: string | undefined,
    rawScore: number,
): { bias: NewsHeadlineRow["bias"]; score: number } {
    const biasLower = String(biasRaw ?? "").toLowerCase();
    if (impact === "Low" || /neutral|mix/.test(biasLower)) {
        return { bias: "flat", score: 0 };
    }

    let sign = 0;
    if (/bull/.test(biasLower) || rawScore > 0) sign = 1;
    else if (/bear/.test(biasLower) || rawScore < 0) sign = -1;

    if (sign === 0) return { bias: "flat", score: 0 };

    const score = sign * (impact === "High" ? 1 : 0.5);
    return { bias: score > 0 ? "up" : "down", score };
}

/**
 * Whether a stored one-line summary fits the asset shown in this row (doc §34).
 * Shared "oil risk" text is wrong when the row’s asset is GOLD / USD / CAD, etc.
 */
function summaryFitsAsset(summary: string, asset: string): boolean {
    const s = summary.trim();
    if (!s) return false;
    const a = asset.toUpperCase();
    const oilCentric = /\boil\b|\bbrent\b|\bwti\b|\bcrude\b/i.test(s);
    const mentionsAsset =
        a === "OIL"
            ? oilCentric || /\boil\b/i.test(s)
            : a === "GOLD"
              ? /\bgold\b|safe[- ]?haven/i.test(s)
              : new RegExp(`\\b${a}\\b`, "i").test(s);

    if (mentionsAsset) return true;
    // Oil-mechanism copy is only valid on OIL (and CAD when CAD is named — handled above).
    if (oilCentric && a !== "OIL") return false;
    // Generic risk / policy reasons without naming the wrong commodity are OK.
    return !oilCentric;
}

/** Short per-asset explanation when the stored summary targets a different asset. */
function summaryForAsset(
    headline: string,
    asset: string,
    score: number,
    stored: string | null | undefined,
): string {
    const cleaned = (stored ?? "").replace(/\s+/g, " ").trim();
    if (cleaned && summaryFitsAsset(cleaned, asset)) return cleaned;

    const h = headline.toLowerCase();
    const bullish = score > 0;
    const bearish = score < 0;

    if (/\b(brent|wti|crude).{0,40}\b(down|fell|drop|settle|settles|lower)\b/i.test(headline) || /\bdown\b.{0,20}\b(brent|wti|crude)/i.test(headline)) {
        if (asset === "CAD") return "Oil weakness weighs on CAD";
        if (asset === "OIL") return "Brent settle confirms oil weakness";
        return bearish ? `${asset} pressured with oil` : `Oil move supports ${asset}`;
    }
    if (/\b(brent|wti|crude).{0,40}\b(up|rise|rises|gain|higher)\b/i.test(headline)) {
        if (asset === "CAD") return "Oil strength supports CAD";
        if (asset === "OIL") return "Crude strength lifts oil";
        return bullish ? `Crude strength supports ${asset}` : `Crude move weighs on ${asset}`;
    }
    if (/\b(aircraft\s+carriers?|missile range|military options|nuclear sites)\b/i.test(headline)) {
        if (asset === "GOLD") return bullish ? "Escalation supports safe-haven gold" : "Relief weighs on gold";
        if (asset === "USD" || asset === "JPY" || asset === "CHF") {
            return bullish ? `Risk-off supports ${asset}` : `Risk tone weighs on ${asset}`;
        }
        if (asset === "OIL" || asset === "CAD") {
            return bullish ? "Escalation raises oil risk" : "De-escalation eases oil risk";
        }
        return bullish ? `Escalation supports ${asset}` : `De-escalation weighs on ${asset}`;
    }
    if (/\b(russia|russian).{0,50}(energy|oil|sanction)/i.test(h) || /\brussia energy buyers\b/i.test(h)) {
        if (asset === "OIL" || asset === "CAD") return "Energy sanctions support oil";
        return bullish ? `Russia sanctions support ${asset}` : `Russia sanctions weigh on ${asset}`;
    }
    if (bullish) return `Positive catalyst supports ${asset}`;
    if (bearish) return `Negative catalyst weighs on ${asset}`;

    // Neutral (score 0) — say why bias is flat, not "unclear".
    if (/\b(inflation|cpi|price).{0,40}(return|back|toward|to)\b.{0,20}(2%|target|medium term)/i.test(h) ||
        /\binflation expectations?.{0,20}(anchored|firm)/i.test(h)) {
        return `Inflation on-target keeps ${asset} bias neutral`;
    }
    if (/\b(midpoint|fixing|reference rate)\b/i.test(h) && /\b(pboc|yuan|cny)\b/i.test(h)) {
        return `Yuan fixing estimate leaves ${asset} bias neutral`;
    }
    if (/\b(rbnz|boe|ecb|fed|pboc|conway|powell|waller)\b/i.test(h)) {
        return `Policy comment keeps ${asset} bias neutral`;
    }
    return cleaned || `No clear directional signal for ${asset}`;
}

/**
 * Doc §34: one unique headline → one News table row (primary / highest-|score| asset).
 * Market Catalyst uses the same primary asset per headline (backend pickPrimaryAsset),
 * so the scoreboard stays 1:1 with what this table shows.
 */
export function mapMarketDriverNews(items: MarketDriverNewsDTO[]): NewsHeadlineRow[] {
    const rows: NewsHeadlineRow[] = [];

    for (const item of items) {
        if (!item.assets.length) continue;

        const scored = item.assets.filter((a) => a.score !== 0);
        const pool = scored.length > 0 ? scored : item.assets;
        // Prefer largest |score|; on ties prefer OIL, then GOLD, then FX alpha order.
        const primary = [...pool].sort((a, b) => {
            const mag = Math.abs(b.score) - Math.abs(a.score);
            if (mag !== 0) return mag;
            const rank = (x: string) => (x === "OIL" ? 0 : x === "GOLD" ? 1 : 2);
            const r = rank(a.asset) - rank(b.asset);
            if (r !== 0) return r;
            return a.asset.localeCompare(b.asset);
        })[0]!;

        const aligned = alignDisplayScore(item.impact, primary.bias, primary.score);
        const asset = primary.asset || "—";
        rows.push({
            news: item.headline,
            asset,
            assetCode: asset === "GOLD" || asset === "OIL" || asset === "—" ? null : asset,
            impact: item.impact,
            bias: aligned.bias,
            score: aligned.score,
            summary: summaryForAsset(item.headline, asset, aligned.score, item.summary),
        });
    }

    return rows;
}
