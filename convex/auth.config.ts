/**
 * Convex validates Clerk-issued JWTs. CLERK_JWT_ISSUER_DOMAIN is the Clerk
 * Frontend API URL (set via `npx convex env set CLERK_JWT_ISSUER_DOMAIN ...`).
 * applicationID must match the Clerk JWT template name — create a template
 * named "convex" in the Clerk dashboard.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
