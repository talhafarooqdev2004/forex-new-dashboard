interface SidebarItem {
    icon: string;
    href: string;
    label: string;
}

export const sidebarItems: SidebarItem[] = [
    { icon: "technical-dashboard-icon", href: "/admin/dashboard", label: "Admin Dashboard" },
    { icon: "technical-dashboard-icon", href: "/dashboard", label: "User Dashboard" },
    { icon: "technical-dashboard-icon", href: "/technical-dashboard", label: "Technical Dashboard" },
    { icon: "fundamental-dashboard-icon", href: "/fundamental-dashboard", label: "Fundamental Dashboard" },
    { icon: "fx-analyzer-pro-icon", href: "/fx-analyzer-pro", label: "FX Analyzer Pro" },
    { icon: "score-dashboard-icon", href: "/score-dashboard", label: "Score Dashboard" },
    { icon: "edge-tools-alerts-icon", href: "/edge-tools-alerts", label: "Edge Tools & Alerts" },
    { icon: "edge-tools-alerts-icon", href: "/trading-analysis", label: "Trading Analysis" },
    { icon: "trading-terminal-icon", href: "/trading-terminal", label: "Trading Terminal" },
    { icon: "currency-fundamentals-icon", href: "/currency-fundamentals", label: "Currency Fundamentals" },
    { icon: "cot-data-analysis-icon", href: "/cot-data-analysis", label: "COT Data & Analysis" },
    { icon: "seasonal-trends-icon", href: "/seasonal-trends", label: "Seasonal Trends" },
    { icon: "retail-sentiment-icon", href: "/retail-sentiment", label: "Retail Sentiment" },
    { icon: "risk-mode-icon", href: "/risk-mode", label: "Risk Mode" },
    { icon: "calendar-news-icon", href: "/calendar-news", label: "Calendar & News" },
    { icon: "trading-journal-icon", href: "/trading-journal", label: "Trading Journal" },
    { icon: "education-svg-icon", href: "/education", label: "Education" },
    { icon: "forum-svg-icon", href: "/forum", label: "Forum" },
];

export const headerLabelsMap = Object.fromEntries(sidebarItems.map((item) => [item.href, item.label])) as Record<string, string>;