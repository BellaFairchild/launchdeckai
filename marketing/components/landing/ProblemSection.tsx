import { Card } from "@/components/ui/Card";

const ANXIETIES = [
  "App Store screenshots, copy, and metadata — what actually matters?",
  "Launch timing, email sequences, and social posts — in what order?",
  "That nagging feeling you forgot something critical before submit.",
];

export function ProblemSection() {
  return (
    <section id="problem" className="mx-auto max-w-5xl px-5 py-16 md:py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          You built the app. Now you&apos;re staring at the mountain.
        </h2>
        <p className="mt-4 text-lg text-text-secondary">
          Launch prep isn&apos;t a lack of effort — it&apos;s too many tabs, too
          many lists, and no steady hand telling you what comes next.
        </p>
      </div>

      <ul className="mt-10 space-y-4">
        {ANXIETIES.map((item) => (
          <li key={item}>
            <Card variant="glass" className="flex gap-4">
              <span
                className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-status-warning/40 text-xs text-status-warning"
                aria-hidden
              >
                ?
              </span>
              <p className="text-text-secondary">{item}</p>
            </Card>
          </li>
        ))}
      </ul>

      <Card variant="elevated" className="mt-8 border-brand-teal/20">
        <p className="font-display text-xl text-text-primary">
          LaunchDeckAI is relief, not another checklist.
        </p>
        <p className="mt-2 text-text-secondary">
          One calm mission control that shows your next move, tracks readiness, and
          keeps Astro in your ear until launch day.
        </p>
      </Card>
    </section>
  );
}
