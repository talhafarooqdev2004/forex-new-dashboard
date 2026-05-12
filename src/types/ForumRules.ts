export type ForumRuleLocale = "en" | "ru" | "de" | "fr" | "zh";

export type ForumRuleTranslation = {
    id: number;
    locale: ForumRuleLocale;
    title: string;
    description: string;
    tags: string[];
};

export type ForumRule = {
    id: number;
    active: boolean;
    translation: ForumRuleTranslation | null;
    translations: ForumRuleTranslation[];
};

export type ForumRulesProps = {
    rules?: ForumRule[];
};
