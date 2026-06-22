import { apiConfig, fetchAPI } from "./api.config";

const URL = `${apiConfig.baseUrl}/api/v1/admin/trading-alerts`;

export type TradingAlert = {
    id: number;
    trade_id: string | null;
    pair: string | null;
    direction: "buy" | "sell" | null;
    direction_type: string | null;
    type: string | null;
    session: string | null;
    entry_level: number | null;
    current_price?: number | null;
    stop_loss: number | null;
    tp1: number | null;
    tp2: number | null;
    tp3: number | null;
    risk: string | null;
    exit_price: number | null;
    outcome: string | null;
    pips: number | null;
    close_reason: string | null;
    tsl_enabled: boolean;
    breakeven_enabled: boolean;
    breakeven_done: boolean;
    activated: boolean;
    activation_side: string | null;
    max_tp_hit: number;
    accumulated_pips?: number;
    manual_partial_closed?: boolean;
    last_alert_event: string | null;
    status: "open" | "completed" | "stopped";
    comment: string | null;
    date: string | null;
    created_at: string;
    updated_at: string;
};

export type TradePartialClose = {
    id: number;
    trading_alert_id: number;
    tp_level: number;
    pips: number;
    exit_price: number | null;
    outcome: string | null;
    close_reason: string | null;
    created_at: string;
    trading_alert?: TradingAlert;
};

export type TradingAlertPayload = Partial<Omit<TradingAlert, "id" | "created_at" | "updated_at">>;

type ApiResponse<T> = {
    success: boolean;
    message: string;
    data?: T;
};

class TradingAlertService {
    list = async (): Promise<TradingAlert[]> => {
        const res = await fetchAPI<ApiResponse<TradingAlert[]>>(URL, { method: "GET" });
        return res?.data ?? [];
    };

    create = async (payload: TradingAlertPayload): Promise<TradingAlert | null> => {
        const res = await fetchAPI<ApiResponse<TradingAlert>>(URL, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        return res?.data ?? null;
    };

    update = async (id: number | string, patch: TradingAlertPayload): Promise<void> => {
        await fetchAPI<ApiResponse<TradingAlert>>(`${URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(patch),
        });
    };

    remove = async (id: number | string): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(`${URL}/${id}`, { method: "DELETE" });
    };

    /** Asks the backend to deliver a status-event alert (deduped server-side). */
    notify = async (id: number | string, event: string): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(`${URL}/${id}/notify`, {
            method: "POST",
            body: JSON.stringify({ event }),
        });
    };

    partialClose = async (id: number | string, level: 1 | 2 | 3): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(`${URL}/${id}/partial-close`, {
            method: "POST",
            body: JSON.stringify({ level }),
        });
    };

    fullClose = async (id: number | string): Promise<void> => {
        await fetchAPI<ApiResponse<unknown>>(`${URL}/${id}/full-close`, {
            method: "POST",
        });
    };

    listPartials = async (): Promise<TradePartialClose[]> => {
        const res = await fetchAPI<ApiResponse<TradePartialClose[]>>(`${URL}/partial-closes`, { method: "GET" });
        return res?.data ?? [];
    };
}

export const tradingAlertService = new TradingAlertService();
