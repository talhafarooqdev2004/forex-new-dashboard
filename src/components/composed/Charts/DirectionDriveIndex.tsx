"use client";

import DriveIndexChart, { type DriveIndexBar } from "./DriveIndexChart";

export default function DirectionDriveIndex({ bars }: { bars?: DriveIndexBar[] | null }) {
    return (
        <DriveIndexChart title="Direction Drive Index" bars={bars} pairLabelTone="direction" scaleMax={75} />
    );
}
