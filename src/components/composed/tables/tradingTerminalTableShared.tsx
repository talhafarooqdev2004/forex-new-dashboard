import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, PencilLine, Trash2 } from "lucide-react";
import Link from "next/link";
import Icon from "@/components/composed/Icon";
import { cn } from "@/lib/utils";

// Single shared palette — the green used by TP columns and the red used by the Current Price column.
export const TRADE_GREEN = "#05df72";
export const TRADE_RED = "#fa003f";
export const TRADE_BLUE = "#3b82f6";

const GREEN_PILL = "bg-[rgba(5,223,114,0.15)] border-[rgba(5,223,114,0.35)] text-[#05df72]";
const RED_PILL = "bg-[rgba(250,0,63,0.15)] border-[rgba(250,0,63,0.35)] text-[#fa003f]";

const SPARKLINE_UP =
    "M0 14L6 12L12 13L18 9L24 10L30 7L36 8L42 5L48 6L54 3L60 2";
const SPARKLINE_DOWN =
    "M0 2L6 4L12 3L18 7L24 6L30 9L36 8L42 11L48 10L54 13L60 14";

export function TradingTableShell({
    title,
    showSettings = false,
    settingsHref,
    headerLink,
    headerActions,
    children,
    footer,
}: {
    title: string;
    showSettings?: boolean;
    settingsHref?: string;
    /** Optional link shown in the table header (e.g. Export Trade History). */
    headerLink?: { href: string; label: string };
    /** Optional header controls (zoom, export, etc.) — takes precedence over headerLink when set. */
    headerActions?: React.ReactNode;
    children: React.ReactNode;
    /** Pass `null` to render no footer (e.g. Active Trades). Omit for the default pagination. */
    footer?: React.ReactNode;
}) {
    return (
        <div className="bg-darkGrey rounded-[12px] w-full border border-stroke overflow-hidden text-foreground">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 py-3 border-b border-stroke px-4">
                <div className="flex items-center justify-start min-h-[22px]">
                    {showSettings && settingsHref ? (
                        <Link
                            href={settingsHref}
                            className="text-foreground/80 hover:text-foreground"
                            aria-label={`${title} settings`}
                        >
                            <Icon name="trading-settings.svg" width={22} height={22} />
                        </Link>
                    ) : null}
                </div>
                <h2 className="font-bold text-[20px] leading-[24px] text-center">{title}</h2>
                <div className="flex items-center justify-end gap-2 min-h-[22px]">
                    {headerActions ? (
                        headerActions
                    ) : headerLink ? (
                        <Link
                            href={headerLink.href}
                            className="rounded-[8px] border border-stroke bg-stroke/10 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-stroke/20"
                        >
                            {headerLink.label}
                        </Link>
                    ) : null}
                </div>
            </div>

            {children}

            {footer !== undefined ? footer : <TradingTablePagination />}
        </div>
    );
}

export function TradingTablePagination({
    page = 1,
    totalPages = 1,
    onPageChange,
    trailing,
}: {
    page?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    trailing?: React.ReactNode;
}) {
    const controls = <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} />;

    if (trailing) {
        return (
            <div className="w-full min-w-0 border-t border-stroke">
                <div className="flex items-center min-w-0">
                    <div className="flex-1 flex items-center justify-center gap-4 py-2 bg-stroke/10">{controls}</div>
                    {trailing}
                </div>
            </div>
        );
    }

    return <div className="flex items-center justify-center gap-4 py-2 bg-stroke/10 border-t border-stroke">{controls}</div>;
}

function PaginationControls({
    page,
    totalPages,
    onPageChange,
}: {
    page: number;
    totalPages: number;
    onPageChange?: (page: number) => void;
}) {
    const current = Math.max(1, Math.min(totalPages, Number(page) || 1));

    const go = (target: number) => {
        const next = Math.max(1, Math.min(totalPages, target));
        if (onPageChange && next !== current) onPageChange(next);
    };

    const btnClass = (disabled: boolean) =>
        cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-[4px] transition-opacity",
            disabled ? "opacity-30 cursor-not-allowed" : "opacity-80 hover:opacity-100 hover:bg-stroke/20",
        );

    const atStart = current <= 1;
    const atEnd = current >= totalPages;

    return (
        <>
            <span className="font-bold text-[11px] leading-[15px]">Page {current}</span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className={btnClass(atStart)}
                    disabled={atStart}
                    aria-label="Previous page"
                    onClick={() => go(current - 1)}
                >
                    <ChevronLeft className="w-[14px] h-[14px]" />
                </button>
                <span className="bg-stroke/20 rounded-[4px] px-2 py-[1px] font-bold text-[11px] leading-[15px]">{current}</span>
                <span className="font-bold text-[11px] leading-[15px] text-secondary">of {totalPages}</span>
                <button
                    type="button"
                    className={btnClass(atEnd)}
                    disabled={atEnd}
                    aria-label="Next page"
                    onClick={() => go(current + 1)}
                >
                    <ChevronRight className="w-[14px] h-[14px]" />
                </button>
            </div>
            <div className="flex items-center gap-2 pl-4 ml-2 border-l border-stroke">
                <button
                    type="button"
                    className={btnClass(atStart)}
                    disabled={atStart}
                    aria-label="First page"
                    onClick={() => go(1)}
                >
                    <ChevronsLeft className="w-[14px] h-[14px]" />
                </button>
                <button
                    type="button"
                    className={btnClass(atEnd)}
                    disabled={atEnd}
                    aria-label="Last page"
                    onClick={() => go(totalPages)}
                >
                    <ChevronsRight className="w-[14px] h-[14px]" />
                </button>
            </div>
        </>
    );
}

/** Colored pill (green Buy / red Sell). Shows the full type label (e.g. "Buy Limit") when provided. */
function DirectionPill({ direction, label }: { direction: "Buy" | "Sell"; label?: string }) {
    return (
        <span
            className={cn(
                "inline-block px-2 py-0.5 rounded-[4px] border font-bold text-[11px] leading-[15px] whitespace-nowrap",
                direction === "Buy" ? GREEN_PILL : RED_PILL,
            )}
        >
            {label ?? direction}
        </span>
    );
}

export const ActiveDirectionPill = DirectionPill;
export const HistoryDirectionPill = DirectionPill;

/** Plain neutral text for the trade Type (Swing/Scalping/Intraday) — not a select box. */
export function HistoryTypePill({ type }: { type: string }) {
    return <span className="text-[13px] whitespace-nowrap">{type}</span>;
}

export function StatusPill({
    label,
    variant,
}: {
    label: string;
    variant: "open" | "profit" | "closed" | "loss" | "pending" | "breakeven";
}) {
    const styles = {
        open: "bg-[rgba(59,130,246,0.18)] border-[rgba(59,130,246,0.4)] text-[#60a5fa]",
        profit: GREEN_PILL,
        closed: "bg-stroke/15 border-stroke/50 text-secondary",
        loss: RED_PILL,
        pending: "bg-[rgba(250,204,21,0.18)] border-[rgba(250,204,21,0.4)] text-[#facc15]",
        breakeven: "bg-[rgba(59,130,246,0.18)] border-[rgba(59,130,246,0.45)] text-[#3b82f6]",
    }[variant];

    return (
        <span className={cn("inline-block px-2 py-[1px] rounded-full border text-[11px] font-bold leading-[15px] whitespace-nowrap", styles)}>
            {label}
        </span>
    );
}

export function OutcomeSparkline({ positive }: { positive: boolean }) {
    return (
        <svg className="w-[60px] h-[16px]" viewBox="0 0 60 16" fill="none" aria-hidden>
            <path
                d={positive ? SPARKLINE_UP : SPARKLINE_DOWN}
                stroke={positive ? TRADE_GREEN : TRADE_RED}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function TableActionButton({ kind }: { kind: "edit" | "delete" }) {
    const IconComponent = kind === "edit" ? PencilLine : Trash2;
    const label = kind === "edit" ? "Edit trade" : "Delete trade";

    return (
        <button
            type="button"
            className="inline-flex items-center justify-center w-7 h-7 rounded-[4px] text-secondary hover:text-foreground hover:bg-stroke/20"
            aria-label={label}
        >
            <IconComponent className="w-[14px] h-[14px]" />
        </button>
    );
}

// Consistent header/cell styles across both tables — gap-separated cells (heatmap-style).
const terminalThCell = "rounded-[4px] border border-stroke bg-stroke/10 dark:border-stroke/60";
const terminalTdCell =
    "rounded-[4px] border border-stroke bg-chartInnerBg dark:bg-[#2A2E37] dark:border-[#2A2E37]";

/** Shared table layout: visible gaps between columns/rows instead of merged borders. */
export function tradingTerminalTableClass(
    minWidthClass?: string,
    opts?: { width?: "full" | "max" },
) {
    return cn(
        opts?.width === "max" ? "w-max table-auto" : "w-full",
        "border-separate [border-spacing:4px_6px]",
        minWidthClass,
    );
}

/** Active Trades: columns stay content-sized when visibility changes. */
export function activeTradesTerminalTableClass() {
    return cn(
        "w-max max-w-none table-auto border-separate [border-spacing:4px_6px]",
    );
}

/** Wrapper padding so edge cell spacing is not clipped by the scroll container. */
export const tradingTerminalTableScrollClass = "horizontal-scroll px-1.5 pb-1.5";

/** Active Trades: vertical scroll after this many rows (header excluded). */
export const ACTIVE_TRADES_VERTICAL_SCROLL_THRESHOLD = 15;

/** ≈ sticky header + 15 gap-separated body rows. */
export const ACTIVE_TRADES_SCROLL_MAX_HEIGHT = "max-h-[728px]";

export function activeTradesTableScrollClass(rowCount: number) {
    const scrollVertically = rowCount > ACTIVE_TRADES_VERTICAL_SCROLL_THRESHOLD;
    return cn(
        tradingTerminalTableScrollClass,
        scrollVertically && ACTIVE_TRADES_SCROLL_MAX_HEIGHT,
        scrollVertically && "!overflow-y-auto",
    );
}

export function tradingTerminalEmptyTdClass(extra = "") {
    return cn(
        "px-3 py-6 text-center text-[13px] leading-[16px] text-secondary rounded-[4px] bg-transparent border-0",
        extra,
    );
}

export function activeThClass(extra = "") {
    return cn(
        "w-px px-3 py-2.5 text-left font-bold text-[13px] leading-[15px] whitespace-nowrap",
        terminalThCell,
        extra,
    );
}

export function activeTdClass(extra = "") {
    return cn("w-px px-3 py-3 text-[13px] leading-[16px] whitespace-nowrap", terminalTdCell, extra);
}

export function historyThClass(extra = "") {
    return cn(
        "px-3 py-2.5 text-center font-bold text-[13px] leading-[15px] whitespace-nowrap",
        terminalThCell,
        extra,
    );
}

export function historyTdClass(extra = "") {
    return cn("px-3 py-3 text-center text-[13px] leading-[16px] whitespace-nowrap", terminalTdCell, extra);
}

export function historyZoomThClass(extra = "") {
    return cn(
        "px-5 py-3.5 text-center font-bold text-[16px] leading-[20px] whitespace-nowrap",
        terminalThCell,
        extra,
    );
}

export function historyZoomTdClass(extra = "") {
    return cn("px-5 py-4 text-center text-[16px] leading-[22px] whitespace-nowrap", terminalTdCell, extra);
}
