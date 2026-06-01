/**
 * Generate app icon + splash + favicon from the branding sources in
 * assets/branding/. Run: node scripts/gen-branding.js
 *
 *   assets/branding/icon-source.png -> assets/images/icon.png (1024, opaque)
 *                                       assets/images/adaptive-icon.png (1024)
 *                                       assets/images/favicon.png (48)
 *   assets/branding/logo-full.png   -> assets/images/splash-icon.png (trimmed)
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "assets", "branding");
const OUT = path.join(ROOT, "assets", "images");
const DARK = "#0B0A0F"; // opaque backdrop for iOS icon (no alpha allowed)

async function squareIcon(input, size, out, flatten) {
  const img = sharp(input);
  const meta = await img.metadata();
  const side = Math.min(meta.width, meta.height);
  const left = Math.round((meta.width - side) / 2);
  const top = Math.round((meta.height - side) / 2);
  let pipe = sharp(input).extract({ left, top, width: side, height: side }).resize(size, size);
  if (flatten) pipe = pipe.flatten({ background: DARK });
  await pipe.png().toFile(out);
  console.log("wrote", path.relative(ROOT, out));
}

async function splashFromLogo(input, out) {
  // Trim transparent margins, then fit inside a 1024 square (keep transparency).
  await sharp(input)
    .trim()
    .resize(1024, 1024, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log("wrote", path.relative(ROOT, out));
}

(async () => {
  const iconSrc = path.join(SRC, "icon-source.png");
  const logoSrc = path.join(SRC, "logo-full.png");
  if (!fs.existsSync(iconSrc)) throw new Error("Missing assets/branding/icon-source.png");

  await squareIcon(iconSrc, 1024, path.join(OUT, "icon.png"), true);
  await squareIcon(iconSrc, 1024, path.join(OUT, "adaptive-icon.png"), true);
  await squareIcon(iconSrc, 48, path.join(OUT, "favicon.png"), true);

  if (fs.existsSync(logoSrc)) {
    await splashFromLogo(logoSrc, path.join(OUT, "splash-icon.png"));
  } else {
    console.log("note: logo-full.png missing — splash uses icon instead");
    await squareIcon(iconSrc, 1024, path.join(OUT, "splash-icon.png"), true);
  }
  console.log("done");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
