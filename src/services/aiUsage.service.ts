import { apiConfig, fetchAPI } from "@/services/api.config";
import type {
    AiProviderBreakdownRow,
    AiQueueHealth,
    AiRequestRow,
    AiUsageDailyRow,
    AiUsagePreset,
    AiUsageRange,
    AiUsageSummary,
    Paginated,
    ProcessingRunRow,
} from "@/types/aiUsage.types";

type ApiResponse<T> = { success?: boolean; message?: string; data?: T };

export type AiUsageFilters = {
    preset: AiUsagePreset;
    from?: string;
    to?: string;
};

function query(filters: AiUsageFilters, pagination?: { page: number; pageSize: number }): string {
    const params = new URLSearchParams();
    params.set("preset", filters.preset);
    if (filters.preset === "custom" && filters.from && filters.to) {
        params.set("from", filters.from);
        params.set("to", filters.to);
    }
    if (pagination) {
        params.set("page", String(pagination.page));
        params.set("pageSize", String(pagination.pageSize));
    }
    return params.toString();
}

async function get<T>(path: string): Promise<T> {
    const response = await fetchAPI<ApiResponse<T>>(`${apiConfig.endpoints.aiUsage}${path}`);
    if (!response?.success || response.data == null) {
        throw new Error(response?.message || "AI usage request failed");
    }
    return response.data;
}

export const aiUsageService = {
    getSummary: (filters: AiUsageFilters) => get<AiUsageSummary>(`/summary?${query(filters)}`),
    getDaily: (filters: AiUsageFilters) =>
        get<{ rows: AiUsageDailyRow[]; range: AiUsageRange }>(`/daily?${query(filters)}`),
    getProviders: (filters: AiUsageFilters) =>
        get<{ rows: AiProviderBreakdownRow[]; range: AiUsageRange }>(`/providers?${query(filters)}`),
    getQueue: () => get<AiQueueHealth>("/queue"),
    getRequests: (filters: AiUsageFilters, pagination: { page: number; pageSize: number }) =>
        get<Paginated<AiRequestRow>>(`/requests?${query(filters, pagination)}`),
    getProcessing: (filters: AiUsageFilters, pagination: { page: number; pageSize: number }) =>
        get<Paginated<ProcessingRunRow>>(`/processing?${query(filters, pagination)}`),
    retryJob: async (jobId: string) => {
        const response = await fetchAPI<ApiResponse<{ jobId: string; status: string; retryCount: number }>>(
            `${apiConfig.endpoints.aiUsage}/jobs/${encodeURIComponent(jobId)}/retry`,
            { method: "POST", body: JSON.stringify({ confirm: true }) },
        );
        if (!response?.success || !response.data) {
            throw new Error(response?.message || "Unable to retry AI job");
        }
        return response.data;
    },
};
