"use client";

import { memo, useEffect, useRef } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { attachTradingViewCopyrightStripper } from "@/lib/stripTradingViewWidgetCopyright";

const SCRIPT_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";

function buildWidgetConfig(isDark: boolean) {
    return {
        allow_symbol_change: true,
        calendar: false,
        details: false,
        hide_side_toolbar: true,
        hide_top_toolbar: false,
        hide_legend: false,
        hide_volume: false,
        hotlist: false,
        interval: "5",
        locale: "en",
        save_image: true,
        style: "1",
        symbol: "OANDA:GBPUSD",
        theme: isDark ? "dark" : "light",
        timezone: "Asia/Dubai",
        backgroundColor: isDark ? "#0F0F0F" : "#ffffff",
        gridColor: isDark ? "rgba(242, 242, 242, 0.06)" : "rgba(0, 0, 0, 0.08)",
        watchlist: [] as string[],
        withdateranges: false,
        compareSymbols: [] as string[],
        studies: [] as string[],
        autosize: true,
    };
}

type TradingViewAdvancedChartProps = {
    className?: string;
};

function TradingViewAdvancedChart({ className = "" }: TradingViewAdvancedChartProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return undefined;

        let cancelled = false;

        function mountWidget() {
            if (cancelled || !rootRef.current) return;
            const host = rootRef.current;
            host.innerHTML = "";

            const container = document.createElement("div");
            container.className = "tradingview-widget-container";
            container.style.height = "100%";
            container.style.width = "100%";

            const widgetHost = document.createElement("div");
            widgetHost.className = "tradingview-widget-container__widget";
            widgetHost.style.height = "100%";
            widgetHost.style.width = "100%";

            const script = document.createElement("script");
            script.src = SCRIPT_SRC;
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = JSON.stringify(buildWidgetConfig(isDark));

            container.appendChild(widgetHost);
            container.appendChild(script);
            host.appendChild(container);
        }

        let stripCopyright: (() => void) | undefined;

        // Defer past React’s effect flush so dev tooling / strict remount does not touch a half-built iframe.
        const mountFrame = requestAnimationFrame(() => {
            if (!cancelled) {
                mountWidget();
                stripCopyright = attachTradingViewCopyrightStripper(rootRef.current, () => cancelled);
            }
        });

        return () => {
            cancelled = true;
            stripCopyright?.();
            cancelAnimationFrame(mountFrame);
            const host = rootRef.current;
            if (host) host.innerHTML = "";
        };
    }, [isDark]);

    return (
        <div
            ref={rootRef}
            className={`w-full min-h-[520px] h-[min(70vh,720px)] ${className}`.trim()}
        />
    );
}

export default memo(TradingViewAdvancedChart);
