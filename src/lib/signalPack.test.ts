import {
  buildSignalPackRows,
  buildSignalScheduleCsv,
  buildSignalScheduleJson,
  buildSignalPackFiles,
  slugifyLabel,
} from "./signalPack";
import { SIGNAL_TEMPLATES } from "@/constants/signalTemplates";
import type { Asset } from "@/types";

const LAUNCH = new Date("2026-07-01T00:00:00").getTime();

function asset(over: Partial<Asset>): Asset {
  return {
    id: "a1",
    type: "signal_asset",
    title: "Dev log thread",
    content: "Hello world",
    status: "flight_ready",
    category: "social",
    updatedAt: 0,
    ...over,
  };
}

describe("signalPack", () => {
  it("builds one row per signal in template order", () => {
    const rows = buildSignalPackRows([], LAUNCH);
    expect(rows).toHaveLength(SIGNAL_TEMPLATES.length);
    expect(rows[0].order).toBe(1);
    expect(rows.every((r) => r.status === "not_loaded")).toBe(true);
  });

  it("reflects linked asset status and content in a row", () => {
    const signal = SIGNAL_TEMPLATES[0];
    const rows = buildSignalPackRows([asset({ signalId: signal.id })], LAUNCH);
    const row = rows.find((r) => r.label === signal.label)!;
    expect(row.status).toBe("flight_ready");
    expect(row.content).toBe("Hello world");
    expect(row.scheduledAt).not.toBe("");
  });

  it("CSV has a header row and escapes commas/quotes", () => {
    const rows = buildSignalPackRows([], LAUNCH);
    const csv = buildSignalScheduleCsv(rows);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("order,phase,label,platform,assetType,scheduledAt,status");
    expect(lines).toHaveLength(rows.length + 1);
  });

  it("CSV escapes a cell containing commas and quotes", () => {
    const rows = buildSignalPackRows([], LAUNCH);
    // Inject a label with a comma and a double-quote to exercise csvCell escaping.
    rows[0] = { ...rows[0], label: 'A, "B"' };
    const csv = buildSignalScheduleCsv(rows);
    const line = csv.split("\n")[1];
    expect(line).toContain('"A, ""B"""');
  });

  it("JSON omits raw content (metadata only) and is valid", () => {
    const rows = buildSignalPackRows([], LAUNCH);
    const parsed = JSON.parse(buildSignalScheduleJson(rows));
    expect(parsed).toHaveLength(rows.length);
    expect(parsed[0]).not.toHaveProperty("content");
    expect(parsed[0]).toHaveProperty("label");
  });

  it("file set includes csv/json/readme always, and a txt only for flight-ready content", () => {
    const ready = asset({ id: "a1", signalId: SIGNAL_TEMPLATES[0].id });
    const draft = asset({ id: "a2", signalId: SIGNAL_TEMPLATES[1].id, status: "in_prep" });
    const files = buildSignalPackFiles([ready, draft], LAUNCH);
    const names = files.map((f) => f.name);
    expect(names).toContain("signal-schedule.csv");
    expect(names).toContain("signal-schedule.json");
    expect(names).toContain("README.md");
    expect(names.filter((n) => n.endsWith(".txt"))).toHaveLength(1);
  });

  it("slugifyLabel makes filesystem-safe names", () => {
    expect(slugifyLabel("TikTok behind-the-scenes!")).toBe("tiktok-behind-the-scenes");
  });
});
