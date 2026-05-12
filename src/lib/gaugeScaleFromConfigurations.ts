import type { FxAnalyzerScoreGaugeType } from "@/lib/fxAnalyzerGaugeDefaults";

/** Overall numeric span for mapping the needle: min of all zone mins, max of all zone maxes. */
export function gaugeScaleFromConfigurations(
    configs: { min_value: number; max_value: number }[],
    type: FxAnalyzerScoreGaugeType,
): { min: number; max: number } {
    if (configs.length > 0) {
        const min = Math.min(...configs.map((c) => Number(c.min_value)));
        const max = Math.max(...configs.map((c) => Number(c.max_value)));
        if (Number.isFinite(min) && Number.isFinite(max) && min < max) {
            return { min, max };
        }
    }
    if (type === "gauge") {
        return { min: -100, max: 100 };
    }
    return { min: -25, max: 25 };
}
