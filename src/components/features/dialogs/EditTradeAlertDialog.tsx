"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import { FieldLabel } from "@/components/composed/trading-terminal/tradeAlertSettingsShared";
import { tradingAlertService, type TradingAlert } from "@/services";

type EditTradeAlertDialogProps = {
    open: boolean;
    trade: TradingAlert | null;
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
    /** When true (Trade History), allows manual correction of recorded pips. */
    allowPipsEdit?: boolean;
};

const TYPE_OPTIONS = ["Swing", "Scalping", "Intraday"];
const SESSION_OPTIONS = ["Tokyo", "London", "New York"];

const numField = (v: string) => {
    const n = parseFloat(String(v).replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) ? n : null;
};

export default function EditTradeAlertDialog({
    open,
    trade,
    onOpenChange,
    onSaved,
    allowPipsEdit = false,
}: EditTradeAlertDialogProps) {
    const [form, setForm] = useState({
        direction: "buy",
        type: "Swing",
        session: "Tokyo",
        entry: "",
        sl: "",
        tp1: "",
        tp2: "",
        tp3: "",
        risk: "",
        notes: "",
        pips: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open && trade) {
            setError(null);
            setSaving(false);
            setForm({
                direction: trade.direction ?? "buy",
                type: trade.type ?? "Swing",
                session: trade.session ?? "Tokyo",
                entry: trade.entry_level != null ? String(trade.entry_level) : "",
                sl: trade.stop_loss != null ? String(trade.stop_loss) : "",
                tp1: trade.tp1 != null ? String(trade.tp1) : "",
                tp2: trade.tp2 != null ? String(trade.tp2) : "",
                tp3: trade.tp3 != null ? String(trade.tp3) : "",
                risk: trade.risk ?? "",
                notes: trade.comment ?? "",
                pips: trade.pips != null ? String(trade.pips) : "",
            });
        }
    }, [open, trade]);

    const set = (key: keyof typeof form, value: string) => setForm((p) => ({ ...p, [key]: value }));

    const handleSave = async () => {
        if (!trade) return;
        setSaving(true);
        setError(null);
        try {
            const pipsValue = numField(form.pips);
            const patch: Parameters<typeof tradingAlertService.update>[1] = {
                direction: form.direction === "sell" ? "sell" : "buy",
                type: form.type,
                session: form.session,
                entry_level: numField(form.entry),
                stop_loss: numField(form.sl),
                tp1: numField(form.tp1),
                tp2: numField(form.tp2),
                tp3: numField(form.tp3),
                risk: form.risk,
                comment: form.notes || null,
            };
            if (allowPipsEdit && pipsValue !== null) {
                patch.pips = pipsValue;
                patch.outcome = pipsValue >= 0 ? "Profit" : "Loss";
            }
            await tradingAlertService.update(trade.id, patch);
            onSaved();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update trade.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg rounded-[16px] border-stroke bg-darkGrey text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-white">
                        Edit Trade {trade?.trade_id ? `(${trade.trade_id})` : ""}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-2 grid grid-cols-2 gap-3">
                    <div>
                        <FieldLabel>Direction</FieldLabel>
                        <Select value={form.direction} onValueChange={(v) => set("direction", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="buy">Buy</SelectItem>
                                <SelectItem value="sell">Sell</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>Type</FieldLabel>
                        <Select value={form.type} onValueChange={(v) => set("type", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {TYPE_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>Session</FieldLabel>
                        <Select value={form.session} onValueChange={(v) => set("session", v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {SESSION_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <FieldLabel>Risk %</FieldLabel>
                        <Input value={form.risk} onChange={(e) => set("risk", e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>Entry Price</FieldLabel>
                        <Input value={form.entry} onChange={(e) => set("entry", e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>Stop Loss</FieldLabel>
                        <Input value={form.sl} onChange={(e) => set("sl", e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>TP1</FieldLabel>
                        <Input value={form.tp1} onChange={(e) => set("tp1", e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>TP2</FieldLabel>
                        <Input value={form.tp2} onChange={(e) => set("tp2", e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>TP3</FieldLabel>
                        <Input value={form.tp3} onChange={(e) => set("tp3", e.target.value)} />
                    </div>
                    {allowPipsEdit ? (
                        <div>
                            <FieldLabel>Pips</FieldLabel>
                            <Input
                                value={form.pips}
                                onChange={(e) => set("pips", e.target.value)}
                                placeholder="e.g. 20 or -15"
                            />
                        </div>
                    ) : null}
                    <div className="col-span-2">
                        <FieldLabel>Notes</FieldLabel>
                        <Input value={form.notes} onChange={(e) => set("notes", e.target.value)} />
                    </div>
                </div>

                {error ? <p className="mt-2 text-xs text-[#fa003f]">{error}</p> : null}

                <div className="mt-5 flex justify-end gap-3">
                    <Button variant="outline" type="button" className="border-stroke bg-transparent" onClick={() => onOpenChange(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button variant="send-alert" size="send-alert" type="button" className="font-bold" onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Save
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
