/**
 * Slice the nav-icons sheet (assets/branding/nav-icons.png) into per-tab icons.
 * Sheet = 5 columns (deck, missions, astro, blueprints, foundry) x 2 rows
 * (top = active/colored, bottom = inactive/grey). White background is removed
 * via an edge-connected flood fill (interior whites like the helmet highlights
 * and the blueprint scroll are preserved). Output: 96x96 transparent PNGs in
 * assets/images/nav/.   Run: node scripts/gen-nav-icons.js
 */
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ROOT = path.resolve(__dirname, "..");
const SRC = path.join(ROOT, "assets", "branding", "nav-icons.png");
const OUT = path.join(ROOT, "assets", "images", "nav");

const COLS = ["deck", "missions", "astro", "blueprints", "foundry"];
// Icon bands as fractions of the full sheet height (exclude the label text row).
const ACTIVE = { top: 0.05, bottom: 0.45 };
const INACTIVE = { top: 0.58, bottom: 0.98 };
// A pixel is "background" if it's near-pure-white (cream/grey icons are darker).
const isWhite = (r, g, b) => r >= 246 && g >= 246 && b >= 246;

function knockoutBackground(data, w, h) {
  const visited = new Uint8Array(w * h);
  const stack = [];
  const pushIf = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    const i = p * 4;
    if (!isWhite(data[i], data[i + 1], data[i + 2])) return;
    visited[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) {
    pushIf(x, 0);
    pushIf(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIf(0, y);
    pushIf(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop();
    data[p * 4 + 3] = 0; // transparent
    const x = p % w;
    const y = (p - x) / w;
    pushIf(x + 1, y);
    pushIf(x - 1, y);
    pushIf(x, y + 1);
    pushIf(x, y - 1);
  }
}

async function cell(meta, colIndex, band, out) {
  const colW = meta.width / COLS.length;
  const left = Math.round(colIndex * colW);
  const top = Math.round(band.top * meta.height);
  const width = Math.round(colW);
  const height = Math.round((band.bottom - band.top) * meta.height);

  const { data, info } = await sharp(SRC)
    .extract({ left, top, width, height })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  knockoutBackground(data, info.width, info.height);

  const png = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  await sharp(png)
    .trim({ threshold: 10 })
    .resize(96, 96, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out);
  console.log("wrote", path.relative(ROOT, out));
}

(async () => {
  if (!fs.existsSync(SRC)) throw new Error("Missing assets/branding/nav-icons.png");
  fs.mkdirSync(OUT, { recursive: true });
  const meta = await sharp(SRC).metadata();
  for (let i = 0; i < COLS.length; i++) {
    await cell(meta, i, ACTIVE, path.join(OUT, `${COLS[i]}-active.png`));
    await cell(meta, i, INACTIVE, path.join(OUT, `${COLS[i]}-inactive.png`));
  }
  console.log("done");
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
