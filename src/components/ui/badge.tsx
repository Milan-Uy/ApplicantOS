import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        wishlist:
          "bg-white/[0.05] border border-white/[0.08] text-[12px] text-muted-fg",
        applied:
          "bg-white/[0.05] border border-white/[0.08] text-[12px] text-[#5e6ad2]",
        phone_screen:
          "bg-white/[0.05] border border-white/[0.08] text-[12px] text-amber-400",
        interview:
          "bg-white/[0.05] border border-white/[0.08] text-[12px] text-orange-400",
        offer:
          "bg-white/[0.05] border border-white/[0.08] text-[12px] text-[#10b981]",
        rejected:
          "bg-white/[0.05] border border-white/[0.08] text-[12px] text-red-400",
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
