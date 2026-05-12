import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ForumPostStoreSchema } from "@/schemas";
import type { ForumPost, ForumPostCategory } from "@/types";

export type ForumPostFormValues = {
    active: boolean;
    category: ForumPostCategory;
    title: string;
    content: string;
    imagePath: string;
    tags: string[];
};

type UseForumPostStoreFormArgs = {
    post?: ForumPost | null;
    defaultCategory: ForumPostCategory;
    onSubmitPost: (data: ForumPostFormValues) => Promise<void>;
    onClose: () => void;
};

const buildDefaultValues = (
    post?: ForumPost | null,
    defaultCategory: ForumPostCategory = "general-discussion",
): ForumPostFormValues => ({
    active: post?.active ?? true,
    category: post?.category ?? defaultCategory,
    title: post?.title ?? "",
    content: post?.content ?? "",
    imagePath: post?.imagePath ?? "",
    tags: post?.tags ?? [],
});

export default function useForumPostStoreForm({
    post,
    defaultCategory,
    onSubmitPost,
    onClose,
}: UseForumPostStoreFormArgs) {
    const form = useForm<ForumPostFormValues>({
        resolver: zodResolver(ForumPostStoreSchema),
        defaultValues: buildDefaultValues(post, defaultCategory),
    });

    useEffect(() => {
        form.reset(buildDefaultValues(post, defaultCategory));
    }, [form, post, defaultCategory]);

    const onSubmit = async (data: ForumPostFormValues) => {
        await onSubmitPost({
            active: data.active,
            category: data.category,
            title: data.title.trim(),
            content: data.content.trim(),
            imagePath: data.imagePath.trim(),
            tags: data.tags.map((tag) => tag.trim()).filter(Boolean),
        });

        onClose();
    };

    return {
        form,
        onSubmit,
    };
}
