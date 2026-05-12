"use client";

import { useEffect, useRef } from "react";

import { useTheme } from "@/components/providers/ThemeProvider";

const SCRIPT_SRC = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";

const DEFAULT_SYMBOLS =
    "OANDA:USDCAD,OANDA:USDCHF,OANDA:USDJPY,GBPUSD,OANDA:GBPAUD,OANDA:GBPCHF,OANDA:GBPNZD,OANDA:GBPJPY,OANDA:GBPCAD,OANDA:EURUSD,OANDA:EURCAD,OANDA:EURJPY,OANDA:EURAUD,OANDA:EURNZD,OANDA:EURCHF,OANDA:EURGBP,OANDA:AUDCAD,OANDA:AUDCHF,OANDA:AUDNZD,OANDA:AUDUSD,OANDA:AUDJPY,OANDA:CADCHF,OANDA:CADJPY,OANDA:CHFJPY,OANDA:NZDUSD,OANDA:NZDJPY,OANDA:NZDCHF,OANDA:NZDCAD";

const HIDE_ATTRIBUTION_STYLE = `
.bottom-link,
[class*="bottom-link"],
[class*="BottomLink"],
.tradingview-widget-copyright,
[class*="widget-copyright"],
a[href*="tradingview.com/widget-docs"],
a[href*="tradingview.com/?solution"] {
  display: none !important;
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  visibility: hidden !important;
  pointer-events: none !important;
  opacity: 0 !important;
  font-size: 0 !important;
  line-height: 0 !important;
}
tv-attribution-boundary {
  display: none !important;
}
`.trim();

const TICKER_ATTRIBUTION_TEXT = /ticker\s+tape\s+by\s+tradingview/i;

/** Collect every element under root (light DOM + nested open shadow roots). */
function collectAllElements(root: Element): Element[] {
    const out: Element[] = [];
    const stack: Element[] = [root];
    while (stack.length) {
        const node = stack.pop()!;
        out.push(node);
        node.querySelectorAll("*").forEach((child) => stack.push(child));
        if (node.shadowRoot) {
            node.shadowRoot.querySelectorAll("*").forEach((child) => stack.push(child));
        }
    }
    return out;
}

function depthFromAncestor(el: Element, ancestor: Element): number {
    let d = 0;
    let n: Element | null = el;
    while (n && n !== ancestor) {
        const next: Element | null =
            n.parentElement ?? (n.parentNode instanceof ShadowRoot ? n.parentNode.host : null);
        if (!next) break;
        n = next;
        d += 1;
        if (d > 200) break;
    }
    return d;
}

/** Strip attribution DOM: class selectors + small subtrees that match “Ticker tape by TradingView”. */
function removeTickerAttributionNodes(root: Element): void {
    const stack: Element[] = [root];
    while (stack.length) {
        const node = stack.pop()!;
        const cls = node.getAttribute("class") ?? "";
        const tag = node.tagName.toLowerCase();

        if (/bottom-link/i.test(cls) || tag === "tv-attribution-boundary") {
            node.remove();
            continue;
        }

        node.querySelectorAll(".bottom-link, [class*='bottom-link'], tv-attribution-boundary").forEach((el) => el.remove());

        if (node.shadowRoot) {
            node.shadowRoot.querySelectorAll(".bottom-link, [class*='bottom-link'], tv-attribution-boundary").forEach((el) => el.remove());
            node.shadowRoot.querySelectorAll("*").forEach((child) => stack.push(child));
        }

        node.querySelectorAll("*").forEach((child) => stack.push(child));
    }

    const candidates = collectAllElements(root).filter((node) => {
        const text = node.textContent?.replace(/\s+/g, " ").trim() ?? "";
        return text.length > 0 && text.length < 120 && TICKER_ATTRIBUTION_TEXT.test(text);
    });
    candidates.sort((a, b) => depthFromAncestor(b, root) - depthFromAncestor(a, root));
    for (const el of candidates) {
        if (el.isConnected) el.remove();
    }
}

function ensureTickerTapeScript(): Promise<void> {
    if (typeof document === "undefined") return Promise.resolve();

    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "module";
        script.src = SCRIPT_SRC;
        script.async = true;
        script.dataset.tradingviewTickerTape = "1";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load TradingView ticker tape script"));
        document.head.appendChild(script);
    });
}

function injectHideAttributionIntoShadow(shadow: ShadowRoot): void {
    if (shadow.querySelector("style[data-tv-ticker-hide-attribution]")) return;
    const style = document.createElement("style");
    style.dataset.tvTickerHideAttribution = "";
    style.textContent = HIDE_ATTRIBUTION_STYLE;
    shadow.appendChild(style);
}

/** Inject CSS into shadow roots and strip attribution nodes / “Ticker tape by TradingView” row. */
function hideTradingViewAttributionUnder(el: Element): void {
    removeTickerAttributionNodes(el);
    const stack: Element[] = [el];
    while (stack.length) {
        const node = stack.pop()!;
        if (node.shadowRoot) {
            injectHideAttributionIntoShadow(node.shadowRoot);
            node.shadowRoot.querySelectorAll("*").forEach((child) => {
                if (child instanceof Element) stack.push(child);
            });
        }
    }
}

function scheduleHideAttribution(
    tape: HTMLElement,
    isCancelled: () => boolean,
): { timeoutIds: number[]; intervalId: number } {
    const run = () => {
        if (isCancelled()) return;
        hideTradingViewAttributionUnder(tape);
    };

    const delays = [0, 80, 250, 700, 2000, 4000, 8000, 15000];
    const timeoutIds = delays.map((ms) => window.setTimeout(run, ms) as unknown as number);

    const intervalId = window.setInterval(run, 600) as unknown as number;

    return { timeoutIds, intervalId };
}

type TradingViewTickerTapeProps = {
    symbols?: string;
    /**
     * `auto` (default): follow app light/dark from `ThemeProvider`.
     * `light` / `dark`: force TradingView widget theme.
     */
    theme?: "light" | "dark" | "auto";
    className?: string;
};

export default function TradingViewTickerTape({
    symbols = DEFAULT_SYMBOLS,
    theme = "auto",
    className = "",
}: TradingViewTickerTapeProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const { theme: appTheme } = useTheme();
    const tvTheme: "light" | "dark" = theme === "auto" ? appTheme : theme;

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;

        let cancelled = false;
        const isCancelled = () => cancelled;
        let attributionTimers: number[] = [];
        let purgeIntervalId: number | null = null;

        void (async () => {
            try {
                await ensureTickerTapeScript();
                if (cancelled) return;
                host.innerHTML = "";
                const tape = document.createElement("tv-ticker-tape");
                tape.setAttribute("symbols", symbols);
                tape.setAttribute("item-size", "compact");
                tape.setAttribute("theme", tvTheme);
                tape.setAttribute("no-link", "");
                tape.setAttribute("borderless", "");
                host.appendChild(tape);
                const scheduled = scheduleHideAttribution(tape, isCancelled);
                attributionTimers = scheduled.timeoutIds;
                purgeIntervalId = scheduled.intervalId;
            } catch (error) {
                console.error(error);
                if (!cancelled && host) {
                    host.innerHTML = "";
                    const fallback = document.createElement("p");
                    fallback.className = "px-3 py-2 text-xs text-[rgb(var(--secondary))]";
                    fallback.textContent = "Ticker tape could not be loaded.";
                    host.appendChild(fallback);
                }
            }
        })();

        return () => {
            cancelled = true;
            for (const id of attributionTimers) window.clearTimeout(id);
            if (purgeIntervalId !== null) window.clearInterval(purgeIntervalId);
            host.innerHTML = "";
        };
    }, [symbols, tvTheme]);

    return (
        <div
            className={`!h-auto min-h-10 basis-full w-full min-w-0 shrink overflow-hidden py-1 ${className}`.trim()}
        >
            {/* Crop ~1 row under compact tape if attribution sits in a closed subtree we cannot reach */}
            <div className="max-h-[44px] overflow-hidden [&_tv-ticker-tape]:block [&_tv-ticker-tape]:w-full">
                <div ref={hostRef} className="h-full w-full min-h-8" />
            </div>
        </div>
    );
}
