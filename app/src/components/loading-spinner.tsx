import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "secondary" | "destructive" | "muted" | "accent"
  showText?: boolean
  text?: string
  className?: string
}

export function LoadingSpinner({
  size = "sm",
  variant = "default",
  showText = false,
  text = "Loading...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} variant={variant} />
      {showText && <span className="text-sm text-foreground">{text}</span>}
    </div>
  )
}