import { useEffect, useState } from "react";

import { forumRuleService } from "@/services";
import type { ForumRule } from "@/types";
import type { ForumRuleFormValues } from "@/hooks/forms/forum/useForumRuleStoreForm";

type ForumRuleDialogState = {
    open: boolean;
    mode: "create" | "edit";
    rule: ForumRule | null;
};

const initialDialogState: ForumRuleDialogState = {
    open: false,
    mode: "create",
    rule: null,
};

export default function useForumRules() {
    const [rules, setRules] = useState<ForumRule[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogState, setDialogState] = useState<ForumRuleDialogState>(initialDialogState);
    const [isDialogLoading, setIsDialogLoading] = useState(false);
    const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);

    const loadRules = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const nextRules = await forumRuleService.list();
            setRules(nextRules);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load forum rules");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void loadRules();
    }, []);

    const openCreateDialog = () => {
        setDialogState({
            open: true,
            mode: "create",
            rule: null,
        });
    };

    const openEditDialog = async (id: number) => {
        setEditingRuleId(id);
        setIsDialogLoading(true);

        try {
            const rule = await forumRuleService.show(id);
            setDialogState({
                open: true,
                mode: "edit",
                rule,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load this forum rule");
        } finally {
            setIsDialogLoading(false);
            setEditingRuleId(null);
        }
    };

    const closeDialog = () => {
        setDialogState(initialDialogState);
    };

    const submitRule = async (data: ForumRuleFormValues) => {
        if (dialogState.mode === "edit" && dialogState.rule) {
            await forumRuleService.update(dialogState.rule.id, data);
        } else {
            await forumRuleService.create(data);
        }

        await loadRules();
    };

    const deleteRule = async (id: number) => {
        if (typeof window !== "undefined") {
            const shouldDelete = window.confirm("Delete this forum rule?");

            if (!shouldDelete) {
                return;
            }
        }

        setDeletingRuleId(id);

        try {
            await forumRuleService.delete(id);
            await loadRules();

            if (dialogState.rule?.id === id) {
                closeDialog();
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Unable to delete forum rule");
        } finally {
            setDeletingRuleId(null);
        }
    };

    return {
        rules,
        isLoading,
        error,
        isDialogLoading,
        editingRuleId,
        deletingRuleId,
        dialogMode: dialogState.mode,
        isDialogOpen: dialogState.open,
        selectedRule: dialogState.rule,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitRule,
        deleteRule,
        reloadRules: loadRules,
    };
}
