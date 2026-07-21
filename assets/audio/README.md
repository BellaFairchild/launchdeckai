# LaunchDeckAI audio assets

See [AUDIO.md](../../AUDIO.md) for the full sound design spec.

## Layout

```
assets/audio/
  ui/           # Short UI telemetry (ui_tap, ui_nav, …)
  signature/    # Four signature moments + rare launch day
  brand/        # brand_stinger_launchdeck
  ambient/      # Loop beds (deck, foundry, launch_eve)
```

## Naming

`{category}_{descriptive_name}.wav` → export to `.m4a` for production bundles.

## Generate placeholders

```bash
node scripts/generate-audio-assets.js
```

## Export AAC (optional, requires ffmpeg)

```bash
node scripts/export-audio-aac.js
```

The app loads `.wav` masters from this tree via Metro `require()`. Replace synthesized placeholders with composer masters without renaming IDs.
