import { act, fireEvent, render, screen, waitFor } from "@testing-library/react-native";

// Same reanimated mock shape the existing onboarding tests use — the dock
// renders through @/tw (react-native-css), so a bare mock can break className
// rendering. The added useReducedMotion is what the dock itself consumes.
jest.mock("react-native-reanimated", () => {
  const { View, ScrollView } = require("react-native");
  return {
    __esModule: true,
    default: { View, ScrollView, createAnimatedComponent: (c: unknown) => c },
    useSharedValue: (v: number) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    withTiming: (to: number) => to,
    withRepeat: (v: unknown) => v,
    useReducedMotion: () => false,
    Easing: { inOut: () => () => 0, ease: () => 0 },
  };
});

// Render the avatar as a plain stub so the test never touches image assets.
jest.mock("@/components/astro/AstroAvatar", () => {
  const { View } = require("react-native");
  return { AstroAvatar: () => <View testID="astro-avatar" /> };
});

const mockTrack = jest.fn();
jest.mock("@/lib/analytics", () => ({ track: (...a: unknown[]) => mockTrack(...a) }));
jest.mock("@/lib/haptics", () => ({ haptics: { light: jest.fn() } }));

// Controllable speech mock shared with the hook.
const listeners: Record<string, (e: unknown) => void> = {};
const mockStart = jest.fn();
const mockStop = jest.fn();
let mockAvailable = true;
let mockGranted = true;
jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: () => mockAvailable,
    requestPermissionsAsync: async () => ({ granted: mockGranted }),
    start: (...a: unknown[]) => mockStart(...a),
    stop: (...a: unknown[]) => mockStop(...a),
  },
  useSpeechRecognitionEvent: (name: string, handler: (e: unknown) => void) => {
    listeners[name] = handler;
  },
}));

import { AstroVoiceDock } from "./AstroVoiceDock";

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailable = true;
  mockGranted = true;
});

it("renders the step's coach line", () => {
  render(<AstroVoiceDock step={0} />);
  expect(screen.getByText(/called/i)).toBeOnTheScreen();
});

it("shows no mic when there is no dictation target", () => {
  render(<AstroVoiceDock step={3} />);
  expect(screen.queryByLabelText("Dictate")).toBeNull();
});

it("shows the mic on a text step and starts dictation on press", async () => {
  const onChange = jest.fn();
  render(
    <AstroVoiceDock
      step={1}
      field="one_liner"
      dictationTarget={{ value: "", onChange }}
    />,
  );
  fireEvent.press(screen.getByLabelText("Dictate"));
  await waitFor(() => expect(mockStart).toHaveBeenCalled());
});

it("appends a final transcript to the field and tracks the event", async () => {
  const onChange = jest.fn();
  render(
    <AstroVoiceDock
      step={1}
      field="one_liner"
      dictationTarget={{ value: "Habit app", onChange }}
    />,
  );
  fireEvent.press(screen.getByLabelText("Dictate"));
  await waitFor(() => expect(mockStart).toHaveBeenCalled());

  act(() => {
    listeners.result?.({ results: [{ transcript: "for indie devs" }], isFinal: true });
  });

  expect(onChange).toHaveBeenLastCalledWith("Habit app for indie devs");
  expect(mockTrack).toHaveBeenCalledWith("onboarding_voice_used", { field: "one_liner" });
});

it("hides the mic when recognition is unavailable", () => {
  mockAvailable = false;
  render(
    <AstroVoiceDock step={1} field="one_liner" dictationTarget={{ value: "", onChange: jest.fn() }} />,
  );
  expect(screen.queryByLabelText("Dictate")).toBeNull();
});

it("announces \"Stop dictating\" while listening", async () => {
  render(
    <AstroVoiceDock step={1} field="one_liner" dictationTarget={{ value: "", onChange: jest.fn() }} />,
  );
  fireEvent.press(screen.getByLabelText("Dictate"));
  await waitFor(() => expect(mockStart).toHaveBeenCalled());
  act(() => listeners.start?.(null));
  expect(screen.getByLabelText("Stop dictating")).toBeOnTheScreen();
});

it("shows a hint in the bubble when mic permission is denied", async () => {
  mockGranted = false;
  render(
    <AstroVoiceDock step={1} field="one_liner" dictationTarget={{ value: "", onChange: jest.fn() }} />,
  );
  fireEvent.press(screen.getByLabelText("Dictate"));
  await waitFor(() =>
    expect(screen.getByText(/enable it in settings/i)).toBeOnTheScreen(),
  );
});
