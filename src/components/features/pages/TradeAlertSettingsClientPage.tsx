"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, Save, X, TrendingUp } from "lucide-react";

import {
    Button,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import Container from "@/components/ui/layout/Container";
import { useAuth } from "@/components/providers/AuthProvider";
import {
    FieldLabel,
    SETTINGS_GREEN,
    SettingsCheckbox,
    SettingsRadio,
    SettingsSection,
    SuffixInput,
} from "@/components/composed/trading-terminal/tradeAlertSettingsShared";
import AddTradeAlertPairDialog from "@/components/features/dialogs/AddTradeAlertPairDialog";
import ManagePairSlPresetsDialog from "@/components/features/dialogs/ManagePairSlPresetsDialog";
import { tradeAlertSettingsService, type TradeAlertPair } from "@/services";
import { cn } from "@/lib/utils";

const TRADE_ALERT_SETTINGS_PATH = "/trading-terminal/trade-alert-settings";

const DEFAULT_TYPES = ["Swing", "Scalping", "Intraday"] as const;

const ALERT_CHANNELS = [
    { id: "telegram", label: "Telegram", color: "#2B7FFF" },
    { id: "whatsapp", label: "WhatsApp", color: "#00A63E" },
    { id: "gmail", label: "Gmail", color: "#EA4335" },
    { id: "discord", label: "Discord", color: "#9810FA" },
    { id: "email", label: "Email (Gmail)", color: "#EA4335" },
    { id: "sms", label: "SMS", color: "#22d3ee" },
    { id: "platform", label: "Platform Notification", color: "#facc15" },
    { id: "push", label: "Push Notification (Mobile)", color: "#05df72" },
] as const;

const MESSAGE_FIELDS = [
    "Trade ID",
    "Symbol",
    "Direction",
    "Type",
    "Session",
    "Entry Price",
    "SL",
    "TP1",
    "TP2",
    "TP3",
    "Risk %",
    "Notes",
    "Current Price",
    "RRR",
] as const;

const TRADE_TYPES = ["Buy", "Sell", "Buy Limit", "Sell Limit", "Buy Stop", "Sell Stop"] as const;

const PREVIEW_VALUES: Record<string, string> = {
    "Trade ID": "T021",
    Symbol: "EURUSD",
    Direction: "Buy",
    Type: "Swing",
    Session: "London",
    "Entry Price": "1.0892",
    SL: "1.0780",
    TP1: "1.0950",
    TP2: "1.1000",
    TP3: "1.1050",
    "Risk %": "1.0%",
    Notes: "London breakout",
    "Current Price": "1.0905",
    RRR: "1:3",
};

const DEFAULT_STATE = {
    pairSymbol: "EURUSD",
    defaultType: "Swing",
    presetMode: "Swing",
    tp1Pct: "50%",
    tp2Pct: "25%",
    tp3Pct: "25%",
    defaultRisk: "1.0",
    tslActivateAfter: "tp1",
    tslChaseDistance: "10",
    alertChannels: Object.fromEntries(ALERT_CHANNELS.map((c) => [c.id, true])) as Record<string, boolean>,
    messageFields: Object.fromEntries(MESSAGE_FIELDS.map((f) => [f, true])) as Record<string, boolean>,
    tradeTypes: Object.fromEntries(TRADE_TYPES.map((t) => [t, true])) as Record<string, boolean>,
};

type SettingsState = typeof DEFAULT_STATE;

function mergeSettings(loaded: Partial<SettingsState> | null): SettingsState {
    if (!loaded) return DEFAULT_STATE;
    return {
        ...DEFAULT_STATE,
        ...loaded,
        alertChannels: { ...DEFAULT_STATE.alertChannels, ...(loaded.alertChannels ?? {}) },
        messageFields: { ...DEFAULT_STATE.messageFields, ...(loaded.messageFields ?? {}) },
        tradeTypes: { ...DEFAULT_STATE.tradeTypes, ...(loaded.tradeTypes ?? {}) },
    };
}

function ChannelIcon({ color, label }: { color: string; label: string }) {
    return (
        <span
            className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
            aria-hidden
        >
            {label.charAt(0)}
        </span>
    );
}

export { TRADE_ALERT_SETTINGS_PATH };

export default function TradeAlertSettingsClientPage() {
    const router = useRouter();
    const { isAdmin, ready } = useAuth();
    const [settings, setSettings] = useState<SettingsState>(DEFAULT_STATE);
    const [pairs, setPairs] = useState<TradeAlertPair[]>([]);
    const [addPairOpen, setAddPairOpen] = useState(false);
    const [managePresetsOpen, setManagePresetsOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);

    const update = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const toggleRecord = useCallback(
        (key: "alertChannels" | "messageFields" | "tradeTypes", id: string, checked: boolean) => {
            setSettings((prev) => ({
                ...prev,
                [key]: { ...prev[key], [id]: checked },
            }));
        },
        [],
    );

    const refetchPairs = useCallback(async (selectName?: string) => {
        const list = await tradeAlertSettingsService.listPairs();
        setPairs(list);
        setSettings((prev) => {
            if (selectName) return { ...prev, pairSymbol: selectName };
            if (list.length > 0 && !list.some((p) => p.name === prev.pairSymbol)) {
                return { ...prev, pairSymbol: list[0].name };
            }
            return prev;
        });
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [list, loaded] = await Promise.all([
                    tradeAlertSettingsService.listPairs(),
                    tradeAlertSettingsService.getSettings(),
                ]);
                if (!active) return;
                setPairs(list);
                setSettings(() => {
                    const merged = mergeSettings(loaded as Partial<SettingsState> | null);
                    if (list.length > 0 && !list.some((p) => p.name === merged.pairSymbol)) {
                        merged.pairSymbol = list[0].name;
                    }
                    return merged;
                });
            } catch {
                // keep defaults on failure
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const handleReset = () => setSettings((prev) => mergeSettings({ ...DEFAULT_STATE, pairSymbol: prev.pairSymbol }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await tradeAlertSettingsService.saveSettings(settings);
            setSavedAt(Date.now());
        } catch {
            setSavedAt(null);
        } finally {
            setSaving(false);
        }
    };

    if (ready && !isAdmin) {
        return (
            <Container className="py-8">
                <div className="bg-darkGrey rounded-[12px] border border-stroke p-8 text-center">
                    <p className="text-secondary text-sm mb-4">Trade Alert Settings are available to administrators only.</p>
                    <Button variant="primary" size="primary" asChild>
                        <Link href="/trading-terminal">Back to Trading Terminal</Link>
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="pb-8 text-foreground">
            <div className="flex items-center justify-between gap-4 py-2">
                <h1 className="font-['Inter',sans-serif] font-bold text-xl text-foreground">Trade Alert Settings</h1>
                <button
                    type="button"
                    onClick={() => router.push("/trading-terminal")}
                    className="text-foreground/80 hover:text-foreground p-1"
                    aria-label="Close settings"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex flex-col gap-4">
                <SettingsSection number={1} title="Pair Configuration">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Pair Symbol</FieldLabel>
                            <Select value={settings.pairSymbol} onValueChange={(v) => update("pairSymbol", v)}>
                                <SelectTrigger><SelectValue placeholder="Select a pair" /></SelectTrigger>
                                <SelectContent>
                                    {pairs.map((p) => (
                                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <button
                                type="button"
                                onClick={() => setAddPairOpen(true)}
                                className="mt-3 text-xs font-semibold text-[#3b82f6] hover:underline"
                            >
                                + Add New Pair
                            </button>
                        </div>
                        <div>
                            <FieldLabel>Default Type</FieldLabel>
                            <Select value={settings.defaultType} onValueChange={(v) => update("defaultType", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {DEFAULT_TYPES.map((t) => (
                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </SettingsSection>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
                    <SettingsSection number={2} title="Stop Loss Setup">
                        <div className="flex flex-col gap-4">
                            <div>
                                <FieldLabel>Preset Mode</FieldLabel>
                                <div className="flex flex-wrap gap-4 mt-1">
                                    <SettingsRadio name="presetMode" value="Scalping" checked={settings.presetMode === "Scalping"} onChange={(v) => update("presetMode", v)} label="Scalping" />
                                    <SettingsRadio name="presetMode" value="Swing" checked={settings.presetMode === "Swing"} onChange={(v) => update("presetMode", v)} label="Swing" />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <p className="text-xs font-semibold">Pair SL Presets (Pips)</p>
                                    <Button variant="dark-grey" size="dark-grey" type="button" className="text-xs" onClick={() => setManagePresetsOpen(true)}>
                                        Manage Pair SL Presets
                                    </Button>
                                </div>
                                <div className="border border-stroke rounded-[8px] overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-stroke/15 border-b border-stroke">
                                                <th className="px-3 py-2 text-left font-bold">Pair</th>
                                                <th className="px-3 py-2 text-center font-bold">Scalping</th>
                                                <th className="px-3 py-2 text-center font-bold">Swing</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pairs.length === 0 ? (
                                                <tr><td colSpan={3} className="px-3 py-4 text-center text-secondary">No pairs yet.</td></tr>
                                            ) : (
                                                pairs.map((row) => (
                                                    <tr
                                                        key={row.id}
                                                        className={cn(
                                                            "border-b border-stroke/50 last:border-b-0",
                                                            row.name === settings.pairSymbol && "bg-[rgba(59,130,246,0.15)]",
                                                        )}
                                                    >
                                                        <td className="px-3 py-2 font-semibold">{row.name}</td>
                                                        <td className="px-3 py-2 text-center">{row.scalping_sl ?? "—"}</td>
                                                        <td className="px-3 py-2 text-center">{row.swing_sl ?? "—"}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </SettingsSection>

                    <div className="flex flex-col gap-4">
                        <SettingsSection number={3} title="Partial Close %">
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <FieldLabel>TP1 (%)</FieldLabel>
                                    <Input type="text" value={settings.tp1Pct} onChange={(e) => update("tp1Pct", e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel>TP2 (%)</FieldLabel>
                                    <Input type="text" value={settings.tp2Pct} onChange={(e) => update("tp2Pct", e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel>TP3 (%)</FieldLabel>
                                    <Input type="text" value={settings.tp3Pct} onChange={(e) => update("tp3Pct", e.target.value)} />
                                </div>
                            </div>
                            <p className="mt-2 text-xs" style={{ color: SETTINGS_GREEN }}>✓ Total must equal 100%</p>
                        </SettingsSection>

                        <SettingsSection number={4} title="Risk Management">
                            <FieldLabel>Default Risk %</FieldLabel>
                            <SuffixInput value={settings.defaultRisk} onChange={(v) => update("defaultRisk", v)} suffix="%" />
                        </SettingsSection>

                        <SettingsSection number={5} title="Trailing Stop Loss (TSL)">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <FieldLabel>TSL Activate After</FieldLabel>
                                    <div className="flex flex-col gap-2 mt-1">
                                        <SettingsRadio name="tslAfter" value="tp1" checked={settings.tslActivateAfter === "tp1"} onChange={(v) => update("tslActivateAfter", v)} label="After TP1" />
                                        <SettingsRadio name="tslAfter" value="tp2" checked={settings.tslActivateAfter === "tp2"} onChange={(v) => update("tslActivateAfter", v)} label="After TP2" />
                                        <SettingsRadio name="tslAfter" value="tp3" checked={settings.tslActivateAfter === "tp3"} onChange={(v) => update("tslActivateAfter", v)} label="After TP3" />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>TSL Chase Distance (Pips)</FieldLabel>
                                    <Input type="text" value={settings.tslChaseDistance} onChange={(e) => update("tslChaseDistance", e.target.value)} />
                                </div>
                            </div>
                        </SettingsSection>
                    </div>
                </div>

                <SettingsSection number={6} title="Alert Channels">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {ALERT_CHANNELS.map((channel) => (
                            <SettingsCheckbox
                                key={channel.id}
                                checked={settings.alertChannels[channel.id] ?? false}
                                onChange={(checked) => toggleRecord("alertChannels", channel.id, checked)}
                                label={channel.label}
                                icon={<ChannelIcon color={channel.color} label={channel.label} />}
                            />
                        ))}
                    </div>
                </SettingsSection>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <SettingsSection number={7} title="Trade Alert Message Configuration">
                        <FieldLabel>Include in Alert Message</FieldLabel>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {MESSAGE_FIELDS.map((field) => (
                                <SettingsCheckbox
                                    key={field}
                                    checked={settings.messageFields[field] ?? false}
                                    onChange={(checked) => toggleRecord("messageFields", field, checked)}
                                    label={field}
                                />
                            ))}
                        </div>
                        <div>
                            <FieldLabel>Trade Type Options</FieldLabel>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {TRADE_TYPES.map((type) => (
                                    <SettingsCheckbox
                                        key={type}
                                        checked={settings.tradeTypes[type] ?? false}
                                        onChange={(checked) => toggleRecord("tradeTypes", type, checked)}
                                        label={type}
                                    />
                                ))}
                            </div>
                        </div>
                    </SettingsSection>

                    <SettingsSection number={8} title="Trade Alert Message Preview (Example)">
                        <MessagePreview
                            symbol={settings.pairSymbol}
                            type={settings.defaultType}
                            fields={settings.messageFields}
                        />
                    </SettingsSection>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
                {savedAt ? <span className="text-xs" style={{ color: SETTINGS_GREEN }}>✓ Settings saved</span> : null}
                <Button variant="outline" type="button" onClick={handleReset} className="border-stroke bg-transparent">
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                </Button>
                <Button variant="send-alert" size="send-alert" type="button" className="font-bold" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                </Button>
            </div>

            <AddTradeAlertPairDialog
                open={addPairOpen}
                onOpenChange={setAddPairOpen}
                onSaved={(name) => refetchPairs(name)}
            />
            <ManagePairSlPresetsDialog
                open={managePresetsOpen}
                pairs={pairs}
                onOpenChange={setManagePresetsOpen}
                onSaved={() => refetchPairs()}
            />
        </Container>
    );
}

function MessagePreview({
    symbol,
    type,
    fields,
}: {
    symbol: string;
    type: string;
    fields: Record<string, boolean>;
}) {
    const rows = MESSAGE_FIELDS.filter(
        (f) => fields[f] && f !== "Symbol" && f !== "Direction" && f !== "Type" && f !== "Session",
    ).map((f) => [f, f === "Symbol" ? symbol : PREVIEW_VALUES[f]] as const);

    return (
        <div className="rounded-[12px] border border-stroke bg-chartInnerBg p-4 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-3">
                <span
                    className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-black"
                    style={{ backgroundColor: SETTINGS_GREEN }}
                >
                    BUY
                </span>
                <span className="text-[10px] text-secondary">10:15 AM</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-8 h-8" style={{ color: SETTINGS_GREEN }} />
                <div>
                    <p className="text-sm font-bold text-foreground">{fields.Symbol ? symbol : "—"}</p>
                    <p className="text-xs text-secondary">
                        {[fields.Type ? type : null, fields.Session ? "London" : null].filter(Boolean).join(" · ") || "—"}
                    </p>
                </div>
            </div>
            <dl className="space-y-1.5 text-xs">
                {rows.length === 0 ? (
                    <p className="text-secondary">No fields selected.</p>
                ) : (
                    rows.map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-2">
                            <dt className="text-secondary">{label}</dt>
                            <dd className="text-foreground font-medium">{value}</dd>
                        </div>
                    ))
                )}
            </dl>
        </div>
    );
}
