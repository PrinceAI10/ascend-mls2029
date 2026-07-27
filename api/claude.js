/*
 * ASCEND AI proxy for VERCEL  ->  Google Gemini (free)
 * ---------------------------------------------------------------------------
 * WHERE THIS GOES
 * Create a folder named  api  at the root of your project, and put this file in
 * it as:   api/claude.js
 * Vercel automatically turns files in /api into serverless functions, reachable
 * at  /api/claude  - so the app must call "/api/claude" (see the app change).
 *
 * ENVIRONMENT VARIABLE (set in Vercel -> Project -> Settings -> Environment Variables):
 *   GEMINI_API_KEY = your AIza... key
 */

const MODEL = "gemini-flash-latest";

export default async function handler(req, res) {
  // CORS (harmless, keeps things smooth)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(500).json({ error: "GEMINI_API_KEY is not set in Vercel environment variables." }); return; }

  // Vercel parses JSON bodies automatically, but guard just in case.
  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch { payload = {}; } }
  const { system, messages, max_tokens } = payload || {};

  const contents = [];
  if (Array.isArray(messages)) {
    for (const m of messages) {
      const role = m.role === "assistant" ? "model" : "user";
      const parts = [];
      if (Array.isArray(m.content)) {
        // A content array may mix text blocks and document/image blocks. Convert
        // each to the matching Gemini "part" so PDFs and images are actually sent
        // to the model (not silently dropped, which made uploads give junk output).
        for (const b of m.content) {
          if (typeof b === "string") {
            parts.push({ text: b });
          } else if (b.type === "text" && b.text) {
            parts.push({ text: b.text });
          } else if ((b.type === "document" || b.type === "image") && b.source && b.source.type === "base64") {
            parts.push({ inlineData: { mimeType: b.source.media_type || "application/pdf", data: b.source.data } });
          } else if (b.text) {
            parts.push({ text: b.text });
          }
        }
      } else {
        parts.push({ text: String(m.content || "") });
      }
      if (parts.length === 0) parts.push({ text: "" });
      contents.push({ role, parts });
    }
  }

  const bodyOut = { contents, generationConfig: { maxOutputTokens: max_tokens || 1024, temperature: 0.7 } };
  if (system) bodyOut.systemInstruction = { parts: [{ text: String(system) }] };

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent?key=" + key;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyOut) });
    const data = await r.json();
    if (!r.ok) {
      const msg = data && data.error && data.error.message ? data.error.message : "Gemini request failed";
      res.status(r.status).json({ error: msg }); return;
    }
    let text = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && Array.isArray(data.candidates[0].content.parts)) {
      text = data.candidates[0].content.parts.map((p) => p.text || "").join("");
    }
    res.status(200).json({ choices: [{ message: { content: text } }] });
  } catch (err) {
    res.status(502).json({ error: "Could not reach Gemini: " + (err && err.message ? err.message : String(err)) });
  }
}
