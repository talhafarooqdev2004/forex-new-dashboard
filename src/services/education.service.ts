import type { Education, EducationLocale, EducationTranslation } from "@/types";
import type { EducationFormValues } from "@/hooks/forms/education/useEducationStoreForm";

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

type EducationApiTranslation = {
    id: number;
    locale: EducationLocale;
    title: string;
    content: string;
};

type EducationApiDto = {
    id: number;
    slug: string;
    publish: boolean;
    translation: EducationApiTranslation | null;
    translations: EducationApiTranslation[];
    created_at?: string;
    updated_at?: string;
    createdAt?: string;
    updatedAt?: string;
};

type EducationStoreResponse = {
    id: number;
    translations: number[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "http://localhost:5005";

class EducationService {
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

    private normalizeTranslation = (translation: EducationApiTranslation): EducationTranslation => ({
        id: translation.id,
        locale: translation.locale,
        title: translation.title,
        content: translation.content,
    });

    private normalizeEducation = (education: EducationApiDto): Education => ({
        id: education.id,
        slug: education.slug,
        publish: education.publish,
        translation: education.translation ? this.normalizeTranslation(education.translation) : null,
        translations: (education.translations ?? []).map((translation) => this.normalizeTranslation(translation)),
        createdAt: education.createdAt ?? education.created_at,
        updatedAt: education.updatedAt ?? education.updated_at,
    });

    list = async (locale: EducationLocale = "en"): Promise<Education[]> => {
        const data = await this.request<EducationApiDto[]>(`/api/v1/admin/educations?locale=${locale}`, {
            method: "GET",
        });

        return (data ?? []).map((education) => this.normalizeEducation(education));
    };

    show = async (id: number | string): Promise<Education> => {
        const data = await this.request<EducationApiDto>(`/api/v1/admin/educations/${id}`, {
            method: "GET",
        });

        return this.normalizeEducation(data);
    };

    create = async (data: EducationFormValues): Promise<EducationStoreResponse> => {
        return this.request<EducationStoreResponse>("/api/v1/admin/educations", {
            method: "POST",
            body: JSON.stringify(data),
        });
    };

    update = async (id: number | string, data: EducationFormValues): Promise<void> => {
        await this.request<void>(`/api/v1/admin/educations/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    };

    delete = async (id: number | string): Promise<void> => {
        await this.request<void>(`/api/v1/admin/educations/${id}`, {
            method: "DELETE",
        });
    };

    publish = async (id: number | string): Promise<Education> => {
        const data = await this.request<EducationApiDto>(`/api/v1/admin/educations/${id}/publish`, {
            method: "POST",
        });

        return this.normalizeEducation(data);
    };

    unpublish = async (id: number | string): Promise<Education> => {
        const data = await this.request<EducationApiDto>(`/api/v1/admin/educations/${id}/unpublish`, {
            method: "POST",
        });

        return this.normalizeEducation(data);
    };
}

export const educationService = new EducationService();
