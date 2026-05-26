import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";

/**
 * Horizontal fill gradient for currency strength bars (−5…+5).
 * Stronger scores use darker greens (or reds); weaker scores use lighter tints.
 * Shared by Fundamental Currency Strength Index, Currency Seasonality, and Technical Dashboard Currency Strength Index.
 */
export function getCurrencyStrengthIndexBarGradient(score: number): string {
    const { strongBuy, buy, weakBuy, strongSell, sell, weakSell } = GAUGE_SIGNAL_COLORS;

    if (score >= 5) return `linear-gradient(90deg, ${strongBuy} 0%, ${buy} 100%)`;
    if (score >= 4) return `linear-gradient(90deg, ${strongBuy} 0%, ${weakBuy} 100%)`;
    if (score >= 3) return `linear-gradient(90deg, ${buy} 0%, ${weakBuy} 100%)`;
    if (score >= 2) return `linear-gradient(90deg, ${buy} 0%, #62d900 100%)`;
    if (score >= 1) return `linear-gradient(90deg, ${weakBuy} 0%, #7cc900 100%)`;
    if (score > 0) return "linear-gradient(90deg, #9bb800 0%, #c7bf00 100%)";

    if (score <= -5) return "linear-gradient(90deg, #5A0404 0%, #D30000 100%)";
    if (score <= -4) return `linear-gradient(90deg, ${strongSell} 0%, ${sell} 100%)`;
    if (score <= -3) return `linear-gradient(90deg, ${strongSell} 0%, #ff4800 100%)`;
    if (score <= -2) return `linear-gradient(90deg, ${sell} 0%, #ff4b12 100%)`;
    if (score <= -1) return `linear-gradient(90deg, #ff8a24 0%, #ff5a16 100%)`;
    if (score < 0) return `linear-gradient(90deg, ${weakSell} 0%, #ff7a16 100%)`;

    return "transparent";
}
