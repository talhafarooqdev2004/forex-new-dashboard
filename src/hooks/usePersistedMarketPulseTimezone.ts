"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getEffectiveIanaTimeZone,
    MARKET_PULSE_TZ_DEVICE,
    readMarketPulseTimezonePreference,
    writeMarketPulseTimezonePreference,
} from "@/lib/marketPulseTimezone";

/**
 * Persists Market Pulse timezone in a **30-day cookie** (and mirrors to localStorage for legacy tabs).
 * `storedTimezone` is the raw stored token (IANA or {@link MARKET_PULSE_TZ_DEVICE});
 * `effectiveTimezone` is always a concrete IANA id for formatting.
 */
export function usePersistedMarketPulseTimezone() {
    const [storedTimezone, setStoredState] = useState<string>(MARKET_PULSE_TZ_DEVICE);

    useEffect(() => {
        setStoredState(readMarketPulseTimezonePreference());
    }, []);

    const setStoredTimezone = useCallback((value: string) => {
        setStoredState(value);
        writeMarketPulseTimezonePreference(value);
    }, []);

    const effectiveTimezone = useMemo(
        () => getEffectiveIanaTimeZone(storedTimezone),
        [storedTimezone],
    );

    return { storedTimezone, effectiveTimezone, setStoredTimezone };
}
