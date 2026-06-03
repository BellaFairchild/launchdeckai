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
  playClick: jest.fn(),
  playSignature: jest.fn(),
}));
