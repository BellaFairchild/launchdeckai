import { isValidDestinationUrl, normalizeDestinationUrl } from "./url";

describe("isValidDestinationUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(isValidDestinationUrl("https://x.com/compose")).toBe(true);
    expect(isValidDestinationUrl("http://producthunt.com/posts/x")).toBe(true);
  });
  it("accepts a bare domain", () => {
    expect(isValidDestinationUrl("buffer.com/queue")).toBe(true);
    expect(isValidDestinationUrl("linkedin.com")).toBe(true);
  });
  it("rejects empty, whitespace, and non-URLs", () => {
    expect(isValidDestinationUrl("")).toBe(false);
    expect(isValidDestinationUrl("   ")).toBe(false);
    expect(isValidDestinationUrl("not a url")).toBe(false);
  });
});

describe("normalizeDestinationUrl", () => {
  it("leaves http(s) URLs untouched", () => {
    expect(normalizeDestinationUrl("https://x.com")).toBe("https://x.com");
  });
  it("prepends https:// to a bare domain", () => {
    expect(normalizeDestinationUrl("buffer.com/queue")).toBe("https://buffer.com/queue");
  });
  it("trims surrounding whitespace", () => {
    expect(normalizeDestinationUrl("  x.com  ")).toBe("https://x.com");
  });
});
