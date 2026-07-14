import { cn } from "@/lib/cn";

interface SignalBarsProps {
  filled: 0 | 1 | 2 | 3;
  className?: string;
}

const barColors = ["bg-text-muted", "bg-status-warning", "bg-status-success"] as const;

export function SignalBars({ filled, className }: SignalBarsProps) {
  const color =
    filled === 0 ? barColors[0] : filled === 3 ? barColors[2] : barColors[1];

  return (
    <div className={cn("flex items-end gap-0.5", className)} aria-label={`Signal ${filled} of 3`}>
      {[1, 2, 3].map((bar) => (
        <span
          key={bar}
          className={cn(
            "w-1 rounded-sm",
            bar === 1 && "h-2",
            bar === 2 && "h-3",
            bar === 3 && "h-4",
            bar <= filled ? color : "bg-border-default",
          )}
        />
      ))}
    </div>
  );
}
