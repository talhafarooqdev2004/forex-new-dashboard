"use client";

import { cn } from "@/lib/utils";
import {
  cotNetIndexFilledSegments,
  type CotOverviewRow,
} from "@/lib/fundamentalDashboardData";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import Icon from "./Icon";

type CommitmentsofTradersOverviewProps = {
  rows: CotOverviewRow[];
};

const COT_POSITIVE_COLOR = GAUGE_SIGNAL_COLORS.buy;
const COT_NEGATIVE_COLOR = GAUGE_SIGNAL_COLORS.sell;

export default function CommitmentsofTradersOverview({
  rows,
}: CommitmentsofTradersOverviewProps) {
  return (
    <CommitmentsofTraders>
      {rows.length === 0 ? (
        <tr>
          <td colSpan={5} className="py-6 text-center text-sm text-secondary">
            No COT overview data. Add rows to &quot;Currency Pair
            Sentiment&quot; and matching currencies in &quot;COT Raw Data&quot;
            (last column = net index 0–100%).
          </td>
        </tr>
      ) : (
        rows.map((row) => <CommitmentsofTrader key={row.id} row={row} />)
      )}
    </CommitmentsofTraders>
  );
}

function CommitmentsofTraders({ children }: React.PropsWithChildren) {
  return (
    <div className="horizontal-scroll">
      <table className="min-w-[700px] border-separate border-spacing-x-2 border-spacing-y-[25px] -ml-2">
        <thead>
          <tr className="text-sm">
            <th>Symbol</th>
            <th className="text-center">Change in N.comm positions</th>
            <th>Position change %</th>
            <th>COT Net index (0-100)</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function parseSignedNumber(text: string): number | null {
  const compact = text
    .replace(/\u2212/g, "-")
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/\s+/g, "")
    .trim();
  const m = compact.match(/-?\d+\.?\d*/);
  if (!m) return null;
  const n = Number.parseFloat(m[0]!);
  return Number.isFinite(n) ? n : null;
}

type PositionChangeTone = "positive" | "negative" | "neutral";

function positionChangeTone(delta: number | null): PositionChangeTone {
  if (delta === null || Number.isNaN(delta) || delta === 0) return "neutral";
  return delta > 0 ? "positive" : "negative";
}

function formatChangeNcommCompact(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "—";
  if (/k\s*$/i.test(trimmed)) return trimmed;

  const n = parseSignedNumber(trimmed.replace(/[,%]/g, ""));
  if (n === null) return trimmed;

  const abs = Math.abs(n);
  if (abs < 1000) {
    return Number.isInteger(n) ? String(n) : n.toFixed(1).replace(/\.?0+$/, "");
  }
  const kAbs = Math.round(abs / 1000);
  return n < 0 ? `-${kAbs}k` : `${kAbs}k`;
}

const COT_NEUTRAL_SEGMENT = "#64748b";

function CommitmentsofTrader({ row }: { row: CotOverviewRow }) {
  const positionDelta = parseSignedNumber(row.positionChangeDisplay);
  const tone = positionChangeTone(positionDelta);
  const filled = cotNetIndexFilledSegments(row.cotNetIndexPercent);
  const toneBg =
    tone === "positive"
      ? COT_POSITIVE_COLOR
      : tone === "negative"
        ? COT_NEGATIVE_COLOR
        : undefined;
  /** Alias for Score pill — avoids stale bundles referencing `scoreBgColor` alone. */
  const scoreBgColor = toneBg;
  /** Left indicator in Position change % — neutral silver (not buy/sell green/red). */
  const positionChangeTriangleFill = "#99A1AF";

  return (
    <tr className="border-t border-solid border-[#000] text-sm">
      <td className="font-semibold">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-lg leading-none" aria-hidden>
            {row.flagEmoji}
          </span>
          <span>{row.symbolLabel}</span>
        </div>
      </td>
      <td className="px-2 text-center font-semibold tabular-nums">
        {formatChangeNcommCompact(row.changeInNcommDisplay)}
      </td>
      <td className="font-semibold">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-default shrink-0 border-0 bg-transparent p-0"
            aria-hidden
            tabIndex={-1}
          >
            <svg width="10" height="10" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.01953 3.51563L1.13333e-07 7.01953L2.96259e-08 1.43099e-07L7.01953 3.51563Z"
                fill={positionChangeTriangleFill}
              />
            </svg>
          </button>
          <div className="flex min-h-7 min-w-0 flex-1 items-center gap-2 tabular-nums text-foreground">
            <span
              className="min-w-0 font-semibold"
              style={
                tone === "positive"
                  ? { color: COT_POSITIVE_COLOR }
                  : tone === "negative"
                    ? { color: COT_NEGATIVE_COLOR }
                    : undefined
              }
            >
              {row.positionChangeDisplay}
            </span>
            {positionDelta !== null && positionDelta !== 0 ? (
              <Icon
                name={positionDelta > 0 ? "profit-icon.svg" : "loss-icon.svg"}
                width={10}
                height={10}
              />
            ) : null}
          </div>
        </div>
      </td>
      <td>
        <div className="ml-5 mr-3 flex items-center gap-[3px] pr-1">
          {Array.from({ length: 20 }, (_, i) => (
            <CotNetIndexSegment key={i} filled={i < filled} tone={tone} />
          ))}
        </div>
      </td>
      <td>
        <div
          className={cn(
            "flex h-7 items-center justify-center rounded-[3px] px-3 pr-4 font-semibold tabular-nums",
            scoreBgColor ? "text-white" : "bg-currencyStrengthIndexBackground text-foreground",
          )}
          style={scoreBgColor ? { backgroundColor: scoreBgColor } : undefined}
        >
          {row.cotNetIndexDisplay}
        </div>
      </td>
    </tr>
  );
}

function CotNetIndexSegment({
  filled,
  tone,
}: {
  filled: boolean;
  tone: PositionChangeTone;
}) {
  const filledColor =
    tone === "positive"
      ? COT_POSITIVE_COLOR
      : tone === "negative"
        ? COT_NEGATIVE_COLOR
        : COT_NEUTRAL_SEGMENT;

  return (
    <div className="h-[19px] w-[9.5px] rounded-2xl">
      <div
        className={cn(
          "h-full rounded-2xl",
          !filled && "bg-currencyStrengthIndexBackground",
        )}
        style={filled ? { backgroundColor: filledColor } : undefined}
      />
    </div>
  );
}
