import Image from "next/image";
import { cn } from "@/lib/cn";

interface FuelBadgeProps {
  amount: number;
  className?: string;
}

export function FuelBadge({ amount, className }: FuelBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-walnut/30 bg-walnut-dark/40 px-2.5 py-1 premium-glow",
        className,
      )}
    >
      <Image src="/icons/flame.png" alt="" width={14} height={14} aria-hidden />
      <span className="font-mono text-xs font-medium text-brand-gold">{amount}</span>
    </div>
  );
}
