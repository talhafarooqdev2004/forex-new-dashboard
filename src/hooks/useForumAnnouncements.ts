import { useCallback, useEffect, useState } from "react";

import { forumAnnouncementService } from "@/services";
import type { ForumAnnouncement } from "@/types";
import useLocale from "@/hooks/useLocale";
import type { ForumAnnouncementFormValues } from "@/hooks/forms/forum/useForumAnnouncementStoreForm";

type ForumAnnouncementDialogState = {
    open: boolean;
    mode: "create" | "edit";
    announcement: ForumAnnouncement | null;
};

const initialDialogState: ForumAnnouncementDialogState = {
    open: false,
    mode: "create",
    announcement: null,
};

export default function useForumAnnouncements() {
    const { locales } = useLocale();
    const locale = locales[0]?.locale ?? "en";

    const [announcements, setAnnouncements] = useState<ForumAnnouncement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogState, setDialogState] = useState<ForumAnnouncementDialogState>(initialDialogState);
    const [isDialogLoading, setIsDialogLoading] = useState(false);
    const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<number | null>(null);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);

    const loadAnnouncements = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const nextAnnouncements = await forumAnnouncementService.list(locale);
            setAnnouncements(nextAnnouncements);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load announcements");
        } finally {
            setIsLoading(false);
        }
    }, [locale]);

    useEffect(() => {
        void loadAnnouncements();
    }, [loadAnnouncements]);

    const openCreateDialog = () => {
        setDialogState({
            open: true,
            mode: "create",
            announcement: null,
        });
    };

    const openEditDialog = async (id: number) => {
        setEditingAnnouncementId(id);
        setIsDialogLoading(true);

        try {
            const announcement = await forumAnnouncementService.show(id);
            setDialogState({
                open: true,
                mode: "edit",
                announcement,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load this announcement");
        } finally {
            setIsDialogLoading(false);
            setEditingAnnouncementId(null);
        }
    };

    const closeDialog = () => {
        setDialogState(initialDialogState);
    };

    const submitAnnouncement = async (data: ForumAnnouncementFormValues) => {
        if (dialogState.mode === "edit" && dialogState.announcement) {
            await forumAnnouncementService.update(dialogState.announcement.id, data);
        } else {
            await forumAnnouncementService.create(data);
        }

        await loadAnnouncements();
    };

    const deleteAnnouncement = async (id: number) => {
        if (typeof window !== "undefined") {
            const shouldDelete = window.confirm("Delete this announcement?");

            if (!shouldDelete) {
                return;
            }
        }

        setDeletingAnnouncementId(id);

        try {
            await forumAnnouncementService.delete(id);
            await loadAnnouncements();

            if (dialogState.announcement?.id === id) {
                closeDialog();
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Unable to delete announcement");
        } finally {
            setDeletingAnnouncementId(null);
        }
    };

    return {
        announcements,
        isLoading,
        error,
        isDialogLoading,
        editingAnnouncementId,
        deletingAnnouncementId,
        dialogMode: dialogState.mode,
        isDialogOpen: dialogState.open,
        selectedAnnouncement: dialogState.announcement,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitAnnouncement,
        deleteAnnouncement,
        reloadAnnouncements: loadAnnouncements,
    };
}
