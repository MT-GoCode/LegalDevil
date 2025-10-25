// src/components/Sidebar.jsx
import { useEffect } from "react";

export default function Sidebar({
  clause,
  setClause,
  partyFor,
  setPartyFor,
  partyAgainst,
  setPartyAgainst,
  jurisdiction,
  setJurisdiction,
  onSubmit,
  loading,
}) {
  const handleAutoGrow = (e) => {
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    document.querySelectorAll("textarea.textarea").forEach((el) => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    });
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <h1 className="title">LegalDevil</h1>

        <div className="field">
          <label htmlFor="clause">Clause</label>
          <textarea
            id="clause"
            className="textarea"
            placeholder="Paste or write the clause here…"
            value={clause}
            onChange={(e) => setClause(e.target.value)}
            onInput={handleAutoGrow}
            rows={3}
          />
        </div>

        <div className="field">
          <label htmlFor="partyFor">Describe the party you are representing</label>
          <textarea
            id="partyFor"
            className="textarea"
            placeholder="Who are you representing? Key details, role, jurisdiction…"
            value={partyFor}
            onChange={(e) => setPartyFor(e.target.value)}
            onInput={handleAutoGrow}
            rows={3}
          />
        </div>

        <div className="field">
          <label htmlFor="partyAgainst">Describe the party you are against</label>
          <textarea
            id="partyAgainst"
            className="textarea"
            placeholder="Describe the counterparty…"
            value={partyAgainst}
            onChange={(e) => setPartyAgainst(e.target.value)}
            onInput={handleAutoGrow}
            rows={3}
          />
        </div>

        <div className="field">
          <label htmlFor="jurisdiction">Jurisdiction / Circuit (limit results to this venue)</label>
          <textarea
            id="jurisdiction"
            className="textarea"
            placeholder="e.g., Ninth Circuit (U.S.), California state courts, SDNY, UK High Court"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            onInput={handleAutoGrow}
            rows={2}
          />
        </div>

        <button className="submit" onClick={onSubmit} disabled={loading}>
          {loading ? "Submitting…" : "Submit"}
        </button>
      </div>
    </aside>
  );
}
