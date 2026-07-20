import { render, screen, fireEvent } from "@testing-library/react-native";
import { Button } from "./Button";

// Prevent react-native-reanimated from initialising native Worklets in Jest.
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

it("exposes an accessibilityLabel (falling back to the label) and testID", () => {
  render(<Button label="Transmit →" testID="transmit-btn" onPress={jest.fn()} />);
  expect(screen.getByTestId("transmit-btn")).toBeTruthy();
  // label arrow is stripped for display but the a11y name stays meaningful
  expect(screen.getByLabelText("Transmit")).toBeTruthy();
});

it("prefers an explicit accessibilityLabel over the visible label", () => {
  render(<Button label="🔒" accessibilityLabel="Transmit Sequence (locked)" onPress={jest.fn()} />);
  expect(screen.getByLabelText("Transmit Sequence (locked)")).toBeTruthy();
});

it("does not fire onPress when disabled", () => {
  const onPress = jest.fn();
  render(<Button label="Go" testID="go" disabled onPress={onPress} />);
  fireEvent.press(screen.getByTestId("go"));
  expect(onPress).not.toHaveBeenCalled();
});
