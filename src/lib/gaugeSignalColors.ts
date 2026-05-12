import { FX_TMV_GAUGE_ZONES_DARK, type FxTmvGaugeZoneList } from "@/lib/fxTmvGaugeZones";

function zoneColor(list: FxTmvGaugeZoneList, name: string, fallback: string): string {
    return list.find((zone) => zone.name === name)?.color ?? fallback;
}

export const GAUGE_SIGNAL_COLORS = {
    strongSell: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Strong Sell", "#D30000"),
    sell: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Sell", "#FF0000"),
    weakSell: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Weak Sell", "#FF8C8C"),
    neutral: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Neutral", "#FFFF00"),
    weakBuy: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Weak Buy", "#2FE24B"),
    buy: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Buy", "#25B73C"),
    strongBuy: zoneColor(FX_TMV_GAUGE_ZONES_DARK, "Strong Buy", "#05871A"),
} as const;

export function gaugeSignalColorForTone(tone: "Bullish" | "Bearish" | "Neutral", _isDark: boolean): string {
    const z = FX_TMV_GAUGE_ZONES_DARK;
    const name = tone === "Bullish" ? "Buy" : tone === "Bearish" ? "Sell" : "Neutral";
    return z.find((x) => x.name === name)?.color ?? "#737373";
}
