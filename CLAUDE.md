<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

<!-- rafter:start -->
## Security: Rafter

See `AGENTS.md` (Rafter section) and `.rafter.yml`. Scan with
`npm run security:secrets`. Plan/Fuel are backend-owned; do not add client
mutations that set `users.plan`. The RevenueCat webhook must fail closed.
<!-- rafter:end -->
