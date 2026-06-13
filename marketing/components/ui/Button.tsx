import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "premium";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-rocket-teal to-deep-indigo text-white primary-glow hover:brightness-110",
  secondary:
    "bg-bg-surface border border-border-default text-text-primary hover:border-border-med",
  ghost: "bg-transparent text-brand-teal hover:text-brand-teal-light",
  premium:
    "bg-walnut text-bg-deep hover:bg-walnut/90 shadow-[0_8px_24px_rgba(139,83,39,0.35)]",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
