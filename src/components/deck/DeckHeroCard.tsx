import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "react-native-reanimated";

import { Floating } from "@/components/ui/Floating";
import { NebulaBackdrop } from "@/components/ui/NebulaBackdrop";
import { colors } from "@/constants/colors";
import { playCountdownTick } from "@/lib/audio";
import { launchCountdownParts, tMinus } from "@/lib/launch";
import { Text, View as TWView } from "@/tw";
import type { Mission } from "@/types";

type Props = {
  mission: Mission;
};

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <TWView className="items-center">
      <Text className="w-[2.2ch] text-center font-mono text-[28px] font-bold leading-none tracking-tighter text-text-primary">
        {value}
      </Text>
      <Text className="mt-1 font-mono text-[8.5px] font-bold uppercase text-text-primary/45">
        {label}
      </Text>
    </TWView>
  );
}

function LiveCountdown({ mission }: { mission: Mission }) {
  const [now, setNow] = useState(Date.now);
  const reducedMotion = useReducedMotion();
  const prevSec = useRef<number | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = launchCountdownParts(mission.launchDate, now);

  useEffect(() => {
    if (reducedMotion || !parts.hasDate || parts.launched) return;
    if (prevSec.current !== null && prevSec.current !== parts.seconds) {
      playCountdownTick();
    }
    prevSec.current = parts.seconds;
  }, [parts.seconds, parts.hasDate, parts.launched, reducedMotion]);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (parts.launched) {
    return (
      <TWView className="items-center py-1">
        <Text className="font-display text-xl font-black uppercase tracking-widest text-brand-teal">
          Orbit established
        </Text>
      </TWView>
    );
  }

  if (!parts.hasDate) {
    return (
      <TWView
        className="items-center rounded-xl border border-border-med bg-bg-deep/70 px-4 py-3"
        style={{
          shadowColor: colors.rocketTeal,
          shadowOpacity: 0.12,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
        }}
      >
        <Text className="font-mono text-lg font-bold text-text-primary">
          T-–
        </Text>
        <Text className="mt-1 font-body text-xs text-text-secondary">
          Set a launch date to start the clock
        </Text>
      </TWView>
    );
  }

  return (
    <TWView
      className="flex-row items-baseline justify-center gap-1.5 rounded-xl border border-border-med bg-bg-deep/70 px-4 py-2.5"
      style={{
        shadowColor: colors.rocketTeal,
        shadowOpacity: 0.12,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <CountdownUnit value={pad(parts.days)} label="Days" />
      <Text className="font-mono text-lg text-brand-teal/35">:</Text>
      <CountdownUnit value={pad(parts.hours)} label="Hrs" />
      <Text className="font-mono text-lg text-brand-teal/35">:</Text>
      <CountdownUnit value={pad(parts.minutes)} label="Min" />
      <Text className="font-mono text-lg text-brand-teal/35">:</Text>
      <CountdownUnit value={pad(parts.seconds)} label="Sec" />
    </TWView>
  );
}

/**
 * Deck hero — nebula backdrop, bold T-days headline, live countdown clock
 * at the foot of the card (reference mock).
 */
export function DeckHeroCard({ mission }: Props) {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const t = tMinus(mission.launchDate, now);
  const launched = t.hasDate && t.days < 0;
  const headline = !t.hasDate ? "T-–" : launched ? "LIFTOFF" : t.label;
  const caption = !t.hasDate
    ? "Set launch date"
    : launched
      ? "Mission launched"
      : "Days to launch";

  return (
    <Floating
      glowColor={colors.rocketTeal}
      className="overflow-hidden rounded-3xl border border-border-med"
    >
      <TWView className="relative min-h-[220px]">
        <NebulaBackdrop />

        <TWView className="relative z-10 items-center justify-between gap-5 px-5 py-6">
          <TWView className="items-center pt-2">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              className="text-center font-display font-black leading-none text-rocket-teal"
              style={{
                fontSize: 72,
                textShadowColor: "rgba(16, 183, 214, 0.45)",
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 12,
              }}
            >
              {headline}
            </Text>
            <Text className="mt-3 font-mono text-[11px] font-bold uppercase tracking-[4px] text-text-primary/80">
              {caption}
            </Text>
          </TWView>

          <TWView className="w-full">
            <LiveCountdown mission={mission} />
          </TWView>
        </TWView>
      </TWView>
    </Floating>
  );
}
