import http from "./http";

const expectedSecret = ["expected", "secret"].join("-");

type RevenueCatHandler = {
  _handler: (
    ctx: { runMutation: jest.Mock<Promise<null>, [unknown, unknown]> },
    request: Request,
  ) => Promise<Response>;
};

function revenueCatHandler(): RevenueCatHandler {
  const router = http as unknown as {
    exactRoutes: Map<string, Map<string, RevenueCatHandler>>;
  };
  const handler = router.exactRoutes.get("/revenuecat")?.get("POST");
  if (!handler) throw new Error("RevenueCat route is not registered");
  return handler;
}

describe("RevenueCat webhook", () => {
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env.REVENUECAT_WEBHOOK_SECRET;
    consoleError.mockRestore();
  });

  it("fails closed when no webhook secret is configured", async () => {
    const runMutation = jest.fn();

    const response = await revenueCatHandler()._handler(
      { runMutation },
      new Request("https://example.test/revenuecat", {
        method: "POST",
        body: JSON.stringify({ event: { app_user_id: "user_123" } }),
      }),
    );

    expect(response.status).toBe(401);
    expect(runMutation).not.toHaveBeenCalled();
  });

  it("rejects a mismatched webhook secret", async () => {
    process.env.REVENUECAT_WEBHOOK_SECRET = expectedSecret;
    const runMutation = jest.fn();

    const response = await revenueCatHandler()._handler(
      { runMutation },
      new Request("https://example.test/revenuecat", {
        method: "POST",
        headers: { Authorization: "Bearer incorrect-secret" },
        body: JSON.stringify({ event: { app_user_id: "user_123" } }),
      }),
    );

    expect(response.status).toBe(401);
    expect(runMutation).not.toHaveBeenCalled();
  });
});
