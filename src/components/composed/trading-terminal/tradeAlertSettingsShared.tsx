"use client";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export const SETTINGS_GREEN = "#05df72";
export const SETTINGS_YELLOW = "#facc15";

export function SettingsSection({
    number,
    title,
    className,
    badge,
    headerAction,
    children,
}: {
    number: number;
    title: string;
    className?: string;
    badge?: React.ReactNode;
    headerAction?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <section className={cn("bg-darkGrey rounded-[12px] border border-stroke p-4 min-w-0", className)}>
            <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 min-w-0">
                    <span
                        className="inline-flex items-center justify-center w-6 h-6 rounded-[4px] text-[11px] font-bold text-black shrink-0"
                        style={{ backgroundColor: SETTINGS_YELLOW }}
                    >
                        {number}
                    </span>
                    <h3 className="font-['Inter',sans-serif] font-bold text-sm text-foreground truncate">{title}</h3>
                    {badge}
                </div>
                {headerAction}
            </div>
            {children}
        </section>
    );
}

export function FieldLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <span className={cn("block text-[11px] text-secondary mb-1 font-['Arimo',sans-serif]", className)}>
            {children}
        </span>
    );
}

export function SettingsRadio({
    name,
    value,
    checked,
    onChange,
    label,
}: {
    name: string;
    value: string;
    checked: boolean;
    onChange: (value: string) => void;
    label: string;
}) {
    return (
        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-foreground">
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                onChange={() => onChange(value)}
                className="accent-[#05df72] w-3.5 h-3.5"
            />
            {label}
        </label>
    );
}

export function SettingsCheckbox({
    checked,
    onChange,
    label,
    icon,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    icon?: React.ReactNode;
}) {
    return (
        <label className="inline-flex items-start gap-2 cursor-pointer text-xs text-foreground min-w-0">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="accent-[#05df72] w-3.5 h-3.5 shrink-0 mt-0.5"
            />
            {icon}
            <span className="break-words">{label}</span>
        </label>
    );
}

export function SettingsToggleRow({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-3 py-1">
            <span className="text-xs text-foreground">{label}</span>
            <Switch
                checked={checked}
                onCheckedChange={onChange}
                className="data-[state=checked]:bg-[#05df72]"
            />
        </div>
    );
}

export function SuffixInput({
    value,
    onChange,
    suffix,
    className,
}: {
    value: string;
    onChange: (value: string) => void;
    suffix: string;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center rounded-[8px] border border-input bg-inputBg overflow-hidden h-10", className)}>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 min-w-0 bg-transparent px-3 text-sm text-foreground outline-none"
            />
            <span className="px-3 text-xs text-secondary border-l border-stroke h-full flex items-center shrink-0">
                {suffix}
            </span>
        </div>
    );
}

export function InfoNote({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-3 text-[10px] leading-relaxed text-[#60a5fa] flex gap-1.5">
            <span className="shrink-0">ⓘ</span>
            <span>{children}</span>
        </p>
    );
}

export function StatusBox({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="mt-3 rounded-[8px] border px-3 py-2 text-[11px] leading-relaxed flex gap-2"
            style={{ borderColor: "rgba(5,223,114,0.4)", backgroundColor: "rgba(5,223,114,0.08)", color: SETTINGS_GREEN }}
        >
            <span className="shrink-0">🛡</span>
            <span>{children}</span>
        </div>
    );
}
