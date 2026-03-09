import { useMemo, useState } from "react";
import { parseIntentText } from "@intenttext/core";
import { DEMO_DOCS, type DemoDoc } from "./demoVault";

interface Props {
  content: string;
  activeTitle?: string;
  onLoadDemo: (doc: DemoDoc) => void;
}

export function SearchShowcasePanel({
  content,
  activeTitle,
  onLoadDemo,
}: Props) {
  const [query, setQuery] = useState("type=task owner=Ahmed");
  const [textQuery, setTextQuery] = useState("");

  const indexed = useMemo(() => {
    return DEMO_DOCS.map((doc) => {
      try {
        const parsed = parseIntentText(doc.source);
        return { doc, parsed, error: null as string | null };
      } catch (err) {
        return {
          doc,
          parsed: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    });
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const tq = textQuery.trim().toLowerCase();
    const typeMatch = q.match(/type\s*=\s*([a-z0-9-]+)/i);
    const ownerMatch = q.match(/owner\s*=\s*([a-z0-9 ._-]+)/i);

    const out: Array<{ doc: DemoDoc; line: string; type: string }> = [];

    for (const item of indexed) {
      if (!item.parsed) continue;
      for (const block of item.parsed.blocks) {
        const type = block.type.toLowerCase();
        const owner = String(block.properties?.owner || "").toLowerCase();
        const contentText = String(block.content || "").toLowerCase();

        if (typeMatch && type !== typeMatch[1].toLowerCase()) continue;
        if (ownerMatch && !owner.includes(ownerMatch[1].trim().toLowerCase()))
          continue;
        if (tq && !contentText.includes(tq) && !owner.includes(tq)) continue;

        out.push({
          doc: item.doc,
          type: block.type,
          line: `${block.type}: ${block.content}`,
        });
      }
    }

    return out.slice(0, 20);
  }, [indexed, query, textQuery]);

  return (
    <aside className="showcase-panel">
      <div className="showcase-panel-header">
        <h3>Vault Search</h3>
        <p>Typed query + fuzzy text across seeded vault docs.</p>
      </div>

      <div className="showcase-field">
        <label>Structured Query</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="type=task owner=Ahmed"
        />
      </div>

      <div className="showcase-field">
        <label>Fuzzy Text</label>
        <input
          value={textQuery}
          onChange={(e) => setTextQuery(e.target.value)}
          placeholder="deadline, migration, contract..."
        />
      </div>

      <div className="showcase-statline">
        <span>{DEMO_DOCS.length} demo docs</span>
        <span>{results.length} matches</span>
      </div>

      <div className="showcase-result-list">
        {results.map((r, i) => (
          <button
            key={`${r.doc.id}-${i}`}
            className="showcase-result"
            onClick={() => onLoadDemo(r.doc)}
          >
            <div className="showcase-result-top">
              <strong>{r.doc.title}</strong>
              <span>{r.type}</span>
            </div>
            <div className="showcase-result-line">{r.line}</div>
          </button>
        ))}
        {results.length === 0 && (
          <div className="showcase-empty">No matches for current filters.</div>
        )}
      </div>

      <div className="showcase-current-doc">
        <label>Current editor document</label>
        <div>{activeTitle || "Untitled"}</div>
      </div>

      <div className="showcase-actions">
        {DEMO_DOCS.map((doc) => (
          <button key={doc.id} onClick={() => onLoadDemo(doc)}>
            Open {doc.section}/{doc.id}
          </button>
        ))}
      </div>
    </aside>
  );
}
