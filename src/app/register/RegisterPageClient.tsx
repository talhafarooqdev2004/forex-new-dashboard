"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/providers/AuthProvider";
import { AuthFormCardSkeleton } from "@/components/skeletons/AuthFormCardSkeleton";
import { DEFAULT_POST_LOGIN_PATH } from "@/lib/postLoginRedirect";

export default function RegisterPageClient() {
    const { register, ready } = useAuth();
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [pending, setPending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPending(true);
        try {
            await register({ email, password, firstName, lastName });
            toast.success("Account created");
            router.replace(DEFAULT_POST_LOGIN_PATH);
            router.refresh();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setPending(false);
        }
    };

    if (!ready) {
        return <AuthFormCardSkeleton variant="register" />;
    }

    return (
        <div className="mx-auto w-full max-w-md rounded-xl border border-stroke bg-darkGrey p-8 shadow-lg">
            <h1 className="text-xl font-semibold tracking-tight">Create account</h1>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? "Creating…" : "Register"}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[rgb(var(--secondary))]">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-[rgb(var(--electric-blue))] hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
