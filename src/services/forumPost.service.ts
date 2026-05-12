import type { ForumPost, ForumPostCategory, ForumPostReply } from "@/types";
import type { ForumPostFormValues } from "@/hooks/forms/forum/useForumPostStoreForm";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

type ForumPostStoreResponse = {
    id: number;
};

type ForumPostReplyApiDto = {
    id: number;
    authorName: string;
    message: string;
    createdAt: string;
    updatedAt: string;
};

type ForumPostApiDto = {
    id: number;
    active: boolean;
    category: ForumPostCategory;
    authorName: string;
    title: string;
    content: string;
    imagePath: string | null;
    viewCount: number;
    replyCount: number;
    replies: ForumPostReplyApiDto[];
    tags: string[] | null;
    createdAt: string;
    updatedAt: string;
};

type UploadImageResponse = {
    imagePath: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:5005";

class ForumPostService {
    private async request<T>(path: string, init?: RequestInit): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${path}`, {
            ...init,
            headers: {
                "Content-Type": "application/json",
                ...(init?.headers ?? {}),
            },
        });

        if (response.status === 204) {
            return undefined as T;
        }

        const payload = (await response.json()) as ApiResponse<T>;

        if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || "Something went wrong");
        }

        return payload.data as T;
    }

    private resolveAssetUrl = (path: string | null): string | null => {
        if (!path) {
            return null;
        }

        if (/^https?:\/\//i.test(path)) {
            return path;
        }

        return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    };

    private normalizeReply = (reply: ForumPostReplyApiDto): ForumPostReply => ({
        id: reply.id,
        authorName: reply.authorName,
        message: reply.message,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
    });

    private normalizePost = (post: ForumPostApiDto): ForumPost => ({
        id: post.id,
        active: post.active,
        category: post.category,
        authorName: post.authorName,
        title: post.title,
        content: post.content,
        imagePath: this.resolveAssetUrl(post.imagePath),
        viewCount: post.viewCount,
        replyCount: post.replyCount,
        replies: (post.replies ?? []).map((reply) => this.normalizeReply(reply)),
        tags: post.tags ?? [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
    });

    list = async (category?: ForumPostCategory): Promise<ForumPost[]> => {
        const query = category ? `?category=${category}` : "";
        const data = await this.request<ForumPostApiDto[]>(`/api/v1/forum-posts${query}`, {
            method: "GET",
        });

        return (data ?? []).map((post) => this.normalizePost(post));
    };

    show = async (id: number | string): Promise<ForumPost> => {
        const data = await this.request<ForumPostApiDto>(`/api/v1/forum-posts/${id}`, {
            method: "GET",
        });

        return this.normalizePost(data);
    };

    create = async (data: ForumPostFormValues): Promise<ForumPostStoreResponse> => {
        return this.request<ForumPostStoreResponse>("/api/v1/forum-posts/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    };

    update = async (id: number | string, data: ForumPostFormValues): Promise<ForumPost> => {
        const response = await this.request<ForumPostApiDto>(`/api/v1/forum-posts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        return this.normalizePost(response);
    };

    uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch(`${API_BASE_URL}/api/v1/forum-posts/upload-image`, {
            method: "POST",
            body: formData,
        });

        const payload = (await response.json()) as ApiResponse<UploadImageResponse>;

        if (!response.ok || !payload?.success || !payload.data?.imagePath) {
            throw new Error(payload?.message || "Unable to upload image");
        }

        return this.resolveAssetUrl(payload.data.imagePath) ?? payload.data.imagePath;
    };

    addReply = async (id: number | string, message: string): Promise<ForumPost> => {
        const response = await this.request<ForumPostApiDto>(`/api/v1/forum-posts/${id}/replies`, {
            method: "POST",
            body: JSON.stringify({ message }),
        });

        return this.normalizePost(response);
    };

    incrementViews = async (id: number | string): Promise<ForumPost> => {
        const response = await this.request<ForumPostApiDto>(`/api/v1/forum-posts/${id}/views`, {
            method: "POST",
        });

        return this.normalizePost(response);
    };

    delete = async (id: number | string): Promise<void> => {
        await this.request<void>(`/api/v1/forum-posts/${id}`, {
            method: "DELETE",
        });
    };
}

export const forumPostService = new ForumPostService();
