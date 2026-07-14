import { cn } from "@/lib/cn";

interface ProgressRingProps {
  value: number;
  size?: number;
  className?: string;
}

export function ProgressRing({ value, size = 72, className }: ProgressRingProps) {
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border-default)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#launchGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="launchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1426A8" />
            <stop offset="100%" stopColor="#10B7D6" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-mono absolute inset-0 flex items-center justify-center text-sm font-medium text-text-primary">
        {value}%
      </span>
    </div>
  );
}
