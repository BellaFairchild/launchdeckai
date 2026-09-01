/* Global test environment: silence native-only modules our UI imports. */

/**
 * react-native-reanimated v4 initialises native Worklets at import time, which
 * throws under jest. Our @/tw wrappers (animated.tsx, image.tsx) import it at
 * module scope, so almost any screen pulls it in transitively. This baseline
 * stub keeps suites loadable; individual tests may still jest.mock it locally
 * when they need richer animation behaviour.
 */
jest.mock("react-native-reanimated", () => {
  const { View, ScrollView } = require("react-native");
  return {
    __esModule: true,
    default: {
      View,
      ScrollView,
      createAnimatedComponent: (c) => c,
    },
    useSharedValue: (v) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    useAnimatedRef: () => ({ current: null }),
    withTiming: (to) => to,
    withSpring: (to) => to,
    withDelay: (_d, v) => v,
    interpolate: () => 0,
    interpolateColor: () => "#000000",
    Easing: { linear: (t) => t, inOut: (e) => e, ease: (t) => t },
  };
});

jest.mock("@/lib/haptics", () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    selection: jest.fn(),
  },
}));

jest.mock("mixpanel-browser", () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    identify: jest.fn(),
    track: jest.fn(),
  },
}));

jest.mock("@/lib/audio", () => ({
  notifyUserInteraction: jest.fn(),
  isSoundEnabled: jest.fn(() => true),
  playClick: jest.fn(),
  playNavigate: jest.fn(),
  playToggle: jest.fn(),
  playSuccess: jest.fn(),
  playPopup: jest.fn(),
  playBack: jest.fn(),
  playConfirm: jest.fn(),
  playError: jest.fn(),
  playLocked: jest.fn(),
  playFuelTick: jest.fn(),
  playCountdownTick: jest.fn(),
  playSignature: jest.fn(),
  playBrandStinger: jest.fn(),
  setAmbient: jest.fn(),
  duckAmbient: jest.fn(),
  restoreAmbient: jest.fn(),
  refreshAudioSessionMode: jest.fn().mockResolvedValue(undefined),
}));
