import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "cyan";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-sa9-pink text-sa9-surface border-sa9-pink hover:bg-sa9-magenta hover:border-sa9-magenta shadow-(--shadow-pink) hover:shadow-[2px_2px_0_var(--color-sa9-pink-shadow)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  secondary:
    "bg-sa9-surface-raised text-sa9-text border-sa9-border hover:border-sa9-pink hover:text-sa9-pink shadow-(--shadow-md) hover:shadow-(--shadow-pink) active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  ghost:
    "bg-transparent text-sa9-text-muted border-transparent hover:text-sa9-pink hover:border-sa9-pink",
  danger:
    "bg-sa9-red text-white border-sa9-red shadow-(--shadow-md) hover:shadow-(--shadow-sm) active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
  cyan: "bg-sa9-cyan text-sa9-surface border-sa9-cyan shadow-(--shadow-cyan) hover:shadow-[2px_2px_0_var(--color-sa9-cyan-shadow)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-8 py-4 text-lg",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "shine inline-flex items-center justify-center font-display font-bold uppercase tracking-wider border-3 transition-all duration-150 cursor-pointer select-none",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
