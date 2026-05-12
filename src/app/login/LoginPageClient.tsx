"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthFormCardSkeleton } from "@/components/skeletons/AuthFormCardSkeleton";
import { DEFAULT_POST_LOGIN_PATH, resolvePostLoginPath } from "@/lib/postLoginRedirect";

export default function LoginPageClient() {
    const { login, ready } = useAuth();
    const router = useRouter();
    const [next, setNext] = useState(DEFAULT_POST_LOGIN_PATH);

    useEffect(() => {
        const q = new URLSearchParams(window.location.search);
        const n = q.get("next");
        if (n && n.startsWith("/")) setNext(resolvePostLoginPath(n));
    }, []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);
        try {
            await login(email, password);
            toast.success("Signed in");
            router.replace(resolvePostLoginPath(next));
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Login failed");
        } finally {
            setPending(false);
        }
    };

    if (!ready) {
        return <AuthFormCardSkeleton variant="login" />;
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border border-stroke bg-darkGrey p-8 shadow-lg">
            <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? "Signing in…" : "Sign in"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[rgb(var(--secondary))]">
                No account?{" "}
                <Link href="/register" className="font-medium text-[rgb(var(--electric-blue))] hover:underline">
                    Register
                </Link>
            </p>
        </div>
    );
}
