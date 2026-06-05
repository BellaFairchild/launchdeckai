/**
 * Signal Deck modal — render + behavior tests.
 *
 * Covers (Docs/11):
 *   1. All 16 signal labels + all 3 phase titles render in list view.
 *   2. X/16 ready count reflects seeded flight-ready assets.
 *   3. Cadet: pressing "Transmit Sequence" shows paywall, does NOT call exportSignalPack.
 *   4. Commander: pressing "Transmit Sequence" calls exportSignalPack, does NOT show paywall.
 *
 * Real text:
 *   Transmit button label : "Transmit Sequence"
 *   Ready count format    : "{n}/16 ready"
 *   Paywall heading       : "Export needs Commander."
 */
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react-native";
import { useMissionStore } from "@/store/mission";
import { useUIStore } from "@/store/ui";
import { SIGNAL_TEMPLATES, SIGNAL_PHASES, TOTAL_SIGNALS } from "@/constants/signalTemplates";

const mockPush = jest.fn();

// ── expo-router ───────────────────────────────────────────────────────────────
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));

// ── react-native-reanimated (native worklet init throws under jest) ───────────
jest.mock("react-native-reanimated", () => {
  const { ScrollView, View } = require("react-native");
  return {
    __esModule: true,
    default: { ScrollView, View, createAnimatedComponent: (c: unknown) => c },
  };
});

// ── @/tw (react-native-css pass-through) ──────────────────────────────────────
jest.mock("@/tw", () => {
  const RN = require("react-native");
  return {
    View: RN.View,
    Text: RN.Text,
    Pressable: RN.Pressable,
    ScrollView: RN.ScrollView,
    TextInput: RN.TextInput,
    useCSSVariable: () => "",
  };
});

// ── GradientView (uses react-native-svg) ──────────────────────────────────────
jest.mock("@/components/ui/GradientView", () => ({
  GradientView: () => null,
}));

// ── Icon (uses react-native-svg) ─────────────────────────────────────────────
jest.mock("@/components/ui/Icon", () => {
  const { Text } = require("react-native");
  return { Icon: (props: any) => <Text testID={`icon-${props.name}`} /> };
});

// ── SignalCalendar — complex child with its own calendar lib, not under test ──
jest.mock("@/components/signal/SignalCalendar", () => {
  const { View, Text } = require("react-native");
  return {
    SignalCalendar: () => (
      <View testID="signal-calendar">
        <Text>SignalCalendar</Text>
      </View>
    ),
  };
});

// ── SignalActions — child with BroadcastScheduler / notifications deps ────────
jest.mock("@/components/signal/SignalActions", () => {
  const { View, Text } = require("react-native");
  return {
    SignalActions: ({ signalId }: { signalId: string }) => (
      <View testID={`signal-actions-${signalId}`}>
        <Text>SignalActions</Text>
      </View>
    ),
  };
});

// ── exportSignalPack (native file-system + JSZip, must not run in tests) ──────
const mockExportSignalPack = jest.fn(async () => [] as string[]);
jest.mock("@/lib/exportSignalPack", () => ({
  exportSignalPack: (...args: unknown[]) => mockExportSignalPack(...args),
}));

// ── analytics (fire-and-forget fetch, irrelevant to render assertions) ────────
jest.mock("@/lib/analytics", () => ({ track: jest.fn() }));

// ── @/lib/launch (pure helpers — real implementation is fine, but mock to keep
//    output deterministic regardless of Date.now()) ───────────────────────────
jest.mock("@/lib/launch", () => ({
  tMinus: () => ({ hasDate: true, days: 14, label: "T-14" }),
  formatLaunchDate: () => "Jun 20, 2026",
}));

// ── playSignalTransmit (audio, already stubbed globally for playSignature) ────
// jest.setup.js already stubs all @/lib/audio exports, so no extra mock needed.

import SignalDeckModal from "./signal-deck";
import type { Asset } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LAUNCH_DATE = Date.now() + 14 * 24 * 60 * 60 * 1000;

const BASE_MISSION = {
  id: "m_test",
  appName: "TestApp",
  appDescription: "A test app",
  oneLiner: "Test one-liner",
  targetAudience: "Developers",
  platform: "ios" as const,
  launchDate: LAUNCH_DATE,
  stage: "store_prep" as const,
  status: "active" as const,
  readinessScore: 0,
};

function makeAsset(id: string, signalId: string, status: Asset["status"]): Asset {
  return {
    id,
    type: "signal_asset",
    title: `Asset ${id}`,
    status,
    category: "social",
    signalId,
    updatedAt: 0,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  // Reset module-level launchChimePlayed flag via re-importing won't work;
  // audio.playSignature is already mocked globally so it's safe to let it fire.
  useMissionStore.setState({
    mission: BASE_MISSION,
    assets: [],
    convex: null,
    broadcasts: [],
  });
  useUIStore.setState({ plan: "cadet" });
});

// ---------------------------------------------------------------------------
// Test 1: All 16 signal labels + 3 phase titles render
// ---------------------------------------------------------------------------

describe("list view renders all signals and phases", () => {
  it("renders all 3 phase titles", () => {
    render(<SignalDeckModal />);
    for (const phase of SIGNAL_PHASES) {
      expect(screen.getByText(phase.title)).toBeTruthy();
    }
  });

  it("renders all 16 signal labels", () => {
    render(<SignalDeckModal />);
    for (const signal of SIGNAL_TEMPLATES) {
      expect(screen.getByText(signal.label)).toBeTruthy();
    }
  });

  it(`renders exactly ${TOTAL_SIGNALS} signal labels`, () => {
    render(<SignalDeckModal />);
    // Each label is unique — length of SIGNAL_TEMPLATES validates TOTAL_SIGNALS = 16
    expect(SIGNAL_TEMPLATES).toHaveLength(16);
    for (const signal of SIGNAL_TEMPLATES) {
      expect(screen.getByText(signal.label)).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// Test 2: Ready count reflects seeded flight-ready assets
// ---------------------------------------------------------------------------

describe("ready count", () => {
  it("shows 0/16 ready when no assets are linked", () => {
    useMissionStore.setState({ assets: [] });
    render(<SignalDeckModal />);
    expect(screen.getByText("0/16 ready")).toBeTruthy();
  });

  it("shows 2/16 ready when 2 flight-ready assets are seeded", () => {
    useMissionStore.setState({
      assets: [
        makeAsset("a1", "pre_1", "flight_ready"),
        makeAsset("a2", "day_3", "flight_ready"),
      ],
    });
    render(<SignalDeckModal />);
    expect(screen.getByText("2/16 ready")).toBeTruthy();
  });

  it("counts exported as flight_ready in the ready count", () => {
    useMissionStore.setState({
      assets: [
        makeAsset("a1", "pre_1", "flight_ready"),
        makeAsset("a2", "day_1", "exported"),
        makeAsset("a3", "post_4", "in_prep"),
      ],
    });
    render(<SignalDeckModal />);
    expect(screen.getByText("2/16 ready")).toBeTruthy();
  });

  it("does NOT count in_prep or needs_clearance in the ready count", () => {
    useMissionStore.setState({
      assets: [
        makeAsset("a1", "pre_1", "in_prep"),
        makeAsset("a2", "day_3", "needs_clearance" as Asset["status"]),
      ],
    });
    render(<SignalDeckModal />);
    expect(screen.getByText("0/16 ready")).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Test 3: Cadet — paywall shown, exportSignalPack NOT called
// ---------------------------------------------------------------------------

describe("cadet plan — Transmit Sequence opens paywall", () => {
  beforeEach(() => {
    useUIStore.setState({ plan: "cadet" });
  });

  it("shows the 'Export needs Commander.' hint text below the button", () => {
    render(<SignalDeckModal />);
    expect(screen.getByText("Export needs Commander. Tap to upgrade.")).toBeTruthy();
  });

  it("pressing Transmit Sequence shows the paywall heading", async () => {
    render(<SignalDeckModal />);
    fireEvent.press(screen.getByText("Transmit Sequence"));
    await waitFor(() => {
      expect(screen.getByText("Export needs Commander.")).toBeTruthy();
    });
  });

  it("pressing Transmit Sequence does NOT call exportSignalPack", async () => {
    render(<SignalDeckModal />);
    fireEvent.press(screen.getByText("Transmit Sequence"));
    // Give async path time to run (it won't, but we confirm the mock stays clean)
    await act(async () => {});
    expect(mockExportSignalPack).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Test 4: Commander — exportSignalPack called, paywall NOT shown
// ---------------------------------------------------------------------------

describe("commander plan — Transmit Sequence calls export", () => {
  beforeEach(() => {
    useUIStore.setState({ plan: "commander" });
    useMissionStore.setState({
      mission: BASE_MISSION,
      assets: [makeAsset("a1", "pre_1", "flight_ready")],
      convex: null,
    });
  });

  it("does NOT show paywall hint text when plan is commander", () => {
    render(<SignalDeckModal />);
    expect(screen.queryByText("Export needs Commander. Tap to upgrade.")).toBeNull();
  });

  it("pressing Transmit Sequence calls exportSignalPack with correct args", async () => {
    render(<SignalDeckModal />);
    fireEvent.press(screen.getByText("Transmit Sequence"));
    await waitFor(() => {
      expect(mockExportSignalPack).toHaveBeenCalledTimes(1);
    });
    const [calledAssets, calledLaunchDate, calledAppName] = mockExportSignalPack.mock.calls[0];
    expect(calledAppName).toBe("TestApp");
    expect(calledLaunchDate).toBe(LAUNCH_DATE);
  });

  it("pressing Transmit Sequence does NOT show the paywall", async () => {
    render(<SignalDeckModal />);
    fireEvent.press(screen.getByText("Transmit Sequence"));
    await waitFor(() => {
      expect(mockExportSignalPack).toHaveBeenCalled();
    });
    // Paywall heading must NOT appear
    expect(screen.queryByText("Export needs Commander.")).toBeNull();
  });
});
