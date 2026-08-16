import { SCOREBOARD_UI } from "@/lib/calendarNewsScoreboardData";

export type NewsHeadlineRow = {
    news: string;
    source: string | null;
    publishedAt: string | null;
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
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "Medium", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "Low", bias: "up", score: -1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "High", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "Low", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "Medium", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "High", bias: "up", score: 1, summary: SUMMARY_TEXT },
  { news: NEWS_TEXT, source: "Sample feed", publishedAt: null, asset: "CAD", assetCode: "CAD", impact: "Low", bias: "up", score: -1, summary: SUMMARY_TEXT },
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
    if (/neutral|mix/.test(biasLower)) {
        return { bias: "flat", score: 0 };
    }

    let sign = 0;
    if (/bull/.test(biasLower) || rawScore > 0) sign = 1;
    else if (/bear/.test(biasLower) || rawScore < 0) sign = -1;

    if (sign === 0) return { bias: "flat", score: 0 };

    const magnitude = Math.abs(Number(rawScore));
    const score = sign * (magnitude >= 0.75 ? 1 : magnitude >= 0.375 ? 0.5 : 0.25);
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

/** Same primary-asset pick as Market Catalyst / News Headline (backend pickPrimaryAsset). */
function pickPrimaryAsset(
    assets: MarketDriverNewsDTO["assets"],
): MarketDriverNewsDTO["assets"][number] | null {
    if (!assets.length) return null;
    const scored = assets.filter((a) => a.score !== 0);
    const pool = scored.length > 0 ? scored : assets;
    return [...pool].sort((a, b) => {
        const mag = Math.abs(b.score) - Math.abs(a.score);
        if (mag !== 0) return mag;
        const rank = (x: string) => (x === "OIL" ? 0 : x === "GOLD" ? 1 : 2);
        const r = rank(a.asset) - rank(b.asset);
        if (r !== 0) return r;
        return a.asset.localeCompare(b.asset);
    })[0]!;
}

/**
 * Doc §34: one unique headline → one News table row (primary / highest-|score| asset).
 * Market Catalyst uses the same primary asset per headline (backend pickPrimaryAsset),
 * so the scoreboard stays 1:1 with what this table shows.
 */
export function mapMarketDriverNews(items: MarketDriverNewsDTO[]): NewsHeadlineRow[] {
    const rows: NewsHeadlineRow[] = [];

    for (const item of items) {
        const primary = pickPrimaryAsset(item.assets);
        if (!primary) continue;

        const aligned = alignDisplayScore(item.impact, primary.bias, primary.score);
        const asset = primary.asset || "—";
        rows.push({
            news: item.headline,
            source: item.source,
            publishedAt: item.publishedAt ?? item.createdAt,
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

/** Admin drill-down: one row per classified factor that can move Market Catalyst counts. */
export type CatalystFactorRow = {
    id: string;
    news: string;
    asset: string;
    impact: NewsHeadlineRow["impact"];
    bias: NewsHeadlineRow["bias"];
    score: number;
    summary: string;
    category: string;
    source: string | null;
    publishedAt: string | null;
    createdAt: string;
};

/**
 * Map admin news DTOs into catalyst factors (score ≠ 0 only).
 * Sorted newest first. Same primary-asset rule as the scoreboard.
 * Then collapses same-event paraphrases so the Factors dialog matches what
 * Market Catalyst counts (one outcome → one factor, pick strongest |score|).
 *
 * Oil→CAD mirror: when primary is OIL with Moderate/Extreme Bullish score (≥ +0.5),
 * also emit a CAD factor so the CAD View dialog matches the heatmap oil-support rule.
 */
export function mapCatalystFactors(items: MarketDriverNewsDTO[]): CatalystFactorRow[] {
    const rows: CatalystFactorRow[] = [];

    for (const item of items) {
        for (const candidate of item.assets) {
            if (!FFE_CATALYST_CURRENCIES.has(candidate.asset)) continue;
            const aligned = alignDisplayScore(item.impact, candidate.bias, candidate.score);
            if (aligned.score === 0) continue;
            const asset = candidate.asset;
            rows.push({
                id: `${item.id}:${asset}`,
                news: item.headline,
                asset,
                impact: item.impact,
                bias: aligned.bias,
                score: aligned.score,
                summary: summaryForAsset(item.headline, asset, aligned.score, item.summary),
                category: item.category,
                source: item.source,
                publishedAt: item.publishedAt,
                createdAt: item.createdAt,
            });
        }
    }

    rows.sort((a, b) => {
        const ta = Date.parse(a.publishedAt ?? a.createdAt) || 0;
        const tb = Date.parse(b.publishedAt ?? b.createdAt) || 0;
        return tb - ta;
    });

    return collapseCatalystFactorsForScoreboard(rows);
}

const FFE_CATALYST_CURRENCIES = new Set(["USD", "EUR", "GBP", "JPY", "CHF", "CAD", "AUD", "NZD"]);

/**
 * Mirror backend `oilCatalystCluster` / `eventFingerprint` exactly so Factors dialog
 * counts always match Market Catalyst scoreboard (no 4-outside / 5-inside drift).
 */
function oilEventFingerprint(headline: string): string | null {
    const h = headline.toLowerCase().replace(/\s+/g, " ").trim();

    if (
        /\biran/.test(h) &&
        /\b(centcom|u\.?s\.?\s+forces|us forces|u\.?s\.?\s+hits|us hits|cnn reports|american enemy|u\.?s\.?\s+strike|us strike)\b/.test(
            h,
        ) &&
        /\b(strike|strikes|struck|targets? hit|precision (?:weapons|munitions)|fired .{0,40}munition|military (sites|targets)|coastal (defense|defence|surveillance)|missile and drone|wheat storage|projectile)\b/.test(
            h,
        )
    ) {
        return "us-iran-military-strikes";
    }
    if (/\bcentcom\b/.test(h) && /\b(strike|strikes|struck|munition|military sites?|iran|hormuz)\b/.test(h)) {
        return "us-iran-military-strikes";
    }
    // Keep identical to backend: \bstrike\b does NOT match "strikes".
    if (/\btrump\b/.test(h) && /\biran\b/.test(h)) {
        if (/\b(strike|monday night|significant strike)\b/.test(h)) return "trump-iran-strike-plan";
        if (/\b(deal|achievable|negotiat|agreement|pressed .{0,20}agreement)\b/.test(h)) return "trump-iran-deal";
        if (/\b(hormuz|compensation|shielding|toll|shipping)\b/.test(h)) return "trump-iran-hormuz";
        if (/\b(dismantl|offensive strength|capabilit|resilience|depleted)\b/.test(h)) return "trump-iran-capability";
        return "trump-iran-remarks";
    }
    if (/\bhormuz\b/.test(h) && /\b(tankers?|shipping|waterway|reopening|strait|toll|irgc|missiles?)\b/.test(h)) {
        return "hormuz-shipping-disruption";
    }
    if (/\biran/.test(h) && /\bjordan/.test(h) && /\b(missiles?|ballistic|intercept|air ?base|airspace)\b/.test(h)) {
        return "iran-jordan-missile";
    }
    if (/\bbahrain\b/.test(h) && /\b(sirens?|radars?|c-ram|patriot|fifth fleet)\b/.test(h)) {
        return "bahrain-iran-alert";
    }
    if (
        /\biran/.test(h) &&
        /\b(bahrain|jordan|uae|qatar|kuwait)\b/.test(h) &&
        /\b(missiles?|sirens?|airspace|intercept|radars?|patriot|air ?base|tankers?)\b/.test(h)
    ) {
        return "iran-gulf-spillover";
    }
    if (
        /\b(wti|brent|crude)\b/.test(h) &&
        /\b(spike|spikes|rises?|advances?|jumps?|forecast|four-week|near \$\d|middle east|hormuz|iran|threatens? strikes?)\b/.test(
            h,
        )
    ) {
        return "wti-me-price-move";
    }
    if (/\biran/.test(h) && /demands?/.test(h) && /(shipping|ships|hormuz|routes?)/.test(h)) {
        return "iran-shipping-us-demands";
    }
    return null;
}

/** Same keys as backend `oilCatalystCluster` — Market Catalyst source of truth. */
function oilCatalystClusterKey(headline: string): string | null {
    const h = headline.toLowerCase().replace(/\s+/g, " ").trim();
    const deEscalation =
        /\b(ceasefire|reopen|reopening|de-?escalat|eases? oil|talks progress|negotiations progress|relief weighs)\b/.test(
            h,
        );

    const fp = oilEventFingerprint(headline);
    if (fp) {
        if (
            fp === "us-iran-military-strikes" ||
            fp === "iran-jordan-missile" ||
            fp === "bahrain-iran-alert" ||
            fp === "iran-gulf-spillover" ||
            fp === "wti-me-price-move" ||
            fp === "trump-iran-strike-plan"
        ) {
            return deEscalation ? "me-iran-de-escalation" : "me-iran-war-escalation";
        }
        if (fp === "trump-iran-hormuz" || fp === "hormuz-shipping-disruption" || fp === "iran-shipping-us-demands") {
            return deEscalation ? "me-iran-de-escalation" : "me-iran-war-escalation";
        }
        if (fp === "trump-iran-deal" || fp === "trump-iran-capability" || fp === "trump-iran-remarks") {
            return "trump-iran-briefing";
        }
        return fp;
    }

    if (/\btrump\b/.test(h) && /\biran\b/.test(h)) return "trump-iran-briefing";

    if (!deEscalation) {
        const warEscalation =
            (/\bcentcom\b/.test(h) &&
                /\b(strike|strikes|struck|munition|military|iran|hormuz|fighter|naval|drone)\b/.test(h)) ||
            (/\biran/.test(h) &&
                /\b(strike|strikes|struck|munition|projectile|irgc|hormuz|centcom|fighter|naval|military sites?|silo|wheat storage)\b/.test(
                    h,
                )) ||
            (/\bhormuz\b/.test(h) && /\b(closed|close|blockade|irgc|strike|missile|remain closed)\b/.test(h)) ||
            (/\b(wti|brent|crude)\b/.test(h) && /\b(iran|hormuz|strike|middle east|threatens? strikes?)\b/.test(h));
        if (warEscalation) return "me-iran-war-escalation";
    }

    return null;
}

function tokenSet(headline: string): Set<string> {
    return new Set(
        headline
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, " ")
            .split(/\s+/)
            .filter((t) => t.length > 2),
    );
}

function jaccard(a: Set<string>, b: Set<string>): number {
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    for (const t of a) if (b.has(t)) inter += 1;
    const union = a.size + b.size - inter;
    return union === 0 ? 0 : inter / union;
}

/** Mirror backend `likelySameEvent` so non-OIL assets also collapse the same way. */
function likelySameCatalystEvent(a: string, b: string): boolean {
    const fa = oilEventFingerprint(a);
    const fb = oilEventFingerprint(b);
    if (fa && fb && fa === fb) return true;

    const ca = oilCatalystClusterKey(a);
    const cb = oilCatalystClusterKey(b);
    if (ca && cb && ca === cb) return true;

    const ta = tokenSet(a);
    const tb = tokenSet(b);
    const jac = jaccard(ta, tb);
    if (jac >= 0.48) return true;

    const shared: string[] = [];
    for (const t of ta) if (tb.has(t)) shared.push(t);
    const filler = new Set(["senior", "officials", "official", "says", "said", "news", "post", "citing"]);
    const topicShared = shared.filter((t) => !filler.has(t));
    return jac >= 0.3 && topicShared.length >= 3;
}

/** Keep one principal per same-event cluster (highest |score|), matching Market Catalyst. */
export function collapseCatalystFactorsForScoreboard(rows: CatalystFactorRow[]): CatalystFactorRow[] {
    const byAsset = new Map<string, CatalystFactorRow[]>();
    for (const row of rows) {
        const list = byAsset.get(row.asset) ?? [];
        list.push(row);
        byAsset.set(row.asset, list);
    }

    const out: CatalystFactorRow[] = [];
    for (const [, list] of byAsset) {
        const principals: CatalystFactorRow[] = [];
        for (const entry of list) {
            // Same rule as backend collapseSameEventEntries: OIL uses oil cluster first.
            const idx = principals.findIndex((p) => {
                if (entry.asset === "OIL" && p.asset === "OIL") {
                    const ca = oilCatalystClusterKey(p.news);
                    const cb = oilCatalystClusterKey(entry.news);
                    if (ca && cb && ca === cb) return true;
                }
                return likelySameCatalystEvent(p.news, entry.news);
            });
            if (idx < 0) {
                principals.push(entry);
                continue;
            }
            if (Math.abs(entry.score) > Math.abs(principals[idx]!.score)) {
                principals[idx] = entry;
            }
        }
        out.push(...principals);
    }

    return out.sort((a, b) => {
        const ta = Date.parse(a.publishedAt ?? a.createdAt) || 0;
        const tb = Date.parse(b.publishedAt ?? b.createdAt) || 0;
        return tb - ta;
    });
}

export function formatCatalystFactorTime(iso: string | null | undefined): string {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Dubai",
    });
}

/** Relative age for admin audit (e.g. "2h ago", "1d ago"). */
export function formatCatalystFactorAge(iso: string | null | undefined, nowMs = Date.now()): string {
    if (!iso) return "Unknown age";
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return "Unknown age";
    const diff = Math.max(0, nowMs - t);
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 48) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
