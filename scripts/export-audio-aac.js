/**
 * Converts every WAV under assets/audio/ to a sibling .m4a (AAC) via ffmpeg.
 * Requires ffmpeg on PATH. Skips files that already have a newer .m4a.
 *
 * Usage: node scripts/export-audio-aac.js
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const AUDIO_ROOT = path.join(__dirname, "..", "assets", "audio");

// Prefer the repo-local static binary; fall back to ffmpeg on PATH.
let FFMPEG = "ffmpeg";
try {
  const staticPath = require("ffmpeg-static");
  if (staticPath) FFMPEG = staticPath;
} catch {
  /* ffmpeg-static not installed — use PATH */
}

function hasFfmpeg() {
  const r = spawnSync(FFMPEG, ["-version"], { encoding: "utf8" });
  return r.status === 0;
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.name.endsWith(".wav")) acc.push(p);
  }
  return acc;
}

if (!hasFfmpeg()) {
  console.error("ffmpeg not found. Install ffmpeg or ship .wav masters in the bundle.");
  process.exit(1);
}

const wavs = walk(AUDIO_ROOT);
if (wavs.length === 0) {
  console.error("No WAV files under assets/audio/. Run: node scripts/generate-audio-assets.js");
  process.exit(1);
}

for (const wav of wavs) {
  const m4a = wav.replace(/\.wav$/i, ".m4a");
  const wavStat = fs.statSync(wav);
  if (fs.existsSync(m4a) && fs.statSync(m4a).mtimeMs >= wavStat.mtimeMs) {
    console.log("skip (up to date)", path.relative(AUDIO_ROOT, m4a));
    continue;
  }
  const isAmbient = wav.includes(`${path.sep}ambient${path.sep}`);
  const bitrate = isAmbient ? "128k" : "96k";
  execSync(
    `"${FFMPEG}" -y -i "${wav}" -c:a aac -b:a ${bitrate} -ar 48000 -ac ${isAmbient ? 2 : 1} "${m4a}"`,
    { stdio: "inherit" },
  );
  console.log("exported", path.relative(AUDIO_ROOT, m4a));
}

console.log("\nUpdate src/lib/audioAssets.ts to prefer .m4a requires when present.");
