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
import { tradeAlertSettingsService, type TradeAlertPair } from "@/services";

type ManagePairSlPresetsDialogProps = {
    open: boolean;
    pairs: TradeAlertPair[];
    onOpenChange: (open: boolean) => void;
    onSaved: () => void;
};

export default function ManagePairSlPresetsDialog({ open, pairs, onOpenChange, onSaved }: ManagePairSlPresetsDialogProps) {
    const [name, setName] = useState("");
    const [scalping, setScalping] = useState("");
    const [swing, setSwing] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName("");
            setScalping("");
            setSwing("");
            setError(null);
            setSaving(false);
        }
    }, [open]);

    // When a known pair is selected, prefill its current preset values.
    const handlePickPair = (value: string) => {
        setName(value);
        const match = pairs.find((p) => p.name === value);
        setScalping(match?.scalping_sl != null ? String(match.scalping_sl) : "");
        setSwing(match?.swing_sl != null ? String(match.swing_sl) : "");
    };

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Please enter or select a pair name.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await tradeAlertSettingsService.upsertPairPreset(
                trimmed,
                scalping.trim() === "" ? null : Number(scalping),
                swing.trim() === "" ? null : Number(swing),
            );
            onSaved();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save preset.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-[16px] border-stroke bg-darkGrey text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-white">Manage Pair SL Presets</DialogTitle>
                </DialogHeader>

                <div className="mt-2 flex flex-col gap-3">
                    <div>
                        <FieldLabel>Pair Name</FieldLabel>
                        {pairs.length > 0 ? (
                            <Select value={pairs.some((p) => p.name === name) ? name : undefined} onValueChange={handlePickPair}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a pair" />
                                </SelectTrigger>
                                <SelectContent>
                                    {pairs.map((p) => (
                                        <SelectItem key={p.id} value={p.name}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input type="text" placeholder="e.g. EURUSD" value={name} onChange={(e) => setName(e.target.value.toUpperCase())} />
                        )}
                    </div>
                    <div>
                        <FieldLabel>Scalping Value (Pips)</FieldLabel>
                        <Input type="number" inputMode="numeric" placeholder="e.g. 15" value={scalping} onChange={(e) => setScalping(e.target.value)} />
                    </div>
                    <div>
                        <FieldLabel>Swing Value (Pips)</FieldLabel>
                        <Input type="number" inputMode="numeric" placeholder="e.g. 25" value={swing} onChange={(e) => setSwing(e.target.value)} />
                    </div>
                    {error ? <p className="text-xs text-[#fa003f]">{error}</p> : null}
                </div>

                <div className="mt-5 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        type="button"
                        className="border-stroke bg-transparent"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
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
