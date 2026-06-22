
"use client";

import {
    Button,
    Form,
    FormField,
    FormLabel,
    FormItem,
    Input,
    Select,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectItem,
    FormControl,
} from "@/components/ui";
import Icon from "@/components/composed/Icon";
import Link from "next/link";
import Section from "@/components/ui/layout/Section";
import Container from "@/components/ui/layout/Container";
import TradingTerminalPerformanceSection from "@/components/composed/trading-terminal/TradingTerminalPerformanceSection";
import TradingTerminalInsightsSection from "@/components/composed/trading-terminal/TradingTerminalInsightsSection";
import { ActiveTradesTable, TradeHistoryTable } from "@/components/composed/tables";
import { TRADE_ALERT_SETTINGS_PATH } from "@/components/features/pages/TradeAlertSettingsClientPage";
import { ACTIVE_TRADES_SETTINGS_PATH } from "@/components/features/pages/ActiveTradesSettingsClientPage";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTradeAlertForm } from "@/hooks/forms";
import { tradeAlertSettingsService, tradingAlertService, type TradeAlertPair } from "@/services";
import { useLivePrices } from "@/hooks/useLivePrices";
import { formatPrice } from "@/lib/technicalLevelsPrice";
import { deriveSlTp, generateTradeId, getActiveSession, resolveSlPipsForTradeType } from "@/lib/tradeAlertCalc";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

const TYPE_OPTIONS = ["Swing", "Scalping", "Intraday"] as const;
const SESSION_OPTIONS = ["Tokyo", "London", "New York"] as const;

const DIRECTION_TYPES = {
    Buy: [
        { value: "Buy", label: "Buy" },
        { value: "Buy Limit", label: "Buy Limit" },
        { value: "Buy Stop", label: "Stock Buy" },
    ],
    Sell: [
        { value: "Sell", label: "Sell" },
        { value: "Sell Limit", label: "Limit Sell" },
        { value: "Sell Stop", label: "Stock Sell" },
    ],
} as const;

const DIRECTION_TYPE_LABELS: Record<string, string> = Object.fromEntries(
    [...DIRECTION_TYPES.Buy, ...DIRECTION_TYPES.Sell].map((t) => [t.value, t.label]),
);

const TRADE_GREEN = "#05df72";
const TRADE_RED = "#fa003f";

export default function TradingTerminalClientPage() {
    const { isAdmin } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const refresh = () => setRefreshKey((k) => k + 1);

    return (
        <Container>
            <TradingTerminalPerformanceSection refreshKey={refreshKey} />

            <Section>
                <ActiveTradesTable
                    showSettings={isAdmin}
                    settingsHref={ACTIVE_TRADES_SETTINGS_PATH}
                    canManage={isAdmin}
                    refreshKey={refreshKey}
                    onChanged={refresh}
                />
            </Section>

            <Section>
                <TradeHistoryTable canManage={isAdmin} refreshKey={refreshKey} onChanged={refresh} />
            </Section>

            <TradingTerminalInsightsSection refreshKey={refreshKey} />

            <Section padding={false}>
                <TradeAlertForm onSent={refresh} />
            </Section>
        </Container>
    );
}

function TradeAlertForm({ onSent }: { onSent: () => void }) {
    const { form, control } = useTradeAlertForm();
    const { isAdmin } = useAuth();
    const { getPrice } = useLivePrices();
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [pairs, setPairs] = useState<TradeAlertPair[]>([]);
    const [presetMode, setPresetMode] = useState<string>("Swing");
    const [enabledTypes, setEnabledTypes] = useState<Record<string, boolean>>({});
    // Local placeholder: freezes live price/session updates once an alert is "sent".
    const sentRef = useRef(false);
    // When true, entry was typed by the admin — keep it instead of syncing live price.
    const entryManualRef = useRef(false);

    const symbol = form.watch("symbol");
    const direction = form.watch("direction");
    const directionType = form.watch("directionType");
    const tradeType = form.watch("type");
    const entryPrice = form.watch("entryPrice");
    const livePrice = getPrice(symbol);
    // Pending orders (Limit/Stop) keep an admin-set entry; only market Buy/Sell track the live price.
    const isPendingType = /limit|stop/i.test(directionType);

    // Load pairs, settings and existing alerts; seed the form (Trade ID, session, defaults).
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [list, settings, alerts] = await Promise.all([
                    tradeAlertSettingsService.listPairs(),
                    tradeAlertSettingsService.getSettings(),
                    tradingAlertService.list().catch(() => []),
                ]);
                if (!active) return;
                setPairs(list);

                const defaultType = typeof settings?.defaultType === "string" ? settings.defaultType : undefined;
                const defaultRisk = typeof settings?.defaultRisk === "string" ? settings.defaultRisk : undefined;
                if (typeof settings?.presetMode === "string") setPresetMode(settings.presetMode);
                if (settings?.tradeTypes && typeof settings.tradeTypes === "object") {
                    setEnabledTypes(settings.tradeTypes as Record<string, boolean>);
                }

                const existingIds = alerts.map((a) => a.trade_id ?? "");
                const current = form.getValues();
                form.reset({
                    ...current,
                    tradeId: generateTradeId(existingIds),
                    session: getActiveSession(),
                    symbol: list.some((p) => p.name === current.symbol) ? current.symbol : (list[0]?.name ?? current.symbol),
                    type: defaultType ?? current.type,
                    riskPerTrade: defaultRisk ? `${defaultRisk}%` : current.riskPerTrade,
                });
            } catch {
                // keep form defaults on failure
            }
        })();
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Current Price always tracks live; Entry auto-fills from live only until the admin types a custom entry.
    useEffect(() => {
        if (sentRef.current || livePrice === null || !symbol) return;
        const priceStr = formatPrice(livePrice, symbol);
        form.setValue("currentPrice", priceStr);
        if (!isPendingType && !entryManualRef.current) form.setValue("entryPrice", priceStr);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [livePrice, symbol, isPendingType]);

    const applyDerivedSlTp = (entry: number) => {
        const pair = pairs.find((p) => p.name === symbol);
        const slPips = resolveSlPipsForTradeType(tradeType, pair, presetMode);
        const derived = deriveSlTp({ entry, pair: symbol, direction, slPips: slPips ?? 0 });
        if (derived) {
            form.setValue("stockLoss", derived.sl);
            form.setValue("tp1", derived.tp1);
            form.setValue("tp2", derived.tp2);
            form.setValue("tp3", derived.tp3);
        }
    };

    // Derive SL/TP from entry (live-filled or admin-typed) using pair presets from admin settings.
    useEffect(() => {
        if (sentRef.current || !symbol) return;
        const entry = parseFloat(entryPrice);
        if (!Number.isFinite(entry)) return;
        applyDerivedSlTp(entry);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entryPrice, symbol, direction, tradeType, presetMode, pairs]);

    // Keep the session aligned with the current Pakistan-time window.
    useEffect(() => {
        const id = window.setInterval(() => {
            if (!sentRef.current) form.setValue("session", getActiveSession());
        }, 60_000);
        return () => window.clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectDirection = (side: "Buy" | "Sell", typeValue: string) => {
        form.setValue("direction", side);
        form.setValue("directionType", typeValue);
        if (/limit|stop/i.test(typeValue)) {
            // Pending order: admin must set the entry level it waits for (don't default to current price).
            entryManualRef.current = false;
            form.setValue("entryPrice", "");
            form.setValue("stockLoss", "");
            form.setValue("tp1", "");
            form.setValue("tp2", "");
            form.setValue("tp3", "");
        } else {
            entryManualRef.current = false;
            if (livePrice !== null && symbol) {
                // Market order: snap entry back to the live price until admin overrides it.
                form.setValue("entryPrice", formatPrice(livePrice, symbol));
            }
        }
    };

    const num = (v: string) => {
        const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
        return Number.isFinite(n) ? n : null;
    };

    const handleSend = async () => {
        const v = form.getValues();
        setSending(true);
        setSendError(null);
        sentRef.current = true; // freeze live updates for this trade
        try {
            await tradingAlertService.create({
                trade_id: v.tradeId,
                pair: v.symbol,
                direction: v.direction.toLowerCase() === "sell" ? "sell" : "buy",
                direction_type: v.directionType || v.direction,
                type: v.type,
                session: v.session,
                entry_level: num(v.entryPrice),
                current_price: num(v.currentPrice),
                stop_loss: num(v.stockLoss),
                tp1: num(v.tp1),
                tp2: num(v.tp2),
                tp3: num(v.tp3),
                risk: v.riskPerTrade,
                comment: v.notes || null,
                status: "open",
                date: new Date().toISOString(),
            });

            // Prepare a fresh Trade ID for the next alert and resume live pricing.
            const alerts = await tradingAlertService.list().catch(() => []);
            form.reset({
                ...form.getValues(),
                tradeId: generateTradeId(alerts.map((a) => a.trade_id ?? "")),
                notes: "",
            });
            sentRef.current = false;
            entryManualRef.current = false;
            onSent();
        } catch (err) {
            sentRef.current = false;
            const message = err instanceof Error ? err.message : "Failed to send alert";
            setSendError(message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-darkGrey rounded-[12px] overflow-hidden text-foreground">
            <div className="px-4 py-3 flex items-center gap-2">
                <h6 className="font-semibold text-sm text-foreground">Trade Alert / Quick Entry</h6>
                {isAdmin ? (
                    <Link
                        href={TRADE_ALERT_SETTINGS_PATH}
                        className="text-foreground/80 hover:text-foreground"
                        aria-label="Trade alert settings"
                    >
                        <Icon name="trading-settings.svg" width={18} height={18} />
                    </Link>
                ) : null}
            </div>

            <div className="px-4 pb-4">
                <Form {...form}>
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                            <FormField
                                control={control}
                                name="tradeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trade ID</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="symbol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Symbol</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Symbol" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {pairs.map((p) => (
                                                        <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                <span className="text-sm font-medium leading-none">Direction</span>
                                <DirectionSelector
                                    direction={direction}
                                    directionType={directionType}
                                    enabledTypes={enabledTypes}
                                    onSelect={selectDirection}
                                />
                            </div>

                            <FormField
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TYPE_OPTIONS.map((t) => (
                                                        <SelectItem key={t} value={t}>{t}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="session"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Session</FormLabel>
                                        <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Session" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SESSION_OPTIONS.map((s) => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="currentPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Price</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="font-semibold" style={{ color: TRADE_GREEN }} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="entryPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Entry Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="text"
                                                placeholder={isPendingType ? "Set pending entry" : undefined}
                                                {...field}
                                                onChange={(e) => {
                                                    entryManualRef.current = true;
                                                    field.onChange(e);
                                                    const entry = parseFloat(e.target.value);
                                                    if (Number.isFinite(entry) && symbol) applyDerivedSlTp(entry);
                                                }}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            <FormField
                                control={control}
                                name="stockLoss"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SL</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="font-semibold" style={{ color: TRADE_RED }} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="tp1"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TP1</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="font-semibold" style={{ color: TRADE_GREEN }} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="tp2"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TP2</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="tp3"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>TP3</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="riskPerTrade"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Risk %</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Notes</FormLabel>
                                        <FormControl>
                                            <Input type="text" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-end gap-3 pt-4">
                        <Button
                            variant="send-alert"
                            size="send-alert"
                            type="button"
                            className="shrink-0 uppercase tracking-wide font-bold"
                            onClick={handleSend}
                            disabled={sending}
                        >
                            {sending ? "Sending…" : "Send Alert"}
                        </Button>
                    </div>
                    {sendError ? (
                        <p className="text-sm mt-2" style={{ color: TRADE_RED }}>
                            {sendError}
                        </p>
                    ) : null}
                </Form>
            </div>
        </div>
    );
}

function DirectionSelector({
    direction,
    directionType,
    enabledTypes,
    onSelect,
}: {
    direction: string;
    directionType: string;
    enabledTypes: Record<string, boolean>;
    onSelect: (side: "Buy" | "Sell", typeValue: string) => void;
}) {
    const [openSide, setOpenSide] = useState<"Buy" | "Sell" | null>(null);

    const renderSide = (side: "Buy" | "Sell", activeClass: string) => {
        const types = DIRECTION_TYPES[side];
        const enabled = types.filter((t) => enabledTypes[t.value] !== false);
        const list = enabled.length ? enabled : [types[0]];
        const isActive = direction === side;
        const buttonLabel = isActive && directionType && directionType !== side
            ? DIRECTION_TYPE_LABELS[directionType] ?? side
            : side;

        const choose = (value: string) => {
            onSelect(side, value);
            setOpenSide(null);
        };

        return (
            <div
                className="relative flex-1"
                onMouseEnter={() => setOpenSide(side)}
                onMouseLeave={() => setOpenSide(null)}
            >
                <button
                    type="button"
                    onClick={() => choose(side)}
                    className={cn(
                        "w-full h-10 rounded-[4px] text-[10px] font-bold uppercase",
                        isActive ? activeClass : "bg-stroke/20 text-foreground border border-stroke/50",
                    )}
                >
                    {buttonLabel}
                </button>
                {/* Menu sits flush under the button (no gap) so the cursor can travel into it. */}
                {openSide === side ? (
                    <div className="absolute left-0 top-full z-30 min-w-full overflow-hidden rounded-[4px] border border-stroke bg-darkGrey shadow-lg">
                        {list.map((t) => (
                            <button
                                key={t.value}
                                type="button"
                                onClick={() => choose(t.value)}
                                className={cn(
                                    "block w-full px-2 py-1.5 text-left text-[10px] font-semibold hover:bg-stroke/30",
                                    directionType === t.value && "bg-stroke/20",
                                )}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        );
    };

    return (
        <div className="flex gap-1 h-10">
            {renderSide("Buy", "bg-[#05df72] text-black")}
            {renderSide("Sell", "bg-[#fa003f] text-white")}
        </div>
    );
}

