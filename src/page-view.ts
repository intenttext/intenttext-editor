// ── Page View Engine ────────────────────────────────────────
// Splits content into paginated pages with headers, footers,
// and page numbers — like MS Word / Google Docs.

export interface PageSettings {
  headerLeft: string;
  headerRight: string;
  footerCenter: string;
  showPageNumbers: boolean;
  pageSize: string;
}

/** Page size definitions: width × height in px at 96dpi */
export const PAGE_SIZES: Record<
  string,
  { width: number; height: number; label: string }
> = {
  a4: { width: 794, height: 1123, label: "A4" },
  a5: { width: 559, height: 794, label: "A5" },
  letter: { width: 816, height: 1056, label: "Letter" },
  legal: { width: 816, height: 1344, label: "Legal" },
  "pos-80mm": { width: 302, height: 0, label: "POS 80mm" }, // height=0 → continuous
  "pos-58mm": { width: 220, height: 0, label: "POS 58mm" },
};

function getContentHeight(
  pageSize: string,
  marginTop: number,
  marginBottom: number,
): number {
  const size = PAGE_SIZES[pageSize] || PAGE_SIZES.a4;
  if (size.height === 0) return Infinity; // continuous roll
  return size.height - marginTop - marginBottom;
}

export class PageView {
  private container: HTMLElement;
  private enabled = true; // Default ON — pages like Word/Docs
  private settings: PageSettings = {
    headerLeft: "",
    headerRight: "",
    footerCenter: "Page {{page}} of {{pages}}",
    showPageNumbers: true,
    pageSize: "a4",
  };
  private marginTop = 72;
  private marginBottom = 72;
  private zoom = 1;
  private static readonly ZOOM_MIN = 0.5;
  private static readonly ZOOM_MAX = 2;
  private static readonly ZOOM_STEP = 0.1;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  toggle(): void {
    this.enabled = !this.enabled;
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
  }

  getSettings(): PageSettings {
    return { ...this.settings };
  }

  /** Extract header/footer settings from .it document page block properties */
  updateFromDocSettings(props: Record<string, unknown>): void {
    if (props.header != null) this.settings.headerLeft = String(props.header);
    if (props.footer != null) this.settings.footerCenter = String(props.footer);
    if (props.numbering === "none") this.settings.showPageNumbers = false;
    else this.settings.showPageNumbers = true;
  }

  setPageSize(size: string): void {
    if (PAGE_SIZES[size]) {
      this.settings.pageSize = size;
      this.applyCSSVars();
    }
  }

  getPageSize(): string {
    return this.settings.pageSize;
  }

  /** Apply current page dimensions to CSS custom properties */
  applyCSSVars(): void {
    const size = PAGE_SIZES[this.settings.pageSize] || PAGE_SIZES.a4;
    document.documentElement.style.setProperty(
      "--page-width",
      `${size.width}px`,
    );
    if (size.height > 0) {
      document.documentElement.style.setProperty(
        "--page-height",
        `${size.height}px`,
      );
    }
  }

  /** Wrap the WYSIWYG canvas into paginated pages */
  paginate(canvas: HTMLElement): void {
    if (!this.enabled) return;

    const size = PAGE_SIZES[this.settings.pageSize] || PAGE_SIZES.a4;
    const contentHeight = getContentHeight(
      this.settings.pageSize,
      this.marginTop,
      this.marginBottom,
    );

    // For continuous sizes (POS), don't paginate
    if (size.height === 0) return;

    // Gather all block elements from the canvas
    const blocks = Array.from(canvas.children) as HTMLElement[];

    // Detach blocks into a fragment
    const fragment = document.createDocumentFragment();
    blocks.forEach((b) => fragment.appendChild(b));

    // Clear canvas and turn it into the page container
    canvas.innerHTML = "";
    canvas.classList.add("it-page-container");

    // Always create at least one page (even if empty)
    let currentPage = this.createPage(1);
    canvas.appendChild(currentPage.el);

    if (blocks.length === 0) {
      // Empty doc — show one blank page
      const pageInfo = document.getElementById("status-page-info");
      if (pageInfo) pageInfo.textContent = "1 page";
      return;
    }

    let usedHeight = 0;
    let pageNum = 1;

    // Append blocks from fragment into pages
    const allBlocks = Array.from(fragment.children) as HTMLElement[];
    for (const block of allBlocks) {
      currentPage.content.appendChild(block);
      const blockHeight = block.offsetHeight + 4; // margin

      usedHeight += blockHeight;
      if (
        usedHeight > contentHeight &&
        currentPage.content.children.length > 1
      ) {
        // Move this block to a new page
        currentPage.content.removeChild(block);
        pageNum++;
        currentPage = this.createPage(pageNum);
        canvas.appendChild(currentPage.el);
        currentPage.content.appendChild(block);
        usedHeight = blockHeight;
      }
    }

    // Finalize page numbers
    const totalPages = pageNum;
    const footers = canvas.querySelectorAll(".it-page__footer-text");
    footers.forEach((el) => {
      el.textContent = (el.textContent ?? "").replace(
        "{{pages}}",
        String(totalPages),
      );
    });
    const headers = canvas.querySelectorAll(".it-page__header-text");
    headers.forEach((el) => {
      el.textContent = (el.textContent ?? "").replace(
        "{{pages}}",
        String(totalPages),
      );
    });

    // Update status bar
    const pageInfo = document.getElementById("status-page-info");
    if (pageInfo)
      pageInfo.textContent = `${totalPages} page${totalPages !== 1 ? "s" : ""}`;
  }

  /** Create a single page element with header and footer */
  private createPage(pageNum: number): {
    el: HTMLElement;
    content: HTMLElement;
  } {
    const size = PAGE_SIZES[this.settings.pageSize] || PAGE_SIZES.a4;
    const page = document.createElement("div");
    page.className = "it-page";
    page.dataset.pageNumber = String(pageNum);
    page.style.width = `${size.width}px`;
    page.style.minHeight = `${size.height}px`;

    // Header
    const header = document.createElement("div");
    header.className = "it-page__header";
    const headerText = document.createElement("span");
    headerText.className = "it-page__header-text";
    headerText.textContent = this.settings.headerLeft.replace(
      "{{page}}",
      String(pageNum),
    );
    const headerRight = document.createElement("span");
    headerRight.className = "it-page__header-right";
    headerRight.textContent = this.settings.headerRight.replace(
      "{{page}}",
      String(pageNum),
    );
    header.appendChild(headerText);
    header.appendChild(headerRight);
    page.appendChild(header);

    // Content area
    const content = document.createElement("div");
    content.className = "it-page__content";
    page.appendChild(content);

    // Footer
    const footer = document.createElement("div");
    footer.className = "it-page__footer";
    const footerText = document.createElement("span");
    footerText.className = "it-page__footer-text";
    if (this.settings.showPageNumbers) {
      footerText.textContent = this.settings.footerCenter.replace(
        "{{page}}",
        String(pageNum),
      );
    }
    footer.appendChild(footerText);
    page.appendChild(footer);

    return { el: page, content };
  }

  // ── Zoom ──────────────────────────────────────────────

  getZoom(): number {
    return this.zoom;
  }

  setZoom(level: number): void {
    this.zoom =
      Math.round(
        Math.max(PageView.ZOOM_MIN, Math.min(PageView.ZOOM_MAX, level)) * 10,
      ) / 10;
    this.applyZoom();
  }

  zoomIn(): void {
    this.setZoom(this.zoom + PageView.ZOOM_STEP);
  }

  zoomOut(): void {
    this.setZoom(this.zoom - PageView.ZOOM_STEP);
  }

  resetZoom(): void {
    this.setZoom(1);
  }

  private applyZoom(): void {
    const editTab = document.getElementById("tab-edit");
    const printTab = document.getElementById("tab-print");
    const scale = `scale(${this.zoom})`;
    if (editTab) editTab.style.transform = scale;
    if (printTab) printTab.style.transform = scale;
    // Update zoom label
    const label = document.getElementById("zoom-level");
    if (label) label.textContent = `${Math.round(this.zoom * 100)}%`;
  }
}
