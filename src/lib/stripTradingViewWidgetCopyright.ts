/** TradingView embed scripts often inject `.tradingview-widget-copyright` after load — strip it repeatedly until stable. */
export function attachTradingViewCopyrightStripper(root: HTMLElement | null, isCancelled: () => boolean): () => void {
    if (!root) return () => undefined;

    const run = () => {
        if (isCancelled()) return;
        root.querySelectorAll(".tradingview-widget-copyright").forEach((node) => node.remove());
    };

    run();
    const timeoutIds = [80, 400, 1200, 3500, 8000].map((ms) => window.setTimeout(run, ms) as unknown as number);
    const intervalId = window.setInterval(run, 700) as unknown as number;

    return () => {
        timeoutIds.forEach((id) => window.clearTimeout(id));
        window.clearInterval(intervalId);
    };
}
