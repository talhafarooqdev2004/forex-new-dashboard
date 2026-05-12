import type { ForumRule, ForumRuleLocale, ForumRuleTranslation } from "@/types";
import type { ForumRuleFormValues } from "@/hooks/forms/forum/useForumRuleStoreForm";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

type ForumRuleStoreResponse = {
    id: number;
    translations: number[];
};

type ForumRuleApiTranslation = {
    id: number;
    locale: ForumRuleLocale;
    title: string;
    description: string;
    tags: string[] | null;
};

type ForumRuleApiDto = {
    id: number;
    active: boolean;
    translation: ForumRuleApiTranslation | null;
    translations: ForumRuleApiTranslation[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:5005";

class ForumRuleService {
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

        if (!response.ok || !payload.success) {
            throw new Error(payload.message || "Something went wrong");
        }

        return payload.data as T;
    }

    private normalizeTranslation = (translation: ForumRuleApiTranslation): ForumRuleTranslation => ({
        id: translation.id,
        locale: translation.locale,
        title: translation.title,
        description: translation.description,
        tags: translation.tags ?? [],
    });

    private normalizeRule = (rule: ForumRuleApiDto): ForumRule => ({
        id: rule.id,
        active: rule.active,
        translation: rule.translation ? this.normalizeTranslation(rule.translation) : null,
        translations: rule.translations.map((translation) => this.normalizeTranslation(translation)),
    });

    list = async (locale: ForumRuleLocale = "en"): Promise<ForumRule[]> => {
        const data = await this.request<ForumRuleApiDto[]>(`/api/v1/forum-rules?locale=${locale}`, {
            method: "GET",
        });

        return (data ?? []).map((rule) => this.normalizeRule(rule));
    };

    show = async (id: number | string, locale?: ForumRuleLocale): Promise<ForumRule> => {
        const query = locale ? `?locale=${locale}` : "";
        const data = await this.request<ForumRuleApiDto>(`/api/v1/forum-rules/${id}${query}`, {
            method: "GET",
        });

        return this.normalizeRule(data);
    };

    create = async (data: ForumRuleFormValues): Promise<ForumRuleStoreResponse> => {
        return this.request<ForumRuleStoreResponse>("/api/v1/forum-rules/create", {
            method: "POST",
            body: JSON.stringify(data),
        });
    };

    update = async (id: number | string, data: ForumRuleFormValues): Promise<ForumRule> => {
        const response = await this.request<ForumRuleApiDto>(`/api/v1/forum-rules/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });

        return this.normalizeRule(response);
    };

    delete = async (id: number | string): Promise<void> => {
        await this.request<void>(`/api/v1/forum-rules/${id}`, {
            method: "DELETE",
        });
    };
}

export const forumRuleService = new ForumRuleService();
