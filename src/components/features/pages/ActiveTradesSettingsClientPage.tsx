"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Eye,
    Flag,
    Loader2,
    RotateCcw,
    Save,
    Shield,
    Target,
    TrendingUp,
    X,
} from "lucide-react";

import {
    Button,
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
    InfoNote,
    SETTINGS_GREEN,
    SettingsCheckbox,
    SettingsSection,
    StatusBox,
    SuffixInput,
} from "@/components/composed/trading-terminal/tradeAlertSettingsShared";
import { activeTradesSettingsService } from "@/services";

export const ACTIVE_TRADES_SETTINGS_PATH = "/trading-terminal/active-trades-settings";

const CLIENT_ALERTS = [
    { id: "tp1", label: "TP1 Achieved", color: SETTINGS_GREEN, icon: "target" },
    { id: "tp2", label: "TP2 Achieved", color: SETTINGS_GREEN, icon: "target" },
    { id: "tp3", label: "TP3 Achieved", color: SETTINGS_GREEN, icon: "target" },
    { id: "slHit", label: "SL Hit", color: "#fa003f", icon: "shield" },
    { id: "be", label: "SL Moved to Breakeven", color: "#3b82f6", icon: "swap" },
    { id: "tsl", label: "TSL Updated (Interval)", color: "#f97316", icon: "trend" },
    { id: "closed", label: "Trade Closed (Win/Loss)", color: "#94a3b8", icon: "flag" },
] as const;

const MOVE_SL_LABELS: Record<string, string> = {
    inactive: "Automatic breakeven is disabled. Use Enable Breakeven on a trade to move SL immediately.",
    tp1: "After TP1 is achieved, Stop Loss will move to Entry Price (Breakeven).",
    tp2: "After TP2 is achieved, Stop Loss will move to Entry Price (Breakeven).",
    tp3: "After TP3 is achieved, Stop Loss will move to Entry Price (Breakeven).",
    manual: "After TP1 is achieved, Stop Loss will move to Entry Price plus the manual pip offset below.",
};

const DEFAULT_STATE = {
    moveSlAfter: "tp1",
    moveSlManualPips: "5",
    clientAlerts: Object.fromEntries(CLIENT_ALERTS.map((a) => [a.id, true])) as Record<string, boolean>,
};

type SettingsState = typeof DEFAULT_STATE;

function mergeSettings(loaded: Partial<SettingsState> | null): SettingsState {
    if (!loaded) return DEFAULT_STATE;
    return {
        ...DEFAULT_STATE,
        ...loaded,
        clientAlerts: { ...DEFAULT_STATE.clientAlerts, ...(loaded.clientAlerts ?? {}) },
    };
}

function AlertIcon({ type, color }: { type: string; color: string }) {
    const className = "w-3.5 h-3.5 shrink-0";
    if (type === "shield") return <Shield className={className} style={{ color }} />;
    if (type === "flag") return <Flag className={className} style={{ color }} />;
    if (type === "trend") return <TrendingUp className={className} style={{ color }} />;
    return <Target className={className} style={{ color }} />;
}

export default function ActiveTradesSettingsClientPage() {
    const router = useRouter();
    const { isAdmin, ready } = useAuth();
    const [settings, setSettings] = useState<SettingsState>(DEFAULT_STATE);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);

    const update = useCallback(<K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }, []);

    const toggleClientAlert = useCallback((id: string, checked: boolean) => {
        setSettings((prev) => ({
            ...prev,
            clientAlerts: { ...prev.clientAlerts, [id]: checked },
        }));
    }, []);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const loaded = await activeTradesSettingsService.getSettings();
                if (!active) return;
                setSettings(mergeSettings(loaded as Partial<SettingsState> | null));
            } catch {
                // keep defaults on failure
            }
        })();
        return () => {
            active = false;
        };
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await activeTradesSettingsService.saveSettings(settings);
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
                    <p className="text-secondary text-sm mb-4">Active Trades Settings are available to administrators only.</p>
                    <Button variant="primary" size="primary" asChild>
                        <Link href="/trading-terminal">Back to Trading Terminal</Link>
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container className="pb-8 min-w-0 max-w-full overflow-x-hidden text-foreground">
            <div className="flex items-center justify-between gap-4 py-2">
                <h1 className="font-['Inter',sans-serif] font-bold text-xl text-foreground">Active Trades Settings</h1>
                <button
                    type="button"
                    onClick={() => router.push("/trading-terminal")}
                    className="text-foreground/80 hover:text-foreground p-1"
                    aria-label="Close settings"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
                <div className="flex flex-col gap-4 min-w-0">
                    <SettingsSection number={1} title="Move Stop Loss to Breakeven">
                        <FieldLabel>Move SL to Breakeven</FieldLabel>
                        <Select value={settings.moveSlAfter} onValueChange={(v) => update("moveSlAfter", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="inactive">Inactive</SelectItem>
                                <SelectItem value="tp1">After TP1 Achieved</SelectItem>
                                <SelectItem value="tp2">After TP2 Achieved</SelectItem>
                                <SelectItem value="tp3">After TP3 Achieved</SelectItem>
                                <SelectItem value="manual">Manual (Entry + Pips)</SelectItem>
                            </SelectContent>
                        </Select>

                        {settings.moveSlAfter === "manual" ? (
                            <div className="mt-3">
                                <FieldLabel>Move SL by (Pips)</FieldLabel>
                                <SuffixInput
                                    value={settings.moveSlManualPips}
                                    onChange={(v) => update("moveSlManualPips", v)}
                                    suffix="pips"
                                />
                            </div>
                        ) : null}

                        <StatusBox>
                            {settings.moveSlAfter === "manual"
                                ? `Stop Loss will move to Entry Price + ${settings.moveSlManualPips || 0} pips after TP1 is achieved.`
                                : MOVE_SL_LABELS[settings.moveSlAfter] ?? MOVE_SL_LABELS.inactive}
                        </StatusBox>
                    </SettingsSection>

                    <SettingsSection number={2} title="Alert Generation (For Clients)">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {CLIENT_ALERTS.map((alert) => (
                                <SettingsCheckbox
                                    key={alert.id}
                                    checked={settings.clientAlerts[alert.id] ?? false}
                                    onChange={(checked) => toggleClientAlert(alert.id, checked)}
                                    label={alert.label}
                                    icon={<AlertIcon type={alert.icon} color={alert.color} />}
                                />
                            ))}
                        </div>
                        <InfoNote>
                            When a status is enabled, its alert is sent to clients (e.g. enabling TP1 Achieved sends an alert the
                            moment TP1 is hit) via their configured notification channels.
                        </InfoNote>
                    </SettingsSection>
                </div>

                <SettingsSection
                    number={3}
                    title="Alert Summary (For Clients)"
                    className="min-w-0"
                    headerAction={
                        <Button variant="dark-grey" size="dark-grey" type="button" className="text-xs h-8">
                            <Eye className="w-3.5 h-3.5" />
                            Preview
                        </Button>
                    }
                >
                    <div className="rounded-[8px] border border-stroke bg-chartInnerBg p-3 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold text-black" style={{ backgroundColor: SETTINGS_GREEN }}>
                                BUY
                            </span>
                            <span className="text-xs text-secondary">20240524-001</span>
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                            {[
                                ["Symbol", "EURUSD"],
                                ["Direction", "Buy"],
                                ["Entry Price", "1.08920"],
                                ["SL Price", "1.07800"],
                                ["TP1", "1.09500"],
                                ["TP2", "1.10000"],
                                ["TP3", "1.10500"],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between gap-2 col-span-1">
                                    <dt className="text-secondary">{label}</dt>
                                    <dd className="text-foreground font-medium">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </SettingsSection>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                {savedAt ? <span className="text-xs" style={{ color: SETTINGS_GREEN }}>✓ Settings saved</span> : null}
                <Button variant="outline" type="button" onClick={() => setSettings(DEFAULT_STATE)} className="border-stroke bg-transparent">
                    <RotateCcw className="w-4 h-4" />
                    Reset to Defaults
                </Button>
                <Button variant="send-alert" size="send-alert" type="button" className="font-bold" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                </Button>
            </div>
        </Container>
    );
}
