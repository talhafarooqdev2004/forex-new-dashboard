import RegisterPageClient from "./RegisterPageClient";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Create account",
    "Create your Forex Fundamentals Edge account to access dashboards, education, and trading tools.",
    "/register",
    { noIndex: true },
);

export default function RegisterPage() {
    return <RegisterPageClient />;
}
