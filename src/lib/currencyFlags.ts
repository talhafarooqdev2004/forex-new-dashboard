/** ISO currency code → flag emoji (same set as Currency Seasonal Trends gauges). */
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

/** Central bank label/abbreviation → flag emoji. */
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
