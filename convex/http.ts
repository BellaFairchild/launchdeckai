import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * RevenueCat webhook (Docs/03 §Payments). Configure RevenueCat to POST to
 * `${EXPO_PUBLIC_CONVEX_SITE_URL}/revenuecat` with an Authorization header equal
 * to REVENUECAT_WEBHOOK_SECRET. The app sets the RevenueCat appUserID to the
 * Clerk user id, so `app_user_id` maps straight to users.clerkId.
 */
type Plan = "cadet" | "commander" | "admiral";
type SubStatus = "active" | "trialing" | "expired" | "cancelled" | "grace_period";

const REMOVED_TYPES = new Set([
  "CANCELLATION",
  "EXPIRATION",
  "SUBSCRIPTION_PAUSED",
  "BILLING_ISSUE",
]);

const http = httpRouter();

http.route({
  path: "/revenuecat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
    const auth = request.headers.get("Authorization");
    if (secret && auth !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    const event = body?.event ?? {};
    const clerkId: string | undefined = event.app_user_id;
    if (!clerkId) return new Response("ok", { status: 200 });

    const entitlementIds: string[] =
      event.entitlement_ids ?? (event.entitlement_id ? [event.entitlement_id] : []);
    const removed = REMOVED_TYPES.has(event.type);

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
      revenueCatCustomerId: event.original_app_user_id ?? undefined,
      productId: event.product_id ?? undefined,
    });

    return new Response("ok", { status: 200 });
  }),
});

export default http;
