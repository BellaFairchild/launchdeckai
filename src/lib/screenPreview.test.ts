import { allowUnauthedScreenPreview } from "./screenPreview";

describe("allowUnauthedScreenPreview", () => {
  it("allows preview on web in development", () => {
    expect(allowUnauthedScreenPreview("web", true)).toBe(true);
  });

  it("stays off on native even in development", () => {
    expect(allowUnauthedScreenPreview("ios", true)).toBe(false);
    expect(allowUnauthedScreenPreview("android", true)).toBe(false);
  });

  it("stays off in production web builds", () => {
    expect(allowUnauthedScreenPreview("web", false)).toBe(false);
  });
});
