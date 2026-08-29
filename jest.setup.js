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

jest.mock("mixpanel-react-native", () => {
  const people = { set: jest.fn() };
  const instance = {
    init: jest.fn(async () => undefined),
    track: jest.fn(),
    identify: jest.fn(async () => undefined),
    reset: jest.fn(),
    flush: jest.fn(),
    registerSuperProperties: jest.fn(),
    getPeople: jest.fn(() => people),
    setLoggingEnabled: jest.fn(),
  };
  const Mixpanel = jest.fn().mockImplementation(() => instance);
  return { Mixpanel, __mockInstance: instance, __mockPeople: people };
});
