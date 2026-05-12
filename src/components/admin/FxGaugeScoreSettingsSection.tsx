"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultFxGaugeConfigurationsForType, type FxAnalyzerScoreGaugeType } from "@/lib/fxAnalyzerGaugeDefaults";
import { gaugeScaleFromConfigurations } from "@/lib/gaugeScaleFromConfigurations";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    bulkUpdateColorConfigurations,
    getColorConfigurations,
    type ColorConfiguration,
    type ColorConfigurationPayload,
} from "@/services/colorConfiguration.service";

const GAUGE_RANGE_NAMES = [
    "Strong Sell",
    "Sell",
    "Weak Sell",
    "Neutral",
    "Weak Buy",
    "Buy",
    "Strong Buy",
] as const;

const FX_PANELS: { type: FxAnalyzerScoreGaugeType; title: string; description: string }[] = [
    {
        type: "gauge",
        title: "Net Bias gauge",
        description: "Score ranges for the Net Bias gauge on FX Analyzer Pro (overall span sets needle mapping).",
    },
    {
        type: "fundamental",
        title: "Fundamental gauge",
        description: "Ranges for the Fundamental gauge and related score colouring.",
    },
    {
        type: "trend",
        title: "Trend gauge",
        description: "Ranges for the Trend gauge and related score colouring.",
    },
    {
        type: "momentum",
        title: "Momentum gauge",
        description: "Ranges for the Momentum gauge.",
    },
    {
        type: "sentiment",
        title: "Sentiment gauge",
        description: "Ranges for the Sentiment gauge and related score colouring.",
    },
];

const REFERENCE_COLORS = [
    { name: "Strong Buy", value: "rgba(137, 243, 54, 0.843)" },
    { name: "Buy", value: "rgba(137, 243, 54, 0.575)" },
    { name: "Weak Buy", value: "rgba(137, 243, 54, 0.365)" },
    { name: "Neutral", value: "#FFFF00" },
    { name: "Weak Sell", value: "rgba(255, 119, 130, 0)" },
    { name: "Sell", value: "rgba(255, 119, 130, 0.575)" },
    { name: "Strong Sell", value: "rgb(255, 119, 130)" },
] as const;

function normalizeConfigs(type: FxAnalyzerScoreGaugeType, rows: ColorConfiguration[]): ColorConfiguration[] {
    if (rows.length > 0) return rows.map((r) => ({ ...r, type }));
    return defaultFxGaugeConfigurationsForType(type) as ColorConfiguration[];
}

function toPayloads(configs: ColorConfiguration[]): ColorConfigurationPayload[] {
    return configs.map((c) => ({
        type: c.type as ColorConfigurationPayload["type"],
        name: c.name,
        min_value: Number.isFinite(c.min_value) ? c.min_value : 0,
        max_value: Number.isFinite(c.max_value) ? c.max_value : 0,
        color: c.color || "#FFFF00",
    }));
}

export function FxGaugeScoreSettingsSection() {
    const { token } = useAuth();
    const [configsByType, setConfigsByType] = useState<Record<FxAnalyzerScoreGaugeType, ColorConfiguration[]>>({
        gauge: [],
        fundamental: [],
        trend: [],
        momentum: [],
        sentiment: [],
    });
    const [loading, setLoading] = useState(true);
    const [savingType, setSavingType] = useState<FxAnalyzerScoreGaugeType | null>(null);

    const loadAll = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        try {
            const [g, f, t, m, s] = await Promise.all([
                getColorConfigurations("gauge", token),
                getColorConfigurations("fundamental", token),
                getColorConfigurations("trend", token),
                getColorConfigurations("momentum", token),
                getColorConfigurations("sentiment", token),
            ]);
            setConfigsByType({
                gauge: normalizeConfigs("gauge", g),
                fundamental: normalizeConfigs("fundamental", f),
                trend: normalizeConfigs("trend", t),
                momentum: normalizeConfigs("momentum", m),
                sentiment: normalizeConfigs("sentiment", s),
            });
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Could not load gauge configurations");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) void loadAll();
    }, [token, loadAll]);

    const handleChange = (type: FxAnalyzerScoreGaugeType, index: number, field: keyof ColorConfiguration, value: string | number) => {
        setConfigsByType((prev) => {
            const list = [...prev[type]];
            const row = { ...list[index], [field]: value };
            list[index] = row;
            return { ...prev, [type]: list };
        });
    };

    const handleSave = async (type: FxAnalyzerScoreGaugeType, title: string) => {
        if (!token) return;
        setSavingType(type);
        try {
            const payloads = toPayloads(configsByType[type]);
            const updated = await bulkUpdateColorConfigurations(type, payloads, token);
            setConfigsByType((prev) => ({ ...prev, [type]: normalizeConfigs(type, updated) }));
            toast.success(`${title} saved`);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSavingType(null);
        }
    };

    const handleRemove = (type: FxAnalyzerScoreGaugeType, index: number) => {
        setConfigsByType((prev) => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index),
        }));
    };

    const scaleHints = useMemo(() => {
        const out: Record<FxAnalyzerScoreGaugeType, string> = {} as Record<FxAnalyzerScoreGaugeType, string>;
        for (const { type } of FX_PANELS) {
            const { min, max } = gaugeScaleFromConfigurations(configsByType[type], type);
            out[type] = `${min} … ${max}`;
        }
        return out;
    }, [configsByType]);

    if (!token) {
        return null;
    }

    if (loading) {
        return <p className="text-sm text-[rgb(var(--secondary))]">Loading FX gauge ranges…</p>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">FX Analyzer Pro — gauge ranges</h2>
                <p className="mt-1 text-sm text-[rgb(var(--secondary))]">
                    Same score-configuration model as the legacy admin app: each band has a min/max score and colour. The
                    needle on FX Analyzer Pro uses the overall span (lowest min to highest max across all bands).
                </p>
            </div>

            <div className="rounded-lg border border-stroke/60 bg-charcoal/40 p-4">
                <h3 className="text-sm font-semibold text-foreground">Reference colours</h3>
                <p className="mt-1 text-xs text-[rgb(var(--secondary))]">Click a value to copy (same palette as the legacy admin).</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {REFERENCE_COLORS.map((c) => (
                        <button
                            key={c.name}
                            type="button"
                            className="flex items-center gap-2 rounded-md border border-stroke bg-darkGrey px-2 py-2 text-left text-xs hover:bg-charcoal"
                            onClick={() => {
                                void navigator.clipboard.writeText(c.value);
                                toast.success(`Copied ${c.name}`);
                            }}
                        >
                            <span className="h-5 w-5 shrink-0 rounded border border-stroke" style={{ backgroundColor: c.value }} />
                            <span className="font-medium text-foreground">{c.name}</span>
                            <code className="ml-auto truncate text-[10px] text-[rgb(var(--secondary))]">{c.value}</code>
                        </button>
                    ))}
                </div>
            </div>

            <Accordion type="multiple" className="rounded-lg border border-stroke/60">
                {FX_PANELS.map(({ type, title, description }) => (
                    <AccordionItem key={type} value={type} className="border-stroke/60 px-2">
                        <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                            <span>
                                {title}
                                <span className="ml-2 text-xs font-normal text-[rgb(var(--secondary))]">
                                    (needle span: {scaleHints[type]})
                                </span>
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-1">
                            <p className="mb-4 text-sm text-[rgb(var(--secondary))]">{description}</p>
                            <div className="mb-4 flex flex-wrap justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={savingType !== null}
                                    onClick={() =>
                                        setConfigsByType((p) => ({
                                            ...p,
                                            [type]: defaultFxGaugeConfigurationsForType(type) as ColorConfiguration[],
                                        }))
                                    }
                                >
                                    Reset to defaults
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="bg-[rgb(var(--electric-blue))] text-white hover:brightness-110"
                                    disabled={savingType !== null}
                                    onClick={() => void handleSave(type, title)}
                                >
                                    {savingType === type ? "Saving…" : "Save changes"}
                                </Button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {configsByType[type].map((config, index) => (
                                    <div
                                        key={`${type}-${config.id}-${index}`}
                                        className="space-y-3 rounded-lg border border-stroke bg-charcoal/30 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h4 className="font-medium text-foreground">
                                                    {GAUGE_RANGE_NAMES[index] ?? `Band ${index + 1}`}
                                                </h4>
                                                <p className="text-xs text-[rgb(var(--secondary))]">
                                                    Range {config.min_value} … {config.max_value}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="shrink-0"
                                                onClick={() => handleRemove(type, index)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-[rgb(var(--secondary))]">Min value</Label>
                                                <Input
                                                    type="number"
                                                    className="mt-1 h-10 border-stroke bg-darkGrey"
                                                    value={Number.isFinite(config.min_value) ? String(config.min_value) : ""}
                                                    onChange={(e) =>
                                                        handleChange(type, index, "min_value", e.target.value === "" ? NaN : parseFloat(e.target.value))
                                                    }
                                                    step="0.01"
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-[rgb(var(--secondary))]">Max value</Label>
                                                <Input
                                                    type="number"
                                                    className="mt-1 h-10 border-stroke bg-darkGrey"
                                                    value={Number.isFinite(config.max_value) ? String(config.max_value) : ""}
                                                    onChange={(e) =>
                                                        handleChange(type, index, "max_value", e.target.value === "" ? NaN : parseFloat(e.target.value))
                                                    }
                                                    step="0.01"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-[rgb(var(--secondary))]">Colour</Label>
                                            <div className="mt-1 flex gap-2">
                                                <Input
                                                    type="color"
                                                    className="h-10 w-14 cursor-pointer border-stroke bg-darkGrey p-1"
                                                    value={/^#[0-9A-Fa-f]{6}$/i.test(config.color) ? config.color : "#ffff00"}
                                                    onChange={(e) => handleChange(type, index, "color", e.target.value)}
                                                />
                                                <Input
                                                    className="h-10 flex-1 border-stroke bg-darkGrey font-mono text-xs"
                                                    value={config.color}
                                                    onChange={(e) => handleChange(type, index, "color", e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="h-10 w-full rounded-md border border-stroke"
                                            style={{ backgroundColor: config.color }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {configsByType[type].length === 0 ? (
                                <p className="py-4 text-center text-sm text-[rgb(var(--secondary))]">No bands — add from defaults or save empty to clear.</p>
                            ) : null}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>

            <Button type="button" variant="outline" size="sm" onClick={() => void loadAll()} disabled={loading || savingType !== null}>
                Reload from server
            </Button>
        </div>
    );
}
