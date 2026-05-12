import type { ForumAnnouncement, ForumAnnouncementLocale, ForumAnnouncementTranslation } from "@/types";
import type { ForumAnnouncementFormValues } from "@/hooks/forms/forum/useForumAnnouncementStoreForm";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

type ForumAnnouncementApiTranslation = {
    id: number;
    locale: ForumAnnouncementLocale;
    title: string;
    description: string;
    tags: string[] | null;
};

type ForumAnnouncementApiDto = {
    id: number;
    active: boolean;
    translation: ForumAnnouncementApiTranslation | null;
    translations: ForumAnnouncementApiTranslation[];
    createdAt: string;
    updatedAt: string;
};

type ForumAnnouncementStoreResponse = {
    id: number;
    translations: number[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:5005";

class ForumAnnouncementService {
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

    private normalizeTranslation = (translation: ForumAnnouncementApiTranslation): ForumAnnouncementTranslation => ({
        id: translation.id,
        locale: translation.locale,
        title: translation.title,
        description: translation.description,
        tags: translation.tags ?? [],
    });

    private normalizeAnnouncement = (announcement: ForumAnnouncementApiDto): ForumAnnouncement => ({
        id: announcement.id,
        active: announcement.active,
        translation: announcement.translation ? this.normalizeTranslation(announcement.translation) : null,
        translations: announcement.translations.map((translation) => this.normalizeTranslation(translation)),
        createdAt: announcement.createdAt,
        updatedAt: announcement.updatedAt,
    });

    list = async (locale: ForumAnnouncementLocale = "en"): Promise<ForumAnnouncement[]> => {
        const data = await this.request<ForumAnnouncementApiDto[]>(`/api/v1/forum-announcements?locale=${locale}`, {
            method: "GET",
        });

        return (data ?? []).map((announcement) => this.normalizeAnnouncement(announcement));
    };

    show = async (id: number | string, locale?: ForumAnnouncementLocale): Promise<ForumAnnouncement> => {
        const query = locale ? `?locale=${locale}` : "";
        const data = await this.request<ForumAnnouncementApiDto>(`/api/v1/forum-announcements/${id}${query}`, {
            method: "GET",
        });

        return this.normalizeAnnouncement(data);
    };

    create = async (data: ForumAnnouncementFormValues): Promise<ForumAnnouncementStoreResponse> => {
        return this.request<ForumAnnouncementStoreResponse>("/api/v1/forum-announcements/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    };

    update = async (id: number | string, data: ForumAnnouncementFormValues): Promise<ForumAnnouncement> => {
        const response = await this.request<ForumAnnouncementApiDto>(`/api/v1/forum-announcements/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        return this.normalizeAnnouncement(response);
    };

    delete = async (id: number | string): Promise<void> => {
        await this.request<void>(`/api/v1/forum-announcements/${id}`, {
            method: "DELETE",
        });
    };
}

export const forumAnnouncementService = new ForumAnnouncementService();
