import { months } from "@/constants/PeriodPickerData";
import { cn } from "@/lib/utils";
import { MonthProps } from "@/types";

export default function PeriodPicker() {
    const currentYear = new Date().getFullYear();
    const currentMonthIndex = new Date().getMonth();

    return (
        <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
                <span className="text-[#99A1AF]">Year</span>
                <div className="bg-[#364153] rounded-[4px] px-3 h-6 text-center">
                    <span>{currentYear}</span>
                </div>
            </div>

            <Months>
                <span>Month</span>

                {months.map((month: MonthProps) => {
                    const isCurrentMonth = month.monthIndex === currentMonthIndex;
                    return (
                        (
                            <Month
                                key={month.monthIndex}
                                isActive={isCurrentMonth}
                            >
                                {isCurrentMonth ? month.name : month.shortName}
                            </Month>
                        )
                    )
                })}
            </Months>
        </div>
    );
};

function Months({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {children}
        </div>
    );
};

function Month({ children, isActive }: React.PropsWithChildren<{ isActive: boolean }>) {
    return (
        <div className={cn("px-3", isActive ? "text-[#05DF72]" : "")}>
            {children}
        </div>
    );
};