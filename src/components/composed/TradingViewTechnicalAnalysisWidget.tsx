"use client";

import { Loader2 } from "lucide-react";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";
import { attachTradingViewCopyrightStripper } from "@/lib/stripTradingViewWidgetCopyright";

const SCRIPT_SRC = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
const LOAD_FALLBACK_MS = 12_000;
/** Backup when iframe `load` already fired before we could subscribe (cached embed). */
const IFRAME_READY_BACKUP_MS = 1_200;

type TradingViewTechnicalAnalysisWidgetProps = {
    className?: string;
    /** TradingView symbol, e.g. `OANDA:GBPUSD` */
    symbol?: string;
    width?: number;
    height?: number;
};

function waitForTradingViewEmbed(root: HTMLElement, onReady: () => void, isCancelled: () => boolean): () => void {
    let finished = false;
    let iframeBackupId: number | undefined;

    const markReady = () => {
        if (finished || isCancelled()) return;
        finished = true;
        if (iframeBackupId !== undefined) window.clearTimeout(iframeBackupId);
        onReady();
    };

    const tryAttachIframe = (iframe: HTMLIFrameElement) => {
        iframe.addEventListener("load", markReady, { once: true });
        iframeBackupId = window.setTimeout(markReady, IFRAME_READY_BACKUP_MS);
    };

    const observer = new MutationObserver(() => {
        const iframe = root.querySelector("iframe");
        if (iframe) {
            observer.disconnect();
            tryAttachIframe(iframe);
        }
    });

    observer.observe(root, { childList: true, subtree: true });

    const existing = root.querySelector("iframe");
    if (existing) {
        observer.disconnect();
        tryAttachIframe(existing);
    }

    const fallback = window.setTimeout(markReady, LOAD_FALLBACK_MS);

    return () => {
        observer.disconnect();
        window.clearTimeout(fallback);
        if (iframeBackupId !== undefined) window.clearTimeout(iframeBackupId);
    };
}

function TradingViewTechnicalAnalysisWidget({
    className = "",
    symbol = "OANDA:GBPUSD",
    width = 425,
    height = 450,
}: TradingViewTechnicalAnalysisWidgetProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const colorTheme = theme === "dark" ? "dark" : "light";
    const [isLoading, setIsLoading] = useState(true);
    const mountKey = `${colorTheme}-${symbol}-${width}-${height}`;

    useLayoutEffect(() => {
        setIsLoading(true);
    }, [mountKey]);

    useEffect(() => {
        const el = mountRef.current;
        if (!el) return undefined;

        setIsLoading(true);
        el.innerHTML = "";

        const widgetWrap = document.createElement("div");
        widgetWrap.className = "tradingview-widget-container__widget";

        const script = document.createElement("script");
        script.src = SCRIPT_SRC;
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            colorTheme,
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
        const stopWatching = waitForTradingViewEmbed(
            el,
            () => setIsLoading(false),
            () => cancelled,
        );

        return () => {
            cancelled = true;
            stopWatching();
            stripCopyright();
            el.innerHTML = "";
        };
    }, [mountKey, colorTheme, height, symbol, width]);

    return (
        <div
            className={`relative w-full min-w-0 flex justify-center ${className}`.trim()}
            style={{ minHeight: height }}
        >
            {isLoading ? (
                <div
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-lg"
                    role="status"
                    aria-live="polite"
                    aria-label="Loading technical analysis"
                >
                    <Loader2 className="h-8 w-8 animate-spin text-foreground/50" aria-hidden />
                </div>
            ) : null}
            <div
                ref={mountRef}
                className={`tradingview-widget-container w-full min-w-0 max-w-full shrink-0 transition-opacity duration-200 ${
                    isLoading ? "pointer-events-none opacity-0" : "opacity-100"
                }`}
                style={{ width, minHeight: height }}
                aria-busy={isLoading}
            />
        </div>
    );
}

export default memo(TradingViewTechnicalAnalysisWidget);
