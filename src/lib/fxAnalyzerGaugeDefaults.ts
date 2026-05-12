/**
 * Default score zones aligned with `forex-admin` `ColorConfigurationsClient` / `useGaugeConfigurations`.
 * Net bias (`gauge`) uses the full −100…100 span; other FX Analyzer gauges use the same zone *shape*
 * scaled to ±25 so behaviour matches the previous hard-coded `maxAbsValue={25}` when no DB rows exist.
 */

import type { ColorConfigurationType } from "@/services/colorConfiguration.service";

export type FxAnalyzerScoreGaugeType = Extract<
    ColorConfigurationType,
    "gauge" | "fundamental" | "trend" | "momentum" | "sentiment"
>;

export type ColorConfigurationRow = {
    id: number | string;
    type: FxAnalyzerScoreGaugeType;
    name: string;
    min_value: number;
    max_value: number;
    color: string;
};

const TEMPLATE_ZONES: { name: string; min_value: number; max_value: number; color: string }[] = [
    { name: "Strong Sell", min_value: -100, max_value: -60, color: "rgb(255, 119, 130)" },
    { name: "Sell", min_value: -60, max_value: -20, color: "rgba(255, 119, 130, 0.575)" },
    { name: "Weak Sell", min_value: -20, max_value: -5, color: "rgba(255, 119, 130, 0)" },
    { name: "Neutral", min_value: -5, max_value: 5, color: "#FFFF00" },
    { name: "Weak Buy", min_value: 5, max_value: 20, color: "rgba(137, 243, 54, 0.365)" },
    { name: "Buy", min_value: 20, max_value: 60, color: "rgba(137, 243, 54, 0.575)" },
    { name: "Strong Buy", min_value: 60, max_value: 100, color: "rgba(137, 243, 54, 0.843)" },
];

function scaleZones(factor: number, type: FxAnalyzerScoreGaugeType): ColorConfigurationRow[] {
    return TEMPLATE_ZONES.map((z, index) => ({
        id: `default-${type}-${index}`,
        type,
        name: z.name,
        min_value: Math.round(z.min_value * factor * 1000) / 1000,
        max_value: Math.round(z.max_value * factor * 1000) / 1000,
        color: z.color,
    }));
}

/** Defaults used when the API returns no rows (matches legacy FX dashboard ranges). */
export function defaultFxGaugeConfigurationsForType(type: FxAnalyzerScoreGaugeType): ColorConfigurationRow[] {
    if (type === "gauge") {
        return scaleZones(1, type);
    }
    return scaleZones(0.25, type);
}
