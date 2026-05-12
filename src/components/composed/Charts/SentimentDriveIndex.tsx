"use client";

import DriveIndexChart, { type DriveIndexBar } from "./DriveIndexChart";

/** Equal 5-unit steps ±25 (same linear spacing as Direction); includes 0, 5, 15, 25 and symmetric negatives. */
const SENTIMENT_DRIVE_AXIS_TICKS = [25, 20, 15, 10, 5, 0, -5, -10, -15, -20, -25] as const;

export default function SentimentDriveIndex({ bars }: { bars?: DriveIndexBar[] | null }) {
    return (
        <DriveIndexChart
            title="Sentiment Drive Index"
            bars={bars}
            pairLabelTone="sentiment"
            scaleMax={25}
            axisTicks={SENTIMENT_DRIVE_AXIS_TICKS}
            barSlotFillRatio={0.64}
        />
    );
}
