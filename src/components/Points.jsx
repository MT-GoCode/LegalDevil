// src/components/Points.jsx
export default function Points({ items }) {
  if (!items?.length) {
    return (
      <div className="output-wrap">
        <div className="output-placeholder">No points yet. Submit to generate analysis.</div>
      </div>
    );
  }

  const classFor = (rating) => {
    if (typeof rating !== "number") return "strength-unknown";
    if (rating >= 7) return "strength-strong";     // red
    if (rating >= 4) return "strength-mid";        // light red
    return "strength-weak";                        // green (1..3)
  };

  return (
    <div className="output-wrap">
      {items.map((it) => (
        <div key={it.id} className={`point-card ${classFor(it.rating)}`}>
          <div className="point-strength">
            Strength: {typeof it.rating === "number" ? `${it.rating}/10` : "—"}
          </div>
          <div className="point-text">{it.point || "(no description found)"}</div>
          <div className="quote-label">Supporting quote</div>
          <div className="quote-text">
            {it.quote ? <q>{it.quote}</q> : <em>(none provided)</em>}
          </div>
        </div>
      ))}
    </div>
  );
}
