import { cn } from "@/lib/utils";
import { SvgIcon } from "../composed";
import styles from "./EducationSidebar.module.scss";

type EducationSidebarItemData = {
    id: number;
    title: string;
};

type EducationSidebarProps = {
    items?: EducationSidebarItemData[];
    activeEducationId?: number | null;
    onSelectEducation?: (id: number) => void;
    isLoading?: boolean;
};

export default function EducationSidebar({
    items = [],
    activeEducationId = null,
    onSelectEducation,
    isLoading = false,
}: EducationSidebarProps) {
    return (
        <div className="w-80 shrink-0 px-[20px] py-6">
            <div className="flex items-center gap-2 mb-8">
                <SvgIcon icon="education-center-icon" />
                <span className="-mt-0.5" style={{ color: 'rgb(var(--education-sidebar-text))' }}>Education Center</span>
            </div>

            <EducationSidebarItems>
                {isLoading ? <EducationSidebarTopicsSkeleton /> : null}
                {!isLoading && items.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-secondary">No topics available yet.</div>
                ) : null}
                {items.map((item) => (
                    <EducationSidebarItem
                        key={item.id}
                        active={activeEducationId === item.id}
                        onClick={() => onSelectEducation?.(item.id)}
                    >
                        {item.title}
                    </EducationSidebarItem>
                ))}
            </EducationSidebarItems>
        </div>
    );
}

function EducationSidebarTopicsSkeleton() {
    return (
        <div className="flex flex-col gap-2" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="flex h-[58px] w-full animate-pulse items-center justify-between rounded-xl bg-foreground/5 px-4"
                />
            ))}
        </div>
    );
}

function EducationSidebarItems({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-2">
            {children}
        </div>
    );
}

function EducationSidebarItem({
    children,
    active = false,
    onClick,
}: React.PropsWithChildren<{ active?: boolean; onClick?: () => void }>) {
    return (
        <button type="button" className={cn(styles.educationSidebarItem, active && styles.active)} onClick={onClick}>
            <div className="flex items-center gap-3">
                <SvgIcon icon="education-icon" />
                <span className={styles.educationSidebarItemText}>{children}</span>
            </div>
            <SvgIcon icon="chevron-right-icon" />
        </button>
    );
}
