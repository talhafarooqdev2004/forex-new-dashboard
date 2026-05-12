"use client";

import { memo, useEffect, useRef } from "react";

import { attachTradingViewCopyrightStripper } from "@/lib/stripTradingViewWidgetCopyright";

const SCRIPT_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";

type TradingViewTechnicalAnalysisWidgetProps = {
    className?: string;
    /** TradingView symbol, e.g. `OANDA:GBPUSD` */
    symbol?: string;
    width?: number;
    height?: number;
};

function TradingViewTechnicalAnalysisWidget({
    className = "",
    symbol = "OANDA:GBPUSD",
    width = 425,
    height = 450,
}: TradingViewTechnicalAnalysisWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return undefined;

        el.innerHTML = "";

        const widgetWrap = document.createElement("div");
        widgetWrap.className = "tradingview-widget-container__widget";

        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme: "dark",
            displayMode: "single",
            isTransparent: true,
            locale: "en",
            interval: "5m",
            disableInterval: false,
            width,
            height,
            symbol,
            showIntervalTabs: true,
        });

        el.appendChild(widgetWrap);
        el.appendChild(script);

        let cancelled = false;
        const stripCopyright = attachTradingViewCopyrightStripper(el, () => cancelled);

        return () => {
            cancelled = true;
            stripCopyright();
            el.innerHTML = "";
        };
    }, [symbol, width, height]);

    return (
        <div
            ref={containerRef}
            className={`tradingview-widget-container w-full min-w-0 ${className}`.trim()}
        />
    );
}

export default memo(TradingViewTechnicalAnalysisWidget);
