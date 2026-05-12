const getBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5005";
    return envUrl.replace(/\/$/, "");
};

const API_BASE_URL = getBaseUrl();

export const apiConfig = {
    baseURL: API_BASE_URL,
    baseUrl: API_BASE_URL,
    endpoints: {
        dynamicTables: `${API_BASE_URL}/api/v1/admin/dynamic-tables`,
        tableStructure: `${API_BASE_URL}/api/v1/admin/table-structure`,
        tableEditor: `${API_BASE_URL}/api/v1/admin/table-editor`,
    },
};

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };

    if (options?.headers && typeof options.headers === "object" && !Array.isArray(options.headers) && !(options.headers instanceof Headers)) {
        Object.assign(headers, options.headers);
    }

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(endpoint, {
        ...options,
        credentials: options?.credentials ?? "include",
        headers,
    });

    if (!response.ok) {
        const errorText = await response.text();
        let message = `API request failed with status: ${response.status}`;

        try {
            const errorData = JSON.parse(errorText);
            message = errorData.message || message;
        } catch (_) {
            if (errorText) {
                message = errorText;
            }
        }

        throw new Error(message);
    }

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return {} as T;
}
