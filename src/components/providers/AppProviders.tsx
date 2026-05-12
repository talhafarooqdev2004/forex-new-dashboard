"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { MaintenanceModeGate } from "@/components/layout/MaintenanceModeGate";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export function AppProviders({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <MaintenanceModeGate>{children}</MaintenanceModeGate>
            </AuthProvider>
            <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
    );
}
