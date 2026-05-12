"use client";

import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type RefObject,
} from "react";

import { apiConfig } from "@/services/api.config";
import styles from "./CalendarNewsClientPage.module.scss";

type InvestingNewsItem = {
    title: string;
    link: string;
    pubDate: string;
    source: "Investing.com";
};

const PAGE_SIZE = 10;
const INVESTING_CALENDAR_SRC =
    "https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&features=datepicker,timezone&countries=25,32,6,37,72,22,17,39,14,10,35,43,56,36,110,11,26,12,4,5&calType=week&timeZone=8&lang=1";

/** Investing embed: iframe loads this URL directly (browser). Server-side HTML proxy is not viable — Investing returns 403. */
const CALENDAR_IFRAME_HEIGHT_PX = 620;
/** Wider than narrow 50% columns so the calendar can scroll horizontally instead of clipping. */
const CALENDAR_IFRAME_MIN_WIDTH_PX = 980;

/**
 * Syncs iframe `width` / `height` to at least the scroll container width (column),
 * but not below {@link CALENDAR_IFRAME_MIN_WIDTH_PX} so wide calendar layouts stay usable with horizontal scroll.
 */
function EconomicCalendarIframe({ src, measureRef }: { src: string; measureRef: RefObject<HTMLElement | null> }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const syncIframeBox = useCallback(() => {
        const measureEl = measureRef.current;
        const iframe = iframeRef.current;
        if (!measureEl || !iframe) return;
        const columnW = Math.max(1, Math.floor(measureEl.getBoundingClientRect().width));
        const iframeW = Math.max(columnW, CALENDAR_IFRAME_MIN_WIDTH_PX);
        iframe.setAttribute("width", String(iframeW));
        iframe.setAttribute("height", String(CALENDAR_IFRAME_HEIGHT_PX));
        iframe.style.width = `${iframeW}px`;
        iframe.style.maxWidth = "none";
        iframe.style.minWidth = `${iframeW}px`;
    }, [measureRef]);

    useLayoutEffect(() => {
        const iframe = iframeRef.current;
        if (iframe) {
            /** React 19 omits non-camelCase legacy attrs from JSX; set here to avoid console noise. */
            iframe.setAttribute("allowtransparency", "true");
            iframe.setAttribute("frameborder", "0");
            iframe.setAttribute("marginwidth", "0");
            iframe.setAttribute("marginheight", "0");
        }

        const measureEl = measureRef.current;
        const run = () => syncIframeBox();
        run();
        let raf2 = 0;
        const raf1 = window.requestAnimationFrame(() => {
            raf2 = window.requestAnimationFrame(run);
        });
        const t1 = window.setTimeout(run, 120);
        const t2 = window.setTimeout(run, 450);
        if (!measureEl || typeof ResizeObserver === "undefined") {
            return () => {
                window.cancelAnimationFrame(raf1);
                window.cancelAnimationFrame(raf2);
                window.clearTimeout(t1);
                window.clearTimeout(t2);
            };
        }
        const ro = new ResizeObserver(run);
        ro.observe(measureEl);
        return () => {
            window.cancelAnimationFrame(raf1);
            window.cancelAnimationFrame(raf2);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            ro.disconnect();
        };
    }, [syncIframeBox, measureRef]);

    return (
        <div ref={wrapRef} className={styles.widgetWrapper}>
            <iframe
                ref={iframeRef}
                src={src}
                title="Economic calendar"
                className={styles.calendarIframe}
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={syncIframeBox}
            />
        </div>
    );
}

export default function CalendarNewsClientPage() {
    const calendarScrollRef = useRef<HTMLDivElement | null>(null);
    const [news, setNews] = useState<InvestingNewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        let cancelled = false;

        async function loadNews() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`${apiConfig.baseURL}/api/v1/public/news/investing`, {
                    credentials: "include",
                });
                const json = (await response.json()) as {
                    success?: boolean;
                    data?: InvestingNewsItem[];
                    message?: string;
                };

                if (!response.ok || !json.success || !Array.isArray(json.data)) {
                    throw new Error(json.message || "Unable to load news.");
                }

                if (!cancelled) {
                    setNews(json.data);
                    setPage(1);
                }
            } catch (err) {
                if (!cancelled) {
                    setNews([]);
                    setError(err instanceof Error ? err.message : "Unable to load news.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadNews();

        return () => {
            cancelled = true;
        };
    }, []);

    const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE));
    const pagedNews = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return news.slice(start, start + PAGE_SIZE);
    }, [news, page]);

    return (
        <div className={styles.container}>
            <section className={styles.section} aria-labelledby="calendar-news-calendar-heading">
                <h2 id="calendar-news-calendar-heading" className={styles.sectionTitle}>
                    Economic calendar
                </h2>
                <div ref={calendarScrollRef} className={styles.calendarScroll}>
                    <EconomicCalendarIframe src={INVESTING_CALENDAR_SRC} measureRef={calendarScrollRef} />
                </div>
            </section>

            <section className={styles.section} aria-labelledby="calendar-news-news-heading">
                <div className={styles.newsHeader}>
                    <h2 id="calendar-news-news-heading" className={styles.sectionTitle}>
                        News
                    </h2>
                    {!loading && !error && news.length > 0 ? (
                        <span className={styles.newsCount}>
                            {news.length} headlines
                        </span>
                    ) : null}
                </div>

                <div className={styles.newsCard}>
                    {loading ? (
                        <div className={styles.stateMessage}>Loading news…</div>
                    ) : error ? (
                        <div className={styles.errorMessage}>{error}</div>
                    ) : pagedNews.length === 0 ? (
                        <div className={styles.stateMessage}>No news headlines available.</div>
                    ) : (
                        <>
                            <ul className={styles.newsList}>
                                {pagedNews.map((item) => (
                                    <li key={item.link} className={styles.newsItem}>
                                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                                            {item.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>

                            {totalPages > 1 ? (
                                <div className={styles.pagination} aria-label="News pagination">
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </button>
                                    <span>
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                        disabled={page === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}