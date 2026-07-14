import Image from "next/image";
import { SALES_COPY } from "@/lib/salesContent";

export function TrustStrip() {
  const { trust } = SALES_COPY;

  return (
    <div className="border-y border-border-default/40 bg-bg-surface/30 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 md:flex-row md:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {trust.badges.map((badge) => (
            <div
              key={badge.label}
              className="flex items-center gap-2 rounded-full border border-border-default bg-bg-card px-3 py-1.5"
            >
              <Image src={badge.icon} alt="" width={20} height={20} className="h-5 w-5" />
              <span className="text-xs font-medium text-text-secondary">{badge.label}</span>
            </div>
          ))}
        </div>
        <p className="font-mono text-xs text-text-tertiary">{trust.reassurance}</p>
      </div>
    </div>
  );
}
