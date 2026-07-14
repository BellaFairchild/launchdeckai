import { SALES_COPY } from "@/lib/salesContent";
import { cn } from "@/lib/cn";

const phaseStyles = {
  Now: "border-brand-teal/40 bg-brand-teal/10 text-brand-teal",
  Next: "border-brand-blue/40 bg-brand-blue/10 text-brand-blue-light",
  Later: "border-border-med bg-bg-surface text-text-tertiary",
} as const;

interface RoadmapTimelineProps {
  orientation?: "vertical" | "horizontal";
}

export function RoadmapTimeline({ orientation = "vertical" }: RoadmapTimelineProps) {
  const { roadmap } = SALES_COPY;

  if (orientation === "horizontal") {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {roadmap.phases.map((phase) => (
          <div
            key={phase.phase}
            className="min-w-[260px] shrink-0 rounded-3xl border border-border-default bg-bg-card p-5 lit-edge"
          >
            <span
              className={cn(
                "inline-block rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider",
                phaseStyles[phase.phase],
              )}
            >
              {phase.phase}
            </span>
            <ul className="mt-4 space-y-2">
              {phase.items.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-text-secondary">
                  <span className="text-brand-teal" aria-hidden>
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border-med md:before:left-1/2 md:before:-translate-x-px">
      {roadmap.phases.map((phase, index) => (
        <div
          key={phase.phase}
          className={cn(
            "relative grid gap-4 md:grid-cols-2 md:gap-8",
            index % 2 === 1 && "md:[direction:rtl]",
          )}
        >
          <div className="hidden md:block" />
          <div className={cn(index % 2 === 1 && "md:[direction:ltr]")}>
            <div className="relative pl-8 md:pl-0">
              <span
                className="absolute top-1 left-0 z-10 h-[22px] w-[22px] rounded-full border-2 border-brand-teal bg-bg-deep md:left-[-11px] md:-translate-x-1/2"
                aria-hidden
              />
              <div className="rounded-3xl border border-border-default bg-bg-card p-5 lit-edge timeline-reveal">
                <span
                  className={cn(
                    "inline-block rounded-full border px-3 py-1 font-mono text-xs uppercase tracking-wider",
                    phaseStyles[phase.phase],
                  )}
                >
                  {phase.phase}
                </span>
                <ul className="mt-4 space-y-2">
                  {phase.items.map((item) => (
                    <li key={item} className="text-sm text-text-secondary">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
