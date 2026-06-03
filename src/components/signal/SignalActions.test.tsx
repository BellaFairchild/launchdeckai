import { render, screen, fireEvent } from "@testing-library/react-native";
import { SignalActions } from "./SignalActions";
import { useMissionStore } from "@/store/mission";

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
jest.mock("@/lib/notifications", () => ({
  scheduleBroadcastReminder: jest.fn(async () => true),
  cancelBroadcastReminder: jest.fn(async () => undefined),
}));
import { cancelBroadcastReminder } from "@/lib/notifications";

function renderActions(status = "not_loaded") {
  return render(
    <SignalActions
      status={status as never}
      signalId="pre_1"
      platform="X/Twitter"
      label="Dev log thread"
      onForge={jest.fn()}
      onViewCargo={jest.fn()}
    />,
  );
}

beforeEach(() => {
  useMissionStore.setState({ convex: null, broadcasts: [] });
  jest.clearAllMocks();
});

it("shows both Forge and Broadcast actions when unscheduled", () => {
  renderActions("not_loaded");
  // Button strips a trailing arrow into an icon, so the text is "Forge"/"Broadcast".
  expect(screen.getByText("Forge")).toBeTruthy();
  expect(screen.getByText("Broadcast")).toBeTruthy();
});

it("reflects a scheduled plan and cancels it", () => {
  useMissionStore.setState({
    broadcasts: [
      { signalId: "pre_1", destinationUrl: "https://x.com", scheduledAt: Date.now() + 3600_000 },
    ],
  });
  renderActions("not_loaded");
  expect(screen.getByText(/Broadcast set for/)).toBeTruthy();

  fireEvent.press(screen.getByText("Cancel broadcast"));
  expect(useMissionStore.getState().broadcasts).toEqual([]);
  expect(cancelBroadcastReminder).toHaveBeenCalledWith("pre_1");
});
