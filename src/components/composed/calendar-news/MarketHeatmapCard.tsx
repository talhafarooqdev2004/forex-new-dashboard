"use client";

import { type MarketHeatmapTile, heatmapTileBackgroundFromLabel } from "@/lib/calendarNewsPageData";

import CalendarNewsAssetIcon from "./CalendarNewsAssetIcon";

import styles from "./MarketHeatmapCard.module.scss";

type MarketHeatmapCardProps = {
    tiles: MarketHeatmapTile[];
};

export default function MarketHeatmapCard({ tiles }: MarketHeatmapCardProps) {
    const currencies = tiles.slice(0, 8);
    const commodities = tiles.slice(8, 10);

    return (
        <section className={styles.card} aria-label="Market Heatmap">
            <h2 className={styles.title}>Market Heatmap</h2>

            <div className={styles.grid}>
                {currencies.map((tile) => (
                    <HeatmapTile key={tile.symbol} tile={tile} />
                ))}
                {commodities.map((tile) => (
                    <HeatmapTile key={tile.symbol} tile={tile} wide />
                ))}
            </div>
        </section>
    );
}

function HeatmapTile({ tile, wide = false }: { tile: MarketHeatmapTile; wide?: boolean }) {
    const backgroundColor = heatmapTileBackgroundFromLabel(tile.label);

    const valueLabel =
        Math.abs(tile.value) < 1e-9
            ? "0.0"
            : `${tile.value > 0 ? "+" : ""}${Number.isInteger(tile.value) ? tile.value : tile.value.toFixed(1)}`;

    return (
        <div
            className={wide ? styles.tileWide : styles.tile}
            style={{ backgroundColor, color: "#000000" }}
        >
            <span className={styles.iconBadge} aria-hidden>
                <CalendarNewsAssetIcon asset={tile.symbol} size={wide ? 28 : 24} />
            </span>
            <span className={styles.symbol}>{tile.symbol}</span>
            <span className={styles.value}>{valueLabel}</span>
            <span className={styles.sentiment}>{tile.label}</span>
        </div>
    );
}
