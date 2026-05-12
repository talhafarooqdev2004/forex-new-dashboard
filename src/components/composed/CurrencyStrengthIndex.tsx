import type { CurrencyStrengthStrengthRange } from "@/lib/currencyStrengthBarColors";
import { getCurrencyStrengthIndexBarGradient } from "@/lib/currencyStrengthIndexBarGradient";
import { cn } from "@/lib/utils";

const MAX_STRENGTH_MAGNITUDE = 10;

function CurrencyStrengthIndexes({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-3">
            {children}
        </div>
    );
}

type CurrencyStrengthIndexProps = {
    currency: string;
    value: number | string;
    /** Optional override: fill width 0–100% (magnitude of score vs max 10). */
    strength?: number;
    /** Kept for API compatibility; fills are flat bull/bear colors (Technical Dashboard look). */
    strengthRange?: CurrencyStrengthStrengthRange;
};

function formatStrengthLabel(v: number): string {
    if (Number.isNaN(v) || v === 0) return "0";
    if (Number.isInteger(v)) return String(v);
    return v.toFixed(1);
}

function parseStrengthNumber(value: number | string): number {
    if (typeof value === "number") return value;
    const compact = String(value)
        .replace(/\u2212/g, "-")
        .replace(/\u00a0/g, "")
        .replace(/\s+/g, "")
        .trim();
    return Number(compact);
}

function CurrencyStrengthIndex({ currency, strength, value }: CurrencyStrengthIndexProps) {
    const numValue = parseStrengthNumber(value);
    const isFiniteValue = Number.isFinite(numValue);
    const magnitude = isFiniteValue ? Math.min(MAX_STRENGTH_MAGNITUDE, Math.abs(numValue)) : 0;
    /** e.g. 0.8 → 8% of track, 6.6 → 66% of track (magnitude / 10) */
    const fillPercent = strength !== undefined
        ? Math.max(0, Math.min(100, strength))
        : (magnitude / MAX_STRENGTH_MAGNITUDE) * 100;
    const showBar = isFiniteValue && numValue !== 0 && fillPercent > 0;
    const label = isFiniteValue ? formatStrengthLabel(numValue) : String(value);
    const gradientScore = isFiniteValue ? Math.sign(numValue) * Math.min(5, Math.abs(numValue)) : 0;
    const barGradient = getCurrencyStrengthIndexBarGradient(gradientScore);

    return (
        <div className="flex items-center gap-4 min-w-0">
            <span className="shrink-0 w-10 text-sm tabular-nums">{currency}</span>

            <div className="relative h-[30px] min-w-0 flex-1 overflow-hidden rounded-[3px] bg-currencyStrengthIndexBackground pr-2">
                {showBar ? (
                    <div
                        className={cn(
                            "absolute left-0 top-0 z-[1] h-full min-h-[30px] rounded-[3px]",
                        )}
                        style={{
                            width: `${fillPercent}%`,
                            minWidth: fillPercent > 0 ? "2px" : undefined,
                            background: barGradient,
                        }}
                    >
                        <span className="absolute right-2.5 top-1/2 max-w-[calc(100%-0.75rem)] -translate-y-1/2 truncate pr-0.5 text-xs font-medium tabular-nums text-black">
                            {label}
                        </span>
                    </div>
                ) : (
                    <div className="absolute left-2 top-1/2 z-[1] -translate-y-1/2 text-xs tabular-nums text-foreground/80">
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
}

export { CurrencyStrengthIndexes, CurrencyStrengthIndex };