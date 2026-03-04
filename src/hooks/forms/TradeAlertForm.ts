import { useForm } from "react-hook-form";

export default function useTradeAlertForm() {
    const form = useForm({
        defaultValues: {
            symbol: "",
            direction: "",
            type: "",
            entryPrice: "",
            stockLoss: "",
            riskPerTrade: "",
            tp1: "",
            tp2: "",
            tp3: "",
        }
    });

    const { control, formState: { isSubmitting } } = form;

    return { form, control, isSubmitting };
}