"use client";

import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea"> & { variant: "dark" | "default" }
>(({ className, variant = "default", placeholder, value, defaultValue, onChange, ...props }, ref) => {
  const variants = {
    dark: "bg-darkGrey rounded-xl outline-none border-none resize-none text-left align-top",
    default: "bg-transparent",
  };

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = React.useState(defaultValue ?? "");
  const currentValue = isControlled ? value : internalValue;
  const isEmpty = currentValue === "" || currentValue == null;

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) setInternalValue(e.target.value);
      onChange?.(e);
    },
    [isControlled, onChange]
  );

  const textarea = (
    <textarea
      className={cn(
        "min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        variants[variant],
        variant === "dark" && "placeholder:invisible",
        !(variant === "dark" && placeholder) && className
      )}
      ref={ref}
      placeholder={variant === "dark" ? "" : placeholder}
      {...(isControlled ? { value } : { defaultValue })}
      onChange={handleChange}
      {...props}
    />
  );

  if (variant === "dark" && placeholder) {
    return (
      <div className={cn("relative w-full", className)}>
        {textarea}
        {isEmpty && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none text-muted-foreground text-base md:text-sm px-3"
            aria-hidden
          >
            {placeholder}
          </div>
        )}
      </div>
    );
  }

  return textarea;
})
Textarea.displayName = "Textarea"

export { Textarea }
