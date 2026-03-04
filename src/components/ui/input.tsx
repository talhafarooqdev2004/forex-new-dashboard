import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { variant?: "dark-grey" | "default" }>(
  ({ className, type, variant = "dark-grey", ...props }, ref) => {
    const variants = {
      "dark-grey": "bg-[#1f2227] rounded-[8px] h-10",
      default: ""
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-9 rounded-md w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          variants[variant],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
