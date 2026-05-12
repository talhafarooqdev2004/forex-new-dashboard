"use client";

import { useEffect, useLayoutEffect, useState, type CSSProperties } from "react";
import styles from "./RetailSentimentHorizontalBarChart.module.scss";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import {
  dynamicTableService,
  DynamicTable,
} from "@/services/dynamicTable.service";
import { cn } from "@/lib/utils";

/** Same corner arrows as COT “Overall Sentiment” / Risk bias row. */
function RiskModeBiasCornerArrow({ direction }: { direction: "up" | "down" }) {
  const stroke = direction === "up" ? GAUGE_SIGNAL_COLORS.buy : GAUGE_SIGNAL_COLORS.sell;
  if (direction === "up") {
    return (
      <svg
        className={styles.footerBiasArrow}
        xmlns="http://www.w3.org/2000/svg"
        width="19"
        height="19"
        viewBox="0 0 23 23"
        fill="none"
        aria-hidden
      >
        <path
          d="M6.66602 6.66602H16.1883V16.1883"
          stroke={stroke}
          strokeWidth="1.90446"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.66602 16.1883L16.1883 6.66602"
          stroke={stroke}
          strokeWidth="1.90446"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg
      className={styles.footerBiasArrow}
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 23 23"
      fill="none"
      aria-hidden
    >
      <path
        d="M16.1883 16.1883H6.66602V6.66602"
        stroke={stroke}
        strokeWidth="1.90446"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.1883 6.66602L6.66602 16.1883"
        stroke={stroke}
        strokeWidth="1.90446"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ChartData {
  name: string;
  long: number;
  short: number;
}

export type RetailSentimentColumnIndices = {
  name: number;
  long: number;
  short: number;
};

/** @deprecated All COT / retail charts use the same long=blue / short=red palette */
export type RetailSentimentBarColors = "retail" | "cot";

interface RetailSentimentHorizontalBarChartProps {
  tableIdentifier?: string;
  refreshTrigger?: number;
  initialTable?: DynamicTable | null;
  title?: string;
  columnIndices?: RetailSentimentColumnIndices;
  /** @deprecated Ignored; blue long / red short is used for all variants. */
  barColors?: RetailSentimentBarColors;
}

// ─── Icon map (emoji) — matches COT / retail naming from sheet data ───────────
const ICON_MAP: Record<string, string> = {
  "CRUDE OIL": "🛢️",
  "NATURAL GAS": "🔥",
  "WHEAT SRW": "🌾",
  "NASDAQ 100": "📈",
  "S&P 500": "📊",
  "S&P500": "📊",
  "WTI": "🛢️",
  "BRENT": "🛢️",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CAD: "🇨🇦",
  AUD: "🇦🇺",
  NZD: "🇳🇿",
  CHF: "🇨🇭",
  XAU: "🥇",
  XAG: "🥈",
  Gold: "🥇",
  Silver: "🥈",
  Corn: "🌽",
  Cotton: "☁️",
  "Crude Oil": "🛢️",
  "Wheat SRW": "🌾",
  Sugar: "🍬",
  "Natural Gas": "🔥",
  "Nasdaq 100": "📈",
  Bitcoin: "₿",
  Ethereum: "◆",
};

const ICON_KEYS_SORTED = Object.keys(ICON_MAP).sort((a, b) => b.length - a.length);

function getIcon(name: string): string | null {
  const trimmed = name.trim();
  if (ICON_MAP[trimmed]) return ICON_MAP[trimmed];
  const upper = trimmed.toUpperCase();
  for (const key of ICON_KEYS_SORTED) {
    if (upper.includes(key.toUpperCase())) return ICON_MAP[key]!;
  }
  const codes = upper.match(/\b[A-Z]{3}\b/g) ?? [];
  for (const c of codes) {
    if (ICON_MAP[c]) return ICON_MAP[c]!;
  }
  return null;
}

/**
 * Width of the first grid column = widest label (icon + text). Labels are right-aligned in that
 * column so every row gets exactly `$chart-gap` (20px) from the text edge to the bar, and 20px
 * from the bar to Net Change — same for Retail Sentiment and Non Com charts.
 */
function computeLabelColumnWidthPx(data: ChartData[]): number {
    const minCol = 120;
    if (data.length === 0) return minCol;
    if (typeof document === "undefined") return minCol;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return minCol;

    const letterSpacingExtra = (s: string) => Math.max(0, s.length - 1) * 0.5;

    let max = 0;
    for (const item of data) {
        const icon = getIcon(item.name);
        /** Emoji / flags often render wider than numeric `font-size`; keep bar alignment. */
        const leading = icon ? 28 + 8 : 26 + 8;

        ctx.font = "500 13px Arial, sans-serif";
        const w13 = ctx.measureText(item.name).width + letterSpacingExtra(item.name);

        ctx.font = "500 11px Arial, sans-serif";
        const w11 = ctx.measureText(item.name).width + letterSpacingExtra(item.name);

        const tw = Math.max(w13, w11);
        max = Math.max(max, leading + tw);
    }
    return Math.max(minCol, Math.ceil(max));
}

/** Net change = Long% − Short% (positive = net long, negative = net short). */
function formatNetChange(long: number, short: number): { text: string; tone: "pos" | "neg" | "neutral" } {
    const net = long - short;
    const rounded = Math.abs(net - Math.round(net)) < 1e-6 ? Math.round(net) : Number(net.toFixed(1));
    if (rounded === 0) return { text: "0%", tone: "neutral" };
    const sign = rounded > 0 ? "+" : "";
    return { text: `${sign}${rounded}%`, tone: rounded > 0 ? "pos" : "neg" };
}
// ─────────────────────────────────────────────────────────────────────────────

function parseLongShortCell(raw: string | null | undefined): number {
  if (raw == null) return Number.NaN;
  const normalized = raw.trim().replace(/,/g, "").replace(/%/g, "");
  return Number.parseFloat(normalized);
}

function processTableToChartData(
  table: DynamicTable,
  columnIndices?: RetailSentimentColumnIndices,
): ChartData[] {
  if (
    !table.rows ||
    !table.columns ||
    table.rows.length === 0 ||
    table.columns.length === 0
  ) {
    return [];
  }

  const sortedColumns = [...table.columns].sort(
    (a, b) => a.column_index - b.column_index,
  );

  let pairColIdx: number;
  let longColIdx: number;
  let shortColIdx: number;

  if (columnIndices) {
    const maxIdx = Math.max(
      columnIndices.name,
      columnIndices.long,
      columnIndices.short,
    );
    if (sortedColumns.length <= maxIdx) return [];
    pairColIdx = columnIndices.name;
    longColIdx = columnIndices.long;
    shortColIdx = columnIndices.short;
  } else {
    const findColumnIndex = (headerName: string): number => {
      const normalized = headerName.toLowerCase().trim();
      return sortedColumns.findIndex((column) => {
        const header = column.header?.toLowerCase().trim() || "";
        const key = column.key?.toLowerCase().trim() || "";
        return (
          header === normalized ||
          header.includes(normalized) ||
          key === normalized ||
          key.includes(normalized)
        );
      });
    };

    pairColIdx = findColumnIndex("pair");
    if (pairColIdx === -1) pairColIdx = findColumnIndex("pairs");
    if (pairColIdx === -1) pairColIdx = findColumnIndex("currency pair");
    if (pairColIdx === -1) pairColIdx = findColumnIndex("name");
    if (pairColIdx === -1) pairColIdx = 0;

    longColIdx = findColumnIndex("long %");
    if (longColIdx === -1) longColIdx = findColumnIndex("long");
    if (longColIdx === -1) longColIdx = findColumnIndex("long percentage");
    if (longColIdx === -1) longColIdx = 1;

    shortColIdx = findColumnIndex("short %");
    if (shortColIdx === -1) shortColIdx = findColumnIndex("short");
    if (shortColIdx === -1) shortColIdx = findColumnIndex("short percentage");
    if (shortColIdx === -1) shortColIdx = 2;
  }

  return table.rows
    .map((row) => {
      const cells = row.cells || [];
      const pairColumn = sortedColumns[pairColIdx];
      const longColumn = sortedColumns[longColIdx];
      const shortColumn = sortedColumns[shortColIdx];

      const pairCell = pairColumn
        ? cells.find((c) => c.table_column_id === pairColumn.id)
        : null;
      const longCell = longColumn
        ? cells.find((c) => c.table_column_id === longColumn.id)
        : null;
      const shortCell = shortColumn
        ? cells.find((c) => c.table_column_id === shortColumn.id)
        : null;

      const pairName = pairCell?.value?.trim() || "";
      const longValue = parseLongShortCell(longCell?.value);
      const shortValue = parseLongShortCell(shortCell?.value);

      if (pairName && !Number.isNaN(longValue) && !Number.isNaN(shortValue)) {
        return {
          name: pairName,
          long: Math.max(0, Math.min(100, longValue)),
          short: Math.max(0, Math.min(100, shortValue)),
        };
      }
      return null;
    })
    .filter((item): item is ChartData => item !== null)
    .sort((a, b) => b.long - a.long);
}

const DEFAULT_CHART_TITLE = "Retail Sentiment Long % vs Short %";

export default function RetailSentimentHorizontalBarChart({
  tableIdentifier = "retail_sentiment_currency_pairs",
  refreshTrigger = 0,
  initialTable = null,
  title = DEFAULT_CHART_TITLE,
  columnIndices,
  barColors: _legacyBarColors = "retail",
}: RetailSentimentHorizontalBarChartProps) {
  void _legacyBarColors;

  const initialData = initialTable
    ? processTableToChartData(initialTable, columnIndices)
    : [];
  const [data, setData] = useState<ChartData[]>(initialData);
  const [loading, setLoading] = useState(!initialTable);
  const [labelColPx, setLabelColPx] = useState(() => computeLabelColumnWidthPx(initialData));

  useLayoutEffect(() => {
    setLabelColPx(computeLabelColumnWidthPx(data));
  }, [data]);

  const labelGridVars: CSSProperties | undefined =
    data.length > 0 ? { ["--label-col" as string]: `${labelColPx}px` } : undefined;

  const loadChartData = async () => {
    try {
      setLoading(true);
      const response =
        await dynamicTableService.getTableByIdentifier(tableIdentifier);

      if (!response?.data?.rows || !response?.data?.columns) {
        setData([]);
        return;
      }
      setData(processTableToChartData(response.data, columnIndices));
    } catch (error) {
      console.error("Failed to load chart data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTable?.columns && initialTable.columns.length > 0) {
      setData(processTableToChartData(initialTable, columnIndices));
      setLoading(false);
      return;
    }
    if (!initialTable || refreshTrigger > 0) {
      void loadChartData();
    }
  }, [
    tableIdentifier,
    refreshTrigger,
    initialTable,
    columnIndices?.name,
    columnIndices?.long,
    columnIndices?.short,
  ]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          Loading chart data...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>{title}</h1>
        <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
          No data available. Please add data to the table.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={labelGridVars}>
      <h1 className={styles.title}>{title}</h1>

      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendLong}></div>
          <span>Long %</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendShort}></div>
          <span>Short %</span>
        </div>
      </div>

      <div className={styles.chartScrollRegion}>
        <div className={styles.chartGrid}>
        <div className={styles.columnHeader}>
          <div className={styles.headerCellLabel} aria-hidden />
          <div className={styles.headerCellBar} aria-hidden />
          <div className={styles.headerCellNet}>
            <span className={styles.headerNetText}>Net Change</span>
          </div>
        </div>

        {data.map((item, index) => {
          const icon = getIcon(item.name);
          const net = formatNetChange(item.long, item.short);
          const hasLong = item.long > 0;
          const hasShort = item.short > 0;
          return (
            <div key={`${item.name}-${index}`} className={styles.row}>
              <div className={styles.label}>
                {icon ? (
                  <span className={styles.labelIcon} aria-hidden="true">
                    {icon}
                  </span>
                ) : (
                  <span className={styles.labelFallback} aria-hidden="true">
                    {(item.name.replace(/[^A-Za-z]/g, "").slice(0, 2) || "?").toUpperCase()}
                  </span>
                )}
                <span className={styles.labelText}>{item.name}</span>
              </div>
              <div className={styles.barTrack}>
                <div className={styles.barContainer}>
                  <div
                    className={cn(styles.long, hasShort ? styles.longMeetShort : styles.longTerminal)}
                    style={{ width: `${item.long}%` }}
                  >
                    <span>{item.long}%</span>
                  </div>
                  <div
                    className={cn(styles.short, hasLong ? styles.shortMeetLong : styles.shortTerminal)}
                    style={{ width: `${item.short}%` }}
                  >
                    <span>{item.short}%</span>
                  </div>
                </div>
              </div>
              <div
                className={
                  net.tone === "pos"
                    ? styles.netCellPos
                    : net.tone === "neg"
                      ? styles.netCellNeg
                      : styles.netCellNeutral
                }
              >
                {net.text}
              </div>
            </div>
          );
        })}
        </div>

        <div className={styles.xAxis}>
        <div className={styles.xAxisInner}>
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
        </div>
      </div>

      <div className={styles.footerLegend}>
        <div className={styles.footerLegendCol}>
          <p className={styles.footerTitleRow}>
            <RiskModeBiasCornerArrow direction="up" />
            <span className={styles.footerTitleLong}>High Long %</span>
          </p>
          <p className={styles.footerLegendSub}>More long positions (bullish sentiment)</p>
        </div>
        <div className={styles.footerLegendCol}>
          <p className={styles.footerTitleRow}>
            <span className={styles.footerEqBadge} aria-hidden>
              =
            </span>
            <span className={styles.footerTitleBalanced}>Balanced</span>
          </p>
          <p className={styles.footerLegendSub}>Long and short positions are equal</p>
        </div>
        <div className={styles.footerLegendCol}>
          <p className={styles.footerTitleRow}>
            <RiskModeBiasCornerArrow direction="down" />
            <span className={styles.footerTitleShort}>High Short %</span>
          </p>
          <p className={styles.footerLegendSub}>More short positions (bearish sentiment)</p>
        </div>
      </div>
    </div>
  );
}
