import { SALES_COPY } from "@/lib/salesContent";
import { Card } from "@/components/ui/Card";

export function ProblemBlock() {
  const { problem } = SALES_COPY;

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        {problem.cards.map((card) => (
          <Card key={card.title} variant="glass">
            <h3 className="font-display text-lg font-semibold text-text-primary">
              {card.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.body}</p>
          </Card>
        ))}
      </div>
      <Card variant="elevated" className="mt-8 border-brand-teal/20">
        <h3 className="font-display text-xl font-semibold text-text-primary">
          {problem.relief.title}
        </h3>
        <p className="mt-2 text-text-secondary">{problem.relief.body}</p>
      </Card>
    </div>
  );
}
