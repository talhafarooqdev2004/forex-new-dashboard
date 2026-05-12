"use client";

import { useState } from "react";
import { Control, FieldValues, useFieldArray, useWatch } from "react-hook-form";

import {
    Accordion,
    AccordionContent,
    AccordionHeader,
    AccordionItem,
    AccordionTrigger,
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
    Switch,
    Textarea,
} from "@/components/ui";
import useForumRuleStoreForm, { type ForumRuleFormValues } from "@/hooks/forms/forum/useForumRuleStoreForm";
import type { ForumRule } from "@/types";

type ForumRuleDialogMode = "create" | "edit";

type ForumRuleCreateDialogProps = {
    open: boolean;
    mode: ForumRuleDialogMode;
    rule?: ForumRule | null;
    onOpenChange: (open: boolean) => void;
    onSubmitRule: (data: ForumRuleFormValues) => Promise<void>;
};

export default function ForumRuleCreateDialog({
    open,
    mode,
    rule,
    onOpenChange,
    onSubmitRule,
}: ForumRuleCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-[24px] border-stroke bg-darkGrey p-0 text-foreground shadow-[0_32px_90px_rgba(0,0,0,0.45)] sm:rounded-[28px]">
                <div className="border-b border-stroke bg-background/20 px-6 py-5 sm:px-7">
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle className="font-arimo text-2xl font-semibold tracking-tight text-foreground">
                            {mode === "edit" ? "Update Forum Rule" : "Create Forum Rule"}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="scrollable-container min-h-0 flex-1">
                    {open && (
                        <ForumRuleForm
                            mode={mode}
                            rule={rule}
                            setClose={() => onOpenChange(false)}
                            onSubmitRule={onSubmitRule}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ForumRuleForm({
    mode,
    rule,
    setClose,
    onSubmitRule,
}: {
    mode: ForumRuleDialogMode;
    rule?: ForumRule | null;
    setClose: () => void;
    onSubmitRule: (data: ForumRuleFormValues) => Promise<void>;
}) {
    const {
        form,
        locales,
        onSubmit,
    } = useForumRuleStoreForm({
        rule,
        onSubmitRule,
        onClose: setClose,
    });

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

                {locales.map((locale, index) => (
                    <Accordion key={locale.locale} type="single" collapsible>
                        <AccordionItem
                            value={locale.locale}
                            className="rounded-[24px] border border-stroke bg-background/20 px-5"
                        >
                            <AccordionHeader>
                                <AccordionTrigger className="py-5 hover:no-underline">
                                    <div className="min-w-0 text-left">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-base font-medium text-foreground">
                                                {locale.fullText}
                                            </span>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                            </AccordionHeader>

                            <AccordionContent className="pb-5">
                                <div className="space-y-5 pt-1">
                                    <div className="grid gap-5">
                                        <FormField
                                            control={form.control}
                                            name={`translations.${index}.title`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        Title
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            variant="dark-grey"
                                                            placeholder="e.g. Keep discussions respectful"
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
                                            name={`translations.${index}.description`}
                                            render={({ field }) => (
                                                <FormItem className="space-y-2">
                                                    <FormLabel className="text-sm font-medium text-foreground">
                                                        Description
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            variant="dark"
                                                            className="min-h-[170px] border border-stroke bg-background/20 px-4 py-4 text-foreground placeholder:text-secondary/70"
                                                            placeholder=""
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <TranslationTagsField
                                            control={form.control}
                                            localeIndex={index}
                                            localeLabel={locale.fullText}
                                        />
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                ))}

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
                    >
                        {mode === "edit" ? "Update rule" : "Create rule"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

function TranslationTagsField({
    control,
    localeIndex,
    localeLabel,
}: {
    control: Control<ForumRuleFormValues>;
    localeIndex: number;
    localeLabel: string;
}) {
    const [draftTag, setDraftTag] = useState("");
    const tagsPath = `translations.${localeIndex}.tags` as const;
    const nestedControl = control as unknown as Control<FieldValues>;

    const { fields, append, remove } = useFieldArray({
        control: nestedControl,
        name: tagsPath as "translations",
    });

    const tags = (useWatch({
        control: nestedControl,
        name: tagsPath as "translations",
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
                        Add labels for the {localeLabel} translation.
                    </p>
                </div>

                <span className="rounded-full border border-stroke bg-background/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-secondary">
                    {fields.length} tags
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? tags.map((tag, tagIndex) => (
                    <span
                        key={fields[tagIndex]?.id ?? `${localeLabel}-${tagIndex}`}
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
