/** Lightweight markdown blocks for Foundry / Cargo previews. */

export type MdBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "hr" }
  | { type: "ul"; items: string[] }
  | { type: "p"; text: string };

const INLINE_RE = /(\*\*[^*]+\*\*|_[^_]+_|`[^`]+`)/g;

export function parseMarkdown(md: string): MdBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (/^-{3,}$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }

    blocks.push({ type: "p", text: line });
    i++;
  }

  return blocks;
}

function escHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineHtml(text: string): string {
  const parts = text.split(INLINE_RE).filter(Boolean);
  return parts
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        const inner = part.slice(2, -2);
        const isLabel = inner.endsWith(":");
        const cls = isLabel ? "label" : "strong";
        return `<span class="${cls}">${escHtml(inner)}</span>`;
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return `<em>${escHtml(part.slice(1, -1))}</em>`;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return `<code>${escHtml(part.slice(1, -1))}</code>`;
      }
      return escHtml(part);
    })
    .join("");
}

/** Render markdown to styled HTML for expo-print PDF export. */
export function markdownToHtml(md: string): string {
  const blocks = parseMarkdown(md);
  const body = blocks
    .map((block) => {
      switch (block.type) {
        case "h1":
          return `<h1>${inlineHtml(block.text)}</h1>`;
        case "h2":
          return `<h2>${inlineHtml(block.text)}</h2>`;
        case "h3":
          return `<h3>${inlineHtml(block.text)}</h3>`;
        case "hr":
          return `<hr />`;
        case "ul":
          return `<ul>${block.items.map((item) => `<li>${inlineHtml(item)}</li>`).join("")}</ul>`;
        case "p":
          return `<p>${inlineHtml(block.text)}</p>`;
        default:
          return "";
      }
    })
    .join("\n");

  return body;
}

export function buildFoundryAssetHtml(title: string, content: string): string {
  const body = markdownToHtml(content);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body {
      font-family: Inter, system-ui, sans-serif;
      background: #060B14;
      color: #F5F7FA;
      margin: 0;
      padding: 32px 28px;
      line-height: 1.55;
    }
    h1, h2, h3 {
      font-family: "Space Grotesk", system-ui, sans-serif;
      font-weight: 700;
      color: #F5F7FA;
      margin: 0 0 12px;
    }
    h1 { font-size: 22px; padding-bottom: 12px; border-bottom: 1px solid #1E2D45; margin-bottom: 20px; }
    h2 { font-size: 17px; margin-top: 20px; }
    h3 { font-size: 15px; margin-top: 16px; }
    p { margin: 0 0 10px; color: #94A3B8; font-size: 14px; }
    ul { margin: 8px 0 16px; padding-left: 0; list-style: none; }
    li {
      position: relative;
      padding-left: 16px;
      margin-bottom: 8px;
      color: #94A3B8;
      font-size: 14px;
    }
    li::before {
      content: "";
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      background: #4DC8C0;
      border-radius: 1px;
    }
    hr { border: none; border-top: 1px dashed #2A4060; margin: 20px 0; }
    .label, .strong { font-weight: 600; }
    .label { color: #4DC8C0; }
    .strong { color: #F5F7FA; }
    em { color: #64748B; font-style: italic; }
    code {
      font-family: "JetBrains Mono", ui-monospace, monospace;
      font-size: 12px;
      background: #0E1520;
      padding: 2px 6px;
      border-radius: 4px;
      color: #7DDBD6;
    }
    .doc-title {
      font-family: "Space Grotesk", system-ui, sans-serif;
      font-size: 11px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="doc-title">${escHtml(title)}</div>
  ${body}
</body>
</html>`;
}

/** Slug-style filename for export headers. */
export function toDocFileName(title: string): string {
  return title
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 48);
}
