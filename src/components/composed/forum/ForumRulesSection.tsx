"use client";

import { Loader2, PencilLine, Plus, Trash2 } from "lucide-react";

import { ForumRuleCreateDialog } from "@/components/features/dialogs";
import { Button } from "@/components/ui";
import { useForumRules } from "@/hooks";

export default function ForumRulesSection() {
    const {
        rules,
        isLoading,
        error,
        isDialogLoading,
        editingRuleId,
        deletingRuleId,
        dialogMode,
        isDialogOpen,
        selectedRule,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitRule,
        deleteRule,
    } = useForumRules();

    return (
        <>
            <section className="mt-8 relative overflow-hidden rounded-[28px] border border-stroke bg-darkGrey px-5 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] sm:px-6 lg:px-8">
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-16 top-0 h-40 w-40 rounded-full bg-royalBlue/20 blur-3xl" />
                    <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-electricBlue/10 blur-3xl" />
                </div>

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-stroke bg-background/30 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-secondary">
                            Community guidelines
                        </div>

                        <div className="mt-4 space-y-3">
                            <h1 className="font-arimo text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                                Forum Rules
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-secondary">
                                Manage the forum rules that appear in the community tab. Each rule can be edited across all supported locales.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 flex flex-wrap gap-3">
                        <Button
                            type="button"
                            variant="primary"
                            className="bg-royalBlue text-white hover:bg-royalBlue/90"
                            onClick={openCreateDialog}
                            disabled={isDialogLoading}
                        >
                            <Plus className="h-4 w-4" />
                            Create rule
                        </Button>
                    </div>
                </div>

                <div className="relative mt-8">
                    {error ? (
                        <div className="rounded-[24px] border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200">
                            {error}
                        </div>
                    ) : null}

                    {isLoading ? (
                        <LoadingState />
                    ) : rules.length === 0 ? (
                        <EmptyState onCreate={openCreateDialog} />
                    ) : (
                        <div className="rounded-[24px] border border-stroke bg-background/20 p-4 sm:p-5">
                            <ol className="grid gap-4">
                                {rules.map((rule, index) => {
                                    const translation = rule.translation ?? rule.translations[0];
                                    const isActive = rule.active;

                                    return (
                                        <li
                                            key={rule.id}
                                            className="group flex flex-col gap-4 rounded-[20px] border border-stroke bg-darkGrey/60 p-4 transition-transform duration-200 hover:-translate-y-0.5 hover:border-royalBlue/40 sm:flex-row sm:items-start"
                                        >
                                            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${isActive ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-stroke bg-background/30 text-foreground"}`}>
                                                {String(index + 1).padStart(2, "0")}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h3 className="text-base font-semibold text-foreground sm:text-lg">
                                                                {translation?.title ?? "Untitled rule"}
                                                            </h3>
                                                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${isActive ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : "border-stroke bg-background/30 text-secondary"}`}>
                                                                {isActive ? "Active" : "Inactive"}
                                                            </span>
                                                        </div>

                                                        <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">
                                                            {translation?.description ?? "No description available."}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <IconActionButton
                                                            label="Edit rule"
                                                            onClick={() => void openEditDialog(rule.id)}
                                                            disabled={isDialogLoading}
                                                        >
                                                            {isDialogLoading && editingRuleId === rule.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <PencilLine className="h-4 w-4" />
                                                            )}
                                                        </IconActionButton>

                                                        <IconActionButton
                                                            label="Delete rule"
                                                            onClick={() => void deleteRule(rule.id)}
                                                            disabled={deletingRuleId === rule.id}
                                                            destructive
                                                        >
                                                            {deletingRuleId === rule.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </IconActionButton>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {(translation?.tags ?? []).map((tag) => (
                                                        <RulePill key={`${rule.id}-${tag}`}>{tag}</RulePill>
                                                    ))}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </div>
                    )}
                </div>
            </section>

            <ForumRuleCreateDialog
                open={isDialogOpen}
                mode={dialogMode}
                rule={selectedRule}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
                onSubmitRule={submitRule}
            />
        </>
    );
}

function LoadingState() {
    return (
        <div className="rounded-[24px] border border-stroke bg-background/20 p-4 sm:p-5">
            <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-32 animate-pulse rounded-[20px] border border-stroke bg-darkGrey/60"
                    />
                ))}
            </div>
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="rounded-[24px] border border-dashed border-stroke bg-background/20 px-6 py-10 text-center">
            <p className="text-base font-medium text-foreground">
                No forum rules yet
            </p>
            <p className="mt-2 text-sm leading-6 text-secondary">
                Create the first rule to start building the community guidelines.
            </p>
            <Button
                type="button"
                variant="primary"
                className="mt-5 bg-royalBlue text-white hover:bg-royalBlue/90"
                onClick={onCreate}
            >
                <Plus className="h-4 w-4" />
                Create rule
            </Button>
        </div>
    );
}

function RulePill({ children }: React.PropsWithChildren) {
    return (
        <span className="rounded-full border border-stroke bg-background/25 px-3 py-1 text-xs font-medium text-secondary">
            {children}
        </span>
    );
}

function IconActionButton({
    children,
    label,
    destructive = false,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    destructive?: boolean;
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            className={`h-10 w-10 rounded-full border transition-colors ${destructive ? "border-red-500/25 bg-red-500/10 text-red-200 hover:bg-red-500/20" : "border-stroke bg-background/20 text-foreground hover:bg-background/35"}`}
            {...props}
        >
            {children}
        </Button>
    );
}
