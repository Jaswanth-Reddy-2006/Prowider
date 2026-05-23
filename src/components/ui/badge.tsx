import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "neon" | "accent"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-brand-surface text-foreground hover:bg-brand-border border border-brand-border",
    secondary: "bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-transparent",
    destructive: "bg-red-900/50 text-red-400 hover:bg-red-900/80 border border-red-800",
    outline: "text-foreground",
    neon: "bg-brand-accent/10 text-brand-accent border border-brand-accent/50 shadow-[0_0_10px_rgba(0,255,102,0.3)]",
    accent: "bg-brand-accent text-black hover:bg-brand-accentHover border-transparent font-bold",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
