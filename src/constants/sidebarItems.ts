interface SidebarItem {
    icon: string;
    href: string;
    label: string;
    /** When true, only shown to users with the admin role */
    adminOnly?: boolean;
    /** When false, row is visible but not clickable; hover shows `comingSoonHint` */
    navigable?: boolean;
    /** Tooltip when `navigable` is false (default: Coming soon) */
    comingSoonHint?: string;
}

/** Main nav first; admin-only entries are appended so they appear at the bottom (Admin Settings last). */
export const sidebarItems: SidebarItem[] = [
    { icon: "technical-dashboard-icon", href: "/technical-dashboard", label: "Technical Dashboard", navigable: true },
    { icon: "fundamental-dashboard-icon", href: "/fundamental-dashboard", label: "Fundamental Dashboard", navigable: true },
    { icon: "fx-analyzer-pro-icon", href: "/fx-analyzer-pro", label: "FX Analyzer Pro", navigable: true },
    { icon: "score-dashboard-icon", href: "/score-dashboard", label: "Score Dashboard", navigable: true },
    { icon: "edge-tools-alerts-icon", href: "/edge-tools", label: "Edge Tools", navigable: true },
    { icon: "currency-fundamentals-icon", href: "/currency-fundamentals", label: "Currency Fundamentals", navigable: true },
    { icon: "cot-data-analysis-icon", href: "/cot-data-analysis", label: "COT Data & Analysis", navigable: true },
    { icon: "seasonal-trends-icon", href: "/seasonal-trends", label: "Seasonal Trends", navigable: true },
    { icon: "retail-sentiment-icon", href: "/retail-sentiment", label: "Retail Sentiment", navigable: true },
    { icon: "calendar-news-icon", href: "/calendar-news", label: "Calendar & News", navigable: true },
    { icon: "education-svg-icon", href: "/education", label: "Education", navigable: true },
    { icon: "edge-tools-alerts-icon", href: "/trading-analysis", label: "Trading Analysis", navigable: false },
    { icon: "trading-terminal-icon", href: "/trading-terminal", label: "Trading Terminal & Alerts", navigable: false },
    // { icon: "risk-mode-icon", href: "/risk-mode", label: "Risk Mode", navigable: false },
    { icon: "trading-journal-icon", href: "/trading-journal", label: "Trading Journal", navigable: false },
    { icon: "forum-svg-icon", href: "/forum", label: "Forum", navigable: false },

    { icon: "technical-dashboard-icon", href: "/admin/dashboard", label: "Admin Dashboard", adminOnly: true, navigable: true },
    { icon: "technical-dashboard-icon", href: "/admin/visitor-analytics", label: "Visitor Analytics", adminOnly: true, navigable: true },
    { icon: "user", href: "/admin/settings", label: "Admin Settings", adminOnly: true, navigable: true },
];
