interface SidebarItem {
    icon: string;
    href: string;
    label: string;
}

export const sidebarItems: SidebarItem[] = [
    { icon: "technical-dashboard.svg", href: "/admin/dashboard", label: "Admin Dashboard" },
    { icon: "technical-dashboard.svg", href: "/dashboard", label: "User Dashboard" },
    { icon: "technical-dashboard.svg", href: "/technical-dashboard", label: "Technical Dashboard" },
    { icon: "fundamental-dashboard.svg", href: "/fundamental-dashboard", label: "Fundamental Dashboard" },
    { icon: "fx-analyzer-pro.svg", href: "/fx-analyzer-pro", label: "FX Analyzer Pro" },
    { icon: "score-dashboard.svg", href: "/score-dashboard", label: "Score Dashboard" },
    { icon: "edge-tools-alerts.svg", href: "/edge-tools-alerts", label: "Edge Tools & Alerts" },
    { icon: "edge-tools-alerts.svg", href: "/trading-analysis", label: "Trading Analysis" },
    { icon: "trading-terminal.svg", href: "/trading-terminal", label: "Trading Terminal" },
    { icon: "currency-fundamentals.svg", href: "/currency-fundamentals", label: "Currency Fundamentals" },
    { icon: "cot-data-analysis.svg", href: "/cot-data-analysis", label: "COT Data & Analysis" },
    { icon: "seasonal-trends.svg", href: "/seasonal-trends", label: "Seasonal Trends" },
    { icon: "retail-sentiment.svg", href: "/retail-sentiment", label: "Retail Sentiment" },
    { icon: "risk-mode.svg", href: "/risk-mode", label: "Risk Mode" },
    { icon: "calendar-news.svg", href: "/calendar-news", label: "Calendar & News" },
    { icon: "trading-journal.svg", href: "/trading-journal", label: "Trading Journal" },
    { icon: "education.svg", href: "/education", label: "Education" },
    { icon: "education.svg", href: "/forum", label: "Forum" },
];

export const headerLabelsMap = Object.fromEntries(sidebarItems.map((item) => [item.href, item.label])) as Record<string, string>;