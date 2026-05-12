"use client";

import { memo, useEffect, useRef } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";

const SCRIPT_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-forex-heat-map.js";

type TradingViewForexHeatMapProps = {
    className?: string;
};

function TradingViewForexHeatMap({ className = "" }: TradingViewForexHeatMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const colorTheme = theme === "dark" ? "dark" : "light";

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        root.innerHTML = "";
        const widgetHost = document.createElement("div");
        widgetHost.className = "tradingview-widget-container__widget";
        root.appendChild(widgetHost);

        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme,
            isTransparent: false,
            locale: "en",
            currencies: ["EUR", "USD", "JPY", "GBP", "CHF", "AUD", "CAD", "NZD"],
            backgroundColor: colorTheme === "dark" ? "#0F0F0F" : "#ffffff",
            width: "100%",
            height: 520,
        });
        root.appendChild(script);

        return () => {
            root.innerHTML = "";
        };
    }, [colorTheme]);

    return (
        <div
            ref={containerRef}
            className={`tradingview-widget-container w-full min-h-[400px] ${className}`.trim()}
        />
    );
}

export default memo(TradingViewForexHeatMap);
