import { SALES_COPY } from "@/lib/salesContent";
import { getShowcaseShot } from "@/components/mocks/AppShots";

interface ShowcaseRowsProps {
  variant?: "alternating" | "stacked";
}

export function ShowcaseRows({ variant = "alternating" }: ShowcaseRowsProps) {
  const { showcase } = SALES_COPY;

  if (variant === "stacked") {
    return (
      <div className="space-y-16">
        {showcase.items.map((item) => {
          const Shot = getShowcaseShot(item.shot);
          return (
            <div key={item.id} className="mx-auto max-w-lg text-center">
              <Shot />
              <h3 className="font-display mt-8 text-2xl font-bold text-text-primary">
                {item.title}
              </h3>
              <p className="mt-3 text-text-secondary">{item.body}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-16 md:space-y-24">
      {showcase.items.map((item, index) => {
        const Shot = getShowcaseShot(item.shot);
        const reversed = index % 2 === 1;
        return (
          <div
            key={item.id}
            className={`grid items-center gap-10 md:grid-cols-2 ${reversed ? "md:[direction:rtl]" : ""}`}
          >
            <div className={reversed ? "md:[direction:ltr]" : ""}>
              <Shot />
            </div>
            <div className={reversed ? "md:[direction:ltr]" : ""}>
              <h3 className="font-display text-2xl font-bold text-text-primary md:text-3xl">
                {item.title}
              </h3>
              <p className="mt-4 text-lg text-text-secondary">{item.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
