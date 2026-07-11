"use client";

import type { GeopoliticalRiskWatch } from "@/lib/calendarNewsPageData";
import { STATIC_GEOPOLITICAL_RISK_WATCH } from "@/lib/calendarNewsPageData";

import GeopoliticalRiskGauge, { geoRiskAccentColor } from "./GeopoliticalRiskGauge";
import styles from "./GeopoliticalRiskWatchCard.module.scss";

type GeopoliticalRiskWatchCardProps = {
    watch?: GeopoliticalRiskWatch | null;
};

export default function GeopoliticalRiskWatchCard({ watch }: GeopoliticalRiskWatchCardProps) {
    const data = watch ?? STATIC_GEOPOLITICAL_RISK_WATCH;
    const score = Math.max(0, Math.min(1, Number.isFinite(data.score) ? data.score : 0));
    const accent = geoRiskAccentColor(score);
    const scoreLabel = `${score.toFixed(2)} / 1.00`;

    return (
        <section className={styles.card} aria-label="Geopolitical Risk Watch">
            <h2 className={styles.title}>Geopolitical Risk Watch</h2>

            <div className={styles.gaugeBlock}>
                <GeopoliticalRiskGauge score={score} />
                <p className={styles.score} style={{ color: accent }} aria-live="polite">
                    {scoreLabel}
                </p>
            </div>
        </section>
    );
}
