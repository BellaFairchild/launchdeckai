import {
  clearOnboardingDraft,
  getOnboardingDraft,
  saveOnboardingDraft,
  hasIntentDraft,
  DRAFT_KEY,
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
  const draft = { appName: "FocusFlow", oneLiner: "Tasks", audience: "Founders", step: 2 };
  mockGet.mockResolvedValue(JSON.stringify(draft));
  expect(await getOnboardingDraft()).toEqual(draft);
  expect(mockGet).toHaveBeenCalledWith(DRAFT_KEY);
});

it("hasIntentDraft is true when appName and oneLiner present", async () => {
  mockGet.mockResolvedValue(JSON.stringify({ appName: "A", oneLiner: "B", audience: "", step: 1 }));
  expect(await hasIntentDraft()).toBe(true);
});

it("clearOnboardingDraft writes empty string", async () => {
  await clearOnboardingDraft();
  expect(mockSet).toHaveBeenCalledWith(DRAFT_KEY, "");
});
