"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";

import AdminTableEditor from "@/components/composed/dynamic-table/AdminTableEditor";
import DynamicTableDisplay from "@/components/composed/dynamic-table/DynamicTableDisplay";
import { useAuth } from "@/components/providers/AuthProvider";
import Container from "@/components/ui/layout/Container";
import { GAUGE_SIGNAL_COLORS } from "@/lib/gaugeSignalColors";
import { apiConfig } from "@/services/api.config";
import { dynamicTableService, DynamicTable } from "@/services/dynamicTable.service";
import { useDashboardBackendPoll } from "@/hooks/useDashboardBackendPoll";

const TABLE_IDENTIFIER = "score_dashboard_sheet76";
const TABLE_NAME = "Score Dashboard (Sheet76)";

export default function ScoreDashboardClientPage({ initialTable }: { initialTable: DynamicTable | null }) {
    const { isAdmin } = useAuth();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [tableExists, setTableExists] = useState<boolean | null>(Boolean(initialTable));
    const [showEditor, setShowEditor] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [table, setTable] = useState<DynamicTable | null>(initialTable);
    const loadTable = useCallback(async () => {
        try {
            const response = await dynamicTableService.getTableByIdentifier(TABLE_IDENTIFIER);
            const nextTable = response?.data ?? null;

            setTable(nextTable);
            setTableExists(Boolean(nextTable));
        } catch (error) {
            console.error("Failed to load score dashboard table:", error);
            setTable(null);
            setTableExists(false);
        }
    }, []);

    useEffect(() => {
        void loadTable();
    }, [loadTable, refreshTrigger]);

    useDashboardBackendPoll(loadTable);

    useEffect(() => {
        const socket = io(apiConfig.baseURL, {
            transports: ["websocket", "polling"],
            withCredentials: true,
        });

        const handleSnapshot = (payload: { data?: { table?: DynamicTable }; table?: DynamicTable }) => {
            const nextTable = payload?.data?.table ?? payload?.table ?? null;
            if (nextTable?.identifier === TABLE_IDENTIFIER) {
                setTable(nextTable);
                setTableExists(true);
            }
        };

        socket.on("scoreDashboardSnapshot", handleSnapshot);

        return () => {
            socket.off("scoreDashboardSnapshot", handleSnapshot);
            socket.disconnect();
        };
    }, []);

    const handleTableSave = async () => {
        setRefreshTrigger((current) => current + 1);
        await loadTable();
        setShowEditor(false);
    };

    const handleDeleteTable = async () => {
        if (typeof window !== "undefined") {
            const shouldDelete = window.confirm("Are you sure you want to delete this table? This action cannot be undone.");
            if (!shouldDelete) {
                return;
            }
        }

        try {
            setIsDeleting(true);
            const response = await dynamicTableService.getTableByIdentifier(TABLE_IDENTIFIER);
            if (response?.data?.id) {
                await dynamicTableService.deleteTable(response.data.id);
                setTable(null);
                setTableExists(false);
                setShowEditor(false);
                setRefreshTrigger((current) => current + 1);
                await loadTable();
            }
        } catch (error) {
            console.error("Failed to delete score dashboard table:", error);
            if (typeof window !== "undefined") {
                window.alert("Failed to delete table. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Container>
            <main className="space-y-6">
                {isAdmin ? (
                    <section className="flex flex-col gap-4 rounded-xl bg-darkGrey p-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <p className="text-sm uppercase tracking-[0.18em] text-[rgb(var(--secondary))]">Score dashboard</p>
                            <p className="mt-1 text-xs text-[rgb(var(--secondary))]">
                                Data syncs from Google Sheet &quot;Sheet76&quot; (A2:J30) about every minute.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setShowEditor((current) => !current)}
                                disabled={tableExists === null}
                                className="rounded-lg bg-[rgb(var(--electric-blue))] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {showEditor ? "Hide editor" : "Edit table"}
                            </button>
                            <button
                                onClick={handleDeleteTable}
                                disabled={!tableExists || isDeleting}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                                style={{ backgroundColor: GAUGE_SIGNAL_COLORS.sell }}
                            >
                                {isDeleting ? "Deleting..." : "Delete table"}
                            </button>
                        </div>
                    </section>
                ) : null}

                {isAdmin && showEditor ? (
                    <section>
                        <AdminTableEditor
                            tableIdentifier={TABLE_IDENTIFIER}
                            tableName={TABLE_NAME}
                            onSave={handleTableSave}
                        />
                    </section>
                ) : null}

                <section className="overflow-hidden rounded-xl bg-darkGrey">
                    <DynamicTableDisplay
                        tableIdentifier={TABLE_IDENTIFIER}
                        refreshTrigger={refreshTrigger}
                        initialTable={table}
                    />
                </section>
            </main>
        </Container>
    );
}
