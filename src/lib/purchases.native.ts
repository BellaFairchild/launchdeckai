import { Platform } from "react-native";
import Purchases, { type PurchasesPackage } from "react-native-purchases";

import type { Plan } from "@/constants/plans";

/**
 * Native RevenueCat integration. Requires a dev build (not Expo Go) and API keys.
 * The app uses the Clerk user id as the RevenueCat appUserID so the Convex
 * webhook can map `app_user_id` → users.clerkId.
 */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "";
export const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "";
export const revenueCatEnabled =
  REVENUECAT_IOS_KEY.length > 0 || REVENUECAT_ANDROID_KEY.length > 0;

export type PlanPackage = {
  plan: Plan;
  priceString: string;
  identifier: string;
  _pkg?: PurchasesPackage;
};

const apiKey = Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
let configured = false;

export function configurePurchases(appUserId?: string): void {
  if (!revenueCatEnabled || !apiKey) return;
  try {
    if (!configured) {
      Purchases.configure({ apiKey, appUserID: appUserId });
      configured = true;
    } else if (appUserId) {
      Purchases.logIn(appUserId).catch(() => {});
    }
  } catch {
    // Native module unavailable (e.g. Expo Go) — purchases stay disabled.
  }
}

function planFromPackage(p: PurchasesPackage): Plan | null {
  const id = `${p.identifier} ${p.product.identifier}`.toLowerCase();
  if (id.includes("admiral")) return "admiral";
  if (id.includes("commander")) return "commander";
  return null;
}

export async function getPlanPackages(): Promise<PlanPackage[]> {
  if (!revenueCatEnabled) return [];
  try {
    const offerings = await Purchases.getOfferings();
    const pkgs = offerings.current?.availablePackages ?? [];
    const out: PlanPackage[] = [];
    for (const p of pkgs) {
      const plan = planFromPackage(p);
      if (plan) {
        out.push({
          plan,
          priceString: p.product.priceString,
          identifier: p.identifier,
          _pkg: p,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

export async function purchasePlan(pkg: PlanPackage): Promise<boolean> {
  if (!pkg._pkg) return false;
  try {
    await Purchases.purchasePackage(pkg._pkg);
    return true;
  } catch (e: any) {
    if (e?.userCancelled) return false;
    throw e;
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    await Purchases.restorePurchases();
    return true;
  } catch {
    return false;
  }
}
