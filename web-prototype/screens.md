# LaunchDeckAI — Interface Screen & System Architecture

> **Web prototype only.** This document describes the React + Vite simulator in
> `web-prototype/`. The canonical mobile v1 nav is
> `Deck | Missions | AI Copilot Orb | Blueprints | Foundry` with Signal Deck and
> Cargo Bay in the drawer — see [`../Docs/04_INFORMATION_ARCHITECTURE_NAVIGATION.md`](../Docs/04_INFORMATION_ARCHITECTURE_NAVIGATION.md).

LaunchDeckAI is an immersive, high-fidelity app launch dashboard styled with a futuristic, multi-layered cosmic spacecraft cockpit. This document maps out the system's screen architecture, detailing each module, its feature-set, and the unified cargo/signals synchronization workflow.

---

## 🗺️ System Navigation Map

The user pilots their launch from the **Dynamic Bottom Navigation Bar**, utilizing the central **Navigation Orb** to spark system intelligence, and managing account configurations via the **Slideout Master Command Drawer**.

```
                           +-------------------+
                           | LaunchDeck Topbar |
                           +---------+---------+
                                     |
                                     v
                       +-------------+-------------+
                       |    Slideout Command menu  | ... (Accesses Settings)
                       +--+---------------+-----+--+
                          |               |     |
                 (Modals) |               |     | (Ancillary Hubs)
                          v               |     v
                 +--------+-------+       |   +-------------------+
                 | Profile Modal  |       |   | Blueprints Modal  |
                 | Support Center |       |   +-------------------+
                 +----------------+       |
                                          v
                              +-----------+-----------+
                              |   Refuel Station Hub  |
                              +-----------------------+

                                 BOTTOM VIEWPORTS
  +-------------------------------------------------------------------------------+
  |   [DECK]   |   [MISSIONS]   |   [FOUNDRY]   |    [CARGO]    |   [SIGNALS]   |
  |  Command   |    Strategic   |  Fuel Forging |  Asset Storage|  Marketing    |
  | Dashboard  |    Roadmap     |    Engine     |     Vault     | Transmissions |
  +----------------------+----------------------+---------------------------------+
                         | (At Center Console)
                         v
              +----------------------+
              |  Master Nav Orb      | ---> Launches [Copilot AI] Dialog
              +----------------------+
```

---

## 🖥️ 1. Core Viewport Screens

### 🌌 A. Launch Sequence Deck (`DeckScreen.tsx`)
The centerpiece of the cockpit—serving as the application's visual command center. It offers real-time cockpit telemetry and coordinates overall launch progress.
* **Launch Sequence Chronometer**: Tracks the exact T-minus countdown (Days, Hours, Minutes, Seconds) until the designated blastoff date.
* **Dynamic Flight-Readiness Score (%)**: An interactive visual metric gauging absolute launch readiness, calculated dynamically based on completed Roadmap milestones.
* **Orbit Parallax Background Engine**: Multiple layered, staggered astronomical vector rings spinning autonomously at slow speeds to simulate continuous cosmic drift.
* **Visual Starfield Canopy**: A custom physics-modeled particle field containing over 60 stars of varying scale and luminance, outfitted with gentle random twinkling delay intervals.
* **Target Info Terminal**: Displays a comprehensive overview of the active checkpoint, letting pilots mark objectives as verified or trigger emergency resets.
* **Acoustic Synthesizer Feedback**: Features lightweight triangle and sine wave audio generation on task checking and navigation, avoiding asset overhead while reinforcing interactivity.
* **Level-Triggered Celebrating Ignition Confetti**: Upon triggering "IGNITION", a progressive color spectrum (cyan, purple, gold, magenta) and particle quantity scale up dynamically according to the user's current level.

---

### 🛡️ B. Mission Roadblocks (`MissionScreen.tsx`)
This is the strategic planner where the user maps out their timeline milestones, establishes clear objectives, and sets the definitive target date.
* **Adaptive Progress Indicator**: Provides live system ratings of progress velocity (e.g., "Launch ready!", "Building momentum") paired with matching radar color codes.
* **Launch Clock Override**: Includes an intuitive date selector for rescheduling the central launch date and projecting T-minus intervals instantly.
* **Chronological Milestones Grid**: Segregates critical launch objectives into operational zones:
  - **Foundation**: Pitch, core architecture, configurations.
  - **Assets**: Visual creatives, metadata packets, copywriting.
  - **Store Prep**: Testing loops, regulatory checklists.
* **State Serialization Layer**: Writes milestones to `localStorage` to ensure flight checklists survive browser restarts.

---

### 📡 C. Marketing Broadcast Feed (`SignalsScreen.tsx`)
The broadcast deck regulates outbound digital transmissions, schedules marketing plans, and charts analytics.
* **Transmission Filter Matrix**: Categorizes all broadcast directives across five streams: *All*, *Drafts*, *Scheduled*, *Broadcasted*, and *Templates*.
* **Display Viewports**:
  - **List Layout**: Renders draggable cards with sharing commands and structural controls.
  - **Calendar Grid**: Plots schedules along a reactive visual grid tracking prospective calendar dates.
* **Simulated Telemetry Analytics**: Fades glowing teal Recharts curves (`AreaChart`) showing click metrics, views, and channel distributions.
* **Predictive AI Advisor**: Features analyzing logic with high-tech spinning prompts that diagnose content quality and suggest adaptations tailored to specific networks (e.g., X, LinkedIn, Thread relays).

---

### 📦 D. Release Cargo Hub (`CargoScreen.tsx`)
The storage bay hosting the legal artifacts, assets, copy blocks, and visual designs required for the release.
* **Bento Grid Storage Cabinets**: Color-coded categorization files separating folders for *Identity App Assets*, *Copy & Metadata*, *App Store Visuals*, and *Legal Releases*.
* **Drag-and-Drop Zone**: Implements drag-and-drop file imports alongside standard click-to-pick workflows.
* **Payload Metrics**: Computes physical counters of current files loaded, assets verified, and pending items requiring correction.

---

### 🧪 E. Blueprint Foundry (`FoundryScreen.tsx`)
A fuel-powered content fabrication engine that converts raw fuel tokens into written assets.
* **Asset Forging Terminals**: Seven micro-tools that programmatically draft App Store Descriptions, Social Launch Threads, Privacy Policies, Press Releases, and App Ideations.
* **Progressive Forging Sequences**: Uses state delays and animated loading spinners to simulate heavy mechanical printing before outputting copy blocks.
* **PDF Exporter**: Integrates client-side export scripts to format forged documents layout-cleanly into physical PDFs.
* **Plan Restriction Gates**: Unlocks more sophisticated industrial tools (like viral video script drafting) as the pilot upgrades clearance packages.

---

### ⚙️ F. Settings Telemetry (`SettingsScreen.tsx`)
The utility subscreen for updating profile definitions, core parameters, target demographics, and primary release devices.

---

## 🗲 2. Interactive Modals & Auxiliaries

* **Master Navigation Orb (`BottomNav.tsx`)**
  At the exact center of the bottom tabs floats a glowing, high-integrity orb with double background blur filters and orbiting micro-stars. Clicking it accesses the Copilot Dialog.
* **Copilot Virtual Assistant (`CopilotModal.tsx`)**
  An AI overlay supporting voice recognition and speech synthesis, allowing pilots to ask system questions or use click-prompts.
* **Refueling Station (`RefuelModal.tsx`)**
  The commercial tier selector where pilots view an analog Fuel Circular Gauge and purchase fuel blocks or upgrade roles (Cadet, Commander, Admiral).
* **App Blueprints Gallery (`BlueprintsModal.tsx`)**
  A conceptual layout index demonstrating gorgeous, futuristic app launch interface mockups.
* **Pioneer Profile (`ProfileModal.tsx`)**
  A high-tech terminal card summarizing level, current logon streak, and active credentials.
* **Diagnostic Distress Grid (`SupportModal.tsx`)**
  An emergency support ticket portal styled to resemble a spaceship distress communications relay.

---

## 🔗 3. The Central Spark: The Signals Ecosystem

The **Signals** module does not operate in isolation; it serves as the active nervous system coordinating with **Deck**, **Missions**, **Foundry**, and **Cargo** to move an app from idea to orbit.

```
       [ FOUNDRY ]  ---------- (Forges copy & content) --------->+
            |                                                     |
            v (consumes fuel)                                     v
       [ REFUEL STATION ]                                    [ CARGO BAY ]
                                                                  |
                                                     (Assets stored & verified)
                                                                  |
       [ DECK SCREEN ] <--- (Calculates score & T-minus) <--------+
            ^                                                     |
            |                                                     |
            v (checks alignment)                                  v
       [ ROADBLOCKS ] <---- (Sets target milestone dates) ----> [ SIGNALS ]
                                                             (Schedules, refines
                                                              & fires broadcast)
```

### 🤝 How Signals Synergizes with the Cockpit:

1. **Foundry ➔ Signals (The Creative Spark)**
   Raw ideas are shaped in the *Foundry* into launch announcements or product updates. Once forged, these blueprints are imported directly into *Signals* as rich draft campaigns.
2. **Signals ➔ Cargo (The Asset Payload)**
   Before any campaign is scheduled, the corresponding imagery, marketing assets, and graphic designs are logged and tracked in the *Cargo* bay. *Signals* checks the *Cargo* database to ensure that every planned launch asset is cleared and stored.
3. **Missions ➔ Signals (Strategic Timeline)**
   *Roadblock Milestones* lay out exactly when store pages go live, when testing starts, and when launch week begins. *Signals* coordinates marketing dates to align with these milestones.
4. **Signals ➔ Deck (Cockpit Telemetry)**
   The central *Dashboard Readiness Score* is an aggregate index of preparation. Completing and launching marketing transmissions in *Signals* updates the core progress bars on the main *Deck Screen*, feeding the ignition countdown toward zero.

This interconnected chain guides the user through the workspace, making app launching cohesive and structured!
