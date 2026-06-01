import React from "react";
import { StyleSheet, View } from "react-native";

import { Image } from "@/tw/image";
import { GradientView } from "./GradientView";

// Teal nebula hero art. Swap this file (assets/images/nebula-hero.jpg) to change
// the hero background — no code change needed.
const NEBULA = require("../../../assets/images/nebula-hero.jpg");

/**
 * Image-backed hero background: the teal nebula under a vertical dark scrim that
 * keeps the top HUD and bottom readiness meter legible over any artwork. Parent
 * must clip (overflow-hidden + rounded).
 */
export function NebulaBackdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Image
        source={NEBULA}
        style={StyleSheet.absoluteFill}
        className="object-cover"
        contentPosition="center"
      />
      <GradientView
        colors={[
          "rgba(6,11,20,0.5)",
          "rgba(6,11,20,0.26)",
          "rgba(6,11,20,0.66)",
        ]}
        locations={[0, 0.42, 1]}
        direction="vertical"
      />
    </View>
  );
}
