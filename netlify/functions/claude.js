/*
 * ASCEND AI proxy  ->  DeepSeek
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * The ASCEND app runs in the student's browser. A browser cannot call DeepSeek
 * directly for two reasons:
 *   1. The API key would be visible to anyone who opens the page (theft = your bill).
 *   2. DeepSeek blocks direct browser calls (CORS).
 * So the browser calls THIS function instead. It runs on Netlify's server, holds
 * the key safely, forwards the request to DeepSeek, and returns the answer.
 *
 * DEPLOY
 *   1. This file goes at:  netlify/functions/claude.js
 *      (The app calls /.netlify/functions/claude - the filename must be claude.js.)
 *   2. In Netlify -> Configuration -> Environment variables, add:
 *         DEEPSEEK_API_KEY = your DeepSeek key (starts with sk-...)
 *   3. Commit, push. Netlify builds the function automatically.
 *
 * The app sends { system, messages, max_tokens }.
 * The app already understands DeepSeek's reply shape, so no app change is needed.
 */

export async function handler(event) {
  // CORS preflight (harmless, keeps browsers happy)
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: cors(), body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: "DEEPSEEK_API_KEY is not set in Netlify environment variables." }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: cors(), body: JSON.stringify({ error: "Bad request body" }) };
  }

  const { system, messages, max_tokens } = payload;

  // DeepSeek uses the OpenAI-style format: a single messages array where the
  // system prompt is the first message with role "system".
  const dsMessages = [];
  if (system) dsMessages.push({ role: "system", content: system });
  if (Array.isArray(messages)) {
    for (const m of messages) {
      // the app sometimes sends content as an array (for PDFs); flatten to text here,
      // since DeepSeek's chat endpoint expects string content.
      let content = m.content;
      if (Array.isArray(content)) {
        content = content.map((b) => (typeof b === "string" ? b : b.text || "")).join("\n");
      }
      dsMessages.push({ role: m.role === "assistant" ? "assistant" : "user", content });
    }
  }

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + key,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: dsMessages,
        max_tokens: max_tokens || 1024,
        temperature: 0.7,
        stream: false,
      }),
    });

    const text = await res.text();
    // pass DeepSeek's response straight back; the app reads choices[0].message.content
    return {
      statusCode: res.status,
      headers: { ...cors(), "Content-Type": "application/json" },
      body: text,
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: cors(),
      body: JSON.stringify({ error: "Could not reach DeepSeek: " + (err && err.message ? err.message : String(err)) }),
    };
  }
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
