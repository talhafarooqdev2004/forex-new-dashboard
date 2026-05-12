"use client";

import type { SeasonalityRow } from "@/lib/fundamentalDashboardData";
import { getCurrencyFlagEmoji } from "@/lib/currencyFlags";
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

/** Matches `SEASONAL_CURRENCY_TREND_GAUGE_ZONES_*` breaks (±5 span, ±0.5 neutral). */
const getBarGradient = (score: number) => {
    if (score >= 3.5) return "linear-gradient(90deg, #05871A 0%, #2FE24B 100%)";
    if (score >= 2) return "linear-gradient(90deg, #25B73C 0%, #62d900 100%)";
    if (score >= 0.5) return "linear-gradient(90deg, #2FE24B 0%, #7cc900 100%)";
    if (score > 0) return "linear-gradient(90deg, #9bb800 0%, #c7bf00 100%)";

    if (score <= -3.5) return "linear-gradient(90deg, #D30000 0%, #ff0000 100%)";
    if (score <= -2) return "linear-gradient(90deg, #ff5a1f 0%, #ff2b00 100%)";
    if (score <= -0.5) return "linear-gradient(90deg, #ff8c8c 0%, #ff5a16 100%)";
    if (score < 0) return "linear-gradient(90deg, #ffb024 0%, #ff7a16 100%)";

    return "transparent";
};

function CurrencySeasonalityRow({ row }: { row: SeasonalityRow }) {
  const { score, label: assetLabel } = row;
  const magnitude = Math.min(5, Math.abs(score)) / 5;
  const fillPercent = magnitude * 100;
  const showBar = score !== 0 && fillPercent > 0;
  const scoreLabel = Number.isInteger(score) ? String(score) : score.toFixed(1);
  const flag = getCurrencyFlagEmoji(assetLabel);

  return (
    <div className="flex min-w-0 w-full items-center gap-2.5">
      <div className="flex w-[74px] shrink-0 items-center gap-2">
        <span className="text-lg leading-none" aria-hidden>
          {flag}
        </span>
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
              background: getBarGradient(score),
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
