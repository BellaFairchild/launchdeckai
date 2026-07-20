import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { CommanderSpotlightSheet } from "./CommanderSpotlightSheet";

jest.mock("react-native-reanimated", () => {
  const { ScrollView, View } = require("react-native");
  return {
    __esModule: true,
    default: { ScrollView, View, createAnimatedComponent: (c: unknown) => c },
  };
});
jest.mock("@/components/ui/GradientView", () => ({ GradientView: () => null }));

const mockTrack = jest.fn();
jest.mock("@/lib/analytics", () => ({
  track: (...args: unknown[]) => mockTrack(...args),
}));

beforeEach(() => {
  mockTrack.mockClear();
});

it("renders the spotlight copy and both buttons", () => {
  render(<CommanderSpotlightSheet visible onUpgrade={jest.fn()} onDismiss={jest.fn()} />);
  expect(
    screen.getByText(
      "Commander unlocks Signal Pack export and unlimited Copilot — right when launch prep gets serious.",
    ),
  ).toBeTruthy();
  expect(screen.getByText("Upgrade to Commander")).toBeTruthy();
  expect(screen.getByText("Not now")).toBeTruthy();
});

it("fires onUpgrade and onDismiss from the buttons", () => {
  const onUpgrade = jest.fn();
  const onDismiss = jest.fn();
  render(<CommanderSpotlightSheet visible onUpgrade={onUpgrade} onDismiss={onDismiss} />);
  fireEvent.press(screen.getByText("Upgrade to Commander"));
  expect(onUpgrade).toHaveBeenCalled();
  fireEvent.press(screen.getByText("Not now"));
  expect(onDismiss).toHaveBeenCalled();
});

it("renders nothing when not visible", () => {
  render(<CommanderSpotlightSheet visible={false} onUpgrade={jest.fn()} onDismiss={jest.fn()} />);
  expect(screen.queryByText("Upgrade to Commander")).toBeNull();
});

it("tracks upsell_soft_shown once when shown", async () => {
  const { rerender } = render(
    <CommanderSpotlightSheet visible={false} onUpgrade={jest.fn()} onDismiss={jest.fn()} />,
  );
  expect(mockTrack).not.toHaveBeenCalled();

  rerender(<CommanderSpotlightSheet visible onUpgrade={jest.fn()} onDismiss={jest.fn()} />);
  await waitFor(() => {
    expect(mockTrack).toHaveBeenCalledWith("upsell_soft_shown");
  });
  expect(mockTrack).toHaveBeenCalledTimes(1);
});

it("does not track again while staying visible", async () => {
  const props = { visible: true, onUpgrade: jest.fn(), onDismiss: jest.fn() };
  const { rerender } = render(<CommanderSpotlightSheet {...props} />);
  await waitFor(() => {
    expect(mockTrack).toHaveBeenCalledWith("upsell_soft_shown");
  });

  rerender(<CommanderSpotlightSheet {...props} />);
  expect(mockTrack).toHaveBeenCalledTimes(1);
});

it("dismisses when the backdrop is pressed", () => {
  const onDismiss = jest.fn();
  render(<CommanderSpotlightSheet visible onUpgrade={jest.fn()} onDismiss={onDismiss} />);
  fireEvent.press(screen.getByLabelText("Dismiss Commander spotlight"));
  expect(onDismiss).toHaveBeenCalled();
});
