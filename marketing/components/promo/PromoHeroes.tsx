import Image from "next/image";
import Link from "next/link";
import { SALES_COPY } from "@/lib/salesContent";
import { WaitlistForm } from "@/components/waitlist/WaitlistForm";
import { Starfield } from "@/components/ui/Starfield";
import { DeckShot } from "@/components/mocks/AppShots";

export function MissionControlHero() {
  const { hero } = SALES_COPY;

  return (
    <section
      id="waitlist"
      className="relative min-h-[90vh] overflow-hidden border-b border-border-default/40"
    >
      <Starfield />
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-40"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-deep/30 via-bg-deep/70 to-bg-deep" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-brand-teal">
            {hero.eyebrow}
          </p>
          <h1 className="font-display mt-4 text-4xl leading-tight font-bold text-text-primary md:text-5xl lg:text-6xl">
            {hero.headline}{" "}
            <span className="text-brand-flame">{hero.headlineEmphasis}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-text-secondary">{hero.subhead}</p>
          <p className="mt-4 font-mono text-sm text-text-tertiary">{hero.audience}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#waitlist"
              className="inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-rocket-teal to-deep-indigo px-6 py-3 text-sm font-semibold text-white primary-glow"
            >
              {hero.primaryCta}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex min-h-11 items-center rounded-full border border-border-med px-6 py-3 text-sm font-semibold text-brand-teal"
            >
              {hero.secondaryCta}
            </a>
          </div>
          <div className="mt-8 max-w-md">
            <WaitlistForm source="promo_mission_control_hero" />
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          <div className="animate-drift-a">
            <DeckShot priority />
          </div>
          <Image
            src="/astro/full-body-astro-hold-a-nutshell.png"
            alt="Astro, your launch coach"
            width={180}
            height={280}
            className="absolute -bottom-4 -left-4 hidden w-32 object-contain md:block lg:w-40"
          />
        </div>
      </div>
    </section>
  );
}

export function BentoHero() {
  const { hero } = SALES_COPY;

  return (
    <section id="waitlist" className="border-b border-border-default/40 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
          <div className="rounded-3xl border border-border-default bg-bg-card p-6 lit-edge md:col-span-2 md:row-span-2">
            <p className="font-mono text-xs uppercase tracking-widest text-brand-teal">
              {hero.eyebrow}
            </p>
            <h1 className="font-display mt-4 text-3xl font-bold text-text-primary md:text-4xl">
              {hero.headline}{" "}
              <span className="text-brand-flame">{hero.headlineEmphasis}</span>
            </h1>
            <p className="mt-4 text-text-secondary">{hero.subhead}</p>
            <a
              href="#waitlist"
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-gradient-to-r from-rocket-teal to-deep-indigo px-5 py-2.5 text-sm font-semibold text-white primary-glow"
            >
              {hero.primaryCta}
            </a>
          </div>
          <div className="flex items-center justify-center rounded-3xl border border-border-med bg-bg-surface p-4 md:col-span-2">
            <DeckShot />
          </div>
          <div className="rounded-3xl border border-border-default bg-bg-card p-5 lit-edge">
            <p className="font-mono text-2xl font-medium text-brand-teal">68%</p>
            <p className="mt-1 text-xs text-text-tertiary">Launch readiness</p>
          </div>
          <div className="rounded-3xl border border-walnut/30 bg-walnut-dark/30 p-5 premium-glow">
            <p className="font-mono text-2xl font-medium text-brand-gold">16</p>
            <p className="mt-1 text-xs text-text-tertiary">Signal Deck steps</p>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-md">
          <WaitlistForm source="promo_bento_hero" />
        </div>
      </div>
    </section>
  );
}

export function ClassicHero() {
  const { hero } = SALES_COPY;

  return (
    <section id="waitlist" className="border-b border-border-default/40">
      <div className="relative h-48 overflow-hidden md:h-64">
        <Image
          src="/images/star-hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover opacity-50"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-bg-deep" />
      </div>
      <div className="mx-auto -mt-16 max-w-2xl px-5 pb-16 text-center md:-mt-20">
        <p className="font-mono text-xs uppercase tracking-widest text-brand-teal">
          {hero.eyebrow}
        </p>
        <h1 className="font-display mt-4 text-4xl font-bold text-text-primary md:text-5xl">
          {hero.headline}{" "}
          <span className="text-brand-flame">{hero.headlineEmphasis}</span>
        </h1>
        <p className="mt-5 text-lg text-text-secondary">{hero.subhead}</p>
        <p className="mt-3 font-mono text-sm text-text-tertiary">{hero.audience}</p>
        <div className="mx-auto mt-8 max-w-md">
          <WaitlistForm source="promo_classic_hero" />
        </div>
        <Link
          href="#how-it-works"
          className="mt-4 inline-block text-sm text-brand-teal hover:text-brand-teal-light"
        >
          {hero.secondaryCta} ↓
        </Link>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

function PromoSection({
  id,
  title,
  subtitle,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-16 md:py-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="font-display text-3xl font-bold text-text-primary md:text-4xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-lg text-text-secondary">{subtitle}</p>
        )}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export { PromoSection };
