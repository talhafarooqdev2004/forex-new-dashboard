import type { ColorConfiguration } from "@/services/colorConfiguration.service";

export type FxGaugeZone = {
    name: string;
    minValue: number;
    maxValue: number;
    color: string;
};

/** Build sorted gauge bands from admin score-configuration rows (same DB as forex-admin). */
export function gaugeZonesFromConfigurations(rows: ColorConfiguration[]): FxGaugeZone[] {
    if (!rows.length) return [];
    return [...rows]
        .map((r) => ({
            name: String(r.name || "").trim() || "Zone",
            minValue: Number(r.min_value),
            maxValue: Number(r.max_value),
            color: String(r.color || "#FFFF00"),
        }))
        .filter((z) => Number.isFinite(z.minValue) && Number.isFinite(z.maxValue))
        .sort((a, b) => a.minValue - b.minValue);
}
