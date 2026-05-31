import type { Plan } from "@/constants/plans";

/**
 * Default (web + TS types) purchases module — a no-op. The native build resolves
 * `purchases.native.ts` instead (real RevenueCat). Both export the same API, so
 * screens import from "@/lib/purchases" and get the right one per platform.
 */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
export const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";
export const revenueCatEnabled =
  REVENUECAT_IOS_KEY.length > 0 || REVENUECAT_ANDROID_KEY.length > 0;

export type PlanPackage = {
  plan: Plan;
  priceString: string;
  identifier: string;
};

export function configurePurchases(_appUserId?: string): void {}
export async function getPlanPackages(): Promise<PlanPackage[]> {
  return [];
}
export async function purchasePlan(_pkg: PlanPackage): Promise<boolean> {
  return false;
}
export async function restorePurchases(): Promise<boolean> {
  return false;
}
