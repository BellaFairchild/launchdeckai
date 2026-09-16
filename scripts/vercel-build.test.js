const packageJson = require("../package.json");
const fs = require("fs");
const path = require("path");

describe("Vercel build configuration", () => {
  it("exports the Expo web bundle through the default build script", () => {
    expect(packageJson.scripts.build).toBe("expo export --platform web");
  });

  it("publishes the Expo static export directory", () => {
    const vercelConfigPath = path.join(__dirname, "..", "vercel.json");

    expect(fs.existsSync(vercelConfigPath)).toBe(true);
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, "utf8"));
    expect(vercelConfig.outputDirectory).toBe("dist");
  });
});
