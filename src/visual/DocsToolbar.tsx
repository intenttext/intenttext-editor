import { useState, useRef, useEffect, useCallback } from "react";
import type { Editor } from "@tiptap/core";
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Subscript,
  Superscript,
  Minus,
  Plus,
  Link,
  Image,
  Palette,
  Highlighter,
  RemoveFormatting,
  ChevronDown,
  SeparatorHorizontal,
  Scissors,
  FileCode2,
  Lightbulb,
  Info,
  AlertTriangle,
  ShieldAlert,
  CircleCheck,
  ImageIcon,
  Link2,
  UserRound,
  BarChart3,
  CalendarClock,
  BookOpen,
} from "lucide-react";

interface Props {
  editor: Editor | null;
}

/* ── Style options that map to IT keywords ──────────────────── */
const STYLE_OPTIONS = [
  { label: "Normal text", node: "paragraph" },
  { label: "Title", node: "itTitle" },
  { label: "Section", node: "itSection" },
  { label: "Subsection", node: "itSub" },
  { label: "Summary", node: "itSummary" },
  { label: "Quote", node: "itQuote" },
] as const;

const INSERT_OPTIONS = [
  { label: "Divider", keyword: "divider", Icon: SeparatorHorizontal },
  { label: "Page break", keyword: "break", Icon: Scissors },
  { label: "Code block", keyword: "code", Icon: FileCode2 },
  { label: "Tip", keyword: "tip", Icon: Lightbulb },
  { label: "Info", keyword: "info", Icon: Info },
  { label: "Warning", keyword: "warning", Icon: AlertTriangle },
  { label: "Danger", keyword: "danger", Icon: ShieldAlert },
  { label: "Success", keyword: "success", Icon: CircleCheck },
  { label: "Image", keyword: "image", Icon: ImageIcon },
  { label: "Link", keyword: "link", Icon: Link2 },
  { label: "Contact", keyword: "contact", Icon: UserRound },
  { label: "Metric", keyword: "metric", Icon: BarChart3 },
  { label: "Deadline", keyword: "deadline", Icon: CalendarClock },
  { label: "Definition", keyword: "def", Icon: BookOpen },
];

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Inter", value: "Inter" },
  { label: "Arial", value: "Arial" },
  { label: "Times New Roman", value: "Times New Roman" },
  { label: "Georgia", value: "Georgia" },
  { label: "Courier New", value: "Courier New" },
  { label: "Verdana", value: "Verdana" },
  { label: "Trebuchet MS", value: "Trebuchet MS" },
] as const;

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const TEXT_COLORS = [
  "#000000",
  "#434343",
  "#666666",
  "#999999",
  "#b7b7b7",
  "#cccccc",
  "#d9d9d9",
  "#efefef",
  "#f3f3f3",
  "#ffffff",
  "#980000",
  "#ff0000",
  "#ff9900",
  "#ffff00",
  "#00ff00",
  "#00ffff",
  "#4a86e8",
  "#0000ff",
  "#9900ff",
  "#ff00ff",
  "#e6b8af",
  "#f4cccc",
  "#fce5cd",
  "#fff2cc",
  "#d9ead3",
  "#d0e0e3",
  "#c9daf8",
  "#cfe2f3",
  "#d9d2e9",
  "#ead1dc",
  "#dd7e6b",
  "#ea9999",
  "#f9cb9c",
  "#ffe599",
  "#b6d7a8",
  "#a2c4c9",
  "#a4c2f4",
  "#9fc5e8",
  "#b4a7d6",
  "#d5a6bd",
  "#cc4125",
  "#e06666",
  "#f6b26b",
  "#ffd966",
  "#93c47d",
  "#76a5af",
  "#6d9eeb",
  "#6fa8dc",
  "#8e7cc3",
  "#c27ba0",
];

const HIGHLIGHT_COLORS = [
  "#ffffff",
  "#cfe2f3",
  "#d9ead3",
  "#fff2cc",
  "#fce5cd",
  "#f4cccc",
  "#d9d2e9",
  "#ead1dc",
  "#d0e0e3",
  "#e6b8af",
];

/* ── Helper: small icon button ──────────────────────────────── */
function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`docs-tb-btn${active ? " active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="docs-tb-sep" />;
}

export function DocsToolbar({ editor }: Props) {
  const [styleOpen, setStyleOpen] = useState(false);
  const [insertOpen, setInsertOpen] = useState(false);
  const [fontOpen, setFontOpen] = useState(false);
  const [textColorOpen, setTextColorOpen] = useState(false);
  const [highlightColorOpen, setHighlightColorOpen] = useState(false);

  const styleRef = useRef<HTMLDivElement>(null);
  const insertRef = useRef<HTMLDivElement>(null);
  const fontRef = useRef<HTMLDivElement>(null);
  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightColorRef = useRef<HTMLDivElement>(null);

  // Close all dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (styleRef.current && !styleRef.current.contains(t))
        setStyleOpen(false);
      if (insertRef.current && !insertRef.current.contains(t))
        setInsertOpen(false);
      if (fontRef.current && !fontRef.current.contains(t)) setFontOpen(false);
      if (textColorRef.current && !textColorRef.current.contains(t))
        setTextColorOpen(false);
      if (highlightColorRef.current && !highlightColorRef.current.contains(t))
        setHighlightColorOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => {
    setStyleOpen(false);
    setInsertOpen(false);
    setFontOpen(false);
    setTextColorOpen(false);
    setHighlightColorOpen(false);
  };

  /* ── Queries ─────────────────────────────────────────────── */
  const getCurrentStyle = useCallback((): string => {
    if (!editor) return "Normal text";
    for (const opt of STYLE_OPTIONS) {
      if (opt.node === "paragraph" && editor.isActive("paragraph")) {
        const isOther = STYLE_OPTIONS.some(
          (o) => o.node !== "paragraph" && editor.isActive(o.node),
        );
        if (!isOther) return opt.label;
      } else if (editor.isActive(opt.node)) {
        return opt.label;
      }
    }
    return "Normal text";
  }, [editor]);

  const getCurrentFont = useCallback((): string => {
    if (!editor) return "Default";
    const family = editor.getAttributes("textStyle")?.fontFamily;
    if (!family) return "Default";
    const match = FONT_FAMILIES.find((f) => f.value === family);
    return match ? match.label : "Default";
  }, [editor]);

  const [fontSize, setFontSize] = useState(15);

  /* ── Actions ─────────────────────────────────────────────── */
  const setStyle = useCallback(
    (nodeType: string) => {
      if (!editor) return;
      if (nodeType === "paragraph") {
        editor.chain().focus().setParagraph().run();
      } else if (nodeType === "itQuote") {
        editor.chain().focus().setNode("itQuote").run();
      } else {
        editor.chain().focus().setNode(nodeType).run();
      }
      closeAll();
    },
    [editor],
  );

  const insertBlock = useCallback(
    (keyword: string) => {
      if (!editor) return;
      const chain = editor.chain().focus();
      if (keyword === "divider") {
        chain.setNode("itDivider").run();
      } else if (keyword === "break") {
        chain.setNode("itBreak").run();
      } else if (keyword === "code") {
        chain.setNode("itCode", { lang: "" }).run();
      } else if (
        ["tip", "info", "warning", "danger", "success"].includes(keyword)
      ) {
        chain.setNode("itCallout", { variant: keyword }).run();
      } else {
        chain.setNode("itGenericBlock", { keyword, properties: "" }).run();
      }
      closeAll();
    },
    [editor],
  );

  const changeFontSize = useCallback(
    (delta: number) => {
      const next = Math.min(96, Math.max(8, fontSize + delta));
      setFontSize(next);
      // We set font-size through the DOM style since TipTap TextStyle doesn't natively track font-size
      // Instead, apply through CSS custom property on the block
      editor?.chain().focus().run();
    },
    [editor, fontSize],
  );

  if (!editor) return null;

  return (
    <div className="docs-toolbar">
      {/* ── Undo / Redo ──────────────────────────────────── */}
      <Btn
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (⌘Z)"
      >
        <Undo2 size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (⌘⇧Z)"
      >
        <Redo2 size={16} />
      </Btn>

      <Sep />

      {/* ── Paragraph Style Dropdown ─────────────────────── */}
      <div className="docs-tb-dropdown" ref={styleRef}>
        <button
          className="docs-tb-select"
          onClick={() => {
            closeAll();
            setStyleOpen(!styleOpen);
          }}
        >
          <span className="docs-tb-select-label">{getCurrentStyle()}</span>
          <ChevronDown size={14} />
        </button>
        {styleOpen && (
          <div className="docs-tb-dropdown-menu docs-style-menu">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.node}
                className={`docs-tb-dropdown-item${getCurrentStyle() === opt.label ? " active" : ""}`}
                onClick={() => setStyle(opt.node)}
              >
                <span className={`docs-style-preview docs-style-${opt.node}`}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Sep />

      {/* ── Font Family Dropdown ─────────────────────────── */}
      <div className="docs-tb-dropdown" ref={fontRef}>
        <button
          className="docs-tb-select docs-tb-font-select"
          onClick={() => {
            closeAll();
            setFontOpen(!fontOpen);
          }}
        >
          <span className="docs-tb-select-label">{getCurrentFont()}</span>
          <ChevronDown size={14} />
        </button>
        {fontOpen && (
          <div className="docs-tb-dropdown-menu docs-font-menu">
            {FONT_FAMILIES.map((f) => (
              <button
                key={f.value || "default"}
                className={`docs-tb-dropdown-item${getCurrentFont() === f.label ? " active" : ""}`}
                style={{ fontFamily: f.value || "inherit" }}
                onClick={() => {
                  if (f.value) {
                    editor.chain().focus().setFontFamily(f.value).run();
                  } else {
                    editor.chain().focus().unsetFontFamily().run();
                  }
                  closeAll();
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Sep />

      {/* ── Font Size ────────────────────────────────────── */}
      <Btn onClick={() => changeFontSize(-1)} title="Decrease font size">
        <Minus size={14} />
      </Btn>
      <span className="docs-tb-fontsize">{fontSize}</span>
      <Btn onClick={() => changeFontSize(1)} title="Increase font size">
        <Plus size={14} />
      </Btn>

      <Sep />

      {/* ── Text Formatting ──────────────────────────────── */}
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (⌘B)"
      >
        <Bold size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (⌘I)"
      >
        <Italic size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline (⌘U)"
      >
        <Underline size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough (⌘⇧X)"
      >
        <Strikethrough size={16} />
      </Btn>

      {/* ── Text Color ───────────────────────────────────── */}
      <div
        className="docs-tb-dropdown docs-tb-color-dropdown"
        ref={textColorRef}
      >
        <button
          className="docs-tb-btn docs-tb-color-btn"
          onClick={() => {
            closeAll();
            setTextColorOpen(!textColorOpen);
          }}
          title="Text color"
        >
          <Palette size={16} />
          <span
            className="docs-tb-color-indicator"
            style={{
              background: editor.getAttributes("textStyle")?.color || "#000000",
            }}
          />
        </button>
        {textColorOpen && (
          <div className="docs-tb-dropdown-menu docs-color-grid-menu">
            <div className="docs-color-grid-label">Text color</div>
            <div className="docs-color-grid">
              {TEXT_COLORS.map((c) => (
                <button
                  key={c}
                  className="docs-color-swatch"
                  style={{ background: c }}
                  title={c}
                  onClick={() => {
                    editor.chain().focus().setColor(c).run();
                    closeAll();
                  }}
                />
              ))}
            </div>
            <button
              className="docs-tb-dropdown-item"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                closeAll();
              }}
            >
              <RemoveFormatting size={14} /> Reset
            </button>
          </div>
        )}
      </div>

      {/* ── Highlight Color ──────────────────────────────── */}
      <div
        className="docs-tb-dropdown docs-tb-color-dropdown"
        ref={highlightColorRef}
      >
        <button
          className="docs-tb-btn docs-tb-color-btn"
          onClick={() => {
            closeAll();
            setHighlightColorOpen(!highlightColorOpen);
          }}
          title="Highlight color"
        >
          <Highlighter size={16} />
          <span
            className="docs-tb-color-indicator"
            style={{
              background:
                editor.getAttributes("highlight")?.color || "transparent",
            }}
          />
        </button>
        {highlightColorOpen && (
          <div className="docs-tb-dropdown-menu docs-color-grid-menu">
            <div className="docs-color-grid-label">Highlight color</div>
            <div className="docs-color-grid docs-highlight-grid">
              {HIGHLIGHT_COLORS.map((c) => (
                <button
                  key={c}
                  className="docs-color-swatch"
                  style={{ background: c }}
                  title={c}
                  onClick={() => {
                    if (c === "#ffffff") {
                      editor.chain().focus().unsetHighlight().run();
                    } else {
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: c })
                        .run();
                    }
                    closeAll();
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Sep />

      {/* ── Subscript / Superscript ──────────────────────── */}
      <Btn
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        active={editor.isActive("subscript")}
        title="Subscript"
      >
        <Subscript size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        active={editor.isActive("superscript")}
        title="Superscript"
      >
        <Superscript size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline code"
      >
        <Code size={16} />
      </Btn>

      <Sep />

      {/* ── Alignment ────────────────────────────────────── */}
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        title="Align left"
      >
        <AlignLeft size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        title="Align center"
      >
        <AlignCenter size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        title="Align right"
      >
        <AlignRight size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        title="Justify"
      >
        <AlignJustify size={16} />
      </Btn>

      <Sep />

      {/* ── Lists ────────────────────────────────────────── */}
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet list"
      >
        <List size={16} />
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Numbered list"
      >
        <ListOrdered size={16} />
      </Btn>

      <Sep />

      {/* ── Clear Formatting ─────────────────────────────── */}
      <Btn
        onClick={() =>
          editor.chain().focus().unsetAllMarks().clearNodes().run()
        }
        title="Clear formatting"
      >
        <RemoveFormatting size={16} />
      </Btn>

      <Sep />

      {/* ── Insert Dropdown ──────────────────────────────── */}
      <div className="docs-tb-dropdown" ref={insertRef}>
        <button
          className="docs-tb-select docs-tb-insert-select"
          onClick={() => {
            closeAll();
            setInsertOpen(!insertOpen);
          }}
        >
          <Plus size={15} />
          <span>Insert</span>
          <ChevronDown size={14} />
        </button>
        {insertOpen && (
          <div className="docs-tb-dropdown-menu docs-insert-menu">
            {INSERT_OPTIONS.map((opt) => (
              <button
                key={opt.keyword}
                className="docs-tb-dropdown-item"
                onClick={() => insertBlock(opt.keyword)}
              >
                <span className="docs-insert-icon">
                  <opt.Icon size={16} />
                </span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
