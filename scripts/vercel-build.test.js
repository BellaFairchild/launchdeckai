const packageJson = require("../package.json");

describe("Vercel build configuration", () => {
  it("exports the Expo web bundle through the default build script", () => {
    expect(packageJson.scripts.build).toBe("expo export --platform web");
  });
});
