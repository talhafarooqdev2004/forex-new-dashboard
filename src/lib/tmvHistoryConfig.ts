/**
 * Market Pulse TMV history bar grid (dashboard + backend must stay in sync).
 *
 * - **40 bars** per row (was 22): each bar uses `calc((100% - gaps) / 40)` so the row fills the panel.
 * - **15 minutes** per slot → 40 × 15 min = **10 hours** of history when fully populated.
 */
export const TMV_HISTORY_BAR_COUNT = 40;
export const TMV_HISTORY_SLOT_MS = 15 * 60 * 1000;

/** Time-axis label every 8 slots (2 hours). */
export const TMV_HISTORY_TIME_LABEL_INDICES: readonly number[] = [0, 8, 16, 24, 32];
