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
    children,
    footer,
}: {
    title: string;
    showSettings?: boolean;
    settingsHref?: string;
    children: React.ReactNode;
    /** Pass `null` to render no footer (e.g. Active Trades). Omit for the default pagination. */
    footer?: React.ReactNode;
}) {
    return (
        <div className="bg-darkGrey rounded-[12px] w-full border border-stroke overflow-hidden text-foreground">
            <div className="flex items-center justify-center py-3 border-b border-stroke relative px-12">
                <h2 className="font-bold text-[20px] leading-[24px]">{title}</h2>
                {showSettings && settingsHref ? (
                    <Link
                        href={settingsHref}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/80 hover:text-foreground"
                        aria-label={`${title} settings`}
                    >
                        <Icon name="trading-settings.svg" width={22} height={22} />
                    </Link>
                ) : null}
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
    const go = (p: number) => {
        if (onPageChange && p >= 1 && p <= totalPages && p !== page) onPageChange(p);
    };
    const arrow = (disabled: boolean) =>
        cn("w-[14px] h-[14px]", disabled ? "opacity-30 cursor-default" : "cursor-pointer opacity-80 hover:opacity-100");
    const atStart = page <= 1;
    const atEnd = page >= totalPages;

    return (
        <>
            <span className="font-bold text-[11px] leading-[15px]">Page {page}</span>
            <div className="flex items-center gap-2">
                <ChevronLeft className={arrow(atStart)} onClick={() => go(page - 1)} />
                <span className="bg-stroke/20 rounded-[4px] px-2 py-[1px] font-bold text-[11px] leading-[15px]">{page}</span>
                <span className="font-bold text-[11px] leading-[15px] text-secondary">of {totalPages}</span>
                <ChevronRight className={arrow(atEnd)} onClick={() => go(page + 1)} />
            </div>
            <div className="flex items-center gap-1 pl-4 border-l border-stroke">
                <ChevronsLeft className={arrow(atStart)} onClick={() => go(1)} />
                <ChevronsRight className={arrow(atEnd)} onClick={() => go(totalPages)} />
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
    variant: "open" | "profit" | "closed" | "loss" | "pending";
}) {
    const styles = {
        open: "bg-[rgba(59,130,246,0.18)] border-[rgba(59,130,246,0.4)] text-[#60a5fa]",
        profit: GREEN_PILL,
        closed: "bg-stroke/15 border-stroke/50 text-secondary",
        loss: RED_PILL,
        pending: "bg-[rgba(250,204,21,0.18)] border-[rgba(250,204,21,0.4)] text-[#facc15]",
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

// Consistent header/cell styles across both tables (same font family as the rest of the app + one size).
export function activeThClass(extra = "") {
    return cn("px-3 py-2.5 text-left font-bold text-[13px] leading-[15px] border-r border-stroke last:border-r-0 whitespace-nowrap", extra);
}

export function activeTdClass(extra = "") {
    return cn("px-3 py-3 border-l border-b border-t border-stroke text-[13px] leading-[16px] whitespace-nowrap", extra);
}

export function historyThClass(extra = "") {
    return cn("px-3 py-2.5 text-center font-bold text-[13px] leading-[15px] border border-stroke whitespace-nowrap", extra);
}

export function historyTdClass(extra = "") {
    return cn("px-3 py-3 text-center text-[13px] leading-[16px] border border-stroke whitespace-nowrap", extra);
}
