// src/App.jsx
import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar.jsx";
import Points from "./components/Points.jsx";
import Precedents from "./components/Precedents.jsx";
import { parsePQ, parseRatings } from "./utils/parsePoints.js";

export default function App() {
  const [clause, setClause] = useState("");
  const [partyFor, setPartyFor] = useState("");         // your party
  const [partyAgainst, setPartyAgainst] = useState(""); // opposing party (voice)
  const [jurisdiction, setJurisdiction] = useState(""); // NEW
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("points"); // 'points' | 'precedents'
  const [points, setPoints] = useState([]);
  const [precedents, setPrecedents] = useState([]);

  // ---- PROMPTS ----
  const claimsPrompt = (opp, us, clauseText, juris) => {
    const lines = [
      `You are counsel for: ${opp || "(unspecified opposing party)"}.`,
      `Your objective: identify arguments that benefit ${opp || "(opposing party)"} and disadvantage ${us || "(our party)"}—strictly from ${opp || "(opposing party)"}'s perspective.`,
    ];
    if (juris?.trim()) {
      lines.push(
        ``,
        `Venue constraint: ${juris.trim()}.`,
        `Apply ONLY legal interpretations and authorities from this jurisdiction/circuit. Do NOT rely on out-of-jurisdiction law.`
      );
    }
    lines.push(
      ``,
      `Given this clause, what can I take advantage of in court for my benefit and their detriment? Discuss nothing else and keep it constrained to this only. Speak strictly as counsel for ${opp || "(opposing party)"} throughout.`,
      ``,
      `Return ONLY repeating [P]/[Q] blocks in the exact format:`,
      `[P]`,
      `text description...`,
      ``,
      `[Q]`,
      `Quote from clause to support the point`,
      ``,
      `Provide as many points as possible, nothing else.`,
      ``,
      `Clause:`,
      clauseText || "(no clause provided)"
    );
    return lines.join("\n");
  };

  const precedentsPrompt = (opp, us, clauseText, juris) => {
    const lines = [
      `You are a legal research assistant preparing materials for opposing counsel.`,
      `Context — Counsel is for: ${opp || "(opposing party)"}; against: ${us || "(our party)"}.`,
    ];
    if (juris?.trim()) {
      lines.push(
        ``,
        `LIMITATION: Include ONLY rulings from this jurisdiction/circuit: ${juris.trim()}.`,
        `If none exist, return fewer items; do NOT include out-of-jurisdiction rulings.`
      );
    }
    lines.push(
      ``,
      `Objective: Provide as many relevant court rulings as possible (from earliest available through very recent) related to the clause and parties.`,
      `For EACH ruling:`,
      `- TWO-SENTENCE summary describing the holding and why it's relevant here.`,
      `- The official case name (and year if known).`,
      ``,
      `Output ONLY repeating [P]/[Q] blocks exactly like this:`,
      `[P]`,
      `Two-sentence summary of the ruling and its relevance.`,
      ``,
      `[Q]`,
      `Full case name (and year if known)`,
      ``,
      `Provide as many [P]/[Q] items as possible, nothing else.`,
      ``,
      `Clause:`,
      clauseText || "(no clause provided)"
    );
    return lines.join("\n");
  };

  // Ratings prompt (no jurisdiction needed; it scores whatever we provide)
  const ratingsPrompt = (claimsText, precsText) => [
    `THE FOLLOWING IS A LIST OF POTENTIAL LEGAL PERSPECTIVES AS [P]/[Q] BLOCKS:`,
    claimsText || "(none)",
    ``,
    `THE FOLLOWING IS A LIST OF RELEVANT LEGAL CASES AS [P]/[Q] BLOCKS:`,
    precsText || "(none)",
    ``,
    `TASK: Rate the strength of EACH legal perspective (in the SAME ORDER as given) from 1 to 10 based solely on how strongly it is supported by the listed cases.`,
    `1 = weakly supported, 10 = strongly supported by precedent.`,
    ``,
    `CRITICAL OUTPUT RULES:`,
    `- Output EXACTLY N integers, where N equals the number of [P] blocks in the first list.`,
    `- Integers only, one per line. No words, no punctuation, no extra lines, no explanations.`,
  ].join("\n");

  // ---- API CALL ----
  const callOpenRouter = async (
    userContent,
    sys = "You are a concise legal analyst. Output ONLY the requested [P]/[Q] blocks—no prefaces, no conclusions. Informational only; not legal advice."
  ) => {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Lawyer Help (Vite Dev)",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
      }),
    });
    const data = await res.json();
    return (
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.delta?.content ??
      ""
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    setPoints([]);
    setPrecedents([]);

    const claims = claimsPrompt(partyAgainst, partyFor, clause, jurisdiction);
    const precs = precedentsPrompt(partyAgainst, partyFor, clause, jurisdiction);

    try {
      // 1) Get claims and precedents in parallel
      const [claimsText, precsText] = await Promise.all([
        callOpenRouter(claims),
        callOpenRouter(precs),
      ]);

      const parsedClaims = parsePQ(claimsText);
      const parsedPrecedents = parsePQ(precsText);
      setPrecedents(parsedPrecedents);

      // 2) Ask for ratings based on both raw outputs
      const ratingsText = await callOpenRouter(
        ratingsPrompt(claimsText, precsText),
        "Return ONLY newline-separated integers (1..10), one per line, number of lines MUST equal the number of [P] blocks in the first list. No other text."
      );
      const ratings = parseRatings(ratingsText, parsedClaims.length);

      const claimsWithRatings = parsedClaims.map((p, i) => ({
        ...p,
        rating: ratings[i],
      }));
      setPoints(claimsWithRatings);

      setActiveTab("points");
    } catch (err) {
      console.error("OpenRouter error:", err);
      setPoints([{ id: "err1", point: `Claims/ratings request failed: ${err?.message || err}`, quote: "" }]);
      setPrecedents([{ id: "err2", point: `Precedents request failed: ${err?.message || err}`, quote: "" }]);
      setActiveTab("points");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <Sidebar
        clause={clause}
        setClause={setClause}
        partyFor={partyFor}
        setPartyFor={setPartyFor}
        partyAgainst={partyAgainst}
        setPartyAgainst={setPartyAgainst}
        jurisdiction={jurisdiction}
        setJurisdiction={setJurisdiction}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <main className="output-pane">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "points" ? "active" : ""}`}
            onClick={() => setActiveTab("points")}
          >
            Potential opposing claims
          </button>
          <button
            className={`tab ${activeTab === "precedents" ? "active" : ""}`}
            onClick={() => setActiveTab("precedents")}
          >
            Precedents
          </button>
        </div>

        {/* Compact header bar */}
        <div className="header-bar">
          <div className="speaking-as">Speaking as: Opposing counsel.</div>
        </div>

        {/* Panel content */}
        {activeTab === "points" ? (
          <Points items={points} />
        ) : (
          <Precedents items={precedents} />
        )}
      </main>
    </div>
  );
}
