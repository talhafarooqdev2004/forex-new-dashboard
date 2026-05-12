"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Image from "next/image";
import { Loader2, MessageSquareText, MoreHorizontal, PencilLine, Plus, SendHorizontal, Trash2 } from "lucide-react";

import { ForumPostCreateDialog } from "@/components/features/dialogs";
import { Button, Input } from "@/components/ui";
import { useForumPosts } from "@/hooks";
import type { ForumPost, ForumPostCategory, ForumPostReply } from "@/types";

type ForumPostsSectionProps = {
    category: ForumPostCategory;
};

export default function ForumPostsSection({ category }: ForumPostsSectionProps) {
    const {
        posts,
        isLoading,
        error,
        isDialogLoading,
        editingPostId,
        deletingPostId,
        replyingPostId,
        viewingPostId,
        isDialogOpen,
        dialogMode,
        selectedPost,
        openCreateDialog,
        openEditDialog,
        deletePost,
        addReply,
        incrementViews,
        closeDialog,
        submitPost,
    } = useForumPosts(category);

    return (
        <>
            <section className="mt-8">
                <div className="mb-6 flex justify-end">
                    <Button
                        type="button"
                        variant="primary"
                        className="bg-royalBlue text-white hover:bg-royalBlue/90"
                        onClick={openCreateDialog}
                    >
                        <Plus className="h-4 w-4" />
                        Create post
                    </Button>
                </div>

                {error ? (
                    <div className="mb-4 rounded-[16px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                ) : null}

                {isLoading ? (
                    <LoadingState />
                ) : posts.length === 0 ? (
                    <EmptyState onCreate={openCreateDialog} />
                ) : (
                    <TopicLists>
                        {posts.map((post) => (
                            <PostRow
                                key={post.id}
                                post={post}
                                isDialogLoading={isDialogLoading}
                                isEditing={editingPostId === post.id}
                                isDeleting={deletingPostId === post.id}
                                isReplying={replyingPostId === post.id}
                                isViewing={viewingPostId === post.id}
                                onEdit={openEditDialog}
                                onDelete={deletePost}
                                onReply={addReply}
                                onView={incrementViews}
                            />
                        ))}
                    </TopicLists>
                )}
            </section>

            <ForumPostCreateDialog
                open={isDialogOpen}
                mode={dialogMode}
                post={selectedPost}
                defaultCategory={category}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
                onSubmitPost={submitPost}
            />
        </>
    );
}

function PostRow({
    post,
    isDialogLoading,
    isEditing,
    isDeleting,
    isReplying,
    isViewing,
    onEdit,
    onDelete,
    onReply,
    onView,
}: {
    post: ForumPost;
    isDialogLoading: boolean;
    isEditing: boolean;
    isDeleting: boolean;
    isReplying: boolean;
    isViewing: boolean;
    onEdit: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
    onReply: (id: number, message: string) => Promise<void>;
    onView: (id: number) => Promise<void>;
}) {
    const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);

    const toggleDiscussion = () => {
        const nextOpen = !isDiscussionOpen;
        setIsDiscussionOpen(nextOpen);

        if (nextOpen) {
            void onView(post.id);
        }
    };

    return (
        <TopicSection>
            <TopicTitle>
                {post.title}
            </TopicTitle>

            {post.imagePath ? (
                <PostImage src={post.imagePath} title={post.title} />
            ) : null}

            <TopicMetaList>
                <div className="flex items-center gap-3">
                    <TagsList>
                        {post.tags?.map((tag) => (
                            <Tag key={`${post.id}-${tag}`}>{tag}</Tag>
                        ))}
                    </TagsList>

                    <Author>{post.authorName ?? "Unknown"}</Author>
                    <CreatedAt>{formatRelativeTime(post.createdAt)}</CreatedAt>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3">
                        <RepliesButton
                            count={post.replyCount}
                            isOpen={isDiscussionOpen}
                            onClick={toggleDiscussion}
                        />
                        <Views>
                            {isViewing ? (
                                <span className="inline-flex items-center gap-2">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    {post.viewCount}
                                </span>
                            ) : post.viewCount}
                        </Views>
                    </div>

                    <div className="flex items-center gap-4">
                        <AuthorImg src="/images/temporary/forum-profile.jpg" />
                        <PostActionsMenu
                            post={post}
                            isDialogLoading={isDialogLoading}
                            isDeleting={isDeleting}
                            isEditing={isEditing}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                </div>
            </TopicMetaList>

            {isDiscussionOpen ? (
                <PostDiscussion
                    post={post}
                    isReplying={isReplying}
                    onReply={onReply}
                />
            ) : null}
        </TopicSection>
    );
}

function LoadingState() {
    return (
        <TopicLists>
            {Array.from({ length: 6 }).map((_, index) => (
                <TopicSection key={index}>
                    <div className="h-6 w-2/5 animate-pulse rounded bg-background/30" />
                    <div className="h-[420px] w-full animate-pulse rounded-[18px] bg-background/20" />
                    <div className="flex justify-between items-center gap-3">
                        <div className="h-8 w-1/3 animate-pulse rounded bg-background/30" />
                        <div className="h-10 w-40 animate-pulse rounded bg-background/30" />
                    </div>
                </TopicSection>
            ))}
        </TopicLists>
    );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="py-10 text-center">
            <p className="text-base font-medium text-foreground">
                No posts yet
            </p>
            <p className="mt-2 text-sm text-secondary">
                Create the first post for this forum tab.
            </p>
            <Button
                type="button"
                variant="primary"
                className="mt-5 bg-royalBlue text-white hover:bg-royalBlue/90"
                onClick={onCreate}
            >
                <Plus className="h-4 w-4" />
                Create post
            </Button>
        </div>
    );
}

function PostImage({ src, title }: { src: string; title: string }) {
    return (
        <div className="overflow-hidden rounded-[20px] border border-stroke bg-background/10">
            <img
                src={src}
                alt={title}
                className="h-[420px] w-full object-cover"
            />
        </div>
    );
}

function PostDiscussion({
    post,
    isReplying,
    onReply,
}: {
    post: ForumPost;
    isReplying: boolean;
    onReply: (id: number, message: string) => Promise<void>;
}) {
    const [message, setMessage] = useState("");

    const submitReply = async () => {
        const nextMessage = message.trim();

        if (!nextMessage) {
            return;
        }

        await onReply(post.id, nextMessage);
        setMessage("");
    };

    return (
        <div className="mt-2 rounded-[20px] border border-stroke bg-darkGrey/40 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MessageSquareText className="h-4 w-4" />
                Discussion
            </div>

            <div className="mt-4 space-y-3">
                {post.replies.length > 0 ? post.replies.map((reply) => (
                    <ReplyItem key={reply.id} reply={reply} />
                )) : (
                    <p className="text-sm text-secondary">
                        No replies yet. Start the discussion below.
                    </p>
                )}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Input
                    variant="dark-grey"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            void submitReply();
                        }
                    }}
                    placeholder="Write a reply..."
                    className="border-stroke bg-background/20 text-foreground placeholder:text-secondary/70"
                    disabled={isReplying}
                />
                <Button
                    type="button"
                    variant="primary"
                    className="bg-royalBlue text-white hover:bg-royalBlue/90"
                    onClick={() => void submitReply()}
                    disabled={isReplying}
                >
                    {isReplying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <SendHorizontal className="h-4 w-4" />
                    )}
                    Reply
                </Button>
            </div>
        </div>
    );
}

function ReplyItem({ reply }: { reply: ForumPostReply }) {
    return (
        <div className="rounded-[16px] border border-stroke bg-background/15 p-3">
            <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-foreground">
                    {reply.authorName}
                </span>
                <span className="text-xs text-secondary">
                    {formatRelativeTime(reply.createdAt)}
                </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-secondary">
                {reply.message}
            </p>
        </div>
    );
}

function TopicLists({ children }: React.PropsWithChildren) {
    return (
        <div>
            {children}
        </div>
    );
}

function TopicSection({ children }: React.PropsWithChildren) {
    return (
        <div className="border-b border-solid border-stroke py-6 flex flex-col gap-3">
            {children}
        </div>
    );
}

function TopicTitle({ children }: React.PropsWithChildren) {
    return (
        <h6>{children}</h6>
    );
}

function TopicMetaList({ children }: React.PropsWithChildren) {
    return (
        <div className="flex justify-between items-center gap-3">
            {children}
        </div>
    );
}

function TagsList({ children }: React.PropsWithChildren) {
    return (
        <div className="flex items-center gap-3">
            {children}
        </div>
    );
}

function Tag({ children }: React.PropsWithChildren) {
    return (
        <div className="bg-royalBlue rounded-[12px] px-3 py-2 h-8 text-white flex items-center justify-center">
            {children}
        </div>
    );
}

function Author({ children }: React.PropsWithChildren) {
    return (
        <span>{children}</span>
    );
}

function CreatedAt({ children }: React.PropsWithChildren) {
    return (
        <span>{children}</span>
    );
}

function RepliesButton({
    count,
    isOpen,
    onClick,
}: {
    count: number;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            className="block border-r border-solid border-stroke pr-4 text-left transition-colors hover:text-royalBlue"
            onClick={onClick}
        >
            <span className="font-semibold mr-1">{count}</span>
            <span>{isOpen ? "Hide Replies" : "Replies"}</span>
        </button>
    );
}

function Views({ children }: React.PropsWithChildren) {
    return (
        <span>
            <span className="font-semibold mr-1">{children}</span>
            <span>Views</span>
        </span>
    );
}

function AuthorImg({ src }: { src: string }) {
    return (
        <div className="w-10 h-10 relative overflow-hidden rounded-full">
            <Image
                src={src}
                alt="author"
                fill
                className="object-cover"
            />
        </div>
    );
}

function PostActionsMenu({
    post,
    isDialogLoading,
    isEditing,
    isDeleting,
    onEdit,
    onDelete,
}: {
    post: ForumPost;
    isDialogLoading: boolean;
    isEditing: boolean;
    isDeleting: boolean;
    onEdit: (id: number) => Promise<void>;
    onDelete: (id: number) => Promise<void>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                aria-label="Open post actions"
                className="flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background/10"
                onClick={() => setOpen((previous) => !previous)}
            >
                <MoreHorizontal className="h-5 w-5" />
            </button>

            {open ? (
                <>
                    <button
                        type="button"
                        aria-label="Close post actions"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 top-[calc(100%+10px)] z-20 min-w-[150px] rounded-[16px] border border-stroke bg-darkGrey p-2 shadow-[0_18px_40px_rgba(0,0,0,0.32)]">
                        <ActionMenuButton
                            disabled={isDialogLoading}
                            onClick={() => {
                                setOpen(false);
                                void onEdit(post.id);
                            }}
                        >
                            {isEditing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <PencilLine className="h-4 w-4" />
                            )}
                            Edit post
                        </ActionMenuButton>

                        <ActionMenuButton
                            destructive
                            disabled={isDeleting}
                            onClick={() => {
                                setOpen(false);
                                void onDelete(post.id);
                            }}
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                            Delete post
                        </ActionMenuButton>
                    </div>
                </>
            ) : null}
        </div>
    );
}

function ActionMenuButton({
    children,
    destructive = false,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    destructive?: boolean;
}) {
    return (
        <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-[12px] px-3 py-2 text-sm transition-colors ${destructive ? "text-red-300 hover:bg-red-500/10" : "text-foreground hover:bg-background/10"} disabled:cursor-not-allowed disabled:opacity-60`}
            {...props}
        >
            {children}
        </button>
    );
}

function formatRelativeTime(isoDate: string) {
    const date = new Date(isoDate);
    const diffMs = Date.now() - date.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMs / 60000));

    if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) {
        return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}
