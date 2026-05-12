import type { Metadata } from "next";

export const SITE_NAME = "Forex Fundamentals Edge";

export const SITE_DEFAULT_DESCRIPTION =
    "Research-driven forex dashboards: technicals, fundamentals, FX Analyzer Pro, COT positioning, seasonality, retail sentiment, calendar and news, and trader education.";

function resolveMetadataBase(): URL {
    const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
    if (!raw) {
        return new URL("http://localhost:3000");
    }
    try {
        const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
        return new URL(withProtocol);
    } catch {
        return new URL("http://localhost:3000");
    }
}

/** Root layout: browser tab icon, default OG/Twitter, title template for child routes. */
export const defaultRootMetadata: Metadata = {
    metadataBase: resolveMetadataBase(),
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DEFAULT_DESCRIPTION,
    applicationName: SITE_NAME,
    keywords: [
        "forex",
        "fx",
        "trading",
        "technical analysis",
        "fundamentals",
        "COT",
        "commitment of traders",
        "retail sentiment",
        "seasonality",
        "currency pairs",
        "market dashboard",
    ],
    authors: [{ name: SITE_NAME }],
    icons: {
        icon: [{ url: "/images/brand-logo-black.png", type: "image/png" }],
        shortcut: "/images/brand-logo-black.png",
        apple: [{ url: "/images/brand-logo.png", sizes: "180x180", type: "image/png" }],
    },
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DEFAULT_DESCRIPTION,
        locale: "en_US",
        url: "/",
    },
    twitter: {
        card: "summary_large_image",
        title: SITE_NAME,
        description: SITE_DEFAULT_DESCRIPTION,
    },
    robots: {
        index: true,
        follow: true,
    },
};

type PageSeoOptions = {
    /** Use for auth, maintenance, and admin tools so they are not indexed. */
    noIndex?: boolean;
};

/**
 * Per-route title (combined with root `title.template`) and unique description.
 * Set `NEXT_PUBLIC_SITE_URL` in production so canonical and Open Graph URLs resolve correctly.
 */
export function pageSeo(title: string, description: string, pathname: string, options?: PageSeoOptions): Metadata {
    const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
    const ogTitle = `${title} | ${SITE_NAME}`;
    const meta: Metadata = {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            title: ogTitle,
            description,
            url: path,
        },
        twitter: {
            title: ogTitle,
            description,
        },
    };
    if (options?.noIndex) {
        meta.robots = { index: false, follow: false };
    }
    return meta;
}
