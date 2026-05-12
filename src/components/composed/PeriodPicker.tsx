"use client";

import type { PropsWithChildren } from "react";
import { months } from "@/constants/PeriodPickerData";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { MonthProps } from "@/types";

function Months({ children }: PropsWithChildren) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {children}
        </div>
    );
}

function Month({ children, isActive }: PropsWithChildren<{ isActive: boolean }>) {
    return (
        <div className="px-3" style={isActive ? { color: GAUGE_SIGNAL_COLORS.buy } : undefined}>
            {children}
        </div>
    );
}

function PeriodPicker() {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    return (
        <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
                <span className="text-[#99A1AF]">Year</span>
                <div className="bg-[#364153] text-white rounded-[4px] px-3 h-6 text-center">
                    <span>{currentYear}</span>
                </div>
            </div>

            <Months>
                <span>Month</span>

                {months.map((month: MonthProps) => {
                    const isCurrentMonth = month.monthIndex === currentMonthIndex;
                    return (
                        <Month key={month.monthIndex} isActive={isCurrentMonth}>
                            {isCurrentMonth ? month.name : month.shortName}
                        </Month>
                    );
                })}
            </Months>
        </div>
    );
}

export default PeriodPicker;
