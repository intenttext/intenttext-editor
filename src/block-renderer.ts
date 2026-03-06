// ── Block Renderer ──────────────────────────────────────────
// Renders a single IntentBlock into an HTMLElement for the WYSIWYG editor.

import type { IntentBlock } from "@intenttext/core";
import { DOCUMENT_SETTING_TYPES } from "./block-schemas";

/** Escape HTML entities */
function esc(text: string): string {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

/** Convert literal \\n escape sequences to <br> for soft line breaks */
function softBreaks(html: string): string {
  return html.replace(/\\n/g, "<br>");
}

/** Render inline nodes to HTML string */
function renderInline(block: IntentBlock): string {
  if (!block.inline || block.inline.length === 0)
    return softBreaks(esc(block.content ?? ""));
  return block.inline
    .map((n) => {
      switch (n.type) {
        case "bold":
          return `<strong>${softBreaks(esc(n.value))}</strong>`;
        case "italic":
          return `<em>${softBreaks(esc(n.value))}</em>`;
        case "strike":
          return `<s>${softBreaks(esc(n.value))}</s>`;
        case "code":
          return `<code>${esc(n.value)}</code>`;
        case "highlight":
          return `<mark>${softBreaks(esc(n.value))}</mark>`;
        case "link":
          return `<a href="${esc(n.href)}">${softBreaks(esc(n.value))}</a>`;
        default:
          return softBreaks(esc((n as { value: string }).value ?? ""));
      }
    })
    .join("");
}

/** Format properties as pipe badges HTML */
function renderPropBadges(block: IntentBlock): string {
  const props = block.properties;
  if (!props || Object.keys(props).length === 0) return "";
  const badges = Object.entries(props)
    .filter(([, v]) => v != null && String(v).trim())
    .map(
      ([k, v]) =>
        `<span class="it-prop-badge" data-prop-key="${esc(k)}">${esc(k)}: ${esc(String(v))}</span>`,
    )
    .join("");
  return badges ? `<div class="it-block__props">${badges}</div>` : "";
}

/** Icon map for block types */
const TYPE_ICONS: Record<string, string> = {
  task: "☐",
  done: "☑",
  ask: "?",
  info: "ℹ",
  warning: "⚠",
  tip: "💡",
  success: "✓",
  step: "▶",
  decision: "◆",
  gate: "🔒",
  checkpoint: "🏁",
  error: "✕",
  wait: "⏳",
  parallel: "⇉",
  retry: "↻",
  audit: "📋",
  emit: "📡",
  result: "✓",
  handoff: "→",
  call: "ƒ",
  trigger: "⚡",
  policy: "📋",
};

/** Check if block type is a document-level setting */
export function isDocumentSetting(type: string): boolean {
  return DOCUMENT_SETTING_TYPES.includes(type);
}

/** Create the HTMLElement for a single block in the WYSIWYG editor */
export function renderBlockElement(block: IntentBlock): HTMLElement {
  const el = document.createElement("div");
  const blockType = block.type;
  el.className = `it-block it-block--${blockType}`;
  el.dataset.blockType = blockType;
  el.dataset.blockId = block.id;

  // Trust blocks — special rendering
  if (blockType === "track" || blockType === "revision") {
    // Invisible — metadata only
    el.style.display = "none";
    return el;
  }

  if (blockType === "freeze") {
    const props = block.properties ?? {};
    const dateStr = props.at
      ? new Date(props.at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";
    const hash = props.hash ? String(props.hash).slice(0, 20) + "..." : "";
    el.innerHTML = `<div class="it-sealed-banner">
      <span class="it-sealed-banner__icon">🔒</span>
      <span class="it-sealed-banner__text">Sealed Document</span>
      ${dateStr ? `<span class="it-sealed-banner__date">${esc(dateStr)}</span>` : ""}
      ${hash ? `<span class="it-sealed-banner__hash">${esc(hash)}</span>` : ""}
    </div>`;
    return el;
  }

  if (blockType === "sign") {
    const name = block.content ?? "";
    const props = block.properties ?? {};
    const role = props.role ?? "";
    const dateStr = props.at
      ? new Date(String(props.at)).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "";
    const valid = block.properties?._valid !== "false";
    el.innerHTML = `<div class="it-signature ${valid ? "it-signature--valid" : "it-signature--invalid"}">
      <span class="it-signature__status">${valid ? "✅" : "❌"}</span>
      <span class="it-signature__name">${esc(name)}</span>
      ${role ? `<span class="it-signature__role">${esc(String(role))}</span>` : ""}
      ${dateStr ? `<span class="it-signature__date">${valid ? "Signed: " : ""}${esc(dateStr)}${valid ? "" : " — INVALID"}</span>` : ""}
      ${!valid ? `<span class="it-signature__warning">Document was modified after signing</span>` : ""}
    </div>`;
    return el;
  }

  if (blockType === "approve") {
    const desc = block.content ?? "";
    const props = block.properties ?? {};
    const by = props.by ?? "";
    const role = props.role ?? "";
    const dateStr = props.at
      ? new Date(String(props.at)).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "";
    el.innerHTML = `<div class="it-approval">
      <span class="it-approval__icon">✓</span>
      <span class="it-approval__label">APPROVED${desc ? " — " + esc(desc) : ""}</span>
      <span class="it-approval__who">${esc(String(by))}${role ? " — " + esc(String(role)) : ""}</span>
      ${dateStr ? `<span class="it-approval__date">${esc(dateStr)}</span>` : ""}
    </div>`;
    return el;
  }

  // Special cases
  if (blockType === "divider") {
    el.innerHTML = `<hr class="it-block__divider" />`;
    return el;
  }

  if (block.content?.startsWith("//") && blockType === "note") {
    el.innerHTML = `<div class="it-block__comment">${esc(block.content ?? "")}</div>`;
    return el;
  }

  // Type indicator
  const indicator = document.createElement("span");
  indicator.className = "it-block__type-indicator";
  const icon = TYPE_ICONS[blockType];
  indicator.textContent = icon ? `${icon} ${blockType}:` : `${blockType}:`;
  el.appendChild(indicator);

  // Content area
  const content = document.createElement("div");
  content.className = "it-block__content";
  content.contentEditable = "true";
  content.setAttribute("spellcheck", "true");
  content.innerHTML = renderInline(block);
  el.appendChild(content);

  // Special rendering for certain types
  if (blockType === "task") {
    el.classList.add("it-block--has-checkbox");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "it-block__checkbox";
    cb.tabIndex = -1;
    el.insertBefore(cb, content);
  } else if (blockType === "done") {
    el.classList.add("it-block--has-checkbox");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "it-block__checkbox";
    cb.checked = true;
    cb.tabIndex = -1;
    el.insertBefore(cb, content);
  } else if (blockType === "code") {
    content.classList.add("it-block__code-content");
  } else if (blockType === "toc") {
    content.contentEditable = "false";
    content.innerHTML = "<em>Table of Contents</em>";
  }

  // Property badges
  const badges = renderPropBadges(block);
  if (badges) {
    const badgesContainer = document.createElement("div");
    badgesContainer.innerHTML = badges;
    el.appendChild(badgesContainer.firstElementChild!);
  }

  return el;
}

/** Render the document settings header bar */
export function renderDocSettingsBar(blocks: IntentBlock[]): HTMLElement {
  const settingBlocks = blocks.filter((b) => isDocumentSetting(b.type));
  const bar = document.createElement("div");
  bar.className = "it-doc-settings";

  if (settingBlocks.length === 0) {
    bar.classList.add("it-doc-settings--empty");
    return bar;
  }

  const summary: string[] = [];
  for (const b of settingBlocks) {
    const props = b.properties ?? {};
    if (b.type === "page") {
      const parts: string[] = [];
      if (props.size) parts.push(String(props.size));
      if (props.margins) parts.push(`margins: ${props.margins}`);
      if (props.header) parts.push(`header: ${props.header}`);
      if (props.footer) parts.push(`footer: ${props.footer}`);
      summary.push(parts.join(" · ") || "page settings");
    } else if (b.type === "font") {
      const parts: string[] = [];
      if (props.family) parts.push(String(props.family));
      if (props.size) parts.push(String(props.size));
      summary.push(parts.join(" ") || "font settings");
    } else {
      summary.push(`${b.type}: ${b.content ?? "..."}`);
    }
  }

  // Build editable panel fields
  const fields: string[] = [];
  for (const b of settingBlocks) {
    const props = b.properties ?? {};
    fields.push(
      `<div class="it-doc-settings__section"><strong>${esc(b.type)}:</strong> ${esc(b.content ?? "")}</div>`,
    );
    for (const [k, v] of Object.entries(props)) {
      fields.push(
        `<div class="it-doc-settings__field">` +
          `<label class="it-doc-settings__label">${esc(k)}</label>` +
          `<input class="it-doc-settings__input" data-block-id="${esc(b.id)}" data-prop="${esc(k)}" value="${esc(String(v))}" />` +
          `</div>`,
      );
    }
  }

  bar.innerHTML = `
    <div class="it-doc-settings__summary">
      <span class="it-doc-settings__icon">⚙</span>
      <span class="it-doc-settings__text">${esc(summary.join(" · "))}</span>
      <button class="it-doc-settings__toggle" type="button">Edit Settings ▾</button>
    </div>
    <div class="it-doc-settings__panel hidden">
      ${fields.join("")}
    </div>
  `;

  return bar;
}
