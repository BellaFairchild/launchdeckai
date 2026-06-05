import { getStorageItem, setStorageItem } from "./secureStorage";

export const DRAFT_KEY = "launchdeck_onboarding_draft_v1";
export const SKIP_WELCOME_KEY = "launchdeck_skip_welcome_back";

export type OnboardingDraft = {
  appName: string;
  oneLiner: string;
  audience: string;
  step: number;
};

export async function getOnboardingDraft(): Promise<OnboardingDraft | null> {
  const raw = await getStorageItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

export async function saveOnboardingDraft(draft: OnboardingDraft): Promise<void> {
  await setStorageItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function clearOnboardingDraft(): Promise<void> {
  await setStorageItem(DRAFT_KEY, "");
}

export async function hasIntentDraft(): Promise<boolean> {
  const d = await getOnboardingDraft();
  return Boolean(d?.appName?.trim() && d?.oneLiner?.trim());
}

export async function getSkipWelcomeBack(): Promise<boolean> {
  const raw = await getStorageItem(SKIP_WELCOME_KEY);
  return raw === "1" || raw === "true";
}

export async function setSkipWelcomeBack(): Promise<void> {
  await setStorageItem(SKIP_WELCOME_KEY, "1");
}
