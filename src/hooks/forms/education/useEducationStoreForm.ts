import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useLocale from "@/hooks/useLocale";
import { EducationStoreSchema } from "@/schemas";
import type { Education, EducationLocale } from "@/types";

export type EducationTranslationValues = {
    locale: EducationLocale;
    title: string;
    content: string;
};

export type EducationFormValues = {
    slug: string;
    publish: boolean;
    translations: EducationTranslationValues[];
};

type UseEducationStoreFormArgs = {
    education?: Education | null;
    onSubmitEducation: (data: EducationFormValues) => Promise<void>;
    onClose: () => void;
};

const getSlug = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const buildDefaultValues = (
    locales: ReadonlyArray<{ locale: EducationLocale; fullText: string }>,
    education?: Education | null,
): EducationFormValues => {
    const translationsByLocale = new Map(
        (education?.translations ?? []).map((translation) => [translation.locale, translation]),
    );

    return {
        slug: education?.slug ?? "",
        publish: education?.publish ?? false,
        translations: locales.map((locale) => {
            const translation = translationsByLocale.get(locale.locale);

            return {
                locale: locale.locale,
                title: translation?.title ?? "",
                content: translation?.content ?? "",
            };
        }),
    };
};

export default function useEducationStoreForm({
    education,
    onSubmitEducation,
    onClose,
}: UseEducationStoreFormArgs) {
    const { locales } = useLocale();

    const form = useForm<EducationFormValues>({
        resolver: zodResolver(EducationStoreSchema),
        defaultValues: buildDefaultValues(locales, education),
    });

    useEffect(() => {
        form.reset(buildDefaultValues(locales, education));
    }, [education, form, locales]);

    const englishIndex = locales.findIndex((locale) => locale.locale === "en");
    const englishTitle = useWatch({
        control: form.control,
        name: englishIndex >= 0 ? (`translations.${englishIndex}.title` as const) : "translations.0.title",
    });

    useEffect(() => {
        const nextSlug = getSlug(englishTitle ?? "");
        form.setValue("slug", nextSlug, {
            shouldDirty: true,
            shouldValidate: true,
        });
    }, [englishTitle, form]);

    const onSubmit = async (data: EducationFormValues) => {
        await onSubmitEducation({
            slug: getSlug(data.translations.find((translation) => translation.locale === "en")?.title ?? data.slug),
            publish: data.publish,
            translations: data.translations.map((translation) => ({
                ...translation,
                title: translation.title.trim(),
                content: translation.content.trim(),
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
