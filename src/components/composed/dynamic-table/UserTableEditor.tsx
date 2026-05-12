'use client';

import dynamic from 'next/dynamic';

import { useAuth } from "@/components/providers/AuthProvider";

// Dynamically import TableEditor only when needed
const TableEditor = dynamic(() => import('./TableEditor'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading editor...</div>,
    ssr: false
});

interface UserTableEditorProps {
    tableIdentifier: string;
    tableName: string;
    onSave?: () => void;
    onDelete?: () => void;
    showTableSelector?: boolean;
    availableTables?: Array<{ identifier: string; name: string; displayName: string }>;
    onTableSelect?: (identifier: string) => void;
    showAdvancedControls?: boolean;
    showStructureControls?: boolean;
    defaultColumns?: Array<{ id: string; header: string; key?: string }>;
    initialRowCount?: number;
    showAddRowIcon?: boolean;
    enableRoleBasedChecks?: boolean; // When true, apply role-based permission checks
    enforceUserDataFiltering?: boolean; // When true, backend filters data to show only current user's rows
}

/**
 * UserTableEditor - A wrapper component that allows both users and admins to edit tables
 * Uses dynamic imports for better performance
 */
export default function UserTableEditor(props: UserTableEditorProps) {
    const { isAdmin, ready } = useAuth();
    if (!ready || !isAdmin) {
        return null;
    }
    return <TableEditor {...props} />;
}
