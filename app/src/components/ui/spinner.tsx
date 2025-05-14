import type React from "react"
import { cn } from "@/lib/utils"
import { type VariantProps, cva } from "class-variance-authority"

const spinnerVariants = cva("animate-spin rounded-full border-current border-t-transparent", {
  variants: {
    size: {
      xs: "h-3 w-3 border-2",
      sm: "h-4 w-4 border-2",
      md: "h-6 w-6 border-2",
      lg: "h-8 w-8 border-3",
      xl: "h-10 w-10 border-4",
    },
    variant: {
      default: "text-primary",
      secondary: "text-secondary",
      destructive: "text-destructive",
      muted: "text-muted-foreground",
      accent: "text-accent",
    },
  },
  defaultVariants: {
    size: "md",
    variant: "default",
  },
})

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof spinnerVariants> {
  label?: string
}

export function Spinner({ className, size, variant, label = "Loading...", ...props }: SpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} role="status" aria-live="polite" {...props}>
      <div className={cn(spinnerVariants({ size, variant }))}>
        <span className="sr-only">{label}</span>
      </div>
      {props.children && <div>{props.children}</div>}
    </div>
  )
}