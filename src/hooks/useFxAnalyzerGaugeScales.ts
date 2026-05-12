"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { defaultFxGaugeConfigurationsForType, type FxAnalyzerScoreGaugeType } from "@/lib/fxAnalyzerGaugeDefaults";
import { gaugeScaleFromConfigurations } from "@/lib/gaugeScaleFromConfigurations";
import { gaugeZonesFromConfigurations, type FxGaugeZone } from "@/lib/gaugeZonesFromConfigurations";
import { getColorConfigurations, type ColorConfiguration } from "@/services/colorConfiguration.service";

const FX_TYPES: FxAnalyzerScoreGaugeType[] = ["gauge", "fundamental", "trend", "momentum", "sentiment"];

export type FxAnalyzerGaugeScaleMap = Record<FxAnalyzerScoreGaugeType, { min: number; max: number }>;

export type FxAnalyzerGaugeZonesMap = Record<FxAnalyzerScoreGaugeType, FxGaugeZone[]>;

function defaultScalesAndZones(): { scales: FxAnalyzerGaugeScaleMap; zones: FxAnalyzerGaugeZonesMap } {
    const scales = {} as FxAnalyzerGaugeScaleMap;
    const zones = {} as FxAnalyzerGaugeZonesMap;
    for (const type of FX_TYPES) {
        const def = defaultFxGaugeConfigurationsForType(type);
        scales[type] = gaugeScaleFromConfigurations(def, type);
        zones[type] = gaugeZonesFromConfigurations(def);
    }
    return { scales, zones };
}

function configsOrDefaults(type: FxAnalyzerScoreGaugeType, rows: ColorConfiguration[]): ColorConfiguration[] {
    if (rows.length > 0) return rows;
    return defaultFxGaugeConfigurationsForType(type);
}

export function useFxAnalyzerGaugeScales(authToken: string | null) {
    const initial = useMemo(() => defaultScalesAndZones(), []);
    const [scales, setScales] = useState<FxAnalyzerGaugeScaleMap>(initial.scales);
    const [zonesByType, setZonesByType] = useState<FxAnalyzerGaugeZonesMap>(initial.zones);
    const [ready, setReady] = useState(false);

    const load = useCallback(async () => {
        try {
            const results = await Promise.all(FX_TYPES.map((type) => getColorConfigurations(type, authToken)));
            const next = {} as FxAnalyzerGaugeScaleMap;
            const nextZones = {} as FxAnalyzerGaugeZonesMap;
            FX_TYPES.forEach((type, i) => {
                const rows = results[i] ?? [];
                const effective = configsOrDefaults(type, rows);
                next[type] = gaugeScaleFromConfigurations(effective, type);
                nextZones[type] = gaugeZonesFromConfigurations(effective);
            });
            setScales(next);
            setZonesByType(nextZones);
        } catch {
            const fallback = defaultScalesAndZones();
            setScales(fallback.scales);
            setZonesByType(fallback.zones);
        } finally {
            setReady(true);
        }
    }, [authToken]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        const onFocus = () => void load();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [load]);

    return { scales, zonesByType, ready, reload: load };
}
