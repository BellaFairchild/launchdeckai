import { SiteFooter } from "@/components/layout/SiteFooter";
import { PromoHeader } from "@/components/promo/PromoHeader";
import { MissionControlHero, PromoSection } from "@/components/promo/PromoHeroes";
import { TrustStrip } from "@/components/promo/shared/TrustStrip";
import { ProblemBlock } from "@/components/promo/shared/ProblemBlock";
import { FeatureCards } from "@/components/promo/shared/FeatureCards";
import { ShowcaseRows } from "@/components/promo/shared/ShowcaseRows";
import { HowItWorksBlock } from "@/components/promo/shared/HowItWorksBlock";
import { RoadmapTimeline } from "@/components/promo/shared/RoadmapTimeline";
import { PricingTable } from "@/components/promo/shared/PricingTable";
import { FaqSection } from "@/components/promo/shared/FaqSection";
import { WaitlistCta } from "@/components/promo/shared/WaitlistCta";
import { SALES_COPY } from "@/lib/salesContent";

export function MissionControlLayout() {
  const { features, howItWorks, roadmap, pricing } = SALES_COPY;

  return (
    <>
      <PromoHeader />
      <main>
        <MissionControlHero />
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
          <FeatureCards layout="scroll" />
        </PromoSection>
        <PromoSection id="showcase" title={SALES_COPY.showcase.title}>
          <ShowcaseRows variant="alternating" />
        </PromoSection>
        <PromoSection
          id="how-it-works"
          title={howItWorks.title}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <HowItWorksBlock />
        </PromoSection>
        <PromoSection
          id="roadmap"
          title={roadmap.title}
          subtitle={roadmap.subtitle}
        >
          <RoadmapTimeline orientation="vertical" />
        </PromoSection>
        <PromoSection
          id="pricing"
          title={pricing.title}
          subtitle={pricing.subtitle}
          className="border-y border-border-default/40 bg-bg-surface/20"
        >
          <PricingTable variant="cards" />
        </PromoSection>
        <PromoSection id="faq" title={SALES_COPY.faq.title}>
          <FaqSection />
        </PromoSection>
        <div className="mx-auto max-w-6xl px-5 pb-20">
          <WaitlistCta source="promo_mission_control_footer" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
