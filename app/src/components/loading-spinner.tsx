import { Spinner } from "@/components/ui/spinner"

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "secondary" | "destructive" | "muted" | "accent"
  showText?: boolean
  text?: string
}

export function LoadingSpinner({
  size = "sm",
  variant = "default",
  showText = false,
  text = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <Spinner size={size} variant={variant}>
      {showText && <span className="text-sm">{text}</span>}
    </Spinner>
  )
}