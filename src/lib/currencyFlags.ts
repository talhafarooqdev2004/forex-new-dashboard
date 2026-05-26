/** ISO 4217 currency → ISO 3166-1 alpha-2 (or EU) for flag images. */
const CURRENCY_TO_COUNTRY: Record<string, string> = {
    USD: "US",
    EUR: "EU",
    GBP: "GB",
    JPY: "JP",
    CAD: "CA",
    CHF: "CH",
    AUD: "AU",
    NZD: "NZ",
    MXN: "MX",
    NOK: "NO",
    SEK: "SE",
    DKK: "DK",
    PLN: "PL",
    SGD: "SG",
    HKD: "HK",
    CZK: "CZ",
    CNY: "CN",
    RUB: "RU",
};

/** Central bank abbreviations → country/region code for flags. */
const CENTRAL_BANK_TO_COUNTRY: Record<string, string> = {
    FED: "US",
    ECB: "EU",
    BOE: "GB",
    SNB: "CH",
    RBA: "AU",
    BOC: "CA",
    RBNZ: "NZ",
    BOJ: "JP",
    CBR: "RU",
    PBOC: "CN",
};

export function getCurrencyCountryCode(currency: string): string | null {
    const code = currency.trim().toUpperCase().slice(0, 3);
    return CURRENCY_TO_COUNTRY[code] ?? null;
}

export function getCentralBankCountryCode(label: string): string | null {
    const code = label.trim().toUpperCase();
    return CENTRAL_BANK_TO_COUNTRY[code] ?? null;
}

/** Extract first known currency code from a pair label (e.g. "EUR/USD" → EUR). */
export function getCurrencyCountryCodeFromLabel(label: string): string | null {
    const upper = label.trim().toUpperCase();
    const codes = upper.match(/\b[A-Z]{3}\b/g) ?? [];
    for (const c of codes) {
        const country = CURRENCY_TO_COUNTRY[c];
        if (country) return country;
    }
    return getCurrencyCountryCode(upper);
}

/** @deprecated Use `<CurrencyFlag />` — emoji flags show as "US", "EU" on Windows. */
export function getCurrencyFlagEmoji(currency: string): string {
    const code = currency.trim().toUpperCase().slice(0, 3);
    const map: Record<string, string> = {
        USD: "🇺🇸",
        EUR: "🇪🇺",
        GBP: "🇬🇧",
        JPY: "🇯🇵",
        CAD: "🇨🇦",
        CHF: "🇨🇭",
        AUD: "🇦🇺",
        NZD: "🇳🇿",
        MXN: "🇲🇽",
        NOK: "🇳🇴",
        SEK: "🇸🇪",
        DKK: "🇩🇰",
        PLN: "🇵🇱",
        SGD: "🇸🇬",
        HKD: "🇭🇰",
        CZK: "🇨🇿",
    };
    return map[code] ?? "🏳️";
}

/** @deprecated Use `<CurrencyFlag centralBank={...} />`. */
export function getCentralBankFlagEmoji(label: string): string {
    const code = label.trim().toUpperCase();
    const map: Record<string, string> = {
        FED: "🇺🇸",
        ECB: "🇪🇺",
        BOE: "🇬🇧",
        SNB: "🇨🇭",
        RBA: "🇦🇺",
        BOC: "🇨🇦",
        RBNZ: "🇳🇿",
        BOJ: "🇯🇵",
        CBR: "🇷🇺",
        PBOC: "🇨🇳",
    };
    return map[code] ?? "🏳️";
}
