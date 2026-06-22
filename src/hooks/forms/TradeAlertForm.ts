import { useForm } from "react-hook-form";

export default function useTradeAlertForm(overrides?: Partial<{ type: string; riskPerTrade: string }>) {
    const form = useForm({
        defaultValues: {
            tradeId: "T021",
            symbol: "EURUSD",
            direction: "Buy",
            directionType: "Buy",
            type: overrides?.type ?? "Swing",
            session: "London",
            currentPrice: "1.0892",
            entryPrice: "1.0892",
            stockLoss: "1.0780",
            riskPerTrade: overrides?.riskPerTrade ?? "1.0%",
            tp1: "1.0780",
            tp2: "1.0780",
            tp3: "1.0780",
            notes: "",
        },
    });

    const {
        control,
        formState: { isSubmitting },
    } = form;

    return { form, control, isSubmitting };
}
