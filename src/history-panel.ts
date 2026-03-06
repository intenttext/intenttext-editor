// ── History Panel ────────────────────────────────────────────
// Slide-out panel showing document change history.
// Reads from the parsed history section of a tracked document.

import { parseIntentText } from "@intenttext/core";
import type { SyncEngine } from "./sync-engine";

export class HistoryPanel {
  private panel: HTMLElement;
  private sync: SyncEngine;

  constructor(sync: SyncEngine) {
    this.sync = sync;

    this.panel = document.createElement("div");
    this.panel.className = "it-history-panel hidden";
    this.panel.innerHTML = `
      <div class="it-history-panel__header">
        <span class="it-history-panel__title">Document History</span>
        <button class="it-history-panel__close" type="button">✕</button>
      </div>
      <div class="it-history-panel__content"></div>
    `;
    document.body.appendChild(this.panel);

    this.panel
      .querySelector(".it-history-panel__close")
      ?.addEventListener("click", () => this.hide());
  }

  toggle(): void {
    if (this.panel.classList.contains("hidden")) {
      this.show();
    } else {
      this.hide();
    }
  }

  show(): void {
    this.refresh();
    this.panel.classList.remove("hidden");
  }

  hide(): void {
    this.panel.classList.add("hidden");
  }

  refresh(): void {
    const source = this.sync.getSource();
    const doc = parseIntentText(source, { includeHistorySection: true });
    const content = this.panel.querySelector(
      ".it-history-panel__content",
    ) as HTMLElement;

    if (!doc.metadata?.tracking?.active) {
      content.innerHTML = `<div class="it-history-panel__empty">History tracking is not enabled for this document.</div>`;
      return;
    }

    const history = doc.history;
    if (!history || !history.revisions || history.revisions.length === 0) {
      content.innerHTML = `<div class="it-history-panel__empty">No revisions recorded yet.</div>`;
      return;
    }

    // Group revisions by version
    const grouped = new Map<string, typeof history.revisions>();
    for (const rev of history.revisions) {
      const key = rev.version;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(rev);
    }

    const html: string[] = [];
    for (const [version, revs] of grouped) {
      const first = revs[0];
      const dateStr = first.at
        ? new Date(first.at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })
        : "";

      for (const rev of revs) {
        const change = rev.change ?? "modified";
        const icon =
          change === "added"
            ? "+"
            : change === "removed"
              ? "−"
              : change === "moved"
                ? "→"
                : "~";

        let detail = "";
        if (rev.was && rev.now) {
          detail = `<div class="it-history-entry__detail">"${esc(rev.was)}" → "${esc(rev.now)}"</div>`;
        } else if (rev.now) {
          detail = `<div class="it-history-entry__detail">"${esc(rev.now)}"</div>`;
        } else if (rev.was) {
          detail = `<div class="it-history-entry__detail">"${esc(rev.was)}"</div>`;
        }

        html.push(`
          <div class="it-history-entry">
            <span class="it-history-entry__version">v${esc(version)}</span>
            <span class="it-history-entry__date">${esc(dateStr)}</span>
            <span class="it-history-entry__by">${esc(rev.by ?? "")}</span>
            <span class="it-history-entry__change it-history-entry__change--${change}">[${icon} ${esc(change)}]</span>
            <span class="it-history-entry__block">${esc(rev.block ?? "")}</span>
            ${rev.section ? `<span class="it-history-entry__section">${esc(rev.section)}</span>` : ""}
            ${detail}
          </div>
        `);
      }
    }

    content.innerHTML = html.join("");
  }

  destroy(): void {
    this.panel.remove();
  }
}

function esc(text: string): string {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}
