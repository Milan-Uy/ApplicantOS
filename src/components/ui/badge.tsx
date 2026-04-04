import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        wishlist:
          "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        applied: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
        phone_screen:
          "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        interview:
          "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
        offer:
          "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
        rejected: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
        ghosted:
          "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
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
  ghosted: "Ghosted",
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
