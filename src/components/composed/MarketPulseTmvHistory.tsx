"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type UIEvent,
    type UIEventHandler,
} from "react";

import { cn } from "@/lib/utils";
import { formatMarketPulseAxisTime } from "@/lib/marketPulseTimezone";
import { FX_TMV_SCORE_MAX, FX_TMV_SCORE_MIN } from "@/lib/fxTmvGaugeZones";
import {
    TMV_HISTORY_BAR_COUNT,
    TMV_HISTORY_SLOT_MS,
    TMV_HISTORY_TIME_LABEL_INDICES,
} from "@/lib/tmvHistoryConfig";

const BAR_COUNT = TMV_HISTORY_BAR_COUNT;
const SLOT_MS = TMV_HISTORY_SLOT_MS;

/** Equal-width segments that fill the row: (100% − 1px gaps) / bar count. */
const BAR_SEGMENT_WIDTH = `calc((100% - ${BAR_COUNT - 1}px) / ${BAR_COUNT})`;
const BAR_TRACK_HEIGHT_PX = 60;

/** Trend, Momentum, Volatility: |2.5| = full bar height (same numeric domain as TMV gauges). */
const TM_BAR_MAX = 2.5;

/** Trend / Momentum / Volatility history bars: red (≤0), green (>0) — same rule; no gauge pink/yellow. */
const TM_HIST_RED = "#FF0000";
const TM_HIST_GREEN = "#05871A";

const TIME_AXIS_LABEL_STARTS = TMV_HISTORY_TIME_LABEL_INDICES;

/** Consecutive persisted snapshots from the left (slots are `[oldest…newest]` then `null` padding). */
function countFilledBarsFromLeft(slots: (MarketPulseTmvHistorySnapshot | null)[]): number {
    let n = 0;
    for (let i = 0; i < slots.length; i++) {
        if (!slots[i]) break;
        n += 1;
    }
    return n;
}

const BAR_ROW_SCROLL =
    "overflow-x-auto overflow-y-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const SCROLL_STRIP_COUNT = 4;

/**
 * Optional file-level toggle (no prop). Prefer passing `filledDemo` from the page for demos.
 * Also: `NEXT_PUBLIC_DUMMY_TMV_HISTORY=true` in `.env.local`.
 */
const QUICK_DUMMY_TMV_HISTORY_TOGGLE = false;

type TmvTriple = { trend: number; momentum: number; volatility: number };
export type MarketPulseTmvHistorySnapshot = TmvTriple & {
    capturedAt?: string;
    slotStartMs?: number;
};

type HistoryState = {
    slots: (MarketPulseTmvHistorySnapshot | null)[];
    cursor: number;
};

function clampTrendMomentum(score: number): number {
    return Math.max(FX_TMV_SCORE_MIN, Math.min(FX_TMV_SCORE_MAX, score));
}

function trendMomentumHistoryColor(score: number): string {
    const s = clampTrendMomentum(score);
    return s > 0 ? TM_HIST_GREEN : TM_HIST_RED;
}

function scoreToBarVisual(score: number): { heightPct: number; fillColor: string } {
    const s = clampTrendMomentum(score);
    const mag = Math.abs(s);
    const heightPct = Math.min(100, (mag / TM_BAR_MAX) * 100);
    return { heightPct, fillColor: trendMomentumHistoryColor(s) };
}

function snapshotTimeMs(slot: MarketPulseTmvHistorySnapshot | null): number {
    if (!slot) return Number.NaN;
    if (Number.isFinite(slot.slotStartMs)) return slot.slotStartMs!;
    if (slot.capturedAt) return Date.parse(slot.capturedAt);
    return Number.NaN;
}

/** Wall-clock time for bar index `i` on the 15‑minute grid (for axis ticks when no snapshot at `i`). */
function tickTimeMsFromWallClock(i: number, nowMs: number): number {
    const rightSlotStart = Math.floor(nowMs / SLOT_MS) * SLOT_MS;
    return rightSlotStart - (BAR_COUNT - 1 - i) * SLOT_MS;
}

/** Label time for bar index `i`: stored slot, 15‑min extrapolation from neighbors, or wall-clock grid. */
function resolvePersistedTickTimeMs(
    slots: (MarketPulseTmvHistorySnapshot | null)[],
    i: number,
    nowMs: number,
): number {
    const direct = snapshotTimeMs(slots[i] ?? null);
    if (Number.isFinite(direct)) return direct;
    for (let j = i - 1; j >= 0; j--) {
        const t = snapshotTimeMs(slots[j] ?? null);
        if (Number.isFinite(t)) return t + (i - j) * SLOT_MS;
    }
    for (let j = i + 1; j < BAR_COUNT; j++) {
        const t = snapshotTimeMs(slots[j] ?? null);
        if (Number.isFinite(t)) return t - (j - i) * SLOT_MS;
    }
    return tickTimeMsFromWallClock(i, nowMs);
}

const DUMMY_MIN_ABS_TM = 0.35;
const DUMMY_MIN_ABS_VOL = 0.08;

/** Synthetic timeline for demos — all three metrics on the ±2.5 clamp domain. */
function buildDummyHistorySlots(): TmvTriple[] {
    const ensureTm = (raw: number): number => {
        const c = clampTrendMomentum(raw);
        if (Math.abs(c) < DUMMY_MIN_ABS_TM) {
            return c >= 0 ? DUMMY_MIN_ABS_TM : -DUMMY_MIN_ABS_TM;
        }
        return c;
    };

    return Array.from({ length: BAR_COUNT }, (_, i) => {
        const t = i / Math.max(1, BAR_COUNT - 1);
        const wave = Math.sin(t * Math.PI * 2.4 + 0.55) * 2.2;
        const wave2 = Math.cos(t * Math.PI * 1.8 + 0.35) * 2.1;
        const step = ((i % 19) - 9) * 0.22;
        let vol = step * 0.35 + Math.sin(i * 0.42) * 1.1;
        vol = clampTrendMomentum(vol);
        if (Math.abs(vol) < DUMMY_MIN_ABS_VOL) {
            vol = vol >= 0 ? DUMMY_MIN_ABS_VOL : -DUMMY_MIN_ABS_VOL;
        }
        return {
            trend: ensureTm(wave + (i % 3) * 0.12),
            momentum: ensureTm(wave2 - (i % 4) * 0.14),
            volatility: vol,
        };
    });
}

function BarTrack({ score }: { score: number }) {
    const { heightPct, fillColor } = scoreToBarVisual(score);
    const showFill = heightPct > 0;

    return (
        <div
            className="relative shrink-0 overflow-hidden rounded-t-[2px] bg-currencyStrengthIndexBackground"
            style={{ width: BAR_SEGMENT_WIDTH, minWidth: BAR_SEGMENT_WIDTH, height: BAR_TRACK_HEIGHT_PX }}
        >
            {showFill ? (
                <div
                    className="absolute bottom-0 left-0 right-0 rounded-t-[2px] transition-[height] duration-300 ease-out"
                    style={{
                        height: `${heightPct}%`,
                        backgroundColor: fillColor,
                    }}
                />
            ) : null}
        </div>
    );
}

function MetricRow({
    label,
    values,
    liveScore,
    liveIndex,
    scrollRef,
    onScroll,
}: {
    label: string;
    values: (number | null)[];
    liveScore: number;
    liveIndex: number;
    scrollRef: (el: HTMLDivElement | null) => void;
    onScroll: UIEventHandler<HTMLDivElement>;
}) {
    return (
        <div className="flex w-full flex-col gap-2">
            <div className="flex items-center justify-center">
                <span className="font-semibold tracking-tight text-foreground">{label}</span>
            </div>
            <div
                ref={scrollRef}
                onScroll={onScroll}
                className={cn("flex w-full min-w-0 items-end justify-start gap-px", BAR_ROW_SCROLL)}
            >
                {values.map((v, i) => (
                    <BarTrack
                        key={i}
                        score={liveIndex >= 0 && i === liveIndex ? liveScore : (v ?? 0)}
                    />
                ))}
            </div>
        </div>
    );
}

function TimeAxisRow({
    labelByIndex,
    scrollRef,
    onScroll,
}: {
    labelByIndex: Map<number, string>;
    scrollRef: (el: HTMLDivElement | null) => void;
    onScroll: UIEventHandler<HTMLDivElement>;
}) {
    return (
        <div
            ref={scrollRef}
            onScroll={onScroll}
            className={cn(
                "flex w-full min-w-0 items-end justify-start gap-px",
                BAR_ROW_SCROLL,
            )}
        >
            {Array.from({ length: BAR_COUNT }, (_, i) => {
                const label = labelByIndex.get(i) ?? "";
                return (
                    <div
                        key={i}
                        className="flex min-h-[16px] shrink-0 flex-col justify-center overflow-visible pb-0.5 pt-1"
                        style={{ width: BAR_SEGMENT_WIDTH, minWidth: BAR_SEGMENT_WIDTH }}
                    >
                        <span
                            className={cn(
                                "block w-full min-w-0 text-center",
                                "whitespace-nowrap text-[10px] font-semibold leading-tight tracking-tight sm:text-[11px]",
                                "text-foreground/90",
                            )}
                        >
                            {label || "\u00a0"}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export type MarketPulseTmvHistoryProps = {
    trend: number;
    momentum: number;
    volatility: number;
    className?: string;
    /**
     * When true (or when `QUICK_DUMMY_TMV_HISTORY_TOGGLE` / env dummy flags are on), every segment uses
     * synthetic scores for demos. Omit for **live** 15‑minute capture from real TMV props.
     */
    filledDemo?: boolean;
    /** IANA zone id for slot labels under the chart (from persisted Market Pulse preference / device). */
    timeZone: string;
    /** Persisted backend snapshots; when provided, renders backend history instead of local timers. */
    historySlots?: MarketPulseTmvHistorySnapshot[];
};

export default function MarketPulseTmvHistory({
    trend,
    momentum,
    volatility,
    className,
    filledDemo = false,
    timeZone,
    historySlots,
}: MarketPulseTmvHistoryProps) {
    const useSyntheticTimeline =
        filledDemo ||
        QUICK_DUMMY_TMV_HISTORY_TOGGLE ||
        process.env.NEXT_PUBLIC_DUMMY_TMV_HISTORY === "true" ||
        process.env.NEXT_PUBLIC_DUMMY_TMV_HISTORY === "1";
    const usePersistedTimeline =
        !useSyntheticTimeline && Array.isArray(historySlots);

    const lastRef = useRef<TmvTriple>({ trend, momentum, volatility });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [history, setHistory] = useState<HistoryState>(() =>
        useSyntheticTimeline
            ? {
                slots: buildDummyHistorySlots(),
                /** −1 = every column uses dummy slots (no “live” replacement column). */
                cursor: -1,
            }
            : { slots: Array.from({ length: BAR_COUNT }, () => null), cursor: 0 },
    );

    const scrollStripRefs = useRef<(HTMLDivElement | null)[]>([null, null, null, null]);
    const ignoreScrollSync = useRef(false);

    const assignScrollStripRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
        scrollStripRefs.current[index] = el;
    }, []);

    const handleStripScroll = useCallback((fromIndex: number) => {
        return (e: UIEvent<HTMLDivElement>) => {
            if (ignoreScrollSync.current) return;
            const left = e.currentTarget.scrollLeft;
            ignoreScrollSync.current = true;
            for (let i = 0; i < SCROLL_STRIP_COUNT; i++) {
                const el = scrollStripRefs.current[i];
                if (el && i !== fromIndex) {
                    el.scrollLeft = left;
                }
            }
            ignoreScrollSync.current = false;
        };
    }, []);

    /** Recompute axis labels periodically and on 15-minute slot boundaries. */
    const [axisNowMs, setAxisNowMs] = useState(() => Date.now());
    useEffect(() => {
        const bump = () => setAxisNowMs(Date.now());
        bump();
        const id30 = window.setInterval(bump, 30_000);
        const slotRemain = Math.max(1, SLOT_MS - (Date.now() % SLOT_MS));
        let id15: number | undefined;
        const alignTimeout = window.setTimeout(() => {
            bump();
            id15 = window.setInterval(bump, SLOT_MS) as unknown as number;
        }, slotRemain);
        return () => {
            window.clearInterval(id30);
            window.clearTimeout(alignTimeout);
            if (id15 !== undefined) window.clearInterval(id15);
        };
    }, []);

    useEffect(() => {
        lastRef.current = { trend, momentum, volatility };
    }, [trend, momentum, volatility]);

    useEffect(() => {
        if (useSyntheticTimeline || usePersistedTimeline) return undefined;

        const arm = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            const delay = Math.max(1, SLOT_MS - (Date.now() % SLOT_MS));
            timeoutRef.current = setTimeout(() => {
                const snap = lastRef.current;
                const entry = {
                    ...snap,
                    capturedAt: new Date().toISOString(),
                    slotStartMs: Math.floor(Date.now() / SLOT_MS) * SLOT_MS,
                };
                setHistory((prev) => {
                    // Completed a full row (0…39) — clear and start a new cycle at bar 0.
                    if (prev.cursor === BAR_COUNT - 1) {
                        const nextSlots: (MarketPulseTmvHistorySnapshot | null)[] = Array.from(
                            { length: BAR_COUNT },
                            () => null,
                        );
                        nextSlots[0] = entry;
                        return { slots: nextSlots, cursor: 1 };
                    }
                    const nextSlots = [...prev.slots];
                    nextSlots[prev.cursor] = entry;
                    return { slots: nextSlots, cursor: prev.cursor + 1 };
                });
                setAxisNowMs(Date.now());
                arm();
            }, delay);
        };

        arm();
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        };
    }, [useSyntheticTimeline, usePersistedTimeline]);

    const persistedHistory = useMemo<HistoryState | null>(() => {
        if (!usePersistedTimeline) return null;

        const sanitized = (historySlots ?? [])
            .filter((slot): slot is MarketPulseTmvHistorySnapshot => (
                Boolean(slot) &&
                Number.isFinite(slot.trend) &&
                Number.isFinite(slot.momentum) &&
                Number.isFinite(slot.volatility)
            ))
            .slice(-BAR_COUNT);

        return {
            slots: [
                ...sanitized,
                ...Array.from({ length: Math.max(0, BAR_COUNT - sanitized.length) }, () => null),
            ],
            /** Persisted data already contains the latest backend snapshot. */
            cursor: -1,
        };
    }, [historySlots, usePersistedTimeline]);

    const activeHistory = persistedHistory ?? history;

    /** After each new slot, align strips so the latest bars (right) stay in view when overflowed. */
    useLayoutEffect(() => {
        for (let i = 0; i < SCROLL_STRIP_COUNT; i++) {
            const el = scrollStripRefs.current[i];
            if (el) {
                el.scrollLeft = el.scrollWidth - el.clientWidth;
            }
        }
    }, [activeHistory.cursor, activeHistory.slots]);

    const trendValues = activeHistory.slots.map((s) => (s ? s.trend : null));
    const momentumValues = activeHistory.slots.map((s) => (s ? s.momentum : null));
    const volatilityValues = activeHistory.slots.map((s) => (s ? s.volatility : null));

    const timeAxisLabels = useMemo(() => {
        if (usePersistedTimeline) {
            const nowMs = axisNowMs;
            const filled = countFilledBarsFromLeft(activeHistory.slots);
            const map = new Map<number, string>();
            for (const i of TIME_AXIS_LABEL_STARTS) {
                if (filled < i + 1) continue;
                const ms = resolvePersistedTickTimeMs(activeHistory.slots, i, nowMs);
                if (Number.isFinite(ms)) {
                    map.set(i, formatMarketPulseAxisTime(ms, timeZone));
                }
            }
            return map;
        }
        const now = axisNowMs;
        const filled = countFilledBarsFromLeft(activeHistory.slots);
        const rightSlotStart = Math.floor(now / SLOT_MS) * SLOT_MS;
        const map = new Map<number, string>();
        for (const i of TIME_AXIS_LABEL_STARTS) {
            if (filled < i + 1) continue;
            const slotStartMs = rightSlotStart - (BAR_COUNT - 1 - i) * SLOT_MS;
            map.set(i, formatMarketPulseAxisTime(slotStartMs, timeZone));
        }
        return map;
    }, [activeHistory.slots, timeZone, axisNowMs, usePersistedTimeline]);

    const historyLiveColumnIndex = usePersistedTimeline ? -1 : activeHistory.cursor;

    return (
        <div
            className={cn(
                "flex h-full min-h-0 w-full flex-col gap-5 overflow-x-hidden overflow-y-visible rounded-xl bg-darkGrey p-6",
                "shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]",
                className,
            )}
        >
            <MetricRow
                label="Trend"
                values={trendValues}
                liveScore={trend}
                liveIndex={historyLiveColumnIndex}
                scrollRef={assignScrollStripRef(0)}
                onScroll={handleStripScroll(0)}
            />
            <MetricRow
                label="Momentum"
                values={momentumValues}
                liveScore={momentum}
                liveIndex={historyLiveColumnIndex}
                scrollRef={assignScrollStripRef(1)}
                onScroll={handleStripScroll(1)}
            />
            <div className="flex w-full min-w-0 flex-col gap-3">
                <MetricRow
                    label="Volatility"
                    values={volatilityValues}
                    liveScore={volatility}
                    liveIndex={historyLiveColumnIndex}
                    scrollRef={assignScrollStripRef(2)}
                    onScroll={handleStripScroll(2)}
                />
                <TimeAxisRow
                    labelByIndex={timeAxisLabels}
                    scrollRef={assignScrollStripRef(3)}
                    onScroll={handleStripScroll(3)}
                />
            </div>
        </div>
    );
}
