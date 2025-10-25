// src/components/Precedents.jsx
export default function Precedents({ items }) {
  if (!items?.length) {
    return (
      <div className="output-wrap">
        <div className="output-placeholder">No precedents yet. Submit to generate research.</div>
      </div>
    );
  }

  return (
    <div className="output-wrap">
      {items.map((it) => (
        <div key={it.id} className="point-card">
          <div className="point-text">{it.point || "(no summary provided)"}</div>
          <div className="quote-label">Case</div>
          <div className="quote-text">
            {it.quote ? <q>{it.quote}</q> : <em>(no case name provided)</em>}
          </div>
        </div>
      ))}
    </div>
  );
}
