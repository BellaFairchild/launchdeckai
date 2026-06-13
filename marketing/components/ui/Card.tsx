import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

type CardVariant = "glass" | "elevated" | "premium";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  glass: "bg-bg-card border border-border-default lit-edge",
  elevated:
    "bg-bg-surface border border-border-med shadow-[0_8px_32px_rgba(5,8,22,0.6)]",
  premium:
    "bg-walnut-dark/40 border border-walnut/40 shadow-[0_8px_32px_rgba(139,83,39,0.2)]",
};

export function Card({
  variant = "glass",
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn("rounded-3xl p-5 md:p-6", variantClasses[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
