/*
 * ASCEND AI proxy for VERCEL
 * Multi-provider fallback chain with automatic retry
 */

export const config = { maxDuration: 60 };

// MODELS - Using models confirmed to work with your keys
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free";
const COHERE_MODEL = process.env.COHERE_MODEL || "command-r-08-2024";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const TOGETHER_MODEL = process.env.TOGETHER_MODEL || "meta-llama/Llama-3.2-3B-Instruct-Turbo";
const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-tiny";
const CEREBRAS_MODEL = process.env.CEREBRAS_MODEL || "llama-3.3-70b";
const FIREWORKS_MODEL = process.env.FIREWORKS_MODEL || "accounts/fireworks/models/llama-v3p3-70b-instruct";

const PROVIDER_TIMEOUT_MS = 15000;

// Each provider/model caps max output tokens differently. Requesting more
// than a model allows (e.g. Cohere's command-r caps at 4096) causes an
// outright rejection instead of just truncating - so clamp per provider
// rather than sending the same max_tokens to everyone.
const TOKEN_CAPS = {
  groq: 8000,
  openrouter: 8000,
  cohere: 4000,
  deepseek: 8000,
  together: 8000,
  mistral: 8000,
  cerebras: 8000,
  fireworks: 4000,
};
function capTokens(provider, requested) {
  const cap = TOKEN_CAPS[provider] || 4000;
  return Math.min(requested || 1024, cap);
}

// Reads the raw response body once and tries JSON.parse on it, keeping the
// raw text around so a real failure reason can be surfaced even when a
// provider returns an error body that doesn't match the {error:{message}}
// shape we assume elsewhere (this is what was hiding Cerebras's actual error).
async function readBody(r) {
  const raw = await r.text();
  let data = null;
  try { data = JSON.parse(raw); } catch {}
  return { data, raw };
}

function getGroqKeys() {
  const keys = [
    process.env.GROQ_API_KEY, 
    process.env.GROQ_API_KEY_2, 
    process.env.GROQ_API_KEY_3
  ].filter(Boolean);
  
  // Shuffle for load balancing
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
      const err = new Error("Provider timed out");
      err.status = 504;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  
  if (req.method === "OPTIONS") { 
    res.status(200).end(); 
    return; 
  }
  
  if (req.method !== "POST") { 
    res.status(405).json({ error: "Method not allowed" }); 
    return; 
  }

  // Get all keys
  const groqKeys = getGroqKeys();
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const cohereKey = process.env.COHERE_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const togetherKey = process.env.TOGETHER_API_KEY;
  const mistralKey = process.env.MISTRAL_API_KEY;
  const cerebrasKey = process.env.CEREBRAS_API_KEY;
  const fireworksKey = process.env.FIREWORKS_API_KEY;

  console.log("=== KEYS STATUS ===");
  console.log("Groq keys:", groqKeys.length);
  console.log("OpenRouter:", !!openrouterKey);
  console.log("Cohere:", !!cohereKey);
  console.log("DeepSeek:", !!deepseekKey);
  console.log("Together:", !!togetherKey);
  console.log("Mistral:", !!mistralKey);
  console.log("Cerebras:", !!cerebrasKey);
  console.log("Fireworks:", !!fireworksKey);
  
  if (!groqKeys.length && !openrouterKey && !cohereKey && !deepseekKey && !togetherKey && !mistralKey && !cerebrasKey && !fireworksKey) {
    res.status(500).json({ error: "No AI provider keys configured." });
    return;
  }

  // Parse request
  let payload = req.body;
  if (typeof payload === "string") { 
    try { payload = JSON.parse(payload); } 
    catch { payload = {}; } 
  }
  
  const { system, messages, max_tokens } = payload || {};

  const hasFileContent = Array.isArray(messages) && messages.some(
    (m) => Array.isArray(m.content) && m.content.some((b) => b && (b.type === "document" || b.type === "image"))
  );

  // Helpers
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

  function readOpenAIContent(data) {
    if (data?.choices?.[0]?.message?.content) {
      return data.choices[0].message.content;
    }
    if (data?.choices?.[0]?.text) {
      return data.choices[0].text;
    }
    if (data?.text) {
      return data.text;
    }
    return "";
  }

  // === PROVIDER FUNCTIONS ===

  // 1. Groq
  async function callGroqWithKey(key) {
    const r = await fetchWithTimeout("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + key 
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: toOpenAIMessages(),
        max_completion_tokens: capTokens("groq", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "Groq request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  async function callGroq() {
    let lastErr;
    for (const key of groqKeys) {
      try {
        return await callGroqWithKey(key);
      } catch (e) {
        lastErr = e;
        const retryable = [429, 503, 502, 504].includes(e.status);
        if (!retryable) throw e;
      }
    }
    throw lastErr || new Error("All Groq keys failed");
  }

  // 2. OpenRouter
  async function callOpenRouter() {
    if (!openrouterKey) throw new Error("OpenRouter key not configured");
    
    const r = await fetchWithTimeout("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + openrouterKey,
        "HTTP-Referer": "https://ascend29.vercel.app",
        "X-Title": "ASCEND",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("openrouter", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "OpenRouter request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // 3. Cohere
  async function callCohere() {
    if (!cohereKey) throw new Error("Cohere key not configured");
    
    const r = await fetchWithTimeout("https://api.cohere.com/v2/chat", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + cohereKey 
      },
      body: JSON.stringify({
        model: COHERE_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("cohere", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.message || data?.error?.message || (raw ? raw.slice(0,200) : "Cohere request failed"));
      err.status = r.status || 502;
      throw err;
    }
    
    let text = "";
    if (data.message?.content) {
      text = data.message.content.map((b) => b.text || "").join("");
    }
    return { choices: [{ message: { content: text } }] };
  }

  // 4. DeepSeek
  async function callDeepSeek() {
    if (!deepseekKey) throw new Error("DeepSeek key not configured");
    
    const r = await fetchWithTimeout("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + deepseekKey 
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("deepseek", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "DeepSeek request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // 5. Together AI
  async function callTogether() {
    if (!togetherKey) throw new Error("Together key not configured");
    
    const r = await fetchWithTimeout("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + togetherKey 
      },
      body: JSON.stringify({
        model: TOGETHER_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("together", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "Together request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // 6. Mistral
  async function callMistral() {
    if (!mistralKey) throw new Error("Mistral key not configured");
    
    const r = await fetchWithTimeout("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + mistralKey 
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("mistral", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "Mistral request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // 7. Cerebras
  async function callCerebras() {
    if (!cerebrasKey) throw new Error("Cerebras key not configured");
    
    const r = await fetchWithTimeout("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + cerebrasKey 
      },
      body: JSON.stringify({
        model: CEREBRAS_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("cerebras", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "Cerebras request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // 8. Fireworks
  async function callFireworks() {
    if (!fireworksKey) throw new Error("Fireworks key not configured");
    
    const r = await fetchWithTimeout("https://api.fireworks.ai/inference/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + fireworksKey 
      },
      body: JSON.stringify({
        model: FIREWORKS_MODEL,
        messages: toOpenAIMessages(),
        max_tokens: capTokens("fireworks", max_tokens),
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    const { data, raw } = await readBody(r);
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || data?.message || (raw ? raw.slice(0,200) : "Fireworks request failed"));
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // === MAIN CHAIN ===
  async function callTextChain() {
    const providers = [];
    if (groqKeys.length) providers.push({ name: "Groq", fn: callGroq });
    if (cerebrasKey) providers.push({ name: "Cerebras", fn: callCerebras });
    if (openrouterKey) providers.push({ name: "OpenRouter", fn: callOpenRouter });
    if (cohereKey) providers.push({ name: "Cohere", fn: callCohere });
    if (deepseekKey) providers.push({ name: "DeepSeek", fn: callDeepSeek });
    if (mistralKey) providers.push({ name: "Mistral", fn: callMistral });
    if (fireworksKey) providers.push({ name: "Fireworks", fn: callFireworks });
    if (togetherKey) providers.push({ name: "Together", fn: callTogether });

    if (!providers.length) {
      throw new Error("No AI providers configured");
    }

    console.log("Providers to try:", providers.map(p => p.name).join(" -> "));

    const CHAIN_DEADLINE_MS = 50000;
    const startedAt = Date.now();
    let firstErr = null;
    
    for (const p of providers) {
      if (Date.now() - startedAt > CHAIN_DEADLINE_MS) {
        console.log("Chain deadline exceeded");
        break;
      }

      console.log(`[${p.name}] Trying...`);

      try {
        const result = await p.fn();
        const content = readOpenAIContent(result);

        if (content && content.trim()) {
          console.log(`[${p.name}] SUCCESS! Length: ${content.length}`);
          return result;
        }

        console.log(`[${p.name}] Empty response`);
        if (!firstErr) {
          firstErr = new Error(p.name + " returned empty response");
        }
      } catch (e) {
        console.error(`[${p.name}] FAILED:`, e.message);
        if (!firstErr) {
          firstErr = e;
        }
      }
    }

    throw firstErr || new Error("All providers failed");
  }

  // === EXECUTE ===
  try {
    if (hasFileContent) {
      // None of the configured providers accept raw image/document blocks -
      // that was Gemini-only. The client (App.js) already extracts PDF/image
      // text before calling this endpoint, so this path shouldn't normally
      // be hit; fail clearly instead of silently trying and failing.
      console.log("Raw file content block received, but no vision-capable provider is configured.");
      throw Object.assign(new Error("This endpoint only accepts plain text. Extract text from files before sending."), { status: 400 });
    }
    const result = await callTextChain();
    res.status(200).json(result);
  } catch (err) {
    const status = err?.status || 502;
    res.status(status === 401 ? 401 : (status >= 500 || status === 429 ? status : 502)).json({
      error: err?.message || "Could not reach the AI service"
    });
  }
}