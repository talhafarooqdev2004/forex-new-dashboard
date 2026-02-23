import { cn } from "@/lib/utils";

export default function HeatMap({ pair, value }: { pair: string, value: number }) {
    const colorMap = {
        positive: { bg: "bg-greenDark", color: "text-white" },
        negative: { bg: "bg-sell", color: "text-white" },
        neutral: { bg: "bg-lemonGlacier", color: "text-black" },
    };

    const variant = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
    const { bg, color } = colorMap[variant as keyof typeof colorMap];

    return (
        <div className={cn("flex flex-col items-center justify-center gap-[7px] h-24 py-3 rounded-2xl", bg)}>
            <span className={cn("text-xl font-semibold", color)}>{pair}</span>
            <span className={cn("font-normal", color)}>{value}</span>
        </div>
    );
};