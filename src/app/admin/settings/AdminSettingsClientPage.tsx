"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/components/providers/AuthProvider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { apiConfig } from "@/services/api.config";
import { FxGaugeScoreSettingsSection } from "@/components/admin/FxGaugeScoreSettingsSection";
import AdminSettingsPageSkeleton from "./AdminSettingsPageSkeleton";

const MAINTENANCE_KEY = "maintenance_mode";

function parseMaintenanceValue(raw: string | null | undefined): boolean {
    if (!raw) return false;
    return raw === "true" || raw === "1" || raw === "yes";
}

function isAbortError(e: unknown): boolean {
    if (e instanceof DOMException && e.name === "AbortError") return true;
    if (e && typeof e === "object" && "name" in e && (e as { name: string }).name === "AbortError") return true;
    return false;
}

export default function AdminSettingsClientPage({ initialMaintenanceEnabled }: { initialMaintenanceEnabled: boolean }) {
    const { isAdmin, token, ready } = useAuth();
    const [enabled, setEnabled] = useState(initialMaintenanceEnabled);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const loadAbortRef = useRef<AbortController | null>(null);
    const loadEpochRef = useRef(0);

    const load = useCallback(async (options?: { showSpinner?: boolean }) => {
        if (!token) return;
        const showSpinner = options?.showSpinner ?? true;
        const epoch = ++loadEpochRef.current;
        loadAbortRef.current?.abort();
        const ac = new AbortController();
        loadAbortRef.current = ac;
        if (showSpinner) setLoading(true);
        try {
            const res = await fetch(`${apiConfig.baseURL}/api/v1/admin/app-configs/${MAINTENANCE_KEY}`, {
                signal: ac.signal,
                headers: { Authorization: `Bearer ${token}` },
                credentials: "include",
            });
            if (ac.signal.aborted) return;
            const json = (await res.json()) as { success?: boolean; data?: { value?: string | null } };
            if (ac.signal.aborted) return;
            if (!res.ok) {
                toast.error("Could not load maintenance setting");
                return;
            }
            const raw = json?.data?.value;
            setEnabled(parseMaintenanceValue(raw ?? undefined));
        } catch (e: unknown) {
            if (isAbortError(e)) return;
            toast.error("Could not load maintenance setting");
        } finally {
            if (showSpinner && epoch === loadEpochRef.current) setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (ready && isAdmin && token) void load({ showSpinner: false });
    }, [ready, isAdmin, token, load]);

    useEffect(
        () => () => {
            loadAbortRef.current?.abort();
        },
        [],
    );

    const save = async (next: boolean) => {
        if (!token) return;
        loadAbortRef.current?.abort();
        const previous = enabled;
        setSaving(true);
        try {
            const res = await fetch(`${apiConfig.baseURL}/api/v1/admin/app-configs/${MAINTENANCE_KEY}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ value: next ? "true" : "false", description: "Site maintenance mode" }),
            });
            const json = (await res.json().catch(() => ({}))) as {
                success?: boolean;
                message?: string;
                data?: { value?: string | null };
            };
            if (!res.ok || json.success === false) {
                throw new Error(json.message || res.statusText);
            }
            const raw = json?.data?.value;
            setEnabled(parseMaintenanceValue(raw ?? (next ? "true" : "false")));
            toast.success(next ? "Maintenance mode enabled" : "Maintenance mode disabled");
        } catch (e) {
            setEnabled(previous);
            toast.error(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    if (!ready) {
        return <AdminSettingsPageSkeleton />;
    }

    if (!isAdmin) {
        return (
            <div className="rounded-xl border border-stroke bg-darkGrey p-6 text-sm text-[rgb(var(--secondary))]">
                You need an administrator account to view this page.
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl space-y-10">
            <div className="space-y-6 rounded-xl border border-stroke bg-darkGrey p-6">
                <div>
                    <h1 className="text-lg font-semibold">Site settings</h1>
                    <p className="mt-1 text-sm text-[rgb(var(--secondary))]">Control global behaviour for all standard users.</p>
                </div>

                {loading ? (
                    <div className="flex min-h-[88px] items-center rounded-lg border border-stroke/40 bg-foreground/5 px-4 py-4">
                        <div className="h-4 w-48 animate-pulse rounded bg-foreground/10" />
                    </div>
                ) : (
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-stroke/60 px-4 py-3">
                        <div>
                            <Label htmlFor="maint" className="text-base font-medium">
                                Maintenance mode
                            </Label>
                            <p className="mt-1 text-xs text-[rgb(var(--secondary))]">
                                When on, signed-in users without the admin role are redirected to the maintenance page. Admins are
                                unaffected.
                            </p>
                        </div>
                        <Switch
                            id="maint"
                            checked={enabled}
                            disabled={saving}
                            onCheckedChange={(v) => {
                                void save(v);
                            }}
                        />
                    </div>
                )}
            </div>

            <div className="rounded-xl border border-stroke bg-darkGrey p-6">
                <FxGaugeScoreSettingsSection />
            </div>
        </div>
    );
}
