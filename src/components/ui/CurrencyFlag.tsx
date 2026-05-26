"use client";

import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";
import {
    getCentralBankCountryCode,
    getCurrencyCountryCode,
    getCurrencyCountryCodeFromLabel,
} from "@/lib/currencyFlags";
import { AU, CA, CH, CN, CZ, DK, EU, GB, HK, JP, MX, NO, NZ, PL, RU, SE, SG, US } from "country-flag-icons/react/3x2";

type FlagComponent = typeof US;

const FLAGS: Record<string, FlagComponent> = {
    AU,
    CA,
    CH,
    CN,
    CZ,
    DK,
    EU,
    GB,
    HK,
    JP,
    MX,
    NO,
    NZ,
    PL,
    RU,
    SE,
    SG,
    US,
};

export type CurrencyFlagProps = {
    /** ISO currency code (USD, EUR, …). */
    currency?: string;
    /** Central bank abbreviation (FED, ECB, …). */
    centralBank?: string;
    /** Pair or asset label — first matching currency code wins. */
    label?: string;
    /** ISO country/region code when already resolved. */
    countryCode?: string;
    className?: string;
    /**
     * Flag height in px (width follows 3:2 ratio).
     * Default matches prior emoji sizing (~`text-base` / 1rem).
     */
    size?: number;
    title?: string;
};

function resolveCountryCode(props: CurrencyFlagProps): string | null {
    if (props.countryCode) return props.countryCode.toUpperCase();
    if (props.centralBank) return getCentralBankCountryCode(props.centralBank);
    if (props.currency) return getCurrencyCountryCode(props.currency);
    if (props.label) return getCurrencyCountryCodeFromLabel(props.label);
    return null;
}

export default function CurrencyFlag({
    currency,
    centralBank,
    label,
    countryCode,
    className,
    size = 13,
    title,
}: CurrencyFlagProps) {
    const code = resolveCountryCode({ currency, centralBank, label, countryCode });
    if (!code) return null;

    const Flag = FLAGS[code];
    if (!Flag) return null;

    const height = size;
    const width = Math.round((size * 3) / 2);
    const style: CSSProperties = { width, height, display: "block" };

    return (
        <Flag
            className={cn("shrink-0 rounded-[2px]", className)}
            style={style}
            role="img"
            aria-label={title ?? currency ?? centralBank ?? label ?? code}
        />
    );
}
