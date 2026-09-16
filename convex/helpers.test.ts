import { parseDestinationUrl } from "./helpers";

describe("parseDestinationUrl", () => {
  it.each([
    "javascript:alert(1)",
    "data:text/html,hello",
    "https://user:pass@evil.example/path",
    "https://localhost/path",
    "https://example.com/a b",
  ])("rejects unsafe broadcast destination %s", (value) => {
    expect(() => parseDestinationUrl(value)).toThrow("Invalid destination URL");
  });

  it("normalizes a safe bare domain", () => {
    expect(parseDestinationUrl("launchdeck.ai/signal")).toBe(
      "https://launchdeck.ai/signal",
    );
  });
});
