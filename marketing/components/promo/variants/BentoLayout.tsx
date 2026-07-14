import { SiteFooter } from "@/components/layout/SiteFooter";
import { PromoHeader } from "@/components/promo/PromoHeader";
import { BentoHero, PromoSection } from "@/components/promo/PromoHeroes";
import { TrustStrip } from "@/components/promo/shared/TrustStrip";
import { ProblemBlock } from "@/components/promo/shared/ProblemBlock";
import { FeatureCards } from "@/components/promo/shared/FeatureCards";
import { RoadmapTimeline } from "@/components/promo/shared/RoadmapTimeline";
import { PricingTable } from "@/components/promo/shared/PricingTable";
import { FaqSection } from "@/components/promo/shared/FaqSection";
import { WaitlistCta } from "@/components/promo/shared/WaitlistCta";
import { SALES_COPY } from "@/lib/salesContent";
import Image from "next/image";
import { DeckShot, FoundryShot } from "@/components/mocks/AppShots";
import { Card } from "@/components/ui/Card";

export function BentoLayout() {
  const { features, roadmap, pricing } = SALES_COPY;

  return (
    <>
      <PromoHeader />
      <main>
        <BentoHero />
        <TrustStrip />
        <PromoSection id="problem" title={SALES_COPY.problem.title}>
          <ProblemBlock />
        </PromoSection>
        <PromoSection
          id="features"
          title={features.title}
          subtitle={features.subtitle}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <FeatureCards layout="bento" />
            </div>
            <div className="flex flex-col gap-4">
              <Card variant="glass" className="flex flex-1 flex-col items-center justify-center p-4">
                <DeckShot />
              </Card>
              <Card variant="glass" className="flex flex-1 flex-col items-center justify-center p-4">
                <FoundryShot />
              </Card>
            </div>
          </div>
        </PromoSection>
        <PromoSection
          id="roadmap"
          title={roadmap.title}
          subtitle={roadmap.subtitle}
        >
          <RoadmapTimeline orientation="horizontal" />
        </PromoSection>
        <PromoSection
          id="pricing"
          title={pricing.title}
          subtitle={pricing.subtitle}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <PricingTable variant="matrix" />
        </PromoSection>
        <PromoSection id="faq" title={SALES_COPY.faq.title}>
          <FaqSection />
        </PromoSection>
        <div className="mx-auto max-w-6xl px-5 pb-20">
          <div className="mb-8 flex items-center justify-center gap-6">
            <Image
              src="/astro/astro-showing-blueprint-and-checklist.png"
              alt="Astro with blueprint"
              width={120}
              height={160}
              className="h-32 w-auto object-contain"
            />
          </div>
          <WaitlistCta source="promo_bento_footer" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
