import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        wishlist:
          "bg-surface-2 border border-border text-xs text-muted-fg",
        applied:
          "bg-surface-2 border border-border text-xs text-accent",
        phone_screen:
          "bg-surface-2 border border-border text-xs text-amber-400",
        interview:
          "bg-surface-2 border border-border text-xs text-orange-400",
        offer:
          "bg-surface-2 border border-border text-xs text-success",
        rejected:
          "bg-surface-2 border border-border text-xs text-red-400",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export type BadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>

const STATUS_LABELS: Record<string, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  phone_screen: "Phone Screen",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
}

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={status as BadgeVariant}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
