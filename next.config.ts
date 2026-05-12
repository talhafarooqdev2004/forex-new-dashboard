import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    /** Lockfiles above this app (e.g. parent `package-lock.json`) must not become Turbopack's project root — breaks `@/` resolution. */
    turbopack: {
        root: path.join(__dirname),
    },
};

export default nextConfig;
