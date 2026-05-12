"use client";

import { useEffect, useState } from "react";

import Section from "@/components/ui/layout/Section";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import {
  dynamicTableService,
  DynamicTable,
} from "@/services/dynamicTable.service";

const CURRENCY_PAIR_SENTIMENT_ID = "currency_pair_sentiment";
const FIXED_RANGE = 15;

const MAX_BAR_COUNT = 16;

// Drawable area boundaries (% of container width)
const CHART_LEFT = 4.71; // where the y-axis / grid starts
const CHART_RIGHT = 96.52; // where the grid ends

const Y_AXIS_LABELS = ["15", "10", "05", "0", "-5", "-10", "-15"];
const Y_AXIS_TOPS = [
  "15.75%",
  "24.20%",
  "32.65%",
  "41.10%",
  "49.55%",
  "58.00%",
  "66.45%",
];
const GRID_LINE_TOPS = [
  "18.07%",
  "26.52%",
  "34.97%",
  "43.42%",
  "51.87%",
  "60.32%",
  "68.77%",
];

const BASELINE_TOP = 43.42;
const POSITIVE_MAX_HEIGHT = 25.35;
const NEGATIVE_MAX_HEIGHT = 25.35;

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
  if (columns.length < 3) return [];

  const valueCol = columns[0];
  const labelCol = columns[columns.length - 2];
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
  const visiblePoints = points.slice(0, MAX_BAR_COUNT);

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
        <div className="relative min-w-[800px] xl:min-w-0 w-full max-w-[1124px] mx-auto aspect-[1124/380] overflow-hidden text-foreground">
          <p
            className="absolute top-[5.20%] font-['Inter',sans-serif] font-bold leading-6 text-[min(1.8vw,20px)] text-foreground whitespace-nowrap"
            style={{ left: "calc(50% - min(19.6vw, 220.5px))" }}
          >
            Weekly Change Net Non Commercial Positions
          </p>

          {loading ? (
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-secondary">
              Loading chart data...
            </p>
          ) : points.length === 0 ? (
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-secondary text-center px-6">
              No chart data. Use Currency Pair Sentiment: column 1 = weekly %
              change, second-to-last column = currency label.
            </p>
          ) : (
            <>
              {Y_AXIS_LABELS.map((label, i) => (
                <p
                  key={`y-${label}`}
                  className="absolute font-['Inter',sans-serif] font-normal leading-[22px] text-foreground tracking-[-0.18px] whitespace-nowrap"
                  style={{
                    left: i < 4 ? "1.41%" : "0.96%",
                    top: Y_AXIS_TOPS[i],
                    fontSize: i < 5 ? "min(1.4vw,16px)" : "min(1.2vw,14px)",
                  }}
                >
                  {label}
                </p>
              ))}

              {GRID_LINE_TOPS.map((top, i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute left-[4.71%] h-px"
                  style={{ top, width: "91.81%" }}
                >
                  <svg
                    width="100%"
                    height="1"
                    fill="none"
                    preserveAspectRatio="none"
                    viewBox="0 0 1013.61 1"
                    className="block"
                  >
                    <path
                      d="M1013.61 0.5H0"
                      stroke="currentColor"
                      strokeOpacity={i === 3 ? 0.95 : 0.35}
                    />
                  </svg>
                </div>
              ))}

              {visiblePoints.map((p, i) => {
                const total = visiblePoints.length;
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
                        backgroundColor: clamped >= 0 ? "#2563eb" : GAUGE_SIGNAL_COLORS.sell,
                      }}
                    />

                    {/* Value label above/below bar */}
                    <span
                      className="absolute -translate-x-1/2 font-['Poppins',sans-serif] font-medium leading-[1.4] text-[min(1.0vw,11px)] text-foreground text-center whitespace-nowrap"
                      style={{
                        left: `${barCentre}%`,
                        top:
                          clamped >= 0
                            ? `${Math.max(top - 4, 10)}%`
                            : `${Math.min(top + height + 1.4, 71)}%`,
                      }}
                    >
                      {p.valueLabel}
                    </span>

                    {/* Rotated x-axis label */}
                    <div
                      className="absolute -translate-x-full flex items-end justify-center pb-0"
                      style={{
                        left: `${barCentre + 2.2}%`,
                        top: "80.00%",
                        width: "4.8%",
                        height: "11%",
                      }}
                    >
                      <div
                        className="shrink-0"
                        style={{ transform: "rotate(-41.88deg)" }}
                      >
                        <p
                          className="font-['Inter',sans-serif] font-normal leading-4 text-[min(1.1vw,12px)] text-foreground text-right tracking-[-0.12px] whitespace-nowrap"
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
