"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiConfig } from "@/services/api.config";

type AuditRow = { id: string; publishedAt: string | null; source: string | null; guid: string; headline: string; classification: string; impact: string; assets: Array<{ asset?: string; bias?: string; score?: number }>; isNew: boolean; classificationCompleted: boolean; semanticDedupCompleted: boolean; coverageRepairCompleted: boolean; duplicateOf: string | null; boardLocked: boolean; displayEligible: boolean; visibleDestinations: string[]; finalDecisionCode: string; finalDecisionReason: string; secondaryReasons: unknown[]; ingestId: string | null; classificationJobId: string | null; provider: string | null; model: string | null; historicalDetail: boolean };
type AuditResponse = { summary: Record<string, number | string | boolean>; rows: AuditRow[]; pagination: { page: number; total: number; totalPages: number; exportTruncated?: boolean } };

function dubaiToday(): string {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const get = (name: string) => parts.find((part) => part.type === name)?.value ?? "";
    const base = `${get("year")}-${get("month")}-${get("day")}`;
    if (Number(get("hour")) < 1) {
        const prior = new Date(`${base}T12:00:00Z`);
        prior.setUTCDate(prior.getUTCDate() - 1);
        return prior.toISOString().slice(0, 10);
    }
    return base;
}

function shiftDay(day: string, amount: number) { const date = new Date(`${day}T12:00:00Z`); date.setUTCDate(date.getUTCDate() + amount); return date.toISOString().slice(0, 10); }
function label(value: string) { return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2"); }
function fmtTime(value: string | null) { return value ? new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dubai", dateStyle: "short", timeStyle: "short" }).format(new Date(value)) : "—"; }

export default function NewsDecisionAuditClientPage() {
    const { ready, isAdmin, token } = useAuth();
    const [day, setDay] = useState(dubaiToday);
    const [data, setData] = useState<AuditResponse | null>(null);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [reason, setReason] = useState("");
    const [classification, setClassification] = useState("");
    const [impact, setImpact] = useState("");
    const [outcome, setOutcome] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const query = useMemo(() => {
        const params = new URLSearchParams({ day, page: String(page), pageSize: "25" });
        if (search) params.set("search", search);
        if (reason) params.set("finalDecisionCode", reason);
        if (classification) params.set("classification", classification);
        if (impact) params.set("impact", impact);
        if (outcome === "visible") params.set("visibleOnly", "true");
        if (outcome === "rejected") params.set("rejectedOnly", "true");
        if (outcome === "duplicates") params.set("duplicatesOnly", "true");
        return params;
    }, [day, page, search, reason, classification, impact, outcome]);

    const load = useCallback(async (exportAll = false) => {
        if (!ready || !isAdmin || !token) return null;
        setLoading(true); setMessage("");
        try {
            const params = new URLSearchParams(query);
            if (exportAll) params.set("exportAll", "true");
            const response = await fetch(`${apiConfig.baseURL}/api/v1/admin/news-decision-audit?${params}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
            if (!response.ok) throw new Error(`Request failed (${response.status})`);
            const json = await response.json() as { success?: boolean; data?: AuditResponse };
            if (!json.success || !json.data) throw new Error("Invalid audit response");
            if (!exportAll) setData(json.data);
            return json.data;
        } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load audit"); return null; } finally { setLoading(false); }
    }, [isAdmin, ready, token, query]);

    useEffect(() => { void load(); }, [load]);
    const summary = data?.summary ?? {};
    const cards: Array<[string, number | string | boolean | undefined]> = [["New", summary.genuinelyNewItems], ["Classified", summary.successfullyClassified], ["Visible", summary.visibleNewsHeadlineRows], ["Rejected", Number(summary.rejectedIrrelevant ?? 0) + Number(summary.rejectedEconomic ?? 0) + Number(summary.rejectedTechnicalForecast ?? 0)], ["Duplicates", summary.semanticDuplicates], ["Hidden", summary.classifiedButHidden], ["Existing skipped", summary.existingIdentitiesSkipped]];
    const copyAll = async () => {
        const full = await load(true); if (!full) return;
        const lines = ["time\tsource\tGUID\theadline\tclassification\timpact\tassets/scores\tduplicate\tdisplay eligible\tfinal decision\texact reason", ...full.rows.map((row) => [fmtTime(row.publishedAt), row.source ?? "", row.guid, row.headline, row.classification, row.impact, row.assets.map((asset) => `${asset.asset ?? ""}:${asset.score ?? 0}`).join(","), row.duplicateOf ?? "", row.displayEligible ? "YES" : "NO", row.finalDecisionCode, row.finalDecisionReason].map((value) => String(value).replaceAll("\t", " ")).join("\t"))];
        try { await navigator.clipboard.writeText(lines.join("\n")); setMessage(full.pagination.exportTruncated ? "Copied first 5,000 rows (export limit)." : `Copied ${full.rows.length} rows.`); } catch { setMessage("Copy failed; browser permission was denied."); }
    };
    const copySummary = async () => { try { await navigator.clipboard.writeText(Object.entries(summary).map(([key, value]) => `${label(key)}\t${value}`).join("\n")); setMessage("Summary copied."); } catch { setMessage("Copy failed."); } };

    if (!ready) return null;
    if (!isAdmin) return <main className="mx-auto max-w-5xl p-6 text-foreground">Admin access required.</main>;
    return <main className="mx-auto max-w-[1800px] space-y-5 p-4 text-foreground lg:p-8">
        <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.2em] text-[rgb(var(--secondary))]">Operations</p><h1 className="text-2xl font-semibold">News Decision Audit</h1><p className="mt-1 text-sm text-[rgb(var(--secondary))]">Persisted decisions for Dubai business day {day}; opening this page never runs AI.</p></div><div className="flex flex-wrap gap-2"><button className="rounded border border-stroke px-3 py-2" onClick={() => setDay(shiftDay(day, -1))}>Previous</button><input type="date" value={day} onChange={(event) => { setDay(event.target.value); setPage(1); }} className="rounded border border-stroke bg-darkGrey px-3 py-2" /><button className="rounded border border-stroke px-3 py-2" onClick={() => setDay(shiftDay(day, 1))}>Next</button><button className="rounded bg-blue-600 px-3 py-2 text-white" onClick={() => { setDay(dubaiToday()); setPage(1); }}>Today</button></div></header>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">{cards.map(([name, value]) => <div key={name} className="rounded-xl border border-stroke bg-darkGrey p-4"><div className="text-xs text-[rgb(var(--secondary))]">{name}</div><strong className="text-2xl">{Number(value ?? 0).toLocaleString()}</strong></div>)}</section>
        <section className="rounded-xl border border-stroke bg-darkGrey p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">Rejection breakdown</h2><div className="flex gap-2"><button className="rounded border border-stroke px-3 py-2 text-sm" onClick={copySummary}>Copy summary</button><button className="rounded bg-blue-600 px-3 py-2 text-sm text-white" onClick={copyAll}>Copy whole table</button></div></div><div className="flex flex-wrap gap-2 text-xs">{[["rejectedIrrelevant","IRRELEVANT"],["rejectedEconomic","ECONOMIC_RELEASE"],["rejectedTechnicalForecast","TECHNICAL_OR_PRICE_FORECAST"],["lowImpact","LOW_IMPACT"],["noTrackedAssetOrActionableScore","NO_TRACKED_ASSET_MAPPING"]].map(([key, code]) => <button key={key} onClick={() => setReason(reason === code ? "" : code)} className={`rounded-full border px-3 py-1.5 ${reason === code ? "border-blue-400 text-blue-300" : "border-stroke text-[rgb(var(--secondary))]"}`}>{label(key)}: {Number(summary[key] ?? 0).toLocaleString()}</button>)}</div></section>
        <section className="flex flex-wrap gap-2 rounded-xl border border-stroke bg-darkGrey p-4"><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search headline or GUID" className="min-w-[220px] flex-1 rounded border border-stroke bg-transparent px-3 py-2" /><select value={classification} onChange={(event) => { setClassification(event.target.value); setPage(1); }} className="rounded border border-stroke bg-darkGrey px-3 py-2"><option value="">All classifications</option><option>DRIVER</option><option>GEOPOLITICAL</option><option>IRRELEVANT</option><option>ECONOMIC</option></select><select value={impact} onChange={(event) => { setImpact(event.target.value); setPage(1); }} className="rounded border border-stroke bg-darkGrey px-3 py-2"><option value="">All impact</option><option>High</option><option>Medium</option><option>Low</option></select><select value={outcome} onChange={(event) => { setOutcome(event.target.value); setPage(1); }} className="rounded border border-stroke bg-darkGrey px-3 py-2"><option value="">All outcomes</option><option value="visible">Visible</option><option value="rejected">Rejected</option><option value="duplicates">Duplicates</option></select></section>
        {message ? <p className="text-sm text-blue-300">{message}</p> : null}{loading ? <p className="text-sm text-[rgb(var(--secondary))]">Loading persisted audit…</p> : null}
        <section className="overflow-hidden rounded-xl border border-stroke bg-darkGrey"><div className="overflow-x-auto"><table className="min-w-[1500px] w-full text-left text-sm"><thead className="bg-black/20 text-xs uppercase text-[rgb(var(--secondary))]"><tr>{["Time (Dubai)","Source / GUID","Headline","Class / impact","Assets / scores","Checkpoint","Duplicate","Display","Final decision","Exact reason"].map((heading) => <th key={heading} className="px-3 py-3">{heading}</th>)}</tr></thead><tbody>{data?.rows.length ? data.rows.map((row) => <tr key={row.id} className="border-t border-stroke align-top"><td className="whitespace-nowrap px-3 py-3">{fmtTime(row.publishedAt)}</td><td className="max-w-[220px] break-all px-3 py-3"><div>{row.source ?? "—"}</div><code className="text-[10px] text-[rgb(var(--secondary))]">{row.guid}</code></td><td className="max-w-[360px] px-3 py-3 font-medium">{row.headline}</td><td className="px-3 py-3"><span className="rounded bg-blue-500/15 px-2 py-1 text-xs">{row.classification}</span><div className="mt-2">{row.impact}</div></td><td className="px-3 py-3">{row.assets.map((asset) => `${asset.asset ?? "?"} ${asset.score ?? 0}`).join(", ") || "—"}</td><td className="px-3 py-3 text-xs">classification: {row.classificationCompleted ? "complete" : "pending"}<br />semantic: {row.semanticDedupCompleted ? "complete" : "pending"}<br />coverage: {row.coverageRepairCompleted ? "complete" : "pending"}</td><td className="px-3 py-3">{row.duplicateOf ? <span className="text-amber-300">DUPLICATE<br /><code className="text-[10px]">{row.duplicateOf}</code></span> : "—"}</td><td className="px-3 py-3">{row.displayEligible ? <span className="text-green-400">YES<br /><small>{row.visibleDestinations.join(", ")}</small></span> : <span className="text-red-300">NO</span>}</td><td className="px-3 py-3"><span className="rounded-full border border-stroke px-2 py-1 text-xs">{label(row.finalDecisionCode)}</span></td><td className="max-w-[360px] px-3 py-3">{row.finalDecisionReason}{row.secondaryReasons.length ? <details className="mt-2 text-xs text-[rgb(var(--secondary))]"><summary>Processing trace</summary>{row.secondaryReasons.join(", ")}</details> : null}{row.historicalDetail ? <div className="mt-2 text-[10px] text-amber-300">Historical/reconstructed detail</div> : null}</td></tr>) : <tr><td colSpan={10} className="px-4 py-12 text-center text-[rgb(var(--secondary))]">No persisted new items for this Dubai business day/filter.</td></tr>}</tbody></table></div>{data?.pagination && data.pagination.totalPages > 1 ? <div className="flex items-center justify-end gap-3 p-4 text-sm"><span>{data.pagination.total.toLocaleString()} rows</span><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded border border-stroke px-3 py-1.5 disabled:opacity-40">Previous</button><span>Page {page} / {data.pagination.totalPages}</span><button disabled={page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-stroke px-3 py-1.5 disabled:opacity-40">Next</button></div> : null}</section>
    </main>;
}
