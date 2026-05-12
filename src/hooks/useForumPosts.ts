import { useCallback, useEffect, useState } from "react";

import { forumPostService } from "@/services";
import type { ForumPost, ForumPostCategory } from "@/types";
import type { ForumPostFormValues } from "@/hooks/forms/forum/useForumPostStoreForm";

type ForumPostDialogState = {
    open: boolean;
    mode: "create" | "edit";
    post: ForumPost | null;
};

const initialDialogState: ForumPostDialogState = {
    open: false,
    mode: "create",
    post: null,
};

export default function useForumPosts(category: ForumPostCategory) {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogState, setDialogState] = useState<ForumPostDialogState>(initialDialogState);
    const [isDialogLoading, setIsDialogLoading] = useState(false);
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
    const [replyingPostId, setReplyingPostId] = useState<number | null>(null);
    const [viewingPostId, setViewingPostId] = useState<number | null>(null);

    const updateSinglePost = useCallback((nextPost: ForumPost) => {
        setPosts((currentPosts) => currentPosts.map((post) => (
            post.id === nextPost.id ? nextPost : post
        )));

        setDialogState((currentDialogState) => {
            if (currentDialogState.post?.id !== nextPost.id) {
                return currentDialogState;
            }

            return {
                ...currentDialogState,
                post: nextPost,
            };
        });
    }, []);

    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const nextPosts = await forumPostService.list(category);
            setPosts(nextPosts);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load forum posts");
        } finally {
            setIsLoading(false);
        }
    }, [category]);

    useEffect(() => {
        void loadPosts();
    }, [loadPosts]);

    const openCreateDialog = () => {
        setDialogState({
            open: true,
            mode: "create",
            post: null,
        });
    };

    const openEditDialog = async (id: number) => {
        setEditingPostId(id);
        setIsDialogLoading(true);

        try {
            const post = await forumPostService.show(id);
            setDialogState({
                open: true,
                mode: "edit",
                post,
            });
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Unable to load this post");
        } finally {
            setIsDialogLoading(false);
            setEditingPostId(null);
        }
    };

    const closeDialog = () => {
        setDialogState(initialDialogState);
    };

    const submitPost = async (data: ForumPostFormValues) => {
        if (dialogState.mode === "edit" && dialogState.post) {
            await forumPostService.update(dialogState.post.id, data);
        } else {
            await forumPostService.create(data);
        }

        await loadPosts();
    };

    const deletePost = async (id: number) => {
        if (typeof window !== "undefined") {
            const shouldDelete = window.confirm("Delete this post?");

            if (!shouldDelete) {
                return;
            }
        }

        setDeletingPostId(id);

        try {
            await forumPostService.delete(id);
            await loadPosts();

            if (dialogState.post?.id === id) {
                closeDialog();
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this post");
        } finally {
            setDeletingPostId(null);
        }
    };

    const addReply = async (id: number, message: string) => {
        setReplyingPostId(id);
        setError(null);

        try {
            const updatedPost = await forumPostService.addReply(id, message);
            updateSinglePost(updatedPost);
        } catch (replyError) {
            setError(replyError instanceof Error ? replyError.message : "Unable to add reply");
            throw replyError;
        } finally {
            setReplyingPostId(null);
        }
    };

    const incrementViews = async (id: number) => {
        setViewingPostId(id);

        try {
            const updatedPost = await forumPostService.incrementViews(id);
            updateSinglePost(updatedPost);
        } catch (viewError) {
            setError(viewError instanceof Error ? viewError.message : "Unable to update post views");
        } finally {
            setViewingPostId(null);
        }
    };

    return {
        posts,
        isLoading,
        error,
        isDialogLoading,
        editingPostId,
        deletingPostId,
        replyingPostId,
        viewingPostId,
        dialogMode: dialogState.mode,
        isDialogOpen: dialogState.open,
        selectedPost: dialogState.post,
        openCreateDialog,
        openEditDialog,
        closeDialog,
        submitPost,
        deletePost,
        addReply,
        incrementViews,
        reloadPosts: loadPosts,
    };
}
