/*
 * ASCEND AI proxy for VERCEL  ->  Groq (free, primary, multi-key rotation) with Gemini (free) as fallback
 * ---------------------------------------------------------------------------
 * WHERE THIS GOES
 * Put this file at:   api/claude.js
 *
 * ENVIRONMENT VARIABLES (Vercel -> Project -> Settings -> Environment Variables):
 *   GROQ_API_KEY    = your first gsk_... key
 *   GROQ_API_KEY_2  = a second gsk_... key (optional but recommended)
 *   GROQ_API_KEY_3  = a third gsk_... key (optional)
 *   GEMINI_API_KEY  = your AIza... key (fallback / for file uploads)
 *
 * You can add just GROQ_API_KEY alone and everything still works exactly as
 * before - GROQ_API_KEY_2 and _3 are optional extras. Add as many as you have;
 * unset ones are simply skipped.
 *
 * HOW THE ROTATION WORKS
 * Groq's free tier limit (30 requests/minute, 14,400/day) is PER KEY. A whole
 * class hitting one shared key exhausts it fast. Each additional key adds
 * another full 30 RPM / 14,400 RPD bucket. On every request we pick a random
 * starting key (so load spreads out instead of always hammering key #1 first)
 * and if that key is rate-limited or errors, we try the next one before ever
 * falling through to Gemini.
 */

const GROQ_MODEL = "openai/gpt-oss-20b";
const GEMINI_MODEL = "gemini-2.0-flash-lite";
// Keep each provider attempt well under Vercel's function time limit (10s on
// the Hobby plan) so a stalled call still leaves room to try the next key /
// fall back to Gemini within the same invocation.
const PROVIDER_TIMEOUT_MS = 8000;

function getGroqKeys() {
  const keys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2, process.env.GROQ_API_KEY_3]
    .filter(Boolean);
  // Shuffle so requests spread across keys instead of always starting on the same one.
  for (let i = keys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keys[i], keys[j]] = [keys[j], keys[i]];
  }
  return keys;
}

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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const groqKeys = getGroqKeys();
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!groqKeys.length && !geminiKey) {
    res.status(500).json({ error: "No GROQ_API_KEY(s) or GEMINI_API_KEY set in Vercel environment variables." });
    return;
  }

  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch { payload = {}; } }
  const { system, messages, max_tokens } = payload || {};

  const hasFileContent = Array.isArray(messages) && messages.some(
    (m) => Array.isArray(m.content) && m.content.some((b) => b && (b.type === "document" || b.type === "image"))
  );

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

  async function callGroqWithKey(key) {
    const r = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
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
    return data;
  }

  // Try each Groq key in turn (order already randomised). Only fall through to
  // the next key on a rate-limit/server-type error - a genuine bad-request
  // error (4xx other than 429) is the same regardless of key, so don't waste
  // the timeout budget retrying it.
  async function callGroq() {
    let lastErr;
    for (const key of groqKeys) {
      try {
        return await callGroqWithKey(key);
      } catch (e) {
        lastErr = e;
        const retryable = e.status === 429 || e.status === 503 || e.status === 502 || e.status === 504;
        if (!retryable) throw e;
        // else try next key
      }
    }
    throw lastErr || new Error("All Groq keys failed");
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
      if (!geminiKey) { res.status(500).json({ error: "This request includes a file, but GEMINI_API_KEY is not set." }); return; }
      result = await callGemini();
    } else if (groqKeys.length) {
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
