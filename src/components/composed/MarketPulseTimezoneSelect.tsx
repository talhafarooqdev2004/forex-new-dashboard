"use client";

import { MARKET_PULSE_TIMEZONE_OPTIONS } from "@/lib/marketPulseTimezone";
import { cn } from "@/lib/utils";

export default function MarketPulseTimezoneSelect({
    value,
    onValueChange,
    className,
    id = "market-pulse-timezone",
}: {
    value: string;
    onValueChange: (ianaOrDevice: string) => void;
    className?: string;
    id?: string;
}) {
    return (
        <div className={cn("flex min-w-0 flex-col items-stretch gap-1", className)}>
            <label htmlFor={id} className="sr-only">
                Time zone
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onValueChange(e.target.value)}
                className={cn(
                    "max-w-[min(100%,280px)] cursor-pointer rounded-lg border border-stroke bg-background px-2 py-1.5",
                    "text-xs font-medium text-foreground shadow-sm outline-none",
                    "focus-visible:ring-2 focus-visible:ring-primary/40",
                )}
            >
                {MARKET_PULSE_TIMEZONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
