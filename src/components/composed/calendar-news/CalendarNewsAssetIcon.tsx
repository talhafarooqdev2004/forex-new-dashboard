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

export default function CalendarNewsAssetIcon({ asset, size = 26 }: CalendarNewsAssetIconProps) {
    const key = asset.trim().toUpperCase();
    const box = { width: size, height: size };

    if (key.startsWith("GOLD")) {
        return <span className={styles.gold} style={box} role="img" aria-label="Gold" />;
    }
    if (key.startsWith("OIL")) {
        return <span className={styles.oil} style={box} role="img" aria-label="Oil" />;
    }

    const code = FLAG_CODE_OVERRIDES[key] ?? key.slice(0, 3);

    return (
        <span className={styles.round} style={box}>
            <CurrencyFlag currency={code} size={size} title={asset} />
        </span>
    );
}
