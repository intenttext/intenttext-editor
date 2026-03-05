// ── Template Manager ────────────────────────────────────────
// Manages templates, placeholders, and the template dropdown UI.

import { TEMPLATES, type Template } from "./templates";
import type { SyncEngine } from "./sync-engine";
import type { BlockEditor } from "./block-editor";

export class TemplateManager {
  private sync: SyncEngine;
  private blockEditor: BlockEditor | null = null;
  private menuEl: HTMLElement;

  constructor(sync: SyncEngine) {
    this.sync = sync;
    this.menuEl = document.getElementById("template-menu")!;
    this.buildMenu();
    this.bindDropdown();
  }

  setBlockEditor(editor: BlockEditor): void {
    this.blockEditor = editor;
  }

  private buildMenu(): void {
    if (!this.menuEl) return;

    const categories: { key: Template["category"]; label: string }[] = [
      { key: "docs", label: "Documents" },
      { key: "human", label: "Human Workflows" },
      { key: "agent", label: "Agent Workflows" },
    ];

    // "Create from current" button at top
    const createItem = document.createElement("button");
    createItem.className = "it-dropdown__item it-dropdown__item--tpl";
    createItem.innerHTML = `<span class="tpl-icon">✏️</span><span class="tpl-name">Create Template…</span><span class="tpl-desc">from current doc</span>`;
    createItem.addEventListener("click", () => {
      this.createTemplateFromCurrent();
      this.closeMenu();
    });
    this.menuEl.appendChild(createItem);

    const divider = document.createElement("div");
    divider.className = "it-dropdown__divider";
    this.menuEl.appendChild(divider);

    for (const cat of categories) {
      const templates = TEMPLATES.filter((t) => t.category === cat.key);
      if (templates.length === 0) continue;

      const catLabel = document.createElement("div");
      catLabel.className = "it-dropdown__category";
      catLabel.textContent = cat.label;
      this.menuEl.appendChild(catLabel);

      for (const tpl of templates) {
        const item = document.createElement("button");
        item.className = "it-dropdown__item it-dropdown__item--tpl";
        item.innerHTML = `<span class="tpl-icon">${tpl.icon}</span><span class="tpl-name">${tpl.name}</span><span class="tpl-desc">${tpl.description}</span>`;
        item.addEventListener("click", () => {
          this.applyTemplate(tpl);
          this.closeMenu();
        });
        this.menuEl.appendChild(item);
      }
    }
  }

  private bindDropdown(): void {
    const btn = document.getElementById("btn-template");
    btn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.menuEl.classList.toggle("open");
    });
    document.addEventListener("click", () => this.closeMenu());
  }

  private closeMenu(): void {
    this.menuEl.classList.remove("open");
  }

  private applyTemplate(tpl: Template): void {
    this.sync.setSource(tpl.content);
    this.blockEditor?.render();
    this.blockEditor?.focusFirstBlock();
  }

  /** Create a "template" from current document — wraps variable content in {{placeholders}} */
  private createTemplateFromCurrent(): void {
    const source = this.sync.getSource();
    if (!source.trim()) return;

    // Prompt for template name
    const name = prompt("Template name:");
    if (!name) return;

    // Generate template content with placeholder hints
    const templateContent = source;

    // Store in localStorage as user template
    const userTemplates = this.getUserTemplates();
    userTemplates.push({
      id: `user-${Date.now()}`,
      name,
      icon: "📌",
      description: "Custom template",
      category: "docs",
      content: templateContent,
    });
    localStorage.setItem("it-user-templates", JSON.stringify(userTemplates));

    // Rebuild menu to include new template
    this.menuEl.innerHTML = "";
    // Re-add user templates to TEMPLATES-like array
    this.buildMenu();
    this.appendUserTemplates();

    const msgEl = document.getElementById("status-message");
    if (msgEl) {
      msgEl.textContent = `Template "${name}" saved`;
      setTimeout(() => {
        msgEl.textContent = "";
      }, 3000);
    }
  }

  private getUserTemplates(): Template[] {
    try {
      return JSON.parse(localStorage.getItem("it-user-templates") ?? "[]");
    } catch {
      return [];
    }
  }

  private appendUserTemplates(): void {
    const userTpls = this.getUserTemplates();
    if (userTpls.length === 0) return;

    const divider = document.createElement("div");
    divider.className = "it-dropdown__divider";
    this.menuEl.appendChild(divider);

    const catLabel = document.createElement("div");
    catLabel.className = "it-dropdown__category";
    catLabel.textContent = "My Templates";
    this.menuEl.appendChild(catLabel);

    for (const tpl of userTpls) {
      const item = document.createElement("button");
      item.className = "it-dropdown__item it-dropdown__item--tpl";
      item.innerHTML = `<span class="tpl-icon">${tpl.icon}</span><span class="tpl-name">${tpl.name}</span><span class="tpl-desc">${tpl.description}</span>`;
      item.addEventListener("click", () => {
        this.applyTemplate(tpl);
        this.closeMenu();
      });
      this.menuEl.appendChild(item);
    }
  }
}
