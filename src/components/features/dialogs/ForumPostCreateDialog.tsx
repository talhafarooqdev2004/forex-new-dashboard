"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import { Loader2, UploadCloud, X } from "lucide-react";
import { Control, FieldValues, useFieldArray, useWatch } from "react-hook-form";

import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
} from "@/components/ui";
import useForumPostStoreForm, { type ForumPostFormValues } from "@/hooks/forms/forum/useForumPostStoreForm";
import { forumPostService } from "@/services";
import { FORUM_POST_CATEGORIES, type ForumPost, type ForumPostCategory } from "@/types";

type ForumPostDialogMode = "create" | "edit";

type ForumPostCreateDialogProps = {
    open: boolean;
    mode: ForumPostDialogMode;
    post?: ForumPost | null;
    defaultCategory: ForumPostCategory;
    onOpenChange: (open: boolean) => void;
    onSubmitPost: (data: ForumPostFormValues) => Promise<void>;
};

const CATEGORY_LABELS: Record<ForumPostCategory, string> = {
    "general-discussion": "General Discussion",
    "technical-charts": "Technical Charts",
    "fundamental-discussion": "Fundamental Discussion",
    "success-stories": "Success Stories",
};

export default function ForumPostCreateDialog({
    open,
    mode,
    post,
    defaultCategory,
    onOpenChange,
    onSubmitPost,
}: ForumPostCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-[24px] border-stroke bg-darkGrey p-0 text-foreground shadow-[0_32px_90px_rgba(0,0,0,0.45)] sm:rounded-[28px]">
                <div className="border-b border-stroke bg-background/20 px-6 py-5 sm:px-7">
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle className="font-arimo text-2xl font-semibold tracking-tight text-foreground">
                            {mode === "edit" ? "Update Post" : "Create Post"}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="scrollable-container min-h-0 flex-1">
                    {open && (
                        <ForumPostForm
                            mode={mode}
                            post={post}
                            defaultCategory={defaultCategory}
                            setClose={() => onOpenChange(false)}
                            onSubmitPost={onSubmitPost}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ForumPostForm({
    mode,
    post,
    defaultCategory,
    setClose,
    onSubmitPost,
}: {
    mode: ForumPostDialogMode;
    post?: ForumPost | null;
    defaultCategory: ForumPostCategory;
    setClose: () => void;
    onSubmitPost: (data: ForumPostFormValues) => Promise<void>;
}) {
    const { form, onSubmit } = useForumPostStoreForm({
        post,
        defaultCategory,
        onSubmitPost,
        onClose: setClose,
    });
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    return (
        <Form {...form}>
            <form className="space-y-5 px-6 py-6 sm:px-7" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-[20px] border border-stroke bg-darkGrey/60 px-4 py-4">
                            <div className="space-y-1">
                                <FormLabel className="text-base text-foreground">
                                    Active
                                </FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground">
                                Category
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger variant="dark-grey" className="border-stroke bg-background/20 text-foreground">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent variant="dark-grey">
                                    {FORUM_POST_CATEGORIES.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {CATEGORY_LABELS[category]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground">
                                Post title
                            </FormLabel>
                            <FormControl>
                                <Input
                                    variant="dark-grey"
                                    placeholder="e.g. GBPJPY setup this week"
                                    className="border-stroke bg-background/20 text-foreground placeholder:text-secondary/70"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="imagePath"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <FormLabel className="text-sm font-medium text-foreground">
                                Post image
                            </FormLabel>
                            <FormControl>
                                <div className="space-y-3 rounded-[20px] border border-stroke bg-darkGrey/50 p-4">
                                    <div className="overflow-hidden rounded-[16px] border border-dashed border-stroke bg-background/10">
                                        {field.value ? (
                                            <div className="relative">
                                                <img
                                                    src={field.value}
                                                    alt="Post preview"
                                                    className="h-[400px] w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70"
                                                    onClick={() => field.onChange("")}
                                                    aria-label="Remove image"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                                                <UploadCloud className="h-10 w-10 text-secondary" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        Upload a post image
                                                    </p>
                                                    <p className="mt-1 text-sm text-secondary">
                                                        This image will appear directly below the post title.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Input
                                        type="file"
                                        accept="image/*"
                                        variant="dark-grey"
                                        className="border-stroke bg-background/20 text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-royalBlue file:px-4 file:py-2 file:text-white hover:file:bg-royalBlue/90"
                                        disabled={isUploadingImage}
                                        onChange={async (event) => {
                                            const file = event.target.files?.[0];

                                            if (!file) {
                                                return;
                                            }

                                            setIsUploadingImage(true);

                                            try {
                                                const uploadedImagePath = await forumPostService.uploadImage(file);
                                                field.onChange(uploadedImagePath);
                                                form.clearErrors("imagePath");
                                            } catch (uploadError) {
                                                form.setError("imagePath", {
                                                    type: "manual",
                                                    message: uploadError instanceof Error ? uploadError.message : "Unable to upload image",
                                                });
                                            } finally {
                                                setIsUploadingImage(false);
                                                event.target.value = "";
                                            }
                                        }}
                                    />

                                    {isUploadingImage ? (
                                        <div className="flex items-center gap-2 text-sm text-secondary">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Uploading image...
                                        </div>
                                    ) : null}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <TagsField control={form.control} />

                <div className="flex flex-col gap-3 border-t border-stroke pt-5 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-stroke bg-transparent text-foreground hover:bg-stroke/10"
                        onClick={setClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="bg-royalBlue text-white hover:bg-royalBlue/90"
                        disabled={isUploadingImage}
                    >
                        {mode === "edit" ? "Update post" : "Create post"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function TagsField({
    control,
}: {
    control: Control<ForumPostFormValues>;
}) {
    const [draftTag, setDraftTag] = useState("");
    const tagsPath = "tags" as const;
    const nestedControl = control as unknown as Control<FieldValues>;

    const { fields, append, remove } = useFieldArray({
        control: nestedControl,
        name: tagsPath as "tags",
    });

    const tags = (useWatch({
        control: nestedControl,
        name: tagsPath as "tags",
    }) ?? []) as string[];

    const addTag = () => {
        const nextTag = draftTag.trim();

        if (!nextTag) {
            return;
        }

        append(nextTag as never);
        setDraftTag("");
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();
        addTag();
    };

    return (
        <div className="space-y-3 rounded-[20px] border border-stroke bg-darkGrey/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-foreground">
                        Tags
                    </p>
                    <p className="mt-1 text-sm leading-6 text-secondary">
                        Add simple English labels for the post.
                    </p>
                </div>

                <span className="rounded-full border border-stroke bg-background/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-secondary">
                    {fields.length} tags
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? tags.map((tag, tagIndex) => (
                    <span
                        key={fields[tagIndex]?.id ?? `${tagIndex}`}
                        className="inline-flex items-center gap-2 rounded-full border border-stroke bg-background/20 px-3 py-2"
                    >
                        <span className="max-w-[180px] truncate text-sm text-foreground">
                            {tag}
                        </span>
                        <button
                            type="button"
                            className="text-secondary transition-colors hover:text-foreground"
                            onClick={() => remove(tagIndex)}
                            aria-label={`Remove ${tag}`}
                        >
                            ×
                        </button>
                    </span>
                )) : (
                    <p className="text-sm text-secondary">
                        No tags added yet.
                    </p>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                    variant="dark-grey"
                    value={draftTag}
                    onChange={(event) => setDraftTag(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a tag and press Enter"
                    className="border-stroke bg-background/20 text-foreground placeholder:text-secondary/70"
                />
                <Button
                    type="button"
                    variant="outline"
                    className="border-stroke bg-transparent text-foreground hover:bg-stroke/10"
                    onClick={addTag}
                >
                    Add tag
                </Button>
            </div>
        </div>
    );
}
