type AuthFormVariant = "login" | "register" | "adminLogin";

/** Matches auth cards: `max-w-md` + `p-8` + title + fields + submit + footer line. */
export function AuthFormCardSkeleton({ variant }: { variant: AuthFormVariant }) {
    return (
        <div
            className="mx-auto w-full max-w-md rounded-xl border border-stroke bg-darkGrey p-8 shadow-lg"
            role="status"
            aria-label="Loading form"
        >
            <div className="h-7 w-40 animate-pulse rounded-md bg-foreground/10" />
            {variant === "adminLogin" ? (
                <div className="mt-2 h-4 w-full max-w-sm animate-pulse rounded bg-foreground/5" />
            ) : null}
            <div className="mt-6 space-y-4">
                {variant === "register" ? (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="h-[72px] animate-pulse rounded-lg bg-foreground/5" />
                        <div className="h-[72px] animate-pulse rounded-lg bg-foreground/5" />
                    </div>
                ) : null}
                <div className="h-[72px] animate-pulse rounded-lg bg-foreground/5" />
                <div className="h-[72px] animate-pulse rounded-lg bg-foreground/5" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-foreground/10" />
            </div>
            <div className="mx-auto mt-6 h-4 w-48 animate-pulse rounded bg-foreground/5" />
        </div>
    );
}
