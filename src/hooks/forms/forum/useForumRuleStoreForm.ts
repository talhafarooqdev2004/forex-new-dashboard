import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useLocale from "@/hooks/useLocale";
import { ForumRuleStoreSchema } from "@/schemas";
import type { ForumRule, ForumRuleLocale } from "@/types";

export type ForumRuleTranslationValues = {
    locale: string;
    title: string;
    description: string;
    tags: string[];
};

export type ForumRuleFormValues = {
    active: boolean;
    translations: ForumRuleTranslationValues[];
};

type UseForumRuleStoreFormArgs = {
    rule?: ForumRule | null;
    onSubmitRule: (data: ForumRuleFormValues) => Promise<void>;
    onClose: () => void;
};

const buildDefaultValues = (
    locales: ReadonlyArray<{ locale: ForumRuleLocale; fullText: string }>,
    rule?: ForumRule | null,
): ForumRuleFormValues => {
    const translationsByLocale = new Map(
        (rule?.translations ?? []).map((translation) => [translation.locale, translation]),
    );

    return {
        active: rule?.active ?? true,
        translations: locales.map((locale) => {
            const translation = translationsByLocale.get(locale.locale);

            return {
                locale: locale.locale,
                title: translation?.title ?? "",
                description: translation?.description ?? "",
                tags: translation?.tags ?? [],
            };
        }),
    };
};

export default function useForumRuleStoreForm({
    rule,
    onSubmitRule,
    onClose,
}: UseForumRuleStoreFormArgs) {
    const { locales } = useLocale();

    const form = useForm<ForumRuleFormValues>({
        resolver: zodResolver(ForumRuleStoreSchema),
        defaultValues: buildDefaultValues(locales, rule),
    });

    useEffect(() => {
        form.reset(buildDefaultValues(locales, rule));
    }, [form, locales, rule]);

    const onSubmit = async (data: ForumRuleFormValues) => {
        await onSubmitRule({
            active: data.active,
            translations: data.translations.map((translation) => ({
                ...translation,
                title: translation.title.trim(),
                description: translation.description.trim(),
                tags: translation.tags.map((tag) => tag.trim()).filter(Boolean),
            })),
        });

        onClose();
    };

    return {
        form,
        locales,
        onSubmit,
    };
}
