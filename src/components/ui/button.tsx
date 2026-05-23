import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "neon" | "destructive" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-white text-black hover:bg-neutral-200",
      secondary: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700",
      neon: "bg-brand-accent text-black hover:bg-brand-accentHover shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:shadow-[0_0_25px_rgba(0,255,102,0.6)] font-bold transition-all duration-300",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      outline: "border border-brand-border bg-transparent hover:bg-brand-surface text-white",
      ghost: "hover:bg-brand-surface text-white",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
