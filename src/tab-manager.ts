// ── Tab Manager ─────────────────────────────────────────────
// Manages the 4 view tabs: Edit, Source, JSON, Print

import * as monaco from "monaco-editor";
import { renderHTML } from "@intenttext/core";
import { SyncEngine } from "./sync-engine";
import { BlockEditor } from "./block-editor";
import { PAGE_SIZES } from "./page-view";

export type TabId = "edit" | "source" | "json" | "print";

export class TabManager {
  private sync: SyncEngine;
  private blockEditor: BlockEditor | null = null;
  private sourceEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private jsonEditor: monaco.editor.IStandaloneCodeEditor | null = null;
  private activeTab: TabId = "edit";
  private tabChangeListeners: Array<(tabId: string) => void> = [];
  private pageSize = "a4";

  private editContainer: HTMLElement;
  private sourceContainer: HTMLElement;
  private jsonContainer: HTMLElement;
  private printContainer: HTMLElement;
  private tabBtns: NodeListOf<HTMLElement>;

  constructor(sync: SyncEngine) {
    this.sync = sync;

    this.editContainer = document.getElementById("tab-edit")!;
    this.sourceContainer = document.getElementById("tab-source")!;
    this.jsonContainer = document.getElementById("tab-json")!;
    this.printContainer = document.getElementById("tab-print")!;
    this.tabBtns = document.querySelectorAll("[data-tab]");

    this.init();
  }

  private init(): void {
    // Bind tab buttons
    this.tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.dataset.tab as TabId;
        this.switchTab(tabId);
      });
    });

    // Create block editor
    this.blockEditor = new BlockEditor(this.editContainer, this.sync);

    // Create source editor (Monaco)
    this.sourceEditor = monaco.editor.create(this.sourceContainer, {
      value: this.sync.getSource(),
      language: "intenttext",
      theme: "it-light",
      fontSize: 14,
      lineHeight: 22,
      fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
      minimap: { enabled: false },
      wordWrap: "on",
      padding: { top: 12, bottom: 12 },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      renderLineHighlight: "line",
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      tabSize: 2,
      lineNumbers: "on",
      glyphMargin: false,
      folding: true,
      lineDecorationsWidth: 8,
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
    });

    // Source editor change → sync
    this.sourceEditor.onDidChangeModelContent(() => {
      if (this.activeTab !== "source") return;
      const source = this.sourceEditor!.getValue();
      // Update source without triggering listener (we'll sync on tab switch)
      this.sync.setSource(source);
    });

    // Create JSON viewer (read-only Monaco)
    this.jsonEditor = monaco.editor.create(this.jsonContainer, {
      value: "",
      language: "json",
      theme: "it-light",
      fontSize: 13,
      lineHeight: 20,
      fontFamily: '"JetBrains Mono", "SF Mono", "Fira Code", monospace',
      minimap: { enabled: false },
      wordWrap: "on",
      readOnly: true,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: "on",
      folding: true,
      padding: { top: 12, bottom: 12 },
    });

    // Listen for sync changes to update JSON + print
    this.sync.onChange(() => {
      this.updateJSONView();
      if (this.activeTab === "print") this.updatePrintView();
      this.updateStatusBar();
    });

    // Initial render
    this.switchTab("edit");
    this.updateStatusBar();
  }

  switchTab(tabId: TabId): void {
    const prevTab = this.activeTab;

    // Save state from current tab before switching
    if (prevTab === "source" && tabId !== "source") {
      const newSource = this.sourceEditor!.getValue();
      if (newSource !== this.sync.getSource()) {
        this.sync.setSource(newSource);
      }
    }

    this.activeTab = tabId;

    // Update tab button styles
    this.tabBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    // Show/hide containers
    this.editContainer.classList.toggle("hidden", tabId !== "edit");
    this.sourceContainer.classList.toggle("hidden", tabId !== "source");
    this.jsonContainer.classList.toggle("hidden", tabId !== "json");
    this.printContainer.classList.toggle("hidden", tabId !== "print");

    // Update content for the active tab
    if (tabId === "edit") {
      if (prevTab === "source") {
        // Came from source — full re-render since user may have edited raw .it
        this.blockEditor?.render();
      } else {
        this.blockEditor?.render();
      }
    } else if (tabId === "source") {
      this.sourceEditor?.setValue(this.sync.getSource());
      this.sourceEditor?.layout();
      this.sourceEditor?.focus();
    } else if (tabId === "json") {
      this.updateJSONView();
      this.jsonEditor?.layout();
    } else if (tabId === "print") {
      this.updatePrintView();
    }

    // Notify listeners
    for (const fn of this.tabChangeListeners) fn(tabId);
  }

  /** Get the underlying block editor */
  getBlockEditor(): BlockEditor | null {
    return this.blockEditor;
  }

  /** Register a callback for tab changes */
  onTabChange(listener: (tabId: string) => void): void {
    this.tabChangeListeners.push(listener);
  }

  /** Get the underlying source editor (for file-ops and other integrations) */
  getSourceEditor(): monaco.editor.IStandaloneCodeEditor | null {
    return this.sourceEditor;
  }

  getActiveTab(): TabId {
    return this.activeTab;
  }

  /** Force re-render of the block editor */
  refreshBlockEditor(): void {
    this.blockEditor?.render();
  }

  private updateJSONView(): void {
    const doc = this.sync.getDocument();
    const json = JSON.stringify(doc, null, 2);
    this.jsonEditor?.setValue(json);
  }

  setPageSize(size: string): void {
    this.pageSize = size;
    if (this.activeTab === "print") this.updatePrintView();
  }

  private updatePrintView(): void {
    const doc = this.sync.getDocument();
    const source = this.sync.getSource();
    if (!source.trim()) {
      this.printContainer.innerHTML =
        '<div class="it-print-empty">Nothing to preview</div>';
      return;
    }

    try {
      const html = renderHTML(doc);
      const size = PAGE_SIZES[this.pageSize] || PAGE_SIZES.a4;
      const isContinuous = size.height === 0;

      if (isContinuous) {
        // POS / continuous: single scroll
        this.printContainer.innerHTML = `<div class="it-print-page" style="width:${size.width}px;min-height:auto">${html}</div>`;
        return;
      }

      // Render into a hidden measurer to split into pages
      const measurer = document.createElement("div");
      measurer.style.position = "absolute";
      measurer.style.visibility = "hidden";
      measurer.style.width = `${size.width - 144}px`; // subtract L+R margins
      measurer.style.fontSize = "14px";
      measurer.style.lineHeight = "1.7";
      measurer.innerHTML = html;
      document.body.appendChild(measurer);

      const contentHeight = size.height - 144; // top + bottom margins
      const children = Array.from(measurer.children) as HTMLElement[];
      const pages: string[] = [];
      let currentPageHTML = "";
      let usedHeight = 0;

      for (const child of children) {
        const h = child.offsetHeight + 8; // margin
        if (usedHeight + h > contentHeight && currentPageHTML) {
          pages.push(currentPageHTML);
          currentPageHTML = "";
          usedHeight = 0;
        }
        currentPageHTML += child.outerHTML;
        usedHeight += h;
      }
      if (currentPageHTML) pages.push(currentPageHTML);
      if (pages.length === 0) pages.push("");

      document.body.removeChild(measurer);

      const totalPages = pages.length;
      const pagesHTML = pages
        .map(
          (content, i) =>
            `<div class="it-print-page" style="width:${size.width}px;min-height:${size.height}px">` +
            content +
            `<div class="it-print-page__footer">Page ${i + 1} of ${totalPages}</div>` +
            `</div>`,
        )
        .join("");

      this.printContainer.innerHTML = pagesHTML;
    } catch {
      this.printContainer.innerHTML =
        '<div class="it-print-empty">Error rendering print preview</div>';
    }
  }

  private updateStatusBar(): void {
    const source = this.sync.getSource();
    const doc = this.sync.getDocument();
    const lines = source.split("\n").length;
    const blocks = doc.blocks.length;
    const words = source.split(/\s+/).filter((w) => w.length > 0).length;

    const statsEl = document.getElementById("status-stats");
    if (statsEl) {
      statsEl.textContent = `blocks: ${blocks}  ·  words: ${words}  ·  lines: ${lines}  ·  .it ✓`;
    }
  }
}
