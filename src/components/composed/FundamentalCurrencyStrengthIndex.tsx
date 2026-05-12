"use client";

import GuageChart from "@/components/chart/GuageChart";
import SeasonalGaugeNeedle from "@/components/chart/SeasonalGaugeNeedle";
import { getCurrencyFlagEmoji } from "@/lib/currencyFlags";
import type { StrengthRow } from "@/lib/fundamentalDashboardData";
import {
  FX_TMV_GAUGE_ZONES_DARK,
  FX_TMV_GAUGE_ZONES_LIGHT,
} from "@/lib/fxTmvGaugeZones";
import { getCurrencyStrengthIndexBarGradient } from "@/lib/currencyStrengthIndexBarGradient";

const DARK_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_DARK.map((z) => ({ ...z }));
const LIGHT_GAUGE_ZONES = FX_TMV_GAUGE_ZONES_LIGHT.map((z) => ({ ...z }));

/** Same band colors & -5...+5 splits as Edge Tools Risk Mode gauge. */
const RISK_ZONE_NAMES = [
  "Strong On",
  "On",
  "Weak On",
  "Neutral",
  "Weak Off",
  "Off",
  "Strong Off",
] as const;
const DARK_RISK_GAUGE_ZONES = DARK_GAUGE_ZONES.map((z, i) => ({
  ...z,
  name: RISK_ZONE_NAMES[i]!,
}));
const LIGHT_RISK_GAUGE_ZONES = LIGHT_GAUGE_ZONES.map((z, i) => ({
  ...z,
  name: RISK_ZONE_NAMES[i]!,
}));

/** Exact Edge Tools mapping: red below 35, neutral 35-65, green from 65. */
function getRiskModeNeedleRotationDeg(rawScore: number): number {
  const s = Math.max(0, Math.min(100, rawScore));
  if (s < 35) return -125;
  if (s < 65) return -62;
  return -2;
}

type FundamentalCurrencyStrengthIndexProps = {
  strengthRows: StrengthRow[];
  riskModeScore: number;
  isDark: boolean;
};

export default function FundamentalCurrencyStrengthIndex({
  strengthRows,
  riskModeScore,
  isDark,
}: FundamentalCurrencyStrengthIndexProps) {
  const riskGaugeRotation = getRiskModeNeedleRotationDeg(riskModeScore);
  const riskZones = isDark ? DARK_RISK_GAUGE_ZONES : LIGHT_RISK_GAUGE_ZONES;

  return (
    <div className="mt-8 flex h-full w-full flex-col gap-4 text-left">
      <div className="flex w-full flex-1 flex-col gap-3">
        {strengthRows.length === 0 ? (
          <p className="text-left text-sm text-secondary">
            No rows yet. Create a &quot;Fundamental Currency Strength
            Index&quot; table (first column = currency, last column = score
            −5…+5).
          </p>
        ) : (
          strengthRows.map((row) => (
            <FundamentalStrengthBar key={row.currency} row={row} />
          ))
        )}
      </div>

      <div className="mt-auto flex w-full items-center justify-between gap-6 pt-2 pb-[30px]">
        <h6 className="m-0 shrink-0 text-left text-foreground text-[22px]">
          Risk Mode
        </h6>
        <div className="flex w-[220px] max-w-full shrink-0 justify-end">
          <GuageChart
            style={{ width: "100%" }}
            indicatorStyle={{
              rotation: riskGaugeRotation,
              transition: "0.8s ease-out",
            }}
            gaugeZones={riskZones}
            customLeftLabel="On"
            customRightLabel="Off"
            renderIndicator={({ rotation: rot, transition }) => (
              <SeasonalGaugeNeedle
                rotationDeg={rot}
                isDark={isDark}
                transition={transition}
                width="56px"
                height="45px"
                style={{ left: "29%", top: "60%", transform: "none" }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}

function FundamentalStrengthBar({ row }: { row: StrengthRow }) {
  const { score } = row;
  const magnitude = Math.min(5, Math.abs(score)) / 5;
  const fillPercent = magnitude * 100;
  const showBar = score !== 0 && fillPercent > 0;
  const label = Number.isInteger(score) ? String(score) : score.toFixed(1);
  const barGradient = getCurrencyStrengthIndexBarGradient(score);
  const flag = getCurrencyFlagEmoji(row.currency);

  return (
    <div className="flex min-w-0 w-full items-center gap-2.5">
      <div className="flex w-[74px] shrink-0 items-center gap-2">
        <span className="text-lg leading-none" aria-hidden>
          {flag}
        </span>
        <span className="truncate text-sm tabular-nums text-foreground">
          {row.currency}
        </span>
      </div>

      <div className="relative h-[30px] min-w-0 flex-1 overflow-hidden rounded-[3px] bg-currencyStrengthIndexBackground pr-2">
        {showBar ? (
          <div
            className="absolute left-0 top-0 z-[1] h-full rounded-[3px] transition-[width] duration-700 ease-out"
            style={{
              width: `${fillPercent}%`,
              background: barGradient,
            }}
          >
            <span className="absolute right-2.5 top-1/2 max-w-[calc(100%-0.75rem)] -translate-y-1/2 truncate pr-0.5 text-xs font-semibold tabular-nums text-black">
              {label}
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
