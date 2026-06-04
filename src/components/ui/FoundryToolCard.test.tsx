import { render, screen, fireEvent } from "@testing-library/react-native";

import { FoundryToolCard } from "./FoundryToolCard";
import { FOUNDRY_TOOLS } from "@/constants/foundryTools";

// Minimal reanimated stub — the real v4 module initializes native Worklets on
// import, which throws under jest. The card only needs these helpers to exist.
jest.mock("react-native-reanimated", () => {
  const { View, ScrollView } = require("react-native");
  return {
    __esModule: true,
    default: { View, ScrollView, createAnimatedComponent: (c: unknown) => c },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (to: number) => to,
    interpolateColor: () => "#000000",
  };
});
jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));

const cadetTool = FOUNDRY_TOOLS.find((t) => t.requiredPlan === "cadet")!;
const lockedTool = FOUNDRY_TOOLS.find((t) => t.requiredPlan === "commander")!;

it("forges when an unlocked, affordable tool is pressed", () => {
  const onForge = jest.fn();
  render(
    <FoundryToolCard
      tool={cadetTool}
      locked={false}
      affordable
      busy={false}
      anyBusy={false}
      onForge={onForge}
    />,
  );
  fireEvent.press(screen.getByText("Forge Content"));
  expect(onForge).toHaveBeenCalledTimes(1);
});

it("still fires onForge for a plan-locked tool so it can route to upgrade", () => {
  const onForge = jest.fn();
  render(
    <FoundryToolCard
      tool={lockedTool}
      locked
      affordable
      busy={false}
      anyBusy={false}
      onForge={onForge}
    />,
  );
  // The whole card is the tap target; press its locked CTA label.
  fireEvent.press(screen.getByText(/Unlock with/));
  expect(onForge).toHaveBeenCalledTimes(1);
});

it("does not forge while another tool is busy", () => {
  const onForge = jest.fn();
  render(
    <FoundryToolCard
      tool={cadetTool}
      locked={false}
      affordable
      busy={false}
      anyBusy
      onForge={onForge}
    />,
  );
  fireEvent.press(screen.getByText("Forge Content"));
  expect(onForge).not.toHaveBeenCalled();
});
