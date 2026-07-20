/**
 * Store-level tests: asset status transitions and signal linkage.
 *
 * We seed `convex: null` so every mutation takes the local path
 * (set → assets array), not the Convex adapter path.
 */
import { useMissionStore } from "@/store/mission";
import type { Asset } from "@/types";

beforeEach(() => {
  // Reset to a clean slate: no convex adapter, empty assets list.
  useMissionStore.setState({ convex: null, assets: [] });
});

// ---------------------------------------------------------------------------
// addAsset
// ---------------------------------------------------------------------------

it("addAsset adds the asset to the store and returns a string id", () => {
  const input: Omit<Asset, "id" | "updatedAt"> = {
    type: "social_blast",
    title: "Launch tweet",
    status: "in_prep",
    category: "social",
  };

  const id = useMissionStore.getState().addAsset(input);

  expect(typeof id).toBe("string");
  expect(id.length).toBeGreaterThan(0);

  const { assets } = useMissionStore.getState();
  expect(assets).toHaveLength(1);
  expect(assets[0].id).toBe(id);
  expect(assets[0].title).toBe("Launch tweet");
  expect(assets[0].status).toBe("in_prep");
  expect(assets[0].category).toBe("social");
  expect(assets[0].type).toBe("social_blast");
});

it("addAsset stamps updatedAt with a recent timestamp", () => {
  const before = Date.now();
  const id = useMissionStore.getState().addAsset({
    type: "app_store_copy",
    title: "Store desc",
    status: "in_prep",
    category: "app_store",
  });
  const after = Date.now();

  const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
  expect(asset.updatedAt).toBeGreaterThanOrEqual(before);
  expect(asset.updatedAt).toBeLessThanOrEqual(after);
});

it("addAsset prepends new assets (most recent first)", () => {
  useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "First",
    status: "in_prep",
    category: "social",
  });
  useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "Second",
    status: "in_prep",
    category: "social",
  });

  const { assets } = useMissionStore.getState();
  expect(assets[0].title).toBe("Second");
  expect(assets[1].title).toBe("First");
});

it("successive addAsset calls produce distinct ids", () => {
  const id1 = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "A",
    status: "in_prep",
    category: "social",
  });
  const id2 = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "B",
    status: "in_prep",
    category: "social",
  });

  expect(id1).not.toBe(id2);
});

// ---------------------------------------------------------------------------
// updateAssetStatus
// ---------------------------------------------------------------------------

it("updateAssetStatus changes status to flight_ready (local path, convex: null)", () => {
  const id = useMissionStore.getState().addAsset({
    type: "app_store_copy",
    title: "Store description",
    status: "in_prep",
    category: "app_store",
  });

  useMissionStore.getState().updateAssetStatus(id, "flight_ready");

  const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
  expect(asset.status).toBe("flight_ready");
});

it("updateAssetStatus refreshes updatedAt on status change", () => {
  const id = useMissionStore.getState().addAsset({
    type: "app_store_copy",
    title: "Store description",
    status: "in_prep",
    category: "app_store",
  });

  const before = Date.now();
  useMissionStore.getState().updateAssetStatus(id, "flight_ready");
  const after = Date.now();

  const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
  expect(asset.updatedAt).toBeGreaterThanOrEqual(before);
  expect(asset.updatedAt).toBeLessThanOrEqual(after);
});

it("updateAssetStatus cycles through the full status union", () => {
  const id = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "Thread",
    status: "in_prep",
    category: "social",
  });

  const statuses: Asset["status"][] = [
    "needs_clearance",
    "flight_ready",
    "exported",
    "not_loaded",
    "in_prep",
  ];

  for (const s of statuses) {
    useMissionStore.getState().updateAssetStatus(id, s);
    const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
    expect(asset.status).toBe(s);
  }
});

it("updateAssetStatus only changes the targeted asset", () => {
  const id1 = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "A",
    status: "in_prep",
    category: "social",
  });
  const id2 = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "B",
    status: "in_prep",
    category: "social",
  });

  useMissionStore.getState().updateAssetStatus(id1, "flight_ready");

  const asset2 = useMissionStore.getState().assets.find((a) => a.id === id2)!;
  expect(asset2.status).toBe("in_prep");
});

// ---------------------------------------------------------------------------
// Signal-linked assets
// ---------------------------------------------------------------------------

it("a signal-linked asset retains signalId, signalLabel, and signalPhase after add", () => {
  const id = useMissionStore.getState().addAsset({
    type: "email_sequence",
    title: "Waitlist email",
    status: "flight_ready",
    category: "pr",
    signalId: "pre_4",
    signalLabel: "Waitlist email teaser",
    signalPhase: "pre_launch",
  });

  const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
  expect(asset.signalId).toBe("pre_4");
  expect(asset.signalLabel).toBe("Waitlist email teaser");
  expect(asset.signalPhase).toBe("pre_launch");
});

it("signal linkage fields survive a status update", () => {
  const id = useMissionStore.getState().addAsset({
    type: "social_blast",
    title: "Launch thread",
    status: "in_prep",
    category: "social",
    signalId: "day_3",
    signalLabel: "X/Twitter launch thread",
    signalPhase: "launch_day",
  });

  useMissionStore.getState().updateAssetStatus(id, "flight_ready");

  const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
  expect(asset.status).toBe("flight_ready");
  expect(asset.signalId).toBe("day_3");
  expect(asset.signalLabel).toBe("X/Twitter launch thread");
  expect(asset.signalPhase).toBe("launch_day");
});

it("an asset without signal fields has undefined signalId/signalLabel/signalPhase", () => {
  const id = useMissionStore.getState().addAsset({
    type: "video_script",
    title: "Promo video",
    status: "in_prep",
    category: "media",
  });

  const asset = useMissionStore.getState().assets.find((a) => a.id === id)!;
  expect(asset.signalId).toBeUndefined();
  expect(asset.signalLabel).toBeUndefined();
  expect(asset.signalPhase).toBeUndefined();
});

// ---------------------------------------------------------------------------
// Convex adapter delegation (does NOT call local set)
// ---------------------------------------------------------------------------

it("updateAssetStatus delegates to convex.updateAssetStatus when adapter is set", () => {
  const updateAssetStatus = jest.fn();
  useMissionStore.setState({
    convex: {
      updateAssetStatus,
      completeMilestone: jest.fn(),
      saveBlueprint: jest.fn(),
      createFoundryAsset: jest.fn(),
      scheduleBroadcast: jest.fn(),
      cancelBroadcast: jest.fn(),
    },
    assets: [
      {
        id: "a_existing",
        type: "social_blast",
        title: "Tweet",
        status: "in_prep",
        category: "social",
        updatedAt: 0,
      },
    ],
  });

  useMissionStore.getState().updateAssetStatus("a_existing", "flight_ready");

  // Adapter called with correct args
  expect(updateAssetStatus).toHaveBeenCalledWith("a_existing", "flight_ready");
  // Local assets array is NOT mutated when convex is set
  const asset = useMissionStore.getState().assets.find((a) => a.id === "a_existing")!;
  expect(asset.status).toBe("in_prep");
});
