import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * RevenueCat webhook (Docs/03 §Payments). Configure RevenueCat to POST to
 * `${EXPO_PUBLIC_CONVEX_SITE_URL}/revenuecat` with an Authorization header equal
 * to REVENUECAT_WEBHOOK_SECRET (raw secret or `Bearer <secret>`). The app sets
 * the RevenueCat appUserID to the Clerk user id, so `app_user_id` maps to
 * users.clerkId.
 *
 * Fails closed: missing secret or mismatched header → 401. Never apply
 * entitlements from an unauthenticated request.
 */
type Plan = "cadet" | "commander" | "admiral";
type SubStatus = "active" | "trialing" | "expired" | "cancelled" | "grace_period";

const REMOVED_TYPES = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "SUBSCRIPTION_PAUSED",
  "BILLING_ISSUE",
]);

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aa = encoder.encode(a);
  const bb = encoder.encode(b);
  if (aa.byteLength !== bb.byteLength) return false;
  let out = 0;
  for (let i = 0; i < aa.byteLength; i++) {
    out |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return out === 0;
}

function presentedSecret(header: string | null): string {
  const raw = (header ?? "").trim();
  if (raw.toLowerCase().startsWith("bearer ")) return raw.slice(7).trim();
  return raw;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const http = httpRouter();

http.route({
  path: "/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    if (!secret) {
      console.error("REVENUECAT_WEBHOOK_SECRET is not configured");
      return new Response("Unauthorized", { status: 401 });
    }
    const presented = presentedSecret(request.headers.get("Authorization"));
    if (!presented || !timingSafeEqual(presented, secret)) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }
    if (body === null || typeof body !== "object") {
      return new Response("Bad Request", { status: 400 });
    }

    const eventValue = (body as { event?: unknown }).event;
    const event =
      eventValue !== null && typeof eventValue === "object"
        ? (eventValue as Record<string, unknown>)
        : {};

    const clerkId = asString(event.app_user_id);
    if (!clerkId) return new Response("ok", { status: 200 });

    const entitlementIds: string[] = [
      ...asStringArray(event.entitlement_ids),
      ...(asString(event.entitlement_id) ? [event.entitlement_id as string] : []),
    ];
    const eventType = asString(event.type) ?? "";
    const removed = REMOVED_TYPES.has(eventType);

    let plan: Plan = "cadet";
    if (!removed) {
      if (entitlementIds.includes("admiral")) plan = "admiral";
      else if (entitlementIds.includes("commander")) plan = "commander";
    }
    const status: SubStatus = removed ? "expired" : "active";

    await ctx.runMutation(internal.subscriptions.applyEntitlement, {
      clerkId,
      plan,
      status,
      revenueCatCustomerId: asString(event.original_app_user_id),
      productId: asString(event.product_id),
    });

    return new Response("ok", { status: 200 });
  }),
});

export default http;
