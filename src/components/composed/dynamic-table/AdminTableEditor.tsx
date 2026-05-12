'use client';

import dynamic from 'next/dynamic';

import { useAuth } from "@/components/providers/AuthProvider";

// Dynamically import TableEditor only when needed
const TableEditor = dynamic(() => import('./TableEditor'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Loading editor...</div>,
    ssr: false
});

interface AdminTableEditorProps {
    tableIdentifier: string;
    tableName: string;
    onSave: () => void;
    showTableSelector?: boolean;
    availableTables?: Array<{ identifier: string; name: string; displayName: string }>;
    onTableSelect?: (identifier: string) => void;
    enableRoleBasedChecks?: boolean; // When true, apply role-based permission checks
    enforceUserDataFiltering?: boolean; // When true, backend filters data to show only current user's rows
    onPasteProgress?: (isPasting: boolean) => void;
}

/**
 * AdminTableEditor - A wrapper component that conditionally loads TableEditor for admin users only
 * Uses dynamic imports to avoid loading editor code for non-admin users
 */
export default function AdminTableEditor(props: AdminTableEditorProps) {
    const { isAdmin, ready } = useAuth();
    if (!ready || !isAdmin) {
        return null;
    }
    return <TableEditor {...props} />;
}
