import { cn } from "@/lib/cn";
import { type HTMLAttributes, forwardRef } from "react";

type BadgeVariant = "default" | "pink" | "cyan" | "acid" | "orange" | "red";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-sa9-surface-overlay text-sa9-text-muted border-sa9-border",
  pink: "bg-sa9-pink/20 text-sa9-pink border-sa9-pink",
  cyan: "bg-sa9-cyan/20 text-sa9-cyan border-sa9-cyan",
  acid: "bg-sa9-acid/20 text-sa9-acid border-sa9-acid",
  orange: "bg-sa9-orange/20 text-sa9-orange border-sa9-orange",
  red: "bg-sa9-red/20 text-sa9-red border-sa9-red",
};

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 text-xs font-mono font-bold uppercase tracking-widest border-2",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge, type BadgeProps };
