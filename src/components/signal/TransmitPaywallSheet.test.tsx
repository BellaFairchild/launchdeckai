import { render, screen, fireEvent } from "@testing-library/react-native";
import { TransmitPaywallSheet } from "./TransmitPaywallSheet";

// Minimal reanimated stub — the real v4 module initializes native Worklets on
// import, which throws under jest. @/tw only needs Animated.ScrollView to exist.
jest.mock("react-native-reanimated", () => {
  const { ScrollView, View } = require("react-native");
  return {
    __esModule: true,
    default: { ScrollView, View, createAnimatedComponent: (c: unknown) => c },
  };
});
jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));

it("renders the exact paywall copy and both buttons", () => {
  render(<TransmitPaywallSheet visible onUpgrade={jest.fn()} onDismiss={jest.fn()} />);
  expect(screen.getByText("Export needs Commander.")).toBeTruthy();
  expect(screen.getByText("Upgrade to Commander")).toBeTruthy();
  expect(screen.getByText("Maybe later")).toBeTruthy();
});

it("fires onUpgrade and onDismiss from the buttons", () => {
  const onUpgrade = jest.fn();
  const onDismiss = jest.fn();
  render(<TransmitPaywallSheet visible onUpgrade={onUpgrade} onDismiss={onDismiss} />);
  fireEvent.press(screen.getByText("Upgrade to Commander"));
  expect(onUpgrade).toHaveBeenCalled();
  fireEvent.press(screen.getByText("Maybe later"));
  expect(onDismiss).toHaveBeenCalled();
});

it("renders nothing when not visible", () => {
  render(<TransmitPaywallSheet visible={false} onUpgrade={jest.fn()} onDismiss={jest.fn()} />);
  expect(screen.queryByText("Export needs Commander.")).toBeNull();
});

it("dismisses when the backdrop is pressed", () => {
  const onDismiss = jest.fn();
  render(<TransmitPaywallSheet visible onUpgrade={jest.fn()} onDismiss={onDismiss} />);
  fireEvent.press(screen.getByLabelText("Dismiss paywall"));
  expect(onDismiss).toHaveBeenCalled();
});

it("does not dismiss when sheet content is pressed", () => {
  const onDismiss = jest.fn();
  render(<TransmitPaywallSheet visible onUpgrade={jest.fn()} onDismiss={onDismiss} />);
  fireEvent.press(screen.getByText("Export needs Commander."));
  expect(onDismiss).not.toHaveBeenCalled();
});
