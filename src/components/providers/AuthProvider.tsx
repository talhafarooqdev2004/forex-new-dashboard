"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { apiConfig } from "@/services/api.config";
import { clearAuthCookie, readAuthTokenFromCookie, setAuthCookie } from "@/lib/authCookie";
import { clearVisitorPingSessionFlag, pingVisitorLocationAfterAuth, pingVisitorLocationFromBrowser } from "@/lib/visitorPing";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export type AuthUser = {
    id: number | string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
};

type AuthContextValue = {
    user: AuthUser | null;
    token: string | null;
    ready: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    adminLogin: (email: string, password: string) => Promise<void>;
    register: (input: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        gender?: string;
    }) => Promise<void>;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthPayload = { token: string; user: AuthUser };

/** Accepts `{ success, data: { token, user } }` and a few common alternate shapes. */
function extractAuthPayload(json: Record<string, unknown>): AuthPayload | null {
    const pickUser = (u: unknown): AuthUser | null => {
        if (!u || typeof u !== "object") return null;
        const o = u as Record<string, unknown>;
        const id = o.id;
        const email = o.email;
        const role = o.role;
        if ((typeof id === "number" || typeof id === "string") && typeof email === "string" && typeof role === "string") {
            return {
                id,
                email,
                role,
                firstName: typeof o.firstName === "string" ? o.firstName : undefined,
                lastName: typeof o.lastName === "string" ? o.lastName : undefined,
            };
        }
        return null;
    };

    const pickToken = (o: Record<string, unknown>): string | null => {
        const t = o.token ?? o.accessToken ?? o.access_token;
        return typeof t === "string" && t.trim() ? t : null;
    };

    const data = json.data;
    if (data && typeof data === "object") {
        const d = data as Record<string, unknown>;
        const token = pickToken(d);
        const user = pickUser(d.user);
        if (token && user) return { token, user };
    }

    const token = pickToken(json);
    const user = pickUser(json.user);
    if (token && user) return { token, user };

    return null;
}

function persistSession(payload: AuthPayload) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setAuthCookie(payload.token);
}

function readStoredSession(): AuthPayload | null {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (!token || !raw) return null;
    try {
        return { token, user: JSON.parse(raw) as AuthUser };
    } catch {
        return null;
    }
}

/** Clears stored token/cookie only (React state must be cleared separately). */
function clearPersistedCredentialsOnly(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthCookie();
}

async function postAuth(path: string, body: Record<string, unknown>): Promise<AuthPayload> {
    const res = await fetch(`${apiConfig.baseURL}/api/v1/auth${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
    });
    const text = await res.text();
    let json: { success?: boolean; message?: string; data?: AuthPayload } = {};
    if (text) {
        try {
            json = JSON.parse(text) as { success?: boolean; message?: string; data?: AuthPayload };
        } catch {
            throw new Error(res.statusText || "Authentication failed");
        }
    }
    const payload = extractAuthPayload(json as Record<string, unknown>);
    if (!res.ok || !json.success || !payload) {
        const msg =
            typeof json.message === "string" && json.message.trim()
                ? json.message
                : !res.ok
                  ? `Sign-in failed (${res.status})`
                  : res.ok && json.success && !payload
                    ? "Sign-in succeeded but the server response was missing a token or user profile. Check API URL and response format."
                    : "Authentication failed";
        throw new Error(msg);
    }
    return payload;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            const stored = readStoredSession();
            const token = stored?.token ?? readAuthTokenFromCookie();
            if (!token) {
                if (!cancelled) setReady(true);
                return;
            }

            try {
                const res = await fetch(`${apiConfig.baseURL}/api/v1/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    credentials: "include",
                });
                if (cancelled) return;

                if (res.status === 401 || res.status === 403) {
                    clearPersistedCredentialsOnly();
                    clearAuthCookie();
                    setUser(null);
                    setToken(null);
                    return;
                }

                const json = (await res.json().catch(() => ({}))) as { success?: boolean; data?: AuthUser };
                if (cancelled) return;

                if (!res.ok || !json.success || !json.data) {
                    clearPersistedCredentialsOnly();
                    clearAuthCookie();
                    setUser(null);
                    setToken(null);
                    return;
                }

                localStorage.setItem(USER_KEY, JSON.stringify(json.data));
                setUser(json.data);
                setToken(token);
                setAuthCookie(token);
            } catch {
                if (!cancelled) {
                    clearPersistedCredentialsOnly();
                    clearAuthCookie();
                    setUser(null);
                    setToken(null);
                }
            } finally {
                if (!cancelled) setReady(true);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (ready) void pingVisitorLocationFromBrowser();
    }, [ready]);

    const login = useCallback(async (email: string, password: string) => {
        const data = await postAuth("/login", { email, password });
        persistSession(data);
        setUser(data.user);
        setToken(data.token);
        void pingVisitorLocationAfterAuth();
    }, []);

    const adminLogin = useCallback(async (email: string, password: string) => {
        const data = await postAuth("/admin/login", { email, password });
        persistSession(data);
        setUser(data.user);
        setToken(data.token);
        void pingVisitorLocationAfterAuth();
    }, []);

    const register = useCallback(
        async (input: { email: string; password: string; firstName: string; lastName: string; gender?: string }) => {
            const data = await postAuth("/register", {
                email: input.email,
                password: input.password,
                firstName: input.firstName,
                lastName: input.lastName,
                gender: input.gender,
            });
            persistSession(data);
            setUser(data.user);
            setToken(data.token);
            void pingVisitorLocationAfterAuth();
        },
        [],
    );

    const logout = useCallback(() => {
        clearPersistedCredentialsOnly();
        clearVisitorPingSessionFlag();
        setUser(null);
        setToken(null);
    }, []);

    const refreshMe = useCallback(async () => {
        const t = localStorage.getItem(TOKEN_KEY);
        if (!t) return;
        try {
            const res = await fetch(`${apiConfig.baseURL}/api/v1/auth/me`, {
                headers: { Authorization: `Bearer ${t}` },
                credentials: "include",
            });
            // Only clear the session on auth failures. 404 can occur from transient DB issues or
            // mismatched ids; logging out here felt like "login works then nothing happens" for users.
            if (res.status === 401 || res.status === 403) {
                logout();
                return;
            }
            const json = (await res.json().catch(() => ({}))) as { success?: boolean; data?: AuthUser };
            if (res.ok && json.success && json.data) {
                localStorage.setItem(USER_KEY, JSON.stringify(json.data));
                setUser(json.data);
            }
        } catch {
            /* ignore: transient network errors should not sign the user out mid-session */
        }
    }, [logout]);

    useEffect(() => {
        if (ready && token) void refreshMe();
    }, [ready, token, refreshMe]);

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            ready,
            isAdmin: user?.role === "admin",
            login,
            adminLogin,
            register,
            logout,
        }),
        [user, token, ready, login, adminLogin, register, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
