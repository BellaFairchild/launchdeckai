import { useMissionStore } from "./mission";

const PLAN = { signalId: "pre_1", destinationUrl: "https://x.com/compose", scheduledAt: 1000 };

beforeEach(() => {
  useMissionStore.setState({ convex: null, broadcasts: [] });
});

describe("mission store broadcasts (demo mode)", () => {
  it("scheduleBroadcast adds a plan", () => {
    useMissionStore.getState().scheduleBroadcast(PLAN);
    expect(useMissionStore.getState().broadcasts).toEqual([PLAN]);
  });

  it("scheduleBroadcast replaces the plan for the same signal", () => {
    useMissionStore.getState().scheduleBroadcast(PLAN);
    const updated = { ...PLAN, destinationUrl: "https://buffer.com", scheduledAt: 2000 };
    useMissionStore.getState().scheduleBroadcast(updated);
    expect(useMissionStore.getState().broadcasts).toEqual([updated]);
  });

  it("cancelBroadcast removes the plan", () => {
    useMissionStore.getState().scheduleBroadcast(PLAN);
    useMissionStore.getState().cancelBroadcast("pre_1");
    expect(useMissionStore.getState().broadcasts).toEqual([]);
  });
});
