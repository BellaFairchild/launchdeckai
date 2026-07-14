import { SALES_COPY } from "@/lib/salesContent";
import { Card } from "@/components/ui/Card";

interface HowItWorksBlockProps {
  variant?: "cards" | "steps";
}

export function HowItWorksBlock({ variant = "cards" }: HowItWorksBlockProps) {
  const { howItWorks } = SALES_COPY;

  if (variant === "steps") {
    return (
      <ol className="mx-auto max-w-xl space-y-8">
        {howItWorks.steps.map((step) => (
          <li key={step.number} className="flex gap-6">
            <span className="font-mono text-2xl font-medium text-brand-teal">{step.number}</span>
            <div>
              <h3 className="font-display text-xl font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-text-secondary">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {howItWorks.steps.map((step) => (
        <Card key={step.number} variant="glass">
          <span className="font-mono text-sm text-brand-teal">{step.number}</span>
          <h3 className="font-display mt-2 text-lg font-semibold text-text-primary">
            {step.title}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">{step.body}</p>
        </Card>
      ))}
    </div>
  );
}
