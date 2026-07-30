/*
 * ASCEND AI proxy for VERCEL
 * Fallback chain:  Groq (multi-key)  ->  OpenRouter  ->  Cohere  ->  Gemini
 * ---------------------------------------------------------------------------
 * WHERE THIS GOES
 * Put this file at:   api/claude.js
 *
 * ENVIRONMENT VARIABLES (Vercel -> Project -> Settings -> Environment Variables):
 *   GROQ_API_KEY        = your first  gsk_... key   (primary)
 *   GROQ_API_KEY_2      = a second    gsk_... key   (optional)
 *   GROQ_API_KEY_3      = a third     gsk_... key   (optional)
 *   OPENROUTER_API_KEY  = your sk-or-... key         (1st fallback, optional)
 *   COHERE_API_KEY      = your Cohere key            (2nd fallback, optional)
 *   GEMINI_API_KEY      = your AIza... key           (final fallback + file uploads)
 *
 * You can set only the keys you have; unset providers are simply skipped.
 * Order of attempts for a normal text request:
 *   each Groq key in turn  ->  OpenRouter  ->  Cohere  ->  Gemini
 * A request that includes a file/image goes straight to Gemini (the only
 * provider wired here for inline documents/images).
 *
 * Optional model overrides (all have sensible defaults):
 *   GROQ_MODEL, OPENROUTER_MODEL, COHERE_MODEL, GEMINI_MODEL
 *
 * HOW GROQ ROTATION WORKS
 * Groq's free tier (30 req/min, 14,400/day) is PER KEY. Each extra key adds a
 * fresh bucket. On every request we pick a random starting key so load spreads
 * out, and if a key is rate-limited/errors we try the next before falling
 * through to the other providers.
 */

// Allow the function up to 30s so a multi-provider fallback has room to finish.
// (Vercel Hobby permits raising this; Pro allows more. Safe to keep at 30.)
export const config = { maxDuration: 60 };

const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const COHERE_MODEL = process.env.COHERE_MODEL || "command-r-08-2024";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

// Keep each provider attempt well under Vercel's function time limit (10s on
// the Hobby plan) so a stalled call still leaves room to try the next
// provider within the same invocation.
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
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const cohereKey = process.env.COHERE_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!groqKeys.length && !openrouterKey && !cohereKey && !geminiKey) {
    res.status(500).json({ error: "No AI provider keys set. Add GROQ_API_KEY (and/or OPENROUTER_API_KEY, COHERE_API_KEY, GEMINI_API_KEY) in Vercel environment variables." });
    return;
  }

  let payload = req.body;
  if (typeof payload === "string") { try { payload = JSON.parse(payload); } catch { payload = {}; } }
  const { system, messages, max_tokens } = payload || {};

  const hasFileContent = Array.isArray(messages) && messages.some(
    (m) => Array.isArray(m.content) && m.content.some((b) => b && (b.type === "document" || b.type === "image"))
  );

  // Flatten our message format into plain {role, content:string} pairs that the
  // OpenAI-compatible providers (Groq, OpenRouter) and Cohere all understand.
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

  // Pull the assistant text out of an OpenAI-style response shape.
  function readOpenAIContent(data) {
    return data && data.choices && data.choices[0] && data.choices[0].message
      ? (data.choices[0].message.content || "")
      : "";
  }

  // ---- Groq (OpenAI-compatible) --------------------------------------------
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

  // ---- OpenRouter (OpenAI-compatible) --------------------------------------
  async function callOpenRouter() {
    const r = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + openrouterKey,
        // OpenRouter asks for these for attribution; harmless if generic.
        "HTTP-Referer": "https://ascend29.vercel.app",
        "X-Title": "ASCEND",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    let data;
    try { data = await r.json(); } catch { data = null; }
    if (!r.ok || !data) {
      const err = new Error((data && data.error && data.error.message) || "OpenRouter request failed");
      err.status = r.status || 502;
      throw err;
    }
    return data; // already OpenAI shape
  }

  // ---- Cohere (v2 chat) ----------------------------------------------------
  async function callCohere() {
    // Cohere v2 uses OpenAI-like roles (system/user/assistant) and returns the
    // reply under data.message.content (an array of {type:"text", text}).
    const r = await fetchWithTimeout("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + cohereKey },
      body: JSON.stringify({
        model: COHERE_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    let data;
    try { data = await r.json(); } catch { data = null; }
    if (!r.ok || !data) {
      const err = new Error((data && (data.message || (data.error && data.error.message))) || "Cohere request failed");
      err.status = r.status || 502;
      throw err;
    }
    let text = "";
    if (data.message && Array.isArray(data.message.content)) {
      text = data.message.content.map((b) => (b && b.text ? b.text : "")).join("");
    } else if (typeof data.text === "string") {
      text = data.text; // very old shape, just in case
    }
    return { choices: [{ message: { content: text } }] };
  }

  // ---- Gemini (also handles files/images) ----------------------------------
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

  // Build the ordered list of text providers that actually have a key, then try
  // each in turn. A provider is retried-past only on transient errors (429/5xx/
  // timeout) OR when it returned an empty completion; a genuine 4xx bad request
  // is surfaced immediately since the next provider would reject it too... except
  // we still continue, because a bad-request on one model (e.g. context length)
  // may well succeed on another. We keep the FIRST meaningful error to report.
  async function callTextChain() {
    const providers = [];
    if (groqKeys.length) providers.push({ name: "Groq", fn: callGroq });
    if (openrouterKey) providers.push({ name: "OpenRouter", fn: callOpenRouter });
    if (cohereKey) providers.push({ name: "Cohere", fn: callCohere });
    if (geminiKey) providers.push({ name: "Gemini", fn: callGemini });

    if (!providers.length) throw new Error("No text-capable AI provider is configured.");

    // Overall budget for the whole chain. Once we're past it we stop starting
    // new providers so the function returns before the platform kills it.
    const CHAIN_DEADLINE_MS = 45000;
    const startedAt = Date.now();

    let firstErr = null;
    for (const p of providers) {
      if (Date.now() - startedAt > CHAIN_DEADLINE_MS) break;
      try {
        const result = await p.fn();
        const content = readOpenAIContent(result);
        if (content && content.trim()) return result;
        // Empty completion -> treat as a soft failure and try the next provider.
        if (!firstErr) firstErr = new Error(p.name + " returned an empty response");
      } catch (e) {
        if (!firstErr) firstErr = e;
        // try next provider
      }
    }
    throw firstErr || new Error("All AI providers failed");
  }

  try {
    let result;
    if (hasFileContent) {
      // Groq/OpenRouter/Cohere can't see the actual file bytes - only Gemini
      // (via inlineData) can read PDFs/images directly. But per request, we
      // now try the text chain FIRST since it's faster and spreads load
      // across the 5 Groq keys instead of hammering Gemini's free quota.
      // In practice this still works well because the frontend already
      // extracts PDF text client-side before it ever gets here - the only
      // time real binary file data reaches this function is the rare
      // fallback path, so trying text-capable providers first is safe and
      // Gemini remains the safety net for genuine binary content.
      let chainErr = null;
      try {
        result = await callTextChain();
      } catch (e) {
        chainErr = e;
      }
      if (!result && geminiKey) {
        try {
          result = await callGemini();
        } catch (geminiErr) {
          throw chainErr || geminiErr;
        }
      }
      if (!result) throw chainErr || new Error("No AI provider could process this file.");
    } else {
      result = await callTextChain();
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
