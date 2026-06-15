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
} from "@/components/ui";
import { FieldLabel } from "@/components/composed/trading-terminal/tradeAlertSettingsShared";
import { tradeAlertSettingsService } from "@/services";

type AddTradeAlertPairDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved: (createdName: string) => void;
};

export default function AddTradeAlertPairDialog({ open, onOpenChange, onSaved }: AddTradeAlertPairDialogProps) {
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setName("");
            setError(null);
            setSaving(false);
        }
    }, [open]);

    const handleSave = async () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Please enter a pair name.");
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await tradeAlertSettingsService.createPair(trimmed);
            onSaved(trimmed);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add pair.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm rounded-[16px] border-stroke bg-darkGrey text-foreground">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-white">Add New Pair</DialogTitle>
                </DialogHeader>

                <div className="mt-2">
                    <FieldLabel>Pair Name</FieldLabel>
                    <Input
                        type="text"
                        autoFocus
                        placeholder="e.g. EURGBP"
                        value={name}
                        onChange={(e) => setName(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                        }}
                    />
                    {error ? <p className="mt-2 text-xs text-[#fa003f]">{error}</p> : null}
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
