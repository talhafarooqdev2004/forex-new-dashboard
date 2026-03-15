import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        primary:
          "bg-[#152339] rounded-[12px] text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "dark-grey": "bg-darkGrey rounded-[4px] outline outline-[0.80px] outline-offset-[-0.80px] outline-stroke text-foreground font-arima",
        "save-to-history": "bg-[#D0870066] rounded-[4px] border border-solid border-[#8D660B] text-foreground",
        "send-alert": "bg-[#00E37166] rounded-[4px] border border-solid border-greenDark text-foreground",
        "telegram": "bg-[#2B7FFF] rounded-[4px] rounded-xl text-foreground",
        "whatsapp": "bg-[#00A63E] rounded-[4px] rounded-xl text-foreground",
        "discord": "bg-[#9810FA] rounded-[4px] rounded-xl text-foreground",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        "dark-grey": "h-8 px-[10px]",
        "save-to-history": "h-9 px-4 py-2",
        "send-alert": "h-9 px-4 py-2",
        "social": "h-9 px-5",
        "primary": "h-10 px-3 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
