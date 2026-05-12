import { useEffect, useRef } from "react";

const DEFAULT_INTERVAL_MS = 60_000;

export type DashboardBackendPollOptions = {
    /** Default 60_000 ms (1 minute). */
    intervalMs?: number;
    /** When false, no interval is registered. */
    enabled?: boolean;
    /** Skip a tick while the browser tab is hidden (fewer API calls). */
    pauseWhenHidden?: boolean;
    /** If the previous tick is still in flight, skip starting another run. */
    skipIfBusy?: boolean;
};

/**
 * Re-runs the given loader on a fixed interval so dashboards stay aligned with the admin API
 * even if a websocket event is missed. Intended alongside existing `tableUpdate` listeners.
 */
export function useDashboardBackendPoll(
    onPoll: () => void | Promise<void>,
    options?: DashboardBackendPollOptions,
): void {
    const { intervalMs = DEFAULT_INTERVAL_MS, enabled = true, pauseWhenHidden = true, skipIfBusy = true } =
        options ?? {};

    const onPollRef = useRef(onPoll);
    useEffect(() => {
        onPollRef.current = onPoll;
    }, [onPoll]);

    const busyRef = useRef(false);

    useEffect(() => {
        if (!enabled) return;
        if (intervalMs < 10_000) return;

        const tick = async () => {
            if (pauseWhenHidden && typeof document !== "undefined" && document.hidden) return;
            if (skipIfBusy && busyRef.current) return;
            busyRef.current = true;
            try {
                await onPollRef.current();
            } catch {
                /* errors logged inside loaders */
            } finally {
                busyRef.current = false;
            }
        };

        const id = window.setInterval(() => {
            void tick();
        }, intervalMs);

        return () => window.clearInterval(id);
    }, [enabled, intervalMs, pauseWhenHidden, skipIfBusy]);
}
