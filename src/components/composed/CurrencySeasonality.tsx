"use client";

import type { SeasonalityRow } from "@/lib/fundamentalDashboardData";
import CurrencyFlag from "@/components/ui/CurrencyFlag";
import { getCurrencyStrengthIndexBarGradient } from "@/lib/currencyStrengthIndexBarGradient";
import { cn } from "@/lib/utils";

type CurrencySeasonalityProps = {
  rows: SeasonalityRow[];
};

export default function CurrencySeasonality({
  rows,
}: CurrencySeasonalityProps) {
  return (
    <div className="mt-8 flex w-full flex-col gap-3 text-left">
      {rows.length === 0 ? (
        <p className="text-left text-sm text-secondary">
          No seasonality data. Add a &quot;Currency Seasonality&quot; table
          (first column = asset label, month columns Jan…Dec) as on the Seasonal
          Trends page.
        </p>
      ) : (
        rows.map((r) => <CurrencySeasonalityRow key={r.label} row={r} />)
      )}
    </div>
  );
}

function CurrencySeasonalityRow({ row }: { row: SeasonalityRow }) {
  const { score, label: assetLabel } = row;
  const magnitude = Math.min(5, Math.abs(score)) / 5;
  const fillPercent = magnitude * 100;
  const showBar = score !== 0 && fillPercent > 0;
  const scoreLabel = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return (
    <div className="flex min-w-0 w-full items-center gap-2.5">
      <div className="flex w-[74px] shrink-0 items-center gap-2">
        <CurrencyFlag label={assetLabel} size={14} title={assetLabel} />
        <span className="truncate text-sm font-medium tabular-nums text-foreground">
          {assetLabel}
        </span>
      </div>
      <div className="relative h-[30px] min-w-0 flex-1 overflow-hidden rounded-[3px] bg-currencyStrengthIndexBackground pr-2">
        {showBar ? (
          <div
            className="absolute left-0 top-0 z-[1] h-full rounded-[3px] transition-[width] duration-700 ease-out"
            style={{
              width: `${fillPercent}%`,
              background: getCurrencyStrengthIndexBarGradient(score),
            }}
          >
            <span
              className={cn(
                "absolute right-2.5 top-1/2 max-w-[calc(100%-0.75rem)] -translate-y-1/2 truncate pr-0.5 text-xs font-semibold tabular-nums text-black",
              )}
            >
              {scoreLabel}
            </span>
          </div>
        ) : (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs tabular-nums text-foreground/80">
            0
          </div>
        )}
      </div>
    </div>
  );
}
