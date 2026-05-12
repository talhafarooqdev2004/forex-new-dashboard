import type { DynamicTable } from "@/services/dynamicTable.service";

export type TechnicalDashboardInitialWidgetTables = {
    scoreHeatmap: DynamicTable | null;
    currencyStrength: DynamicTable | null;
    tmv: DynamicTable | null;
};
