"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui";
import {
    TRADE_HISTORY_SORT_OPTIONS,
    type TradeHistorySortKey,
} from "@/lib/tradeHistorySort";

export default function TradeHistorySortSelect({
    value,
    onChange,
    className,
}: {
    value: TradeHistorySortKey;
    onChange: (value: TradeHistorySortKey) => void;
    className?: string;
}) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as TradeHistorySortKey)}>
            <SelectTrigger className={className ?? "w-[148px] h-8 text-xs px-2 shrink-0"}>
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                {TRADE_HISTORY_SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
