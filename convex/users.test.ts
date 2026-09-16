import { authorizeFoundryGeneration } from "./users";

type FoundryGate = {
  _handler: (
    ctx: {
      auth: { getUserIdentity: () => Promise<{ subject: string }> };
      db: {
        query: () => {
          withIndex: () => { unique: () => Promise<{ plan: string; fuelBalance: number }> };
        };
      };
    },
    args: { tool: string; mode: "standard" | "powerful" },
  ) => Promise<{ ok: boolean; mock?: boolean }>;
};

function contextFor(plan: string, fuelBalance = 100) {
  return {
    auth: {
      getUserIdentity: async () => ({ subject: "clerk-user" }),
    },
    db: {
      query: () => ({
        withIndex: () => ({
          unique: async () => ({ plan, fuelBalance }),
        }),
      }),
    },
  };
}

describe("authorizeFoundryGeneration", () => {
  it("rejects powerful generation for a non-Admiral plan", async () => {
    const gate = authorizeFoundryGeneration as unknown as FoundryGate;

    await expect(
      gate._handler(contextFor("commander"), {
        tool: "social_blast",
        mode: "powerful",
      }),
    ).rejects.toThrow("Plan required");
  });
});
