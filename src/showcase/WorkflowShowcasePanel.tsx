import { useMemo, useState } from "react";
import { parseIntentText } from "@intenttext/core";

interface Props {
  content: string;
}

const EXEC_TYPES = new Set([
  "step",
  "decision",
  "gate",
  "result",
  "task",
  "ask",
]);

export function WorkflowShowcasePanel({ content }: Props) {
  const [running, setRunning] = useState(false);
  const [cursor, setCursor] = useState(0);

  const nodes = useMemo(() => {
    try {
      const doc = parseIntentText(content);
      return doc.blocks
        .filter((b) => EXEC_TYPES.has(b.type))
        .map((b) => ({
          id: String(b.properties?.id || b.id || b.type),
          type: b.type,
          label: b.content || b.type,
          depends: String(b.properties?.depends || ""),
        }));
    } catch {
      return [] as Array<{
        id: string;
        type: string;
        label: string;
        depends: string;
      }>;
    }
  }, [content]);

  const runStep = () => {
    if (nodes.length === 0) return;
    setRunning(true);
    setCursor((c) => (c + 1) % nodes.length);
  };

  return (
    <aside className="showcase-panel">
      <div className="showcase-panel-header">
        <h3>Workflow Execution</h3>
        <p>
          Live step pipeline view, ready for future Rust/Tauri runtime wiring.
        </p>
      </div>

      <div className="showcase-statline">
        <span>{nodes.length} executable blocks</span>
        <span>{running ? "Running" : "Idle"}</span>
      </div>

      <div className="workflow-list">
        {nodes.length === 0 && (
          <div className="showcase-empty">
            No workflow blocks in current document.
          </div>
        )}
        {nodes.map((n, i) => {
          const status =
            i < cursor ? "done" : i === cursor && running ? "active" : "queued";
          return (
            <div key={`${n.id}-${i}`} className={`workflow-item ${status}`}>
              <div className="workflow-type">{n.type}</div>
              <div className="workflow-label">{n.label}</div>
              {n.depends && (
                <div className="workflow-dep">depends: {n.depends}</div>
              )}
            </div>
          );
        })}
      </div>

      <div className="showcase-actions">
        <button onClick={runStep}>Advance Step</button>
        <button
          onClick={() => {
            setRunning(false);
            setCursor(0);
          }}
        >
          Reset
        </button>
      </div>
    </aside>
  );
}
