/*
 * ASCEND AI proxy for VERCEL  ->  Groq (free, primary) with Gemini (free) as fallback
 * ---------------------------------------------------------------------------
 * WHERE THIS GOES
 * Create a folder named  api  at the root of your project, and put this file in
 * it as:   api/claude.js
 * Vercel automatically turns files in /api into serverless functions, reachable
 * at  /api/claude  - so the app must call "/api/claude" (see the app change).
 *
 * WHY GROQ + GEMINI
 * Gemini's free tier alone (15 RPM / 1,500 RPD on flash-lite) gets exhausted
 * fast with a whole class hitting it at once - that's the "AI is busy" spam.
 * Groq's free tier is far more generous for a text-only classroom tool
 * (30 RPM / 14,400 RPD on openai/gpt-oss-20b) and is very fast. So:
 *   - Plain text requests (the vast majority: MCQs, flashcards, notes, chat)
 *     go to Groq first.
 *   - Requests that include a PDF/image attachment go straight to Gemini,
 *     since Groq's gpt-oss-20b is text-only.
 *   - If Groq is rate-limited or errors, we automatically fall back to
 *     Gemini so the request still has a chance to succeed.
 *
 * ENVIRONMENT VARIABLES (set in Vercel -> Project -> Settings -> Environment Variables):
 *   GROQ_API_KEY   = your gsk_... key from console.groq.com/keys (free, no card)
 *   GEMINI_API_KEY = your AIza... key (kept as fallback / for file uploads)
 */

const GROQ_MODEL = "openai/gpt-oss-20b";
const GEMINI_MODEL = "gemini-2.0-flash-lite";
// Keep each provider attempt well under Vercel's function time limit (10s on
// the Hobby plan) so a stalled Groq call still leaves room to fall back to
// Gemini within the same invocation, instead of the whole function hanging
// until Vercel kills it (which is what caused the client to spin forever).
const PROVIDER_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (e) {
    if (e && e.name === "AbortError") {
      const err = new Error("Upstream AI provider timed out");
      err.status = 504;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  // CORS (harmless, keeps things smooth)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!groqKey && !geminiKey) {
    res.status(500).json({ error: "Neither GROQ_API_KEY nor GEMINI_API_KEY is set in Vercel environment variables." });
    return;
  }

  // Vercel parses JSON bodies automatically, but guard just in case.
  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch { payload = {}; } }
  const { system, messages, max_tokens } = payload || {};

  const hasFileContent = Array.isArray(messages) && messages.some(
    (m) => Array.isArray(m.content) && m.content.some((b) => b && (b.type === "document" || b.type === "image"))
  );

  // Groq (OpenAI-compatible) only accepts plain text content per message, so
  // flatten any text blocks into a single string. PDFs/images can't go to
  // Groq at all - those requests skip straight to Gemini below.
  function toOpenAIMessages() {
    const out = [];
    if (system) out.push({ role: "system", content: String(system) });
    if (Array.isArray(messages)) {
      for (const m of messages) {
        const role = m.role === "assistant" ? "assistant" : "user";
        let text = "";
        if (Array.isArray(m.content)) {
          text = m.content.map((b) => (typeof b === "string" ? b : (b.text || ""))).filter(Boolean).join("\n");
        } else {
          text = String(m.content || "");
        }
        out.push({ role, content: text });
      }
    }
    return out;
  }

  async function callGroq() {
    const r = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + groqKey },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: toOpenAIMessages(),
        max_completion_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    let data;
    try { data = await r.json(); } catch { data = null; }
    if (!r.ok || !data) {
      const err = new Error((data && data.error && data.error.message) || "Groq request failed");
      err.status = r.status || 502;
      throw err;
    }
    return data; // already { choices: [{ message: { content } }] }
  }

  async function callGemini() {
    const contents = [];
    if (Array.isArray(messages)) {
      for (const m of messages) {
        const role = m.role === "assistant" ? "model" : "user";
        const parts = [];
        if (Array.isArray(m.content)) {
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

    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + geminiKey;
    const r = await fetchWithTimeout(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bodyOut) }, PROVIDER_TIMEOUT_MS);
    let data;
    try { data = await r.json(); } catch { data = null; }
    if (!r.ok || !data) {
      const err = new Error((data && data.error && data.error.message) || "Gemini request failed");
      err.status = r.status || 502;
      if (r.status === 429) {
        const details = (data && data.error && data.error.details) || [];
        const retryInfo = details.find((d) => d["@type"] && String(d["@type"]).includes("RetryInfo"));
        err.retryDelay = retryInfo && retryInfo.retryDelay ? parseInt(retryInfo.retryDelay, 10) : null;
      }
      throw err;
    }
    let text = "";
    if (data.candidates && data.candidates[0] && data.candidates[0].content && Array.isArray(data.candidates[0].content.parts)) {
      text = data.candidates[0].content.parts.map((p) => p.text || "").join("");
    }
    return { choices: [{ message: { content: text } }] };
  }

  try {
    let result;
    if (hasFileContent) {
      // PDFs/images: Gemini only.
      if (!geminiKey) { res.status(500).json({ error: "This request includes a file, but GEMINI_API_KEY is not set." }); return; }
      result = await callGemini();
    } else if (groqKey) {
      // Plain text: Groq first, Gemini as fallback.
      try {
        result = await callGroq();
      } catch (groqErr) {
        if (!geminiKey) throw groqErr;
        try {
          result = await callGemini();
        } catch (geminiErr) {
          throw groqErr; // report the primary provider's error
        }
      }
    } else {
      result = await callGemini();
    }
    res.status(200).json(result);
  } catch (err) {
    const status = err && err.status ? err.status : 502;
    if (status === 429 && err.retryDelay) res.setHeader("Retry-After", String(err.retryDelay));
    res.status(status === 401 ? 401 : (status >= 500 || status === 429 ? status : 502)).json({
      error: (err && err.message) ? err.message : "Could not reach the AI service: " + String(err),
    });
  }
}
