import React from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GalaxyBackdrop } from "@/components/ui/GalaxyBackdrop";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { colors } from "@/constants/colors";
import { tMinus } from "@/lib/launch";
import { Text, View } from "@/tw";
import type { Mission, MissionStage } from "@/types";

const STAGE_LABEL: Record<MissionStage, string> = {
  building: "Building",
  testing: "Testing",
  store_prep: "Store Prep",
  ready_to_submit: "Ready to Submit",
};

const HERO_GLOW = {
  shadowColor: colors.rocketTeal,
  shadowOpacity: 0.3,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 12 },
  elevation: 12,
};

/** Interpolate two #rrggbb hexes. */
function lerpHex(a: string, b: string, t: number): string {
  const ca = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const cb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const mix = ca.map((v, i) => Math.round(v + (cb[i] - v) * t));
  return "#" + mix.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/**
 * Readiness fill warms from teal toward gold as the mission nears 100% — the
 * bar itself becomes the reward cue. Teal until ~40%, ramping to gold at launch
 * readiness. (Gold-is-rare: it only appears as you actually earn it.)
 */
function readinessFill(score: number): readonly [string, string] {
  const reward = Math.max(0, Math.min(1, (score - 40) / 60));
  return [colors.rocketTeal, lerpHex(colors.rocketTeal, colors.brandGold, reward)];
}

type Props = {
  mission: Mission;
  completedCount: number;
  totalCount: number;
  /** Jump to the next incomplete milestone. */
  onContinue: () => void;
  /** Start a fresh mission setup. */
  onNewMission: () => void;
};

/**
 * Missions hero — project identity over a galaxy, launch countdown, and the
 * launch-readiness meter, with the two top-level mission actions. Distinct from
 * the Deck hero (which is countdown-first): this one leads with the mission's
 * name and tagline.
 */
export function MissionHeroCard({
  mission,
  completedCount,
  totalCount,
  onContinue,
  onNewMission,
}: Props) {
  const t = tMinus(mission.launchDate);
  const launched = t.hasDate && t.days < 0;
  const headline = !t.hasDate ? "T-–" : launched ? "LIFTOFF" : t.label;
  const score = Math.round(mission.readinessScore);

  return (
    <View
      style={HERO_GLOW}
      className="overflow-hidden rounded-3xl border border-border-med"
    >
      <View className="relative min-h-[208px]">
        <GalaxyBackdrop />

        <View className="relative z-10 gap-4 p-5">
          {/* identity · countdown */}
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="font-mono text-[10px] font-bold uppercase tracking-[3px] text-text-tertiary">
                Project
              </Text>
              <View className="mt-1 flex-row flex-wrap items-center gap-2">
                <Text className="font-display text-2xl font-black text-text-primary">
                  {mission.appName}
                </Text>
                <Badge label={STAGE_LABEL[mission.stage]} variant="status" />
              </View>
              <Text
                numberOfLines={2}
                className="mt-1 font-body text-sm text-brand-teal"
              >
                {mission.oneLiner}
              </Text>
            </View>

            <View className="items-end">
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className="font-display text-4xl font-black leading-none text-brand-flame"
                style={{
                  textShadowColor: "rgba(255, 214, 90, 0.4)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 10,
                }}
              >
                {headline}
              </Text>
              <Text className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[2px] text-text-secondary">
                Days to launch
              </Text>
            </View>
          </View>

          {/* launch readiness */}
          <View className="gap-1.5">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-text-secondary">
                Launch Readiness
              </Text>
              <Text className="font-mono text-sm font-bold text-brand-teal">
                {score}%
              </Text>
            </View>
            <ProgressBar value={score} height={10} fill={readinessFill(score)} />
            <Text className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary">
              {completedCount}/{totalCount} milestones cleared
            </Text>
          </View>

          {/* actions */}
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label="Continue"
                variant="primary"
                fullWidth
                left={<Text className="text-base">🚀</Text>}
                onPress={onContinue}
              />
            </View>
            <View className="flex-1">
              <Button
                label="+ New Mission"
                variant="secondary"
                fullWidth
                onPress={onNewMission}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
