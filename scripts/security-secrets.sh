#!/usr/bin/env bash
# Local + CI secret scan. Source trees only — lockfile integrity hashes
# false-positive as AWS keys under the pattern engine.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RAFTER=(npx --yes @rafter-security/cli)

"${RAFTER[@]}" secrets src
"${RAFTER[@]}" secrets convex
"${RAFTER[@]}" secrets scripts
"${RAFTER[@]}" secrets .env.example
"${RAFTER[@]}" secrets web-prototype/src
"${RAFTER[@]}" secrets web-prototype/.env.example
"${RAFTER[@]}" secrets web-prototype/firebase-applet-config.json
