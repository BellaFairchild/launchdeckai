import {
  clearOnboardingDraft,
  DRAFT_KEY,
  getOnboardingDraft,
  getSkipWelcomeBack,
  hasIntentDraft,
  saveOnboardingDraft,
  setSkipWelcomeBack,
  SKIP_WELCOME_KEY,
  SPOTLIGHT_KEY,
  getHasSeenCommanderSpotlight,
  setHasSeenCommanderSpotlight,
} from "./onboardingDraft";
import * as secureStorage from "./secureStorage";

jest.mock("./secureStorage");

const mockGet = secureStorage.getStorageItem as jest.Mock;
const mockSet = secureStorage.setStorageItem as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

it("returns null when no draft stored", async () => {
  mockGet.mockResolvedValue(null);
  expect(await getOnboardingDraft()).toBeNull();
});

it("saves and parses draft JSON", async () => {
  const draft = {
    appName: "FocusFlow",
    oneLiner: "Tasks",
    audience: "Founders",
    step: 2,
  };
  mockGet.mockResolvedValue(JSON.stringify(draft));
  expect(await getOnboardingDraft()).toEqual(draft);
  expect(mockGet).toHaveBeenCalledWith(DRAFT_KEY);
});

it("hasIntentDraft is true when appName and oneLiner present", async () => {
  mockGet.mockResolvedValue(
    JSON.stringify({ appName: "A", oneLiner: "B", audience: "", step: 1 }),
  );
  expect(await hasIntentDraft()).toBe(true);
});

it("clearOnboardingDraft writes empty string", async () => {
  await clearOnboardingDraft();
  expect(mockSet).toHaveBeenCalledWith(DRAFT_KEY, "");
});

it("saveOnboardingDraft persists JSON", async () => {
  const draft = {
    appName: "A",
    oneLiner: "B",
    audience: "C",
    step: 1,
  };
  await saveOnboardingDraft(draft);
  expect(mockSet).toHaveBeenCalledWith(DRAFT_KEY, JSON.stringify(draft));
});

it("getSkipWelcomeBack is false when pref not set", async () => {
  mockGet.mockResolvedValue(null);
  expect(await getSkipWelcomeBack()).toBe(false);
});

it("getSkipWelcomeBack is true when pref is set", async () => {
  mockGet.mockResolvedValue("1");
  expect(await getSkipWelcomeBack()).toBe(true);
  expect(mockGet).toHaveBeenCalledWith(SKIP_WELCOME_KEY);
});

it("setSkipWelcomeBack persists skip flag", async () => {
  await setSkipWelcomeBack();
  expect(mockSet).toHaveBeenCalledWith(SKIP_WELCOME_KEY, "1");
});

it("getHasSeenCommanderSpotlight is false when pref not set", async () => {
  mockGet.mockResolvedValue(null);
  expect(await getHasSeenCommanderSpotlight()).toBe(false);
});

it("getHasSeenCommanderSpotlight is true when pref is set", async () => {
  mockGet.mockResolvedValue("1");
  expect(await getHasSeenCommanderSpotlight()).toBe(true);
  expect(mockGet).toHaveBeenCalledWith(SPOTLIGHT_KEY);
});

it("setHasSeenCommanderSpotlight persists seen flag", async () => {
  await setHasSeenCommanderSpotlight();
  expect(mockSet).toHaveBeenCalledWith(SPOTLIGHT_KEY, "1");
});
