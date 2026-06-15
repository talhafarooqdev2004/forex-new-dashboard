import { formatPrice, pipSize } from "@/lib/technicalLevelsPrice";

export type TradeEvaluation = {
    statusLabel: string;
    isPending: boolean;
    /** Set when the trade should auto-close. */
    terminal: "tp3" | "sl" | null;
    exitPrice: number | null;
    outcome: "Profit" | "Loss" | null;
};

function isBuyDirection(direction: string): boolean {
    return direction.toLowerCase().startsWith("buy");
}

/** Has the live price reached the entry from the side recorded at creation? (mirrors the backend worker) */
function reachedEntry(side: string | null | undefined, entry: number, price: number): boolean {
    if (side === "down") return price <= entry; // entry was below price at creation -> wait for a fall
    if (side === "up") return price >= entry; // entry was above price at creation -> wait for a rise
    return false; // unknown side -> wait for the worker to confirm activation
}

/**
 * Live status of a trade against the current price. Status is NOT latched — it reflects
 * where the price is right now. `terminal` signals the row should be closed.
 */
export function evaluateTrade(params: {
    entry: number | null;
    sl: number | null;
    tp1: number | null;
    tp2: number | null;
    tp3: number | null;
    direction: string;
    directionType: string;
    currentPrice: number | null;
    /** Whether a pending order has already activated (persisted by the backend worker). */
    activated?: boolean;
    /** Side the price must cross to activate ('down' = fall to entry, 'up' = rise to entry). */
    activationSide?: string | null;
}): TradeEvaluation {
    const { entry, sl, tp1, tp2, tp3, direction, directionType, currentPrice, activated, activationSide } = params;
    const baseType = directionType || (isBuyDirection(direction) ? "Buy" : "Sell");
    const isLimitOrStop = !/^(buy|sell)$/i.test(baseType.trim());

    // A pending order shows its direction-type status until the price reaches the entry from the
    // recorded side. We flip to active the instant the live price crosses entry (same rule as the
    // backend worker) so the terminal updates in real time, before the worker's next tick.
    if (isLimitOrStop && activated === false) {
        const reached =
            currentPrice !== null && entry !== null && reachedEntry(activationSide, entry, currentPrice);
        if (!reached) {
            return { statusLabel: baseType, isPending: true, terminal: null, exitPrice: null, outcome: null };
        }
        // price has reached entry -> treat as Open (worker will persist activated shortly)
    }

    if (currentPrice === null || entry === null) {
        return { statusLabel: "Open", isPending: false, terminal: null, exitPrice: null, outcome: null };
    }

    const buy = isBuyDirection(direction);
    const hit = (target: number | null, dir: "above" | "below") =>
        target !== null && (dir === "above" ? currentPrice >= target : currentPrice <= target);

    if (buy) {
        if (hit(sl, "below")) return { statusLabel: "SL Hit — Trade Close", isPending: false, terminal: "sl", exitPrice: sl, outcome: "Loss" };
        if (hit(tp3, "above")) return { statusLabel: "TP3 Achieved — Trade Close", isPending: false, terminal: "tp3", exitPrice: tp3, outcome: "Profit" };
        if (hit(tp2, "above")) return { statusLabel: "Open: TP2 Achieved", isPending: false, terminal: null, exitPrice: null, outcome: null };
        if (hit(tp1, "above")) return { statusLabel: "Open: TP1 Achieved", isPending: false, terminal: null, exitPrice: null, outcome: null };
    } else {
        if (hit(sl, "above")) return { statusLabel: "SL Hit — Trade Close", isPending: false, terminal: "sl", exitPrice: sl, outcome: "Loss" };
        if (hit(tp3, "below")) return { statusLabel: "TP3 Achieved — Trade Close", isPending: false, terminal: "tp3", exitPrice: tp3, outcome: "Profit" };
        if (hit(tp2, "below")) return { statusLabel: "Open: TP2 Achieved", isPending: false, terminal: null, exitPrice: null, outcome: null };
        if (hit(tp1, "below")) return { statusLabel: "Open: TP1 Achieved", isPending: false, terminal: null, exitPrice: null, outcome: null };
    }
    return { statusLabel: "Open", isPending: false, terminal: null, exitPrice: null, outcome: null };
}

/** Floating P/L in pips for an open trade (≈ SL pips at TP1, 2× at TP2, etc.). */
export function floatingPips(params: {
    entry: number | null;
    currentPrice: number | null;
    pair: string;
    direction: string;
}): number | null {
    const { entry, currentPrice, pair, direction } = params;
    if (entry === null || currentPrice === null) return null;
    const sign = isBuyDirection(direction) ? 1 : -1;
    return ((currentPrice - entry) / pipSize(pair)) * sign;
}

export type TradeSession = "Tokyo" | "London" | "New York";

/**
 * Active trading session based on Pakistan (Asia/Karachi) local time:
 *  - 01:00–11:00  -> Tokyo
 *  - 11:00–17:00  -> London
 *  - 17:00–24:00 (and 00:00–01:00) -> New York
 */
export function getActiveSession(date: Date = new Date()): TradeSession {
    const hourStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        hour: "numeric",
        hour12: false,
    }).format(date);
    // Intl can emit "24" for midnight in some environments; normalize to 0.
    const hour = Number.parseInt(hourStr, 10) % 24;

    if (hour >= 1 && hour < 11) return "Tokyo";
    if (hour >= 11 && hour < 17) return "London";
    return "New York";
}

export type DerivedSlTp = { sl: string; tp1: string; tp2: string; tp3: string };

/**
 * Derives Stop Loss and TP1/TP2/TP3 from the entry price and SL pips.
 * Buy:  SL below entry, TPs above.   Sell: SL above entry, TPs below.
 * TP1 = 1x SL pips, TP2 = 2x, TP3 = 3x.
 */
export function deriveSlTp(params: {
    entry: number;
    pair: string;
    direction: string;
    slPips: number;
}): DerivedSlTp | null {
    const { entry, pair, direction, slPips } = params;
    if (!Number.isFinite(entry) || !Number.isFinite(slPips) || slPips <= 0) return null;

    const delta = slPips * pipSize(pair);
    const isBuy = direction.toLowerCase().startsWith("buy");
    const sign = isBuy ? 1 : -1;

    return {
        sl: formatPrice(entry - sign * delta, pair),
        tp1: formatPrice(entry + sign * delta, pair),
        tp2: formatPrice(entry + sign * delta * 2, pair),
        tp3: formatPrice(entry + sign * delta * 3, pair),
    };
}

/**
 * Generates a unique Trade ID: `MDDYY-NN(H:MM)` (e.g. `61527-06(9:30)` for 15 Jun 2027, seq 06, 09:30).
 * Sequence increments per calendar-day prefix among existing IDs.
 */
export function generateTradeId(existingIds: Array<string | null | undefined>, date: Date = new Date()): string {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const yy = String(date.getFullYear()).slice(-2);
    const prefix = `${month}${String(day).padStart(2, "0")}${yy}`;

    let maxSeq = 0;
    for (const id of existingIds) {
        if (!id) continue;
        const match = new RegExp(`^${prefix}-(\\d+)\\(`).exec(id.trim());
        if (match) maxSeq = Math.max(maxSeq, Number.parseInt(match[1], 10));
    }

    const seq = String(maxSeq + 1).padStart(2, "0");
    const hour = date.getHours();
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${prefix}-${seq}(${hour}:${minute})`;
}
