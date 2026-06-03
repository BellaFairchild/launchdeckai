# Cargo Bay Organization & Download — Design

**Date:** 2026-06-02
**Status:** Approved (design); pending implementation plan
**Area:** Cargo Bay (`src/app/(modals)/cargo.tsx`), a new asset detail route (`src/app/(modals)/cargo-asset/[id].tsx`), Cargo UI components (`src/components/cargo/*`), mission store (`src/store/mission.ts` — read only)

## Summary

Turn the Cargo Bay from a flat list of asset titles into the place where launch
content is **organized by category** and genuinely **available for download**.
The top level becomes a color-coded **category grid** (count per card, matching
the Foundry brand-ring aesthetic). Tapping a category **expands it inline** to
reveal its asset rows; tapping a row opens a dedicated **asset detail screen**
where the full content is readable and can be exported via the native **Share**
sheet or **Copy** to clipboard. A **bundle export** packages all flight-ready
assets into one share. No new data layer is required — every level reads the
existing `assets` collection from the mission store.

## Decisions (from brainstorming)

- **Top-level organization:** A 2-column **category grid**, one card per category
  that has assets, each showing a count and a category-colored gradient ring.
- **Category navigation:** **Inline accordion** — tapping a card expands it in
  place to list that category's assets; tapping again collapses. No screen change
  at this level.
- **Asset interaction:** Tapping an asset row opens a **full detail screen** wired
  as a **separate Expo Router route** (`/(modals)/cargo-asset/[id]`) — deep-linkable
  with native back navigation.
- **Download semantics:** Export = the **native share sheet** (per asset) plus a
  **bundle export** of all flight-ready assets. No per-asset "save as file" and no
  per-asset clipboard-only flow as the primary export.
- **Detail screen actions:** **Share** (single asset) and **Copy content**. The
  screen is otherwise read-only.
- **Status changes:** **Mark flight-ready** stays on the asset **row** inside the
  expanded category (as it works today), not on the detail screen.
- **Empty categories:** Categories with **0 assets are hidden** (e.g. Legal,
  Files when unused). An entirely empty Cargo keeps today's `EmptyState → Open
  Foundry`.

## What exists today

- `src/app/(modals)/cargo.tsx` renders a **flat list** of `AssetRow` cards
  (title + status/signal badges + signal bars), each with a **"Mark flight-ready"**
  and **"View Signal"** button, plus a **Cargo Payload Hub** whose "Download assets
  (N)" button only flips `flight_ready → exported` — **content is never readable,
  copyable, or exportable** anywhere.
- Assets come from `useMissionStore(s => s.assets)`. Each `Asset` already carries
  `content?: string`, `category`, `status`, `signalId/Label/Phase`, `updatedAt`
  (`src/types.ts`). The store hydrates from Convex when signed in (via
  `getLaunchData`) and from mock data in demo mode; **screens read it identically**.
- Convex already backs this: `assets` table + `createFoundryAsset` /
  `updateAssetStatus` (`convex/assets.ts`), surfaced through `getLaunchData`
  (`convex/missions.ts`).
- `AssetCategory` has six values: `app_store`, `social`, `media`, `pr`, `legal`,
  `files` (`src/types.ts`).

## Architecture

Three presentation levels over the **same** `assets` array — no new queries or
mutations beyond what already exists.

### Components

- **`CategoryGrid`** (`src/components/cargo/CategoryGrid.tsx`) — groups `assets`
  by `category`, renders one `CategoryCard` per non-empty category. Owns the
  expanded-category state (which single category, if any, is open).
- **`CategoryCard`** (`src/components/cargo/CategoryCard.tsx`) — collapsed: glyph,
  name, count, category-colored gradient ring (reusing the `GradientView` +
  `withAlpha` pattern from `FoundryToolCard`). Expanded: spans full width and
  renders its `AssetRow`s inline.
- **`AssetRow`** — moved into `src/components/cargo/AssetRow.tsx` (lifted from
  `cargo.tsx`); keeps title, status/signal badges, signal bars, and the
  **Mark flight-ready** action; the whole row navigates to the detail route.
- **`CargoPayloadHub`** — retained; "Download assets (N)" relabeled to **Export**
  and wired to the bundle share (below).
- **Asset detail route** (`src/app/(modals)/cargo-asset/[id].tsx`) — reads `id`
  from route params, finds the asset in the store, renders header (title, category
  · status), scrollable content card, and **Share** / **Copy** actions.

### Category metadata

A single map `src/constants/assetCategories.ts`:

```ts
CATEGORY_META: Record<AssetCategory, { label: string; glyph: string; hex: string }>
```

with the brand colors validated in the mockup — `app_store`→teal `#4DC8C0`,
`social`→blue `#1DA1F2`, `media`→amber `#F59E0B`, `pr`→pink `#FE2C55`,
`legal`→purple `#A78BFA`, `files`→slate `#64748B`. Drives the card ring, glyph
tint, and grid order.

## Data flow

1. `cargo.tsx` reads `assets` from the mission store and passes them to
   `CategoryGrid`.
2. `CategoryGrid` derives `Map<AssetCategory, Asset[]>`, dropping empty groups,
   ordered by `CATEGORY_META`.
3. Expanding a card reveals its rows; the row press calls
   `router.push('/(modals)/cargo-asset/' + asset.id)`.
4. The detail route re-reads the store by `id` (so it reflects live status/content
   updates), rather than passing the asset through params.
5. **Mark flight-ready** continues to call `updateAssetStatus(id, "flight_ready")`
   on the store (which delegates to Convex when connected).

## Export behavior

- **Per asset (detail screen):**
  - **Share** → `Share.share({ message: asset.content, title: asset.title })`
    (React Native `Share`; falls back gracefully on web). Cancel is a no-op.
  - **Copy** → `expo-clipboard` `setStringAsync(asset.content)`, with `haptics`
    and a signature sound, plus a brief "Copied" confirmation.
- **Bundle export (hub):** gather all assets with status `flight_ready`, join
  into one document (per-asset `## {title}` heading + content), and open the share
  sheet with the combined text. On a successful share, flip each included asset
  `flight_ready → exported` (preserving today's behavior). Disabled at 0
  flight-ready assets.

## Error handling & edge cases

- **Unknown / stale `id`** on the detail route → a graceful "Asset not found"
  state with a back action (no crash).
- **Missing `content`** (asset never carried text) → detail shows a muted
  "No content yet" placeholder; Share/Copy disabled.
- **Share dismissed/cancelled** → no state change, no error surfaced.
- **Empty Cargo** → existing `EmptyState` with "Open Foundry".
- **Single open category** at a time keeps the accordion page height manageable;
  collapsing is always available.

## Testing (RNTL)

- **Grid:** renders one card per non-empty category with the correct **count**;
  **hides** categories with zero assets; entirely-empty store shows the empty state.
- **Accordion:** tapping a card reveals its rows; tapping again collapses; opening
  a second category collapses the first.
- **Navigation:** tapping an asset row pushes `/(modals)/cargo-asset/[id]`.
- **Detail:** renders the asset's content; **Share** invokes `Share.share` with the
  asset content; **Copy** invokes clipboard `setStringAsync` with the asset content;
  unknown `id` renders the not-found state.
- **Bundle export:** gathers **only** `flight_ready` assets into the share payload
  and flips them to `exported`; disabled when none are flight-ready.

## Out of scope (this build)

- **Edit content** and **Regenerate** on the detail screen (heavier; deferred).
- Per-asset **save-as-file** / `.zip` packaging (share-based export only for now).
- New Convex queries or schema changes (the existing `assets` data is sufficient).
