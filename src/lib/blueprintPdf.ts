import { BLUEPRINT_SECTIONS } from "@/constants/blueprintSections";
import {
  SOCIAL_LINKS_FIELD_KEY,
  SOCIAL_PLATFORMS,
} from "@/constants/socialPlatforms";
import { parseSocialLinks } from "@/lib/socialLinks";
import type { Blueprint, BlueprintSection } from "@/types";

const BLANK = "— not filled yet";

type Blueprints = Record<BlueprintSection, Blueprint>;

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function appName(blueprints: Blueprints): string {
  return (blueprints.app_info?.fields?.appName ?? "").trim();
}

function overallCompletion(blueprints: Blueprints): number {
  const total = BLUEPRINT_SECTIONS.reduce(
    (sum, s) => sum + (blueprints[s.id]?.completionStatus ?? 0),
    0,
  );
  return Math.round(total / BLUEPRINT_SECTIONS.length);
}

/** Marketing social links → list of "Platform: handle" rows, or [] if none. */
function socialRows(bp: Blueprint | undefined): string[] {
  const links = parseSocialLinks(bp?.fields?.[SOCIAL_LINKS_FIELD_KEY]);
  return SOCIAL_PLATFORMS.filter(
    (p) => links[p.id].enabled && links[p.id].handle.trim(),
  ).map((p) => `${esc(p.name)}: ${esc(links[p.id].handle.trim())}`);
}

function fieldRow(label: string, rawValue: string | undefined): string {
  const value = rawValue?.trim()
    ? esc(rawValue.trim())
    : `<span class="blank">${BLANK}</span>`;
  return `<div class="field"><div class="label">${esc(label)}</div><div class="value">${value}</div></div>`;
}

function sectionBlock(
  blueprints: Blueprints,
  sectionId: BlueprintSection,
): string {
  const meta = BLUEPRINT_SECTIONS.find((s) => s.id === sectionId)!;
  const bp = blueprints[sectionId];
  const completion = bp?.completionStatus ?? 0;

  const rows = meta.fields
    .map((f) => fieldRow(f.label, bp?.fields?.[f.key]))
    .join("");

  let socialBlock = "";
  if (sectionId === "marketing") {
    const social = socialRows(bp);
    const body = social.length
      ? social.map((r) => `<div class="value">${r}</div>`).join("")
      : `<div class="value"><span class="blank">${BLANK}</span></div>`;
    socialBlock = `<div class="field"><div class="label">Social links</div>${body}</div>`;
  }

  return `
    <section class="block">
      <div class="block-head">
        <h2>${meta.title}</h2>
        <span class="pct">${completion}%</span>
      </div>
      ${rows}
      ${socialBlock}
    </section>`;
}

export function buildBlueprintHtml(blueprints: Blueprints): string {
  const title = esc(appName(blueprints) || "Your App");
  const overall = overallCompletion(blueprints);
  const body = BLUEPRINT_SECTIONS.map((s) =>
    sectionBlock(blueprints, s.id),
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1a2230; margin: 0; padding: 32px; background: #ffffff; }
  .header { border-bottom: 4px solid #4DC8C0; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0; font-size: 28px; color: #0b1220; }
  .header .sub { color: #4DC8C0; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; font-size: 12px; }
  .header .overall { margin-top: 8px; font-size: 13px; color: #5b6675; }
  .block { margin-bottom: 22px; page-break-inside: avoid; }
  .block-head { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #e2e6ec; padding-bottom: 4px; margin-bottom: 8px; }
  .block-head h2 { font-size: 17px; margin: 0; color: #0b1220; }
  .pct { font-size: 12px; color: #4DC8C0; font-weight: 600; }
  .field { margin-bottom: 8px; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #8a93a3; }
  .value { font-size: 14px; color: #1a2230; white-space: pre-wrap; }
  .blank { color: #aab2bf; font-style: italic; }
</style>
</head>
<body>
  <div class="header">
    <div class="sub">Launch Blueprint</div>
    <h1>${title}</h1>
    <div class="overall">Overall completion: ${overall}%</div>
  </div>
  ${body}
</body>
</html>`;
}

/** Filesystem-safe PDF filename derived from the app name. */
export function blueprintFileName(blueprints: Blueprints): string {
  const safe = appName(blueprints)
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safe ? `${safe}-Launch-Blueprint.pdf` : "Launch-Blueprint.pdf";
}
