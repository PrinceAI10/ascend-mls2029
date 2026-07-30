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
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-lite";

const PROVIDER_TIMEOUT_MS = 10000;

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
  const geminiKey = process.env.GEMINI_API_KEY;

  console.log("=== KEYS STATUS ===");
  console.log("Groq keys:", groqKeys.length);
  console.log("OpenRouter:", !!openrouterKey);
  console.log("Cohere:", !!cohereKey);
  console.log("DeepSeek:", !!deepseekKey);
  console.log("Together:", !!togetherKey);
  console.log("Mistral:", !!mistralKey);
  console.log("Gemini:", !!geminiKey);
  
  if (!groqKeys.length && !openrouterKey && !cohereKey && !deepseekKey && !togetherKey && !mistralKey && !geminiKey) {
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
        max_completion_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || "Groq request failed");
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
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || "OpenRouter request failed");
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
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.message || data?.error?.message || "Cohere request failed");
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
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || "DeepSeek request failed");
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
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || "Together request failed");
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
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
      }),
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || "Mistral request failed");
      err.status = r.status || 502;
      throw err;
    }
    return data;
  }

  // 7. Gemini (last resort + files)
  async function callGemini() {
    if (!geminiKey) throw new Error("Gemini key not configured");
    
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
            } else if ((b.type === "document" || b.type === "image") && b.source?.type === "base64") {
              parts.push({ 
                inlineData: { 
                  mimeType: b.source.media_type || "application/pdf", 
                  data: b.source.data 
                } 
              });
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

    const bodyOut = { 
      contents, 
      generationConfig: { 
        maxOutputTokens: max_tokens || 1024, 
        temperature: 0.7 
      } 
    };
    if (system) bodyOut.systemInstruction = { parts: [{ text: String(system) }] };

    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent?key=" + geminiKey;
    const r = await fetchWithTimeout(url, { 
      method: "POST", 
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify(bodyOut) 
    }, PROVIDER_TIMEOUT_MS);
    
    let data;
    try { data = await r.json(); } catch { data = null; }
    
    if (!r.ok || !data) {
      const err = new Error(data?.error?.message || "Gemini request failed");
      err.status = r.status || 502;
      if (r.status === 429) {
        err.retryDelay = data?.error?.details?.find(d => d["@type"]?.includes("RetryInfo"))?.retryDelay || 60;
      }
      throw err;
    }
    
    let text = "";
    if (data.candidates?.[0]?.content?.parts) {
      text = data.candidates[0].content.parts.map((p) => p.text || "").join("");
    }
    return { choices: [{ message: { content: text } }] };
  }

  // === MAIN CHAIN ===
  async function callTextChain() {
    const providers = [];
    if (groqKeys.length) providers.push({ name: "Groq", fn: callGroq });
    if (openrouterKey) providers.push({ name: "OpenRouter", fn: callOpenRouter });
    if (cohereKey) providers.push({ name: "Cohere", fn: callCohere });
    if (deepseekKey) providers.push({ name: "DeepSeek", fn: callDeepSeek });
    if (togetherKey) providers.push({ name: "Together", fn: callTogether });
    if (mistralKey) providers.push({ name: "Mistral", fn: callMistral });
    if (geminiKey) providers.push({ name: "Gemini", fn: callGemini });

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
    let result;
    if (hasFileContent) {
      console.log("File content detected, trying providers...");
      let chainErr = null;
      try {
        result = await callTextChain();
      } catch (e) {
        chainErr = e;
      }
      
      if (!result && geminiKey) {
        console.log("Falling back to Gemini for file...");
        try {
          result = await callGemini();
        } catch (geminiErr) {
          throw chainErr || geminiErr;
        }
      }
      
      if (!result) {
        throw chainErr || new Error("No provider could process this file");
      }
    } else {
      result = await callTextChain();
    }
    
    res.status(200).json(result);
  } catch (err) {
    const status = err?.status || 502;
    res.status(status === 401 ? 401 : (status >= 500 || status === 429 ? status : 502)).json({
      error: err?.message || "Could not reach the AI service"
    });
  }
}