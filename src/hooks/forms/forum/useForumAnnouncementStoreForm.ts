import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useLocale from "@/hooks/useLocale";
import { ForumAnnouncementStoreSchema } from "@/schemas";
import type { ForumAnnouncement, ForumAnnouncementLocale } from "@/types";

export type ForumAnnouncementTranslationValues = {
    locale: string;
    title: string;
    description: string;
    tags: string[];
};

export type ForumAnnouncementFormValues = {
    active: boolean;
    translations: ForumAnnouncementTranslationValues[];
};

type UseForumAnnouncementStoreFormArgs = {
    announcement?: ForumAnnouncement | null;
    onSubmitAnnouncement: (data: ForumAnnouncementFormValues) => Promise<void>;
    onClose: () => void;
};

const buildDefaultValues = (
    locales: ReadonlyArray<{ locale: ForumAnnouncementLocale; fullText: string }>,
    announcement?: ForumAnnouncement | null,
): ForumAnnouncementFormValues => {
    const translationsByLocale = new Map(
        (announcement?.translations ?? []).map((translation) => [translation.locale, translation]),
    );

    return {
        active: announcement?.active ?? true,
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

export default function useForumAnnouncementStoreForm({
    announcement,
    onSubmitAnnouncement,
    onClose,
}: UseForumAnnouncementStoreFormArgs) {
    const { locales } = useLocale();

    const form = useForm<ForumAnnouncementFormValues>({
        resolver: zodResolver(ForumAnnouncementStoreSchema),
        defaultValues: buildDefaultValues(locales, announcement),
    });

    useEffect(() => {
        form.reset(buildDefaultValues(locales, announcement));
    }, [form, locales, announcement]);

    const onSubmit = async (data: ForumAnnouncementFormValues) => {
        await onSubmitAnnouncement({
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
