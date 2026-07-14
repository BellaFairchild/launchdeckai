import { PhoneMock } from "@/components/ui/PhoneMock";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { FuelBadge } from "@/components/ui/FuelBadge";
import { SignalBars } from "@/components/ui/SignalBars";

const SCREEN = "/screens/screen-deck.png";

export function DeckScreenContent() {
  return (
    <div className="flex h-full flex-col bg-bg-deep p-4 pt-8">
      <div className="flex items-center justify-between">
        <p className="font-display text-sm font-semibold text-text-primary">Mission Control</p>
        <FuelBadge amount={142} />
      </div>
      <div className="mt-6 flex justify-center">
        <ProgressRing value={68} size={80} />
      </div>
      <div className="mt-4 rounded-2xl border border-brand-teal/30 bg-bg-card p-3 primary-glow">
        <p className="font-mono text-[10px] uppercase tracking-wider text-brand-teal">Next move</p>
        <p className="mt-1 text-xs font-medium text-text-primary">Write App Store subtitle</p>
      </div>
      <ul className="mt-3 space-y-2">
        {["App icon ready", "Privacy policy", "Store screenshots"].map((item, i) => (
          <li key={item} className="flex items-center gap-2 text-xs text-text-secondary">
            <span className={i === 0 ? "text-status-success" : "text-text-muted"}>
              {i === 0 ? "✓" : "○"}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DeckShot({ priority = false }: { priority?: boolean }) {
  return (
    <PhoneMock imageSrc={SCREEN} imageAlt="LaunchDeckAI Deck mission control" priority={priority}>
      <DeckScreenContent />
    </PhoneMock>
  );
}

export function MissionShot() {
  return (
    <PhoneMock
      imageSrc="/screens/screen-mission.png"
      imageAlt="LaunchDeckAI Mission detail"
    >
      <div className="flex h-full flex-col bg-bg-deep p-4 pt-8">
        <p className="font-display text-sm font-semibold">App Store Launch</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border-default">
          <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-deep-indigo to-rocket-teal" />
        </div>
        <p className="mt-2 font-mono text-xs text-text-tertiary">42% complete</p>
      </div>
    </PhoneMock>
  );
}

export function FoundryShot() {
  return (
    <PhoneMock
      imageSrc="/screens/screen-foundry.png"
      imageAlt="LaunchDeckAI Foundry AI generation"
    >
      <div className="flex h-full flex-col bg-bg-deep p-4 pt-8">
        <p className="font-display text-sm font-semibold">The Foundry</p>
        <div className="mt-4 rounded-xl border border-border-default bg-bg-surface p-2 text-xs text-text-muted">
          Generate App Store subtitle…
        </div>
      </div>
    </PhoneMock>
  );
}

export function CargoShot() {
  return (
    <PhoneMock imageSrc="/screens/screen-cargo.png" imageAlt="LaunchDeckAI Cargo Bay">
      <div className="flex h-full flex-col bg-bg-deep p-4 pt-8">
        <p className="font-display text-sm font-semibold">Cargo Bay</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {["Icon", "Screens", "Copy", "Legal"].map((label) => (
            <div
              key={label}
              className="aspect-square rounded-xl border border-border-default bg-bg-card p-2 text-center text-[10px] text-text-secondary"
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </PhoneMock>
  );
}

export function SignalShot() {
  return (
    <PhoneMock
      imageSrc="/screens/screen-signal.png"
      imageAlt="LaunchDeckAI Signal Deck timeline"
    >
      <div className="flex h-full flex-col bg-bg-deep p-4 pt-8">
        <p className="font-display text-sm font-semibold">Signal Deck</p>
        <ul className="mt-4 space-y-3">
          {[
            { day: "Day -7", label: "Teaser post", bars: 3 as const },
            { day: "Day 0", label: "Launch announcement", bars: 2 as const },
          ].map((row) => (
            <li
              key={row.day}
              className="flex items-center justify-between rounded-xl border border-border-default bg-bg-card px-3 py-2"
            >
              <div>
                <p className="font-mono text-[10px] text-brand-teal">{row.day}</p>
                <p className="text-xs text-text-primary">{row.label}</p>
              </div>
              <SignalBars filled={row.bars} />
            </li>
          ))}
        </ul>
      </div>
    </PhoneMock>
  );
}

export function getShowcaseShot(shot: "deck" | "foundry" | "signal" | "mission" | "cargo") {
  switch (shot) {
    case "deck":
      return DeckShot;
    case "foundry":
      return FoundryShot;
    case "signal":
      return SignalShot;
    case "mission":
      return MissionShot;
    case "cargo":
      return CargoShot;
  }
}
