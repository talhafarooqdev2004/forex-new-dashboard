import { useCallback, useEffect, useState } from "react";

import useLocale from "@/hooks/useLocale";
import type { Education } from "@/types";
import type { EducationFormValues } from "@/hooks/forms/education/useEducationStoreForm";
import { educationService } from "@/services";

type EducationDialogState = {
    open: boolean;
    mode: "create" | "edit";
    education: Education | null;
};

const initialDialogState: EducationDialogState = {
    open: false,
    mode: "create",
    education: null,
};

export default function useEducations() {
    const { locales } = useLocale();
    const locale = locales[0]?.locale ?? "en";

    const [educations, setEducations] = useState<Education[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogState, setDialogState] = useState<EducationDialogState>(initialDialogState);
    const [isDialogLoading, setIsDialogLoading] = useState(false);
    const [editingEducationId, setEditingEducationId] = useState<number | null>(null);
    const [deletingEducationId, setDeletingEducationId] = useState<number | null>(null);
    const [publishingEducationId, setPublishingEducationId] = useState<number | null>(null);

    const loadEducations = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const nextEducations = await educationService.list(locale);
            setEducations(nextEducations);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load educations");
        } finally {
            setIsLoading(false);
        }
    }, [locale]);

    useEffect(() => {
        void loadEducations();
    }, [loadEducations]);

    const openCreateDialog = () => {
        setDialogState({
            open: true,
            mode: "create",
            education: null,
        });
    };

    const openEditDialog = async (id: number) => {
        setEditingEducationId(id);
        setIsDialogLoading(true);
        setError(null);

        try {
            const education = await educationService.show(id);
            setDialogState({
                open: true,
                mode: "edit",
                education,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load this education topic");
        } finally {
            setIsDialogLoading(false);
            setEditingEducationId(null);
        }
    };

    const closeDialog = () => {
        setDialogState(initialDialogState);
    };

    const submitEducation = async (data: EducationFormValues) => {
        if (dialogState.mode === "edit" && dialogState.education) {
            await educationService.update(dialogState.education.id, data);
        } else {
            await educationService.create(data);
        }

        await loadEducations();
    };

    const deleteEducation = async (id: number) => {
        if (typeof window !== "undefined") {
            const shouldDelete = window.confirm("Delete this education topic?");

            if (!shouldDelete) {
                return;
            }
        }

        setDeletingEducationId(id);
        setError(null);

        try {
            await educationService.delete(id);
            await loadEducations();

            if (dialogState.education?.id === id) {
                closeDialog();
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this education topic");
        } finally {
            setDeletingEducationId(null);
        }
    };

    const togglePublishEducation = async (education: Education) => {
        setPublishingEducationId(education.id);
        setError(null);

        try {
            if (education.publish) {
                await educationService.unpublish(education.id);
            } else {
                await educationService.publish(education.id);
            }

            await loadEducations();
        } catch (publishError) {
            setError(publishError instanceof Error ? publishError.message : "Unable to update publish status");
        } finally {
            setPublishingEducationId(null);
        }
    };

    return {
        educations,
        isLoading,
        error,
        isDialogLoading,
        editingEducationId,
        deletingEducationId,
        publishingEducationId,
        dialogMode: dialogState.mode,
        isDialogOpen: dialogState.open,
        selectedEducation: dialogState.education,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitEducation,
        deleteEducation,
        togglePublishEducation,
        reloadEducations: loadEducations,
    };
}
