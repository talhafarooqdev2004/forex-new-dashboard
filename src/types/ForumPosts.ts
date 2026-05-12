export const FORUM_POST_CATEGORIES = [
    "general-discussion",
    "technical-charts",
    "fundamental-discussion",
    "success-stories",
] as const;

export type ForumPostCategory = typeof FORUM_POST_CATEGORIES[number];

export type ForumPost = {
    id: number;
    active: boolean;
    category: ForumPostCategory;
    authorName: string;
    title: string;
    content: string;
    imagePath: string | null;
    viewCount: number;
    replyCount: number;
    replies: ForumPostReply[];
    tags: string[];
    createdAt: string;
    updatedAt: string;
};

export type ForumPostReply = {
    id: number;
    authorName: string;
    message: string;
    createdAt: string;
    updatedAt: string;
};

export type ForumPostsProps = {
    posts?: ForumPost[];
};
