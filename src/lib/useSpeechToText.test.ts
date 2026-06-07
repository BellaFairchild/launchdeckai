import { act, renderHook } from "@testing-library/react-native";

const listeners: Record<string, (e: unknown) => void> = {};
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockRequest = jest.fn(async () => ({ granted: true }));
let mockAvailable = true;

jest.mock("expo-speech-recognition", () => ({
  ExpoSpeechRecognitionModule: {
    isRecognitionAvailable: () => mockAvailable,
    requestPermissionsAsync: (...a: unknown[]) => mockRequest(...a),
    start: (...a: unknown[]) => mockStart(...a),
    stop: (...a: unknown[]) => mockStop(...a),
  },
  useSpeechRecognitionEvent: (name: string, handler: (e: unknown) => void) => {
    listeners[name] = handler;
  },
}));

import { useSpeechToText } from "./useSpeechToText";

beforeEach(() => {
  jest.clearAllMocks();
  mockAvailable = true;
  mockRequest.mockResolvedValue({ granted: true });
});

it("reports availability from the module", () => {
  mockAvailable = false;
  const { result } = renderHook(() => useSpeechToText());
  expect(result.current.isAvailable).toBe(false);
});

it("requests permission and starts recognition when granted", async () => {
  const { result } = renderHook(() => useSpeechToText());
  await act(async () => {
    await result.current.start();
  });
  expect(mockRequest).toHaveBeenCalled();
  expect(mockStart).toHaveBeenCalledWith(
    expect.objectContaining({ lang: "en-US", interimResults: true }),
  );
});

it("sets an error and does not start when permission denied", async () => {
  mockRequest.mockResolvedValue({ granted: false });
  const { result } = renderHook(() => useSpeechToText());
  await act(async () => {
    await result.current.start();
  });
  expect(mockStart).not.toHaveBeenCalled();
  expect(result.current.error).toBe("not-allowed");
});

it("forwards interim and final results to onResult", async () => {
  const onResult = jest.fn();
  const { result } = renderHook(() => useSpeechToText({ onResult }));

  act(() => {
    listeners.result?.({ results: [{ transcript: "focus" }], isFinal: false });
  });
  expect(onResult).toHaveBeenLastCalledWith("focus", false);
  expect(result.current.partialText).toBe("focus");

  act(() => {
    listeners.result?.({ results: [{ transcript: "focus flow" }], isFinal: true });
  });
  expect(onResult).toHaveBeenLastCalledWith("focus flow", true);
});

it("stop() calls the module and start/end toggle isListening", () => {
  const { result } = renderHook(() => useSpeechToText());
  act(() => listeners.start?.(null));
  expect(result.current.isListening).toBe(true);
  act(() => result.current.stop());
  expect(mockStop).toHaveBeenCalled();
  act(() => listeners.end?.(null));
  expect(result.current.isListening).toBe(false);
});
