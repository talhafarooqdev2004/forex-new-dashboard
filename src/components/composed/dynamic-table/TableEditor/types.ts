import { CellMetadata, DynamicTable } from '@/services/dynamicTable.service';

export interface TableOption {
    identifier: string;
    name: string;
    displayName?: string;
}

export interface TableEditorProps {
    tableIdentifier: string;
    tableName: string;
    onSave?: () => void;
    onDelete?: () => void;
    showTableSelector?: boolean;
    availableTables?: TableOption[];
    onTableSelect?: (identifier: string) => void;
    showAdvancedControls?: boolean;
    showStructureControls?: boolean;
    defaultColumns?: Array<{ id: string; header: string; key?: string }>;
    initialRowCount?: number;
    showAddRowIcon?: boolean;
    isUserView?: boolean; // When true, hides advanced features and restricts functionality
    isReadOnly?: boolean; // When true, table is read-only (display mode)
    onEditToggle?: (isEditing: boolean) => void; // Callback when edit mode is toggled
    enableRoleBasedChecks?: boolean; // When true, apply role-based permission checks (e.g., for trading journal)
    enforceUserDataFiltering?: boolean; // When true, backend filters data to show only current user's rows (e.g., for trading journal)
    /** Fired when a large paste is in progress (for page-level loading UI). */
    onPasteProgress?: (isPasting: boolean) => void;
}

export interface CellData {
    value: string;
    formula?: string;
    metadata?: CellMetadata;
}

export interface TableRow {
    id: string;
    currencyPairId?: number;
    cells: CellData[];
}

export interface TableColumn {
    id: string;
    header: string;
    key?: string;
    /** Persisted as API `column_metadata` (e.g. `{ admin_only: true }`). */
    column_metadata?: Record<string, unknown>;
}

export interface AutoColorSettings {
    positiveColor: string;
    negativeColor: string;
    neutralColor: string;
    minValue: number | string;
    maxValue: number | string;
    neutralMode: 'range' | 'exact';
}

export type ActiveTab = 'background' | 'text' | 'alignment' | 'border';
export type Alignment = 'left' | 'center' | 'right';
export type BorderStyle = 'spacing' | 'simple';
