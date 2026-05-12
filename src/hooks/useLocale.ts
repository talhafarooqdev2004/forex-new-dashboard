import type { ForumRuleLocale } from "@/types";

const locales = [
    { locale: "en", fullText: "English" },
    { locale: "ru", fullText: "Russian" },
    { locale: "de", fullText: "German" },
    { locale: "fr", fullText: "French" },
    { locale: "zh", fullText: "Chinese" },
] as const satisfies ReadonlyArray<{ locale: ForumRuleLocale; fullText: string }>;

export default function useLocale() {
    return {
        locales,
    };
}
