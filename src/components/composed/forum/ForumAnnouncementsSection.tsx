"use client";

import { BellRing, Clock3, Hash, Loader2, Megaphone, PencilLine, Pin, Plus, Sparkles, Trash2 } from "lucide-react";

import { ForumAnnouncementCreateDialog } from "@/components/features/dialogs";
import { Button } from "@/components/ui";
import { useForumAnnouncements } from "@/hooks";

export default function ForumAnnouncementsSection() {
    const {
        announcements,
        isLoading,
        error,
        isDialogLoading,
        editingAnnouncementId,
        deletingAnnouncementId,
        dialogMode,
        isDialogOpen,
        selectedAnnouncement,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitAnnouncement,
        deleteAnnouncement,
    } = useForumAnnouncements();

    return (
        <section className="mt-8 relative overflow-hidden rounded-[28px] border border-stroke bg-darkGrey px-5 py-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -right-14 top-0 h-44 w-44 rounded-full bg-[#5865F2]/20 blur-3xl" />
                <div className="absolute -left-12 bottom-0 h-48 w-48 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
            </div>

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                    <div className="mt-4 space-y-3">
                        <h1 className="font-arimo text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            Announcements
                        </h1>
                    </div>
                </div>

                <div className="relative z-10 flex flex-wrap gap-3">
                    <Button
                        type="button"
                        variant="primary"
                        className="bg-[#5865F2] text-white hover:bg-[#5865F2]/90"
                        onClick={openCreateDialog}
                        disabled={isDialogLoading}
                    >
                        <Plus className="h-4 w-4" />
                        Create announcement
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
                ) : announcements.length === 0 ? (
                    <EmptyState onCreate={openCreateDialog} />
                ) : (
                    <div className="grid gap-4">
                        {announcements.map((announcement, index) => {
                            const translation = announcement.translation ?? announcement.translations[0];
                            const relativeTime = formatRelativeTime(announcement.createdAt);
                            const accent = index % 2 === 0 ? "border-[#5865F2]/40 bg-[#232428]" : "border-stroke bg-[#2b2d31]";

                            return (
                                <article
                                    key={announcement.id}
                                    className={`group rounded-[24px] border p-5 shadow-[0_18px_60px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:-translate-y-0.5 ${accent}`}
                                >
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                        <AnnouncementAvatar active={announcement.active} />

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-full border border-[#5865F2]/30 bg-[#5865F2]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9ca3ff]">
                                                    <Hash className="h-3.5 w-3.5" />
                                                    announcements
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full border border-stroke bg-background/25 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-secondary">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    Community Team
                                                </span>
                                                <span className="inline-flex items-center gap-1 rounded-full border border-stroke bg-background/25 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-secondary">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {relativeTime}
                                                </span>
                                                {announcement.active ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                                                        <BellRing className="h-3.5 w-3.5" />
                                                        live
                                                    </span>
                                                ) : null}
                                            </div>

                                            <div className="mt-3 space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3 className="text-lg font-semibold text-foreground sm:text-xl">
                                                            {translation?.title ?? "Untitled announcement"}
                                                        </h3>
                                                        <p className="mt-1 text-sm leading-6 text-secondary">
                                                            {translation?.description ?? "No description available."}
                                                        </p>
                                                    </div>

                                                    <div className="flex shrink-0 items-center gap-2">
                                                        <IconActionButton
                                                            label="Edit announcement"
                                                            onClick={() => void openEditDialog(announcement.id)}
                                                            disabled={isDialogLoading}
                                                        >
                                                            {isDialogLoading && editingAnnouncementId === announcement.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <PencilLine className="h-4 w-4" />
                                                            )}
                                                        </IconActionButton>

                                                        <IconActionButton
                                                            label="Delete announcement"
                                                            onClick={() => void deleteAnnouncement(announcement.id)}
                                                            disabled={deletingAnnouncementId === announcement.id}
                                                            destructive
                                                        >
                                                            {deletingAnnouncementId === announcement.id ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="h-4 w-4" />
                                                            )}
                                                        </IconActionButton>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {(translation?.tags ?? []).map((tag) => (
                                                        <AnnouncementTag key={`${announcement.id}-${tag}`}>{tag}</AnnouncementTag>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            <ForumAnnouncementCreateDialog
                open={isDialogOpen}
                mode={dialogMode}
                announcement={selectedAnnouncement}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
                onSubmitAnnouncement={submitAnnouncement}
            />
        </section>
    );
}

function AnnouncementAvatar({ active }: { active: boolean }) {
    return (
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border ${active ? "border-[#5865F2]/35 bg-gradient-to-br from-[#5865F2]/30 to-[#8B5CF6]/10 text-[#c7d2fe]" : "border-stroke bg-background/20 text-secondary"}`}>
            <Megaphone className="h-6 w-6" />
        </div>
    );
}

function AnnouncementTag({ children }: React.PropsWithChildren) {
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

function LoadingState() {
    return (
        <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
                <div
                    key={index}
                    className="h-36 animate-pulse rounded-[24px] border border-stroke bg-[#2b2d31]"
                />
            ))}
        </div>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="rounded-[24px] border border-dashed border-stroke bg-[#2b2d31]/80 px-6 py-10 text-center">
            <p className="text-base font-medium text-foreground">
                No announcements yet
            </p>
            <p className="mt-2 text-sm leading-6 text-secondary">
                Once the team posts an update, it will appear here in the Discord-style feed.
            </p>
            <Button
                type="button"
                variant="primary"
                className="mt-5 bg-[#5865F2] text-white hover:bg-[#5865F2]/90"
                onClick={onCreate}
            >
                <Plus className="h-4 w-4" />
                Create announcement
            </Button>
        </div>
    );
}

function formatRelativeTime(isoDate: string) {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) {
        return `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        return `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
}
