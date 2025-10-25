// src/utils/parsePoints.js
export function parsePQ(text = "") {
  const src = String(text).replace(/\r\n/g, "\n").trim();
  const points = [];
  let i = 0;

  const chunks = src.split(/\n?\[P\]\s*/g);
  for (let c = 1; c < chunks.length; c++) {
    const chunk = chunks[c];
    const qIdx = chunk.search(/\n?\[Q\]\s*/);
    if (qIdx === -1) {
      const desc = chunk.trim();
      if (desc) points.push({ id: `p-${i++}`, point: desc, quote: "" });
      continue;
    }
    const beforeQ = chunk.slice(0, qIdx);
    const afterQ = chunk.slice(qIdx).replace(/^\s*\[Q\]\s*/, "");
    const desc = beforeQ.trim();
    const quote = afterQ.trim();
    if (desc || quote) points.push({ id: `p-${i++}`, point: desc, quote });
  }

  if (points.length === 0 && src) {
    points.push({ id: `p-${i++}`, point: src, quote: "" });
  }
  return points;
}

// Parse newline-separated integers 1..10
export function parseRatings(text = "", expectedCount) {
  const lines = String(text).replace(/\r\n/g, "\n").split("\n");
  const nums = [];
  for (const raw of lines) {
    const m = raw.match(/^\s*(\d{1,2})\s*$/);
    if (!m) continue;
    let n = parseInt(m[1], 10);
    if (n < 1) n = 1;
    if (n > 10) n = 10;
    nums.push(n);
  }
  if (Number.isInteger(expectedCount) && nums.length < expectedCount) {
    // pad with 5s to maintain indexing if the model returned fewer
    while (nums.length < expectedCount) nums.push(5);
  }
  return nums;
}
