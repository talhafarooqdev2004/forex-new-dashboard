import LoginPageClient from "./LoginPageClient";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo(
    "Sign in",
    "Sign in to Forex Fundamentals Edge to access dashboards, tools, and your saved workspace.",
    "/login",
    { noIndex: true },
);

export default function LoginPage() {
    return <LoginPageClient />;
}
