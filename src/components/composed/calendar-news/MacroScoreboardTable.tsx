"use client";

import { useEffect, useMemo, useState } from "react";

import { Table, Tbody, Td, Th, Thead, Tr } from "@/components/composed/base-table";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { MacroScoreboardRow } from "@/lib/calendarNewsScoreboardData";
import { marketDayKey, SCOREBOARD_UI, biasTextColor, scoreTextColor } from "@/lib/calendarNewsScoreboardData";
import { apiConfig } from "@/services/api.config";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";
import { CN_TD_STYLE, CN_TD_WRAP_STYLE, CN_TH_STYLE } from "./calendarNewsAdminTableStyles";

import styles from "./CalendarNewsScoreboards.module.scss";

type MacroScoreboardTableProps = {
    rows: MacroScoreboardRow[];
};

type MacroCommentResponse = { success?: boolean; data?: { comments?: Record<string, string> } };

export default function MacroScoreboardTable({ rows }: MacroScoreboardTableProps) {
    const { ready, isAdmin, token } = useAuth();
    const showAdminColumns = ready && isAdmin;
    const dayKey = useMemo(() => marketDayKey(), []);
    const [comments, setComments] = useState<Record<string, string>>({});
    const [factorCurrency, setFactorCurrency] = useState<string | null>(null);
    const [commentCurrency, setCommentCurrency] = useState<string | null>(null);
    const [commentDraft, setCommentDraft] = useState("");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (!showAdminColumns || !token) {
            setComments({});
            return;
        }
        let cancelled = false;
        void (async () => {
            try {
                const response = await fetch(`${apiConfig.baseURL}/api/v1/admin/macro-comments?day=${encodeURIComponent(dayKey)}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                    cache: "no-store",
                });
                const json = (await response.json().catch(() => ({}))) as MacroCommentResponse;
                if (!cancelled && response.ok && json.success) setComments(json.data?.comments ?? {});
            } catch {
                if (!cancelled) setComments({});
            }
        })();
        return () => { cancelled = true; };
    }, [showAdminColumns, token, dayKey]);

    const selectedFactorRow = useMemo(
        () => (factorCurrency ? rows.find((row) => row.currency === factorCurrency) ?? null : null),
        [factorCurrency, rows],
    );
    const selectedCommentRow = useMemo(
        () => (commentCurrency ? rows.find((row) => row.currency === commentCurrency) ?? null : null),
        [commentCurrency, rows],
    );
    const minWidth = showAdminColumns ? 900 : 620;

    const openCommentEditor = (row: MacroScoreboardRow) => {
        setCommentCurrency(row.currency);
        setCommentDraft(comments[row.currency] ?? row.comment);
        setSaveError(null);
    };

    const saveComment = async () => {
        if (!commentCurrency || !token) return;
        setSaving(true);
        setSaveError(null);
        try {
            const response = await fetch(
                `${apiConfig.baseURL}/api/v1/admin/macro-comments/${encodeURIComponent(commentCurrency)}?day=${encodeURIComponent(dayKey)}`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
                    body: JSON.stringify({ comment: commentDraft }),
                },
            );
            if (!response.ok) throw new Error("Unable to save the admin comment");
            setComments((current) => ({ ...current, [commentCurrency]: commentDraft.trim() }));
            setCommentCurrency(null);
        } catch (error) {
            setSaveError(error instanceof Error ? error.message : "Unable to save the admin comment");
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className={styles.panel} aria-label="Macro Scoreboard">
            <h2 className={styles.panelTitle}>Macro Scoreboard</h2>
            <div className={`${styles.tableScroll} ${styles.scoreboardStickyScroll}`}>
                {rows.length === 0 ? (
                    <div className={styles.emptyState}>No macro scoreboard data available</div>
                ) : (
                    <Table enableDragScroll ariaLabel="Macro Scoreboard" style={{ minWidth }}>
                        <Thead>
                            <Tr>
                                <Th style={CN_TH_STYLE}>Currency</Th>
                                <Th style={CN_TH_STYLE}>Current Bias</Th>
                                <Th style={CN_TH_STYLE}>Macro Score</Th>
                                <Th style={CN_TH_STYLE}>Trend</Th>
                                <Th style={{ ...CN_TH_STYLE, minWidth: 120 }}>Market Factor</Th>
                                {showAdminColumns ? <Th style={{ ...CN_TH_STYLE, minWidth: 200 }}>Comment</Th> : null}
                            </Tr>
                        </Thead>
                        <Tbody>
                            {rows.map((row) => (
                                <Tr key={row.currency}>
                                    <Td className={`${styles.tdCentered} ${styles.cellThin}`} style={CN_TD_STYLE}>
                                        <span className={styles.assetCell}><CalendarNewsAssetIcon asset={row.currency} size={26} /><span>{row.currency}</span></span>
                                    </Td>
                                    <Td className={`${styles.tdCentered} ${styles.cellThin}`} style={CN_TD_STYLE}>
                                        <div className={styles.cellCenter}><span className={`${styles.biasLabel} ${styles.cellThin}`} style={{ color: biasTextColor(row.bias) }}>{row.bias}</span></div>
                                    </Td>
                                    <Td className={`${styles.tdCentered} ${styles.cellThin}`} style={CN_TD_STYLE}>
                                        <div className={styles.cellCenter}><span className={`${styles.tabular} ${styles.cellThin}`} style={{ color: scoreTextColor(row.macroScore) }}>{formatSignedScore(row.macroScore)}</span></div>
                                    </Td>
                                    <Td className={`${styles.tdCentered} ${styles.cellThin}`} style={CN_TD_STYLE}>
                                        <div className={styles.cellCenter}><TrendIcon trend={row.trend} /></div>
                                    </Td>
                                    <Td className={`${styles.tdCentered} ${styles.cellThin}`} style={{ ...CN_TD_STYLE, minWidth: 120 }}>
                                        {row.factor ? (
                                            <Button type="button" variant="outline" size="sm" className={styles.viewFactorsBtn} onClick={() => setFactorCurrency(row.currency)}>
                                                View
                                            </Button>
                                        ) : <span className={styles.noFactor}>—</span>}
                                    </Td>
                                    {showAdminColumns ? (
                                        <Td style={CN_TD_WRAP_STYLE} className={`${styles.tdComment} ${styles.cellThin}`}>
                                            <button type="button" className={styles.commentButton} onClick={() => openCommentEditor(row)} title={`Edit ${row.currency} admin comment`}>
                                                {comments[row.currency] ?? row.comment}
                                            </button>
                                        </Td>
                                    ) : null}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                )}
            </div>

            {selectedFactorRow?.factor ? (
                <MacroFactorDialog
                    row={selectedFactorRow}
                    open={Boolean(factorCurrency)}
                    onOpenChange={(open) => { if (!open) setFactorCurrency(null); }}
                />
            ) : null}
            {showAdminColumns && selectedCommentRow ? (
                <Dialog open={Boolean(commentCurrency)} onOpenChange={(open) => { if (!open && !saving) setCommentCurrency(null); }}>
                    <DialogContent className={styles.macroDialog}>
                        <DialogHeader>
                            <DialogTitle>{selectedCommentRow.currency} · Admin comment</DialogTitle>
                            <DialogDescription>Private to admins and saved for the current Dubai market day ({dayKey}).</DialogDescription>
                        </DialogHeader>
                        <Textarea variant="default" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} maxLength={2000} aria-label={`${selectedCommentRow.currency} admin comment`} />
                        {saveError ? <p className={styles.saveError}>{saveError}</p> : null}
                        <div className={styles.dialogActions}>
                            <Button type="button" variant="outline" onClick={() => setCommentCurrency(null)} disabled={saving}>Cancel</Button>
                            <Button type="button" onClick={() => void saveComment()} disabled={saving}>{saving ? "Saving…" : "Save comment"}</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : null}
        </section>
    );
}

function MacroFactorDialog({ row, open, onOpenChange }: { row: MacroScoreboardRow; open: boolean; onOpenChange: (open: boolean) => void }) {
    const factor = row.factor!;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={styles.macroDialog}>
                <DialogHeader>
                    <DialogTitle>{row.currency} · Market factor</DialogTitle>
                    <DialogDescription>{factor.country || row.currency} · {factor.impact} impact · score {formatSignedScore(factor.score)}</DialogDescription>
                </DialogHeader>
                <p className={styles.factorHeadline}>{factor.event}</p>
                <dl className={styles.factorValues}>
                    <div><dt>Actual</dt><dd>{factor.actual ?? "—"}</dd></div>
                    <div><dt>Forecast</dt><dd>{factor.forecast ?? "—"}</dd></div>
                    <div><dt>Previous</dt><dd>{factor.previous ?? "—"}</dd></div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}

function formatSignedScore(score: number): string {
    const rounded = Math.abs(score - Math.round(score)) < 1e-6 ? Math.round(score) : Number(score.toFixed(1));
    if (rounded === 0) return "0.0";
    return `${rounded > 0 ? "+" : ""}${rounded}`;
}

function TrendIcon({ trend }: { trend: MacroScoreboardRow["trend"] }) {
    if (trend === "up") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 5L12 19M12 5L6 11M12 5L18 11" stroke={SCOREBOARD_UI.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    if (trend === "down") return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 19L12 5M12 19L6 13M12 19L18 13" stroke={SCOREBOARD_UI.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M5 12H19M19 12L14 7M19 12L14 17" stroke={SCOREBOARD_UI.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
