"use client";

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
} from "@/components/ui";
import TextEditor from "@/components/ui/form/TextEditor";
import useEducationStoreForm, { type EducationFormValues } from "@/hooks/forms/education/useEducationStoreForm";
import type { Education } from "@/types";

type EducationDialogMode = "create" | "edit";

type EducationCreateDialogProps = {
    open: boolean;
    mode: EducationDialogMode;
    education?: Education | null;
    isLoading?: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmitEducation: (data: EducationFormValues) => Promise<void>;
};

export default function EducationCreateDialog({
    open,
    mode,
    education,
    isLoading = false,
    onOpenChange,
    onSubmitEducation,
}: EducationCreateDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden rounded-[24px] border-stroke bg-darkGrey p-0 text-foreground shadow-[0_32px_90px_rgba(0,0,0,0.45)] sm:rounded-[28px]">
                <div className="border-b border-stroke bg-background/20 px-6 py-5 sm:px-7">
                    <DialogHeader className="space-y-2 text-left">
                        <DialogTitle className="font-arimo text-2xl font-semibold tracking-tight text-foreground">
                            {mode === "edit" ? "Edit Education Topic" : "Create Education Topic"}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="scrollable-container min-h-0 flex-1">
                    {isLoading ? (
                        <div className="px-6 py-10 text-sm text-secondary sm:px-7">Loading topic...</div>
                    ) : (
                        open && (
                            <EducationForm
                                mode={mode}
                                education={education}
                                setClose={() => onOpenChange(false)}
                                onSubmitEducation={onSubmitEducation}
                            />
                        )
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function EducationForm({
    mode,
    education,
    setClose,
    onSubmitEducation,
}: {
    mode: EducationDialogMode;
    education?: Education | null;
    setClose: () => void;
    onSubmitEducation: (data: EducationFormValues) => Promise<void>;
}) {
    const { form, locales, onSubmit } = useEducationStoreForm({
        education,
        onSubmitEducation,
        onClose: setClose,
    });

    return (
        <Form {...form}>
            <form className="space-y-5 px-6 py-6 sm:px-7" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name={"publish" as const}
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-[20px] border border-stroke bg-darkGrey/60 px-4 py-4">
                            <div className="space-y-1">
                                <FormLabel className="text-base text-foreground">Publish</FormLabel>
                                <p className="text-sm text-secondary">
                                    {field.value ? "Published" : "Unpublished"}
                                </p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                                    <span className="text-base font-medium text-foreground">{locale.fullText}</span>
                                </AccordionTrigger>
                            </AccordionHeader>

                            <AccordionContent className="pb-5">
                                <div className="space-y-5 pt-1">
                                    <FormField
                                        control={form.control}
                                        name={`translations.${index}.title` as const}
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    Title
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        variant="dark-grey"
                                                        placeholder="Enter Title"
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
                                        name={`translations.${index}.content` as const}
                                        render={({ field }) => (
                                            <FormItem className="space-y-2">
                                                <FormLabel className="text-sm font-medium text-foreground">
                                                    Content
                                                </FormLabel>
                                                <FormControl>
                                                    <TextEditor value={field.value} onChange={field.onChange} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
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
                    <Button type="submit" variant="primary" className="bg-royalBlue text-white hover:bg-royalBlue/90">
                        {mode === "edit" ? "Update topic" : "Create topic"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
