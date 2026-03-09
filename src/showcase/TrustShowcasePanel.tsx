import type { TrustState } from "../hooks/useTrustState";

interface Props {
  trust: TrustState;
}

export function TrustShowcasePanel({ trust }: Props) {
  const events = [
    ...(trust.trackBlock
      ? [
          {
            label: "Tracked",
            by: trust.trackBlock.by || "system",
            at: trust.trackBlock.at || "-",
          },
        ]
      : []),
    ...trust.approvals.map((a) => ({
      label: "Approved",
      by: a.by || "-",
      at: a.at || "-",
    })),
    ...trust.signatures.map((s) => ({
      label: "Signed",
      by: s.by || "-",
      at: s.at || "-",
    })),
    ...(trust.isSealed
      ? [
          {
            label: "Sealed",
            by: trust.sealedBy || "system",
            at: trust.sealedAt || "-",
          },
        ]
      : []),
    ...trust.amendments.map((a) => ({
      label: "Amended",
      by: a.by || "-",
      at: a.at || "-",
    })),
  ];

  return (
    <aside className="showcase-panel">
      <div className="showcase-panel-header">
        <h3>Document Trust</h3>
        <p>Track → approve → sign → seal → verify → amend timeline.</p>
      </div>

      <div className="showcase-trust-state">
        <span className={`badge ${trust.isSealed ? "sealed" : "open"}`}>
          {trust.isSealed ? "SEALED" : "OPEN"}
        </span>
        <span>Lifecycle: {trust.lifecycle.toUpperCase()}</span>
      </div>

      <div className="showcase-timeline">
        {events.length === 0 && (
          <div className="showcase-empty">No trust events yet.</div>
        )}
        {events.map((e, i) => (
          <div key={`${e.label}-${i}`} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-body">
              <div className="timeline-title">{e.label}</div>
              <div className="timeline-meta">
                by {e.by} • {e.at}
              </div>
            </div>
          </div>
        ))}
      </div>

      {trust.sealHash && (
        <div className="showcase-hash">
          <label>Seal hash</label>
          <code>{trust.sealHash}</code>
        </div>
      )}
    </aside>
  );
}
