# LaunchDeckAI — Antigravity Agent Development Workflow

This document sets the hard developer standards, directory structures, verification loops, and quality control routines to follow when updating or modifying the LaunchDeckAI codebase.

---

## 1. Local Dev Environment Constraints

### Ingress Port Control
*   **Port 3000** is the exclusively exposed container port using the external reverse proxy.
*   **DO NOT** configuration-override the port. Keep all dev server setups targeted strictly onto port `3000` (`0.0.0.0:3000`).

### Hot Module Replacement (HMR) is Disabled
*   Because files are updated incrementally, the preview does not reload instantly. A full reload is triggered upon turn completions.
*   Disregard browser developer console errors concerning WebSocket connectivity (`[vite] failed to connect to websocket`).

---

## 2. Directory & Structure Rules

Adhere to the single-view-centric clean separation of concerns:

*   `/index.html`: Base entry point for HTML frame mounting.
*   `/src/main.tsx`: Standard React root connector bootstrap.
*   `/src/App.tsx`: Navigation manager, high-level states, modals relay.
*   `/src/types.ts`: Domain models and user state specifications.
*   `/src/index.css`: Global custom styles, displays, backgrounds, animations, and Tailwind imports.
*   `/src/components/`: Directory for individual display modules.
    *   `Drawer.tsx`: Profiling side launcher.
    *   `ProfileModal.tsx`: Badge ribbon status metrics.
    *   `SignalsScreen.tsx`: Launch timeline broadcast sequencer.
    *   `FoundryScreen.tsx`: Dynamic copy and engine modules.

---

## 3. Strict Style & Quality Guidelines

### Typography Consistency
Ensure headings and data tags leverage the precise theme font weight rules:
*   Use `font-display` for main landing display headings (`Syne`).
*   Use `font-body` for lists, UI button controls, descriptions (`Instrument Sans`).
*   Use `font-mono` for timelines, metadata tables, values, tracking dates, codes (`DM Mono`).

### CSS & Custom Overwrite Restraints
*   **Tailwind ONLY**: Style all newly introduced components strictly with Tailwind utility classes.
*   **NO Custom `.css` files**: Do not spawn auxiliary stylesheet documents.
*   **ID Attributes**: Every actionable element (nav buttons, major panels, cards) MUST carry a unique human-literal ID tag (e.g. `id="refuel-station-btn"` or `id="profile-badges-container"`) to ensure targeted script accessibility and styling reliability.

---

## 4. Verification Flow (Critical Loop)

Before handing control back to the Commander, enforce the absolute Verification process:

1.  **Iterative Styling Guard**: Once small-grain edits are complete, run a local syntax audit:
    ```bash
    # Run the codebase audit tool (lint_applet)
    ```
2.  **App Compile Verification**: Check if the application builds cleanly to production parameters:
    ```bash
    # Run the production builder tool (compile_applet)
    ```
3.  **Maximum Refactoring Triage**: If compilation fails, inspect path configurations, missing package definitions, or type imports, fix incrementally, and re-test. Stop if three failed tries happen and clarify with the user.
