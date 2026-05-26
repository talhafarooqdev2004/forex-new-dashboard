import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    /** Lockfiles above this app (e.g. parent `package-lock.json`) must not become Turbopack's project root — breaks `@/` resolution. */
    turbopack: {
        root: path.join(__dirname),
    },
    /**
     * Lets nginx (and similar proxies) stream RSC + Suspense instead of buffering the full HTML
     * before sending — required for route skeletons on VPS production.
     */
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [{ key: "X-Accel-Buffering", value: "no" }],
            },
        ];
    },
};

export default nextConfig;
