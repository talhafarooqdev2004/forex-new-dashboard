"use client";

import CurrencyFlag from "@/components/ui/CurrencyFlag";

import styles from "./CalendarNewsAssetIcon.module.scss";

/** Design labels the pound "GPY"; it still uses the UK flag. */
const FLAG_CODE_OVERRIDES: Record<string, string> = {
    GPY: "GBP",
};

type CalendarNewsAssetIconProps = {
    /** Asset key: USD…CHF, GPY, GOLD, OIL. */
    asset: string;
    size?: number;
};

/**
 * Gold bars + sparkle — same motif as Material Design `mdi:gold`, which most
 * finance / broker UIs reuse for XAU / GOLD.
 * @see https://pictogrammers.com/library/mdi/icon/gold/
 */
function GoldBarsIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={styles.commoditySvg}>
            {/* Bottom-left bar */}
            <path d="M1 22 L2.5 17 H9.5 L11 22 Z" fill="#e8b923" stroke="#6b4e08" strokeWidth="0.6" strokeLinejoin="round" />
            {/* Bottom-right bar */}
            <path d="M13 22 L14.5 17 H21.5 L23 22 Z" fill="#d4a017" stroke="#6b4e08" strokeWidth="0.6" strokeLinejoin="round" />
            {/* Middle bar */}
            <path d="M6 15 L7.5 10 H14.5 L16 15 Z" fill="#f6d35a" stroke="#6b4e08" strokeWidth="0.6" strokeLinejoin="round" />
            {/* Sparkle (standard gold icon accent) */}
            <path
                d="M23 6.05 L19.14 7.14 L18.05 11 L16.96 7.14 L13.1 6.05 L16.96 4.96 L18.05 1.1 L19.14 4.96 Z"
                fill="#ffe566"
                stroke="#b8860b"
                strokeWidth="0.45"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * Oil drum / barrel — same commodity motif as Unicode 🛢️ and broker heatmaps
 * (steel drum + yellow bands), not a wine barrel.
 */
function OilDrumIcon({ size }: { size: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={styles.commoditySvg}>
            <ellipse cx="12" cy="20.2" rx="5.8" ry="1.7" fill="#1a1a1a" />
            <rect x="6.2" y="5.5" width="11.6" height="14.7" rx="1.2" fill="#3a3a3a" stroke="#111" strokeWidth="0.9" />
            {/* Hazard / drum bands — common oil-commodity shorthand */}
            <rect x="6.2" y="8" width="11.6" height="2.1" fill="#f5c542" />
            <rect x="6.2" y="12.1" width="11.6" height="2.1" fill="#f5c542" />
            <rect x="6.2" y="16.2" width="11.6" height="2.1" fill="#f5c542" />
            <ellipse cx="12" cy="5.5" rx="5.8" ry="2.2" fill="#4a4a4a" stroke="#111" strokeWidth="0.9" />
            <ellipse cx="12" cy="5" rx="2.1" ry="0.85" fill="#1a1a1a" />
        </svg>
    );
}

export default function CalendarNewsAssetIcon({ asset, size = 26 }: CalendarNewsAssetIconProps) {
    const key = asset.trim().toUpperCase();
    const box = { width: size, height: size };
    const glyph = Math.max(14, Math.round(size * 0.88));

    if (key.startsWith("GOLD")) {
        return (
            <span className={`${styles.round} ${styles.goldBadge}`} style={box} role="img" aria-label="Gold">
                <GoldBarsIcon size={glyph} />
            </span>
        );
    }
    if (key.startsWith("OIL")) {
        return (
            <span className={`${styles.round} ${styles.oilBadge}`} style={box} role="img" aria-label="Oil">
                <OilDrumIcon size={glyph} />
            </span>
        );
    }

    const code = FLAG_CODE_OVERRIDES[key] ?? key.slice(0, 3);

    return (
        <span className={styles.round} style={box}>
            <CurrencyFlag currency={code} size={size} title={asset} />
        </span>
    );
}
