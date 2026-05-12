import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Maintenance",
    "Forex Fundamentals Edge is temporarily unavailable while we perform scheduled maintenance.",
    "/maintenance",
    { noIndex: true },
);

export default function MaintenancePage() {
    return (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
            <h1 className="text-2xl font-semibold">Maintenance mode</h1>
            <p className="text-sm text-[rgb(var(--secondary))]">
                The site is temporarily unavailable for scheduled maintenance. Please try again later.
            </p>
        </div>
    );
}
