import { SvgIcon } from "../composed";
import styles from "./EducationSidebar.module.scss";

const educationItems = [
    "Forex Introduction",
    "Forex Market Structure",
    "Forex Market Participants",
    "Trading Forex",
    "Forex Basic Terminology",
    "Forex Analysis",
    "Forex Technical Indicators",
    "Forex Chart Patterns",
    "Forex Candlestick Patterns",
];

export default function EducationSidebar() {
    return (
        <div className="w-80 shrink-0 px-[20px] py-6">
            <div className="flex items-center gap-2 mb-8">
                <SvgIcon icon="education-center-icon" />
                <span className="-mt-0.5" style={{ color: 'rgb(var(--education-sidebar-text))' }}>Education Center</span>
            </div>

            <EducationSidebarItems>
                {educationItems.map((item) => (
                    <EducationSidebarItem key={item}>{item}</EducationSidebarItem>
                ))}
            </EducationSidebarItems>
        </div>
    );
};

function EducationSidebarItems({ children }: React.PropsWithChildren) {
    return (
        <div className="flex flex-col gap-2">
            {children}
        </div>
    );
};

function EducationSidebarItem({ children }: React.PropsWithChildren) {
    return (
        <div className={styles.educationSidebarItem}>
            <div className="flex items-center gap-3">
                <SvgIcon icon="education-icon" />
                <span className={styles.educationSidebarItemText}>{children}</span>
            </div>
            <SvgIcon icon="chevron-right-icon" />
        </div>
    );
};