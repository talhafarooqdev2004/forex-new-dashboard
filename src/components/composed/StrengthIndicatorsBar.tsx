import { cn } from "@/lib/utils";

export default function StrengthIndicatorsBar({
    type,
    currency,
    value
}: {
    type: "bullish" | "bearish",
    currency: string,
    value: string
}) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <span className="text-base">{currency}</span>
                <span className={cn("text-base font-semibold", type === "bullish" ? "text-[#05DF72]" : "text-[#FF0000]")}>{value}</span>
            </div>

            <StrengthIndicators>
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
                <StrengthIndicator type={type} />
            </StrengthIndicators>
        </div>
    );
};

function StrengthIndicators({ children }: React.PropsWithChildren) {
    return (
        <div className="flex items-center gap-1">
            {children}
        </div>
    );
};

function StrengthIndicator({ type }: { type: "bullish" | "bearish" }) {
    return (
        <div className={cn("h-2 rounded-2xl flex-1", type === "bullish" ? "bg-[#00C950]" : "bg-[#FF0000]")}></div>
    );
};