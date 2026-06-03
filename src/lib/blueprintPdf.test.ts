import { buildBlueprintHtml, blueprintFileName } from "./blueprintPdf";
import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import { SOCIAL_LINKS_FIELD_KEY } from "@/constants/socialPlatforms";
import type { Blueprint, BlueprintSection } from "@/types";

/** Build a full blueprints record, then apply per-section overrides. */
function makeBlueprints(
  overrides: Partial<
    Record<
      BlueprintSection,
      { fields?: Record<string, string>; completionStatus?: number }
    >
  > = {},
): Record<BlueprintSection, Blueprint> {
  const out = {} as Record<BlueprintSection, Blueprint>;
  for (const section of BLUEPRINT_SECTIONS) {
    const o = overrides[section.id];
    out[section.id] = {
      section: section.id,
      fields: o?.fields ?? {},
      completionStatus: o?.completionStatus ?? 0,
    };
  }
  return out;
}

describe("buildBlueprintHtml", () => {
  it("includes every section title", () => {
    const html = buildBlueprintHtml(makeBlueprints());
    for (const section of BLUEPRINT_SECTIONS) {
      expect(html).toContain(section.title);
    }
  });

  it("renders a filled field's value", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({ app_info: { fields: { appName: "FocusFlow" } } }),
    );
    expect(html).toContain("FocusFlow");
  });

  it("marks empty and whitespace-only fields as not filled", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({ app_info: { fields: { oneLiner: "   " } } }),
    );
    expect(html).toContain("not filled yet");
  });

  it("renders marketing social links as handles, never raw JSON", () => {
    const social = JSON.stringify({
      twitter: { enabled: true, handle: "@focusflow" },
      instagram: { enabled: false, handle: "ignored" },
    });
    const html = buildBlueprintHtml(
      makeBlueprints({
        marketing: { fields: { [SOCIAL_LINKS_FIELD_KEY]: social } },
      }),
    );
    expect(html).toContain("focusflow");
    expect(html).not.toContain("enabled");
    expect(html).not.toContain("ignored");
  });

  it("escapes HTML in user values", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({ app_info: { fields: { appName: '<b>&"x' } } }),
    );
    expect(html).toContain("&lt;b&gt;&amp;&quot;x");
    expect(html).not.toContain('<b>&"x');
  });

  it("shows the rounded average completion across sections", () => {
    const html = buildBlueprintHtml(
      makeBlueprints({
        app_info: { completionStatus: 100 },
        app_store: { completionStatus: 50 },
      }),
    );
    // (100 + 50 + 0*6) / 8 = 18.75 -> 19
    expect(html).toContain("19%");
  });
});

describe("blueprintFileName", () => {
  it("derives a safe filename from the app name", () => {
    const name = blueprintFileName(
      makeBlueprints({ app_info: { fields: { appName: "Focus Flow!" } } }),
    );
    expect(name).toBe("Focus-Flow-Launch-Blueprint.pdf");
  });

  it("falls back when no app name is set", () => {
    expect(blueprintFileName(makeBlueprints())).toBe("Launch-Blueprint.pdf");
  });
});
