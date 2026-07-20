/* Global test environment: silence native-only modules our UI imports. */
jest.mock("@/lib/haptics", () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    selection: jest.fn(),
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
