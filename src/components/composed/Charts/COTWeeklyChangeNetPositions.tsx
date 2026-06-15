"use client";

import { useEffect, useState } from "react";

import Section from "@/components/ui/layout/Section";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import {
  resolveCurrencyPairSentimentSymbolColumn,
  resolveCurrencyPairSentimentWeeklyChangeColumn,
} from "@/lib/cotDataAnalysisFromTables";
import {
  dynamicTableService,
  DynamicTable,
} from "@/services/dynamicTable.service";

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";
const FIXED_RANGE = 15;

/** Space below the title before the plot (Y-axis / grid). */
const TITLE_BOTTOM_SPACE_PCT = 4;
/** Space between rotated currency labels and the chart bottom edge. */
const X_AXIS_LABEL_BOTTOM_PCT = 6;

// Drawable area boundaries (% of container width)
const CHART_LEFT = 4.71; // where the y-axis / grid starts
const CHART_RIGHT = 96.52; // where the grid ends

const Y_AXIS_LABELS = ["15", "10", "05", "0", "-5", "-10", "-15"];

/** Match Edge Tools Sentiment Drive Index — faint grid; zero line slightly stronger. */
const GRID_LINE_OPACITY = 0.08;
const ZERO_LINE_OPACITY = 0.16;
/** Y-axis label tops — offset slightly above grid lines. */
const Y_AXIS_TOPS = [7.68, 19.01, 30.35, 41.68, 53.01, 64.35, 75.68].map(
  (p) => `${p + TITLE_BOTTOM_SPACE_PCT}%`,
);
/** Grid lines for ±15 … 0 … −15 (wider vertical span = taller bars). */
const GRID_LINE_TOPS = [10, 21.33, 32.67, 44, 55.33, 66.67, 78].map(
  (p) => `${p + TITLE_BOTTOM_SPACE_PCT}%`,
);

const BASELINE_TOP = 44 + TITLE_BOTTOM_SPACE_PCT;
/** Max bar height (% of container) at ±FIXED_RANGE — matches grid extent above/below baseline. */
const POSITIVE_MAX_HEIGHT = 34;
const NEGATIVE_MAX_HEIGHT = 34;

// Bar width as % of container — kept narrow so bars don't overlap at 16 items
const BAR_WIDTH_PCT = 1.45;

interface ChartPoint {
  label: string;
  value: number;
  valueLabel: string;
}

function parsePercentCell(raw: string | null | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseFloat(raw.trim().replace(/,/g, "").replace(/%/g, ""));
  return Number.isFinite(n) ? n : null;
}

function formatBarValueLabel(raw: string, value: number): string {
  const t = raw.trim();
  if (t.includes("%")) return t;
  const dec = Number.isInteger(value) ? 0 : 2;
  return `${value.toFixed(dec).replace(/\.?0+$/, "")}%`;
}

function tableToWeeklyPoints(table: DynamicTable): ChartPoint[] {
  const columns = [...(table.columns ?? [])].sort(
    (a, b) => a.column_index - b.column_index,
  );
  const labelCol = resolveCurrencyPairSentimentSymbolColumn(columns);
  const valueCol = resolveCurrencyPairSentimentWeeklyChangeColumn(columns);
  if (!labelCol || !valueCol) return [];
  const rows = [...(table.rows ?? [])].sort(
    (a, b) => a.row_index - b.row_index,
  );

  const out: ChartPoint[] = [];
  for (const row of rows) {
    const cells = row.cells ?? [];
    const vCell = cells.find((c) => c.table_column_id === valueCol.id);
    const lCell = cells.find((c) => c.table_column_id === labelCol.id);
    const label = lCell?.value?.trim() ?? "";
    const rawVal = (vCell?.value ?? "").trim();
    const value = parsePercentCell(vCell?.value);
    if (!label || value === null) continue;
    out.push({ label, value, valueLabel: formatBarValueLabel(rawVal, value) });
  }
  return out;
}

interface COTWeeklyChangeNetPositionsProps {
  refreshTrigger?: number;
}

export default function COTWeeklyChangeNetPositions({
  refreshTrigger = 0,
}: COTWeeklyChangeNetPositionsProps) {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await dynamicTableService.getTableByIdentifier(
          CURRENCY_PAIR_SENTIMENT_ID,
        );
        if (cancelled) return;
        if (res?.data) {
          const raw = tableToWeeklyPoints(res.data);
          /** Strongest positive → weakest positive → weakest negative → strongest negative */
          raw.sort((a, b) => b.value - a.value);
          setPoints(raw);
        } else setPoints([]);
      } catch {
        if (!cancelled) setPoints([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  return (
    <Section padding={false} className="w-full">
      <div className="w-full horizontal-scroll bg-darkGrey rounded-[12px]">
        <div className="relative min-w-[800px] xl:min-w-0 w-full max-w-[1124px] mx-auto aspect-[1124/600] overflow-hidden text-foreground">
          <div className="absolute left-0 right-0 top-[5.20%] z-10 flex justify-center px-4 pb-4">
            <p className="font-['Inter',sans-serif] text-center text-[min(2vw,22px)] font-bold leading-6 text-foreground">
              Weekly Change Net Non Commercial Positions
            </p>
          </div>

          {loading ? (
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-secondary">
              Loading chart data...
            </p>
          ) : points.length === 0 ? (
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-secondary text-center px-6">
              No chart data. Sync Currency Pair Sentiment (symbol + position
              change % columns).
            </p>
          ) : (
            <>
              {Y_AXIS_LABELS.map((label, i) => (
                <p
                  key={`y-${label}`}
                  className="absolute left-[1.1%] font-['Poppins',sans-serif] text-[13px] font-medium leading-none text-foreground/65 whitespace-nowrap"
                  style={{ top: Y_AXIS_TOPS[i] }}
                >
                  {label}
                </p>
              ))}

              {GRID_LINE_TOPS.map((top, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute left-[4.71%] h-px bg-foreground"
                  style={{
                    top,
                    width: "91.81%",
                    opacity: i === 3 ? ZERO_LINE_OPACITY : GRID_LINE_OPACITY,
                  }}
                />
              ))}

              {points.map((p, i) => {
                const total = points.length;
                const clamped = Math.max(
                  -FIXED_RANGE,
                  Math.min(FIXED_RANGE, p.value),
                );
                const absPct = Math.abs(clamped) / FIXED_RANGE;

                /**
                 * Slot-based layout:
                 * Divide the drawable width into `total` equal slots.
                 * Each bar is centred inside its slot.
                 *
                 *  slot width  = (CHART_RIGHT - CHART_LEFT) / total
                 *  slot centre = CHART_LEFT + (i + 0.5) * slotWidth
                 *
                 * The bar's `left` CSS prop is the left edge of the bar,
                 * so subtract half the bar width.
                 */
                const slotWidth = (CHART_RIGHT - CHART_LEFT) / total;
                const barCentre = CHART_LEFT + (i + 0.5) * slotWidth;
                const barLeft = barCentre - BAR_WIDTH_PCT / 2;

                const positiveHeight = absPct * POSITIVE_MAX_HEIGHT;
                const negativeHeight = absPct * NEGATIVE_MAX_HEIGHT;
                const top =
                  clamped >= 0 ? BASELINE_TOP - positiveHeight : BASELINE_TOP;
                const height = clamped >= 0 ? positiveHeight : negativeHeight;

                return (
                  <div key={`${p.label}-${i}`}>
                    {/* Bar */}
                    <div
                      className={`absolute ${BAR_WIDTH_PCT <= 1.6 ? "w-[1.45%]" : "w-[1.45%]"}`}
                      style={{
                        left: `${barLeft}%`,
                        top: `${top}%`,
                        height: `${Math.max(height, 0.3)}%`,
                        width: `${BAR_WIDTH_PCT}%`,
                        backgroundColor:
                          clamped >= 0 ? "#2563eb" : GAUGE_SIGNAL_COLORS.sell,
                      }}
                    />

                    {/* Value label above/below bar */}
                    <span
                      className="absolute -translate-x-1/2 font-['Poppins',sans-serif] text-[15px] font-medium leading-snug text-foreground text-center whitespace-nowrap"
                      style={{
                        left: `${barCentre}%`,
                        top:
                          clamped >= 0
                            ? `${Math.max(top - 4, 5 + TITLE_BOTTOM_SPACE_PCT)}%`
                            : `${Math.min(top + height + 1.4, 82 + TITLE_BOTTOM_SPACE_PCT)}%`,
                      }}
                    >
                      {p.valueLabel}
                    </span>

                    {/* Rotated x-axis label */}
                    <div
                      className="absolute -translate-x-full flex items-end justify-center pb-3"
                      style={{
                        left: `${barCentre + 2.2}%`,
                        bottom: `${X_AXIS_LABEL_BOTTOM_PCT}%`,
                        width: "4.8%",
                      }}
                    >
                      <div
                        className="shrink-0"
                        style={{ transform: "rotate(-41.88deg)" }}
                      >
                        <p
                          className="font-['Poppins',sans-serif] text-[15px] font-medium leading-4 text-foreground text-right tracking-[-0.12px] whitespace-nowrap"
                          title={p.label}
                        >
                          {p.label}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
